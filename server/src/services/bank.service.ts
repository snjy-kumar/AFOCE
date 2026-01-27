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

// ============================================
// BANK STATEMENT IMPORT
// ============================================

interface ParsedTransaction {
    date: Date;
    description: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    reference?: string;
    balance?: number;
}

/**
 * Parse CSV bank statement
 * Supports common formats from Nepal banks
 */
export function parseCSVStatement(csvContent: string, format: 'standard' | 'nabil' | 'nic_asia' | 'global_ime' = 'standard'): ParsedTransaction[] {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(Boolean);
    const transactions: ParsedTransaction[] = [];
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    for (const line of dataLines) {
        try {
            const columns = parseCSVLine(line);
            let transaction: ParsedTransaction | null = null;
            
            switch (format) {
                case 'nabil':
                    // Nabil Bank format: Date, Particulars, Cheque No, Debit, Credit, Balance
                    if (columns.length >= 6) {
                        const debit = parseFloat(columns[3].replace(/,/g, '')) || 0;
                        const credit = parseFloat(columns[4].replace(/,/g, '')) || 0;
                        transaction = {
                            date: parseDate(columns[0]),
                            description: columns[1],
                            amount: credit || debit,
                            type: credit > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
                            reference: columns[2] || undefined,
                            balance: parseFloat(columns[5].replace(/,/g, '')) || undefined,
                        };
                    }
                    break;
                    
                case 'nic_asia':
                    // NIC Asia format: Transaction Date, Value Date, Description, Debit, Credit, Balance
                    if (columns.length >= 6) {
                        const debit = parseFloat(columns[3].replace(/,/g, '')) || 0;
                        const credit = parseFloat(columns[4].replace(/,/g, '')) || 0;
                        transaction = {
                            date: parseDate(columns[0]),
                            description: columns[2],
                            amount: credit || debit,
                            type: credit > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
                            balance: parseFloat(columns[5].replace(/,/g, '')) || undefined,
                        };
                    }
                    break;
                    
                case 'global_ime':
                    // Global IME format: Date, Narration, Instrument No, Debit, Credit, Balance
                    if (columns.length >= 6) {
                        const debit = parseFloat(columns[3].replace(/,/g, '')) || 0;
                        const credit = parseFloat(columns[4].replace(/,/g, '')) || 0;
                        transaction = {
                            date: parseDate(columns[0]),
                            description: columns[1],
                            amount: credit || debit,
                            type: credit > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
                            reference: columns[2] || undefined,
                            balance: parseFloat(columns[5].replace(/,/g, '')) || undefined,
                        };
                    }
                    break;
                    
                default:
                    // Standard format: Date, Description, Amount, Type
                    if (columns.length >= 4) {
                        transaction = {
                            date: parseDate(columns[0]),
                            description: columns[1],
                            amount: Math.abs(parseFloat(columns[2].replace(/,/g, '')) || 0),
                            type: columns[3].toLowerCase().includes('credit') || columns[3].toLowerCase().includes('deposit') 
                                ? 'DEPOSIT' 
                                : 'WITHDRAWAL',
                        };
                    } else if (columns.length >= 3) {
                        // Simple format: Date, Description, Amount (negative = withdrawal)
                        const amount = parseFloat(columns[2].replace(/,/g, '')) || 0;
                        transaction = {
                            date: parseDate(columns[0]),
                            description: columns[1],
                            amount: Math.abs(amount),
                            type: amount >= 0 ? 'DEPOSIT' : 'WITHDRAWAL',
                        };
                    }
            }
            
            if (transaction && transaction.date && transaction.amount > 0) {
                transactions.push(transaction);
            }
        } catch (e) {
            console.warn('Failed to parse line:', line, e);
        }
    }
    
    return transactions;
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    
    return result;
}

/**
 * Parse date in various formats
 */
function parseDate(dateStr: string): Date {
    // Try common formats
    const formats = [
        /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
        /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
        /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
        /(\d{4})\/(\d{2})\/(\d{2})/, // YYYY/MM/DD
    ];
    
    for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
            if (format.source.startsWith('(\\d{4})')) {
                return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
            } else {
                return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
            }
        }
    }
    
    // Fallback to native parsing
    return new Date(dateStr);
}

/**
 * Import bank statement from CSV
 */
export async function importBankStatement(
    userId: string,
    bankAccountId: string,
    csvContent: string,
    format: 'standard' | 'nabil' | 'nic_asia' | 'global_ime' = 'standard'
): Promise<{ imported: number; skipped: number; errors: string[] }> {
    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
        where: { id: bankAccountId, userId },
    });
    
    if (!bankAccount) {
        throw new Error('Bank account not found');
    }
    
    const transactions = parseCSVStatement(csvContent, format);
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    for (const tx of transactions) {
        try {
            // Check for duplicate (same date, amount, description)
            const existing = await prisma.bankTransaction.findFirst({
                where: {
                    bankAccountId,
                    date: tx.date,
                    amount: tx.amount,
                    description: tx.description,
                },
            });
            
            if (existing) {
                skipped++;
                continue;
            }
            
            // Create transaction
            await prisma.bankTransaction.create({
                data: {
                    bankAccountId,
                    date: tx.date,
                    description: tx.description + (tx.reference ? ` (Ref: ${tx.reference})` : ''),
                    amount: tx.amount,
                    type: tx.type,
                    reconciled: false,
                },
            });
            
            // Update bank account balance
            const balanceChange = tx.type === 'DEPOSIT' ? tx.amount : -tx.amount;
            await prisma.bankAccount.update({
                where: { id: bankAccountId },
                data: {
                    currentBalance: {
                        increment: balanceChange,
                    },
                },
            });
            
            imported++;
        } catch (e) {
            errors.push(`Failed to import transaction: ${tx.description} - ${e}`);
        }
    }
    
    return { imported, skipped, errors };
}

/**
 * Parse OFX (Open Financial Exchange) format
 * Used by many banks for statement exports
 */
export function parseOFXStatement(ofxContent: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = [];
    
    // Simple OFX parser - looks for STMTTRN blocks
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;
    
    while ((match = stmtTrnRegex.exec(ofxContent)) !== null) {
        const block = match[1];
        
        const getTagValue = (tag: string): string => {
            const regex = new RegExp(`<${tag}>([^<\\n]+)`, 'i');
            const m = block.match(regex);
            return m ? m[1].trim() : '';
        };
        
        const dtPosted = getTagValue('DTPOSTED');
        const trnAmt = parseFloat(getTagValue('TRNAMT')) || 0;
        const name = getTagValue('NAME');
        const memo = getTagValue('MEMO');
        const fitId = getTagValue('FITID');
        
        if (dtPosted && trnAmt !== 0) {
            // Parse OFX date format: YYYYMMDDHHMMSS
            const year = parseInt(dtPosted.substr(0, 4));
            const month = parseInt(dtPosted.substr(4, 2)) - 1;
            const day = parseInt(dtPosted.substr(6, 2));
            
            transactions.push({
                date: new Date(year, month, day),
                description: name || memo || 'Unknown transaction',
                amount: Math.abs(trnAmt),
                type: trnAmt > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
                reference: fitId || undefined,
            });
        }
    }
    
    return transactions;
}
