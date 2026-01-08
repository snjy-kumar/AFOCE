import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import type {
    CreateBankAccountInput,
    UpdateBankAccountInput,
    CreateTransactionInput,
    UpdateTransactionInput,
    ReconcileTransactionInput,
    BulkImportTransactionsInput,
    BankQueryInput
} from '../schemas/bank.schema.js';

/**
 * Bank Account & Transaction Service
 * Handles bank reconciliation operations
 */

// ============================================
// BANK ACCOUNTS
// ============================================

export async function createBankAccount(userId: string, data: CreateBankAccountInput) {
    return prisma.bankAccount.create({
        data: {
            userId,
            name: data.name,
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            openingBalance: data.openingBalance ?? 0,
            currentBalance: data.openingBalance ?? 0,
        },
    });
}

export async function getBankAccounts(userId: string) {
    return prisma.bankAccount.findMany({
        where: { userId, isActive: true },
        include: {
            _count: {
                select: { transactions: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getBankAccountById(userId: string, id: string) {
    return prisma.bankAccount.findFirst({
        where: { id, userId },
        include: {
            _count: {
                select: {
                    transactions: true,
                },
            },
        },
    });
}

export async function updateBankAccount(userId: string, id: string, data: UpdateBankAccountInput) {
    // Verify ownership
    const existing = await prisma.bankAccount.findFirst({
        where: { id, userId },
    });

    if (!existing) return null;

    return prisma.bankAccount.update({
        where: { id },
        data: {
            name: data.name,
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            openingBalance: data.openingBalance,
        },
    });
}

export async function deleteBankAccount(userId: string, id: string) {
    // Verify ownership
    const existing = await prisma.bankAccount.findFirst({
        where: { id, userId },
    });

    if (!existing) return null;

    // Soft delete by marking inactive
    return prisma.bankAccount.update({
        where: { id },
        data: { isActive: false },
    });
}

// ============================================
// BANK TRANSACTIONS
// ============================================

export async function createTransaction(userId: string, data: CreateTransactionInput) {
    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
        where: { id: data.bankAccountId, userId },
    });

    if (!bankAccount) {
        throw new Error('Bank account not found');
    }

    // Create transaction and update balance in a transaction
    return prisma.$transaction(async (tx) => {
        const transaction = await tx.bankTransaction.create({
            data: {
                bankAccountId: data.bankAccountId,
                date: new Date(data.date),
                description: data.description,
                amount: data.amount,
                type: data.type,
                notes: data.notes,
            },
        });

        // Update current balance
        const balanceChange = data.type === 'credit'
            ? data.amount
            : -data.amount;

        await tx.bankAccount.update({
            where: { id: data.bankAccountId },
            data: {
                currentBalance: {
                    increment: balanceChange,
                },
            },
        });

        return transaction;
    });
}

export async function getTransactions(
    userId: string,
    bankAccountId: string,
    query: BankQueryInput
) {
    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
        where: { id: bankAccountId, userId },
    });

    if (!bankAccount) {
        throw new Error('Bank account not found');
    }

    const where: Prisma.BankTransactionWhereInput = {
        bankAccountId,
    };

    // Apply filters
    if (query.startDate) {
        where.date = { ...where.date as object, gte: new Date(query.startDate) };
    }
    if (query.endDate) {
        where.date = { ...where.date as object, lte: new Date(query.endDate) };
    }
    if (query.reconciled !== 'all') {
        where.reconciled = query.reconciled === 'true';
    }
    if (query.type !== 'all') {
        where.type = query.type;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const [transactions, total, unreconciledCount] = await Promise.all([
        prisma.bankTransaction.findMany({
            where,
            include: {
                invoice: {
                    select: { id: true, invoiceNumber: true, total: true },
                },
                expense: {
                    select: { id: true, expenseNumber: true, totalAmount: true },
                },
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit,
        }),
        prisma.bankTransaction.count({ where }),
        prisma.bankTransaction.count({
            where: { bankAccountId, reconciled: false }
        }),
    ]);

    return {
        transactions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        summary: {
            unreconciledCount,
            currentBalance: bankAccount.currentBalance,
        },
    };
}

export async function getTransactionById(userId: string, id: string) {
    const transaction = await prisma.bankTransaction.findFirst({
        where: { id },
        include: {
            bankAccount: {
                select: { id: true, userId: true, name: true },
            },
            invoice: {
                select: { id: true, invoiceNumber: true, total: true, customer: true },
            },
            expense: {
                select: { id: true, expenseNumber: true, totalAmount: true, vendor: true },
            },
        },
    });

    if (!transaction || transaction.bankAccount.userId !== userId) {
        return null;
    }

    return transaction;
}

export async function updateTransaction(userId: string, id: string, data: UpdateTransactionInput) {
    const existing = await getTransactionById(userId, id);
    if (!existing) return null;

    return prisma.bankTransaction.update({
        where: { id },
        data: {
            date: data.date ? new Date(data.date) : undefined,
            description: data.description,
            amount: data.amount,
            type: data.type,
            notes: data.notes,
        },
    });
}

export async function deleteTransaction(userId: string, id: string) {
    const existing = await getTransactionById(userId, id);
    if (!existing) return null;

    // Delete and revert balance
    return prisma.$transaction(async (tx) => {
        const balanceChange = existing.type === 'credit'
            ? -Number(existing.amount)
            : Number(existing.amount);

        await tx.bankAccount.update({
            where: { id: existing.bankAccount.id },
            data: {
                currentBalance: { increment: balanceChange },
            },
        });

        return tx.bankTransaction.delete({ where: { id } });
    });
}

// ============================================
// RECONCILIATION
// ============================================

export async function reconcileTransaction(
    userId: string,
    id: string,
    data: ReconcileTransactionInput
) {
    const existing = await getTransactionById(userId, id);
    if (!existing) return null;

    // Verify invoice/expense ownership if provided
    if (data.invoiceId) {
        const invoice = await prisma.invoice.findFirst({
            where: { id: data.invoiceId, userId },
        });
        if (!invoice) throw new Error('Invoice not found');
    }

    if (data.expenseId) {
        const expense = await prisma.expense.findFirst({
            where: { id: data.expenseId, userId },
        });
        if (!expense) throw new Error('Expense not found');
    }

    return prisma.bankTransaction.update({
        where: { id },
        data: {
            reconciled: true,
            reconciledAt: new Date(),
            invoiceId: data.invoiceId,
            expenseId: data.expenseId,
            notes: data.notes,
        },
    });
}

export async function unreconcileTransaction(userId: string, id: string) {
    const existing = await getTransactionById(userId, id);
    if (!existing) return null;

    return prisma.bankTransaction.update({
        where: { id },
        data: {
            reconciled: false,
            reconciledAt: null,
            invoiceId: null,
            expenseId: null,
        },
    });
}

// ============================================
// BULK OPERATIONS
// ============================================

export async function bulkImportTransactions(userId: string, data: BulkImportTransactionsInput) {
    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
        where: { id: data.bankAccountId, userId },
    });

    if (!bankAccount) {
        throw new Error('Bank account not found');
    }

    // Calculate total balance change
    let totalBalanceChange = 0;
    const transactionsData = data.transactions.map(t => {
        const balanceChange = t.type === 'credit' ? t.amount : -t.amount;
        totalBalanceChange += balanceChange;

        return {
            bankAccountId: data.bankAccountId,
            date: new Date(t.date),
            description: t.description,
            amount: t.amount,
            type: t.type,
        };
    });

    // Bulk create and update balance
    return prisma.$transaction(async (tx) => {
        const result = await tx.bankTransaction.createMany({
            data: transactionsData,
        });

        await tx.bankAccount.update({
            where: { id: data.bankAccountId },
            data: {
                currentBalance: { increment: totalBalanceChange },
            },
        });

        return {
            imported: result.count,
            newBalance: Number(bankAccount.currentBalance) + totalBalanceChange,
        };
    });
}

// ============================================
// AUTO-MATCHING SUGGESTIONS
// ============================================

export async function getSuggestedMatches(userId: string, transactionId: string) {
    const transaction = await getTransactionById(userId, transactionId);
    if (!transaction) return null;

    const amount = Number(transaction.amount);
    const tolerance = 0.01; // Match within 1 paisa

    // For credits (incoming), suggest matching invoices
    // For debits (outgoing), suggest matching expenses
    if (transaction.type === 'credit') {
        const invoices = await prisma.invoice.findMany({
            where: {
                userId,
                status: { in: ['SENT', 'PARTIALLY_PAID'] },
                total: {
                    gte: amount - tolerance,
                    lte: amount + tolerance,
                },
            },
            include: {
                customer: { select: { name: true } },
            },
            take: 5,
        });

        return { type: 'invoices', matches: invoices };
    } else {
        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                isPaid: false,
                totalAmount: {
                    gte: amount - tolerance,
                    lte: amount + tolerance,
                },
            },
            include: {
                vendor: { select: { name: true } },
            },
            take: 5,
        });

        return { type: 'expenses', matches: expenses };
    }
}

// ============================================
// SUMMARY & REPORTS
// ============================================

export async function getBankSummary(userId: string) {
    const accounts = await prisma.bankAccount.findMany({
        where: { userId, isActive: true },
        include: {
            _count: {
                select: { transactions: true },
            },
            transactions: {
                where: { reconciled: false },
                select: { id: true },
            },
        },
    });

    const totalBalance = accounts.reduce(
        (sum, acc) => sum + Number(acc.currentBalance),
        0
    );

    const totalUnreconciled = accounts.reduce(
        (sum, acc) => sum + acc.transactions.length,
        0
    );

    return {
        accounts: accounts.map(acc => ({
            id: acc.id,
            name: acc.name,
            bankName: acc.bankName,
            currentBalance: acc.currentBalance,
            transactionCount: acc._count.transactions,
            unreconciledCount: acc.transactions.length,
        })),
        summary: {
            totalAccounts: accounts.length,
            totalBalance,
            totalUnreconciled,
        },
    };
}
