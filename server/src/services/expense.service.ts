import { Decimal } from '@prisma/client/runtime/client';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { CreateExpenseInput, UpdateExpenseInput, ExpenseQuery } from '../schemas/expense.schema.js';

/**
 * Expense service - Purchase and expense tracking
 */

// Generate sequential expense number
async function generateExpenseNumber(userId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();

    const lastExpense = await prisma.expense.findFirst({
        where: {
            userId,
            expenseNumber: {
                startsWith: `EXP-${year}-`,
            },
        },
        orderBy: { expenseNumber: 'desc' },
        select: { expenseNumber: true },
    });

    let nextNumber = 1;
    if (lastExpense) {
        const lastNumber = parseInt(lastExpense.expenseNumber.split('-')[2], 10);
        nextNumber = lastNumber + 1;
    }

    return `EXP-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

function incrementExpenseNumber(base: string, offset: number): string {
    const parts = base.split('-');
    if (parts.length < 3) return base;
    const sequence = parseInt(parts[2], 10);
    if (Number.isNaN(sequence)) return base;
    const next = sequence + offset;
    parts[2] = next.toString().padStart(4, '0');
    return parts.join('-');
}

type PolicyViolation = {
    ruleId: string;
    ruleName: string;
    severity: 'WARNING' | 'CRITICAL';
    message: string;
};

function evaluateExpensePolicies(params: { amount: number; receiptUrl?: string | null }): PolicyViolation[] {
    const violations: PolicyViolation[] = [];

    if (params.amount > 5000 && !params.receiptUrl) {
        violations.push({
            ruleId: 'receipt_required_over_5000',
            ruleName: 'Receipt required for high-value expenses',
            severity: 'WARNING',
            message: 'Receipt required for expenses over ₹5,000.',
        });
    }

    return violations;
}

export const expenseService = {
    /**
     * Get all expenses with filters and pagination
     */
    async getExpenses(userId: string, query: ExpenseQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const where: {
            userId: string;
            vendorId?: string;
            accountId?: string;
            isPaid?: boolean;
            date?: { gte?: Date; lte?: Date };
        } = { userId };

        if (query.vendorId) where.vendorId = query.vendorId;
        if (query.accountId) where.accountId = query.accountId;
        if (query.isPaid !== undefined) where.isPaid = query.isPaid;

        if (query.startDate || query.endDate) {
            where.date = {};
            if (query.startDate) where.date.gte = new Date(query.startDate);
            if (query.endDate) where.date.lte = new Date(query.endDate);
        }

        const skip = (page - 1) * limit;

        const [expenses, total] = await Promise.all([
            prisma.expense.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    vendor: {
                        select: { id: true, name: true },
                    },
                    account: {
                        select: { id: true, code: true, name: true },
                    },
                },
            }),
            prisma.expense.count({ where }),
        ]);

        return {
            expenses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get expense by ID
     */
    async getExpenseById(userId: string, expenseId: string) {
        const expense = await prisma.expense.findFirst({
            where: { id: expenseId, userId },
            include: {
                vendor: true,
                account: {
                    select: { id: true, code: true, name: true, type: true },
                },
                approver: {
                    select: { id: true, name: true },
                },
                rejector: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!expense) {
            throw new ApiError(404, 'EXPENSE_NOT_FOUND', 'Expense not found');
        }

        return expense;
    },

    /**
     * Create a new expense
     */
    async createExpense(userId: string, input: CreateExpenseInput) {
        // Validate account exists and is an expense account
        const account = await prisma.account.findFirst({
            where: { id: input.accountId, userId, type: 'EXPENSE' },
        });

        if (!account) {
            throw new ApiError(404, 'ACCOUNT_NOT_FOUND', 'Expense account not found');
        }

        // Validate vendor if provided
        if (input.vendorId) {
            const vendor = await prisma.vendor.findFirst({
                where: { id: input.vendorId, userId },
            });

            if (!vendor) {
                throw new ApiError(404, 'VENDOR_NOT_FOUND', 'Vendor not found');
            }
        }

        // Calculate VAT
        const vatAmount = input.amount * (input.vatRate / 100);
        const totalAmount = input.amount + vatAmount;
        const policyViolations = evaluateExpensePolicies({
            amount: input.amount,
            receiptUrl: input.receiptUrl ?? null,
        });

        // Generate expense number and retry on unique constraint collisions
        const baseExpenseNumber = await generateExpenseNumber(userId);
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const expenseNumber = attempt === 0
                ? baseExpenseNumber
                : incrementExpenseNumber(baseExpenseNumber, attempt);
            try {
                const expense = await prisma.expense.create({
                    data: {
                        userId,
                        expenseNumber,
                        vendorId: input.vendorId ?? null,
                        accountId: input.accountId,
                        date: new Date(input.date),
                        description: input.description,
                        amount: new Decimal(input.amount),
                        vatRate: new Decimal(input.vatRate),
                        vatAmount: new Decimal(vatAmount.toFixed(2)),
                        totalAmount: new Decimal(totalAmount.toFixed(2)),
                        receiptUrl: input.receiptUrl ?? null,
                        isPaid: input.isPaid,
                        notes: input.notes ?? null,
                        policyViolations: policyViolations.length > 0 ? policyViolations : null,
                    },
                    include: {
                        vendor: {
                            select: { id: true, name: true },
                        },
                        account: {
                            select: { id: true, code: true, name: true },
                        },
                    },
                });

                return expense;
            } catch (error) {
                if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'P2002') {
                    if (attempt < 4) {
                        continue;
                    }
                    throw new ApiError(409, 'DUPLICATE_EXPENSE_NUMBER', 'Expense number already exists');
                }
                throw error;
            }
        }

        throw new ApiError(500, 'EXPENSE_CREATE_FAILED', 'Unable to create expense');
    },

    /**
     * Update an expense
     */
    async updateExpense(userId: string, expenseId: string, input: UpdateExpenseInput) {
        const existing = await prisma.expense.findFirst({
            where: { id: expenseId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'EXPENSE_NOT_FOUND', 'Expense not found');
        }

        // Recalculate VAT if amount or rate changed
        let vatAmount: Decimal | undefined;
        let totalAmount: Decimal | undefined;

        if (input.amount !== undefined || input.vatRate !== undefined) {
            const amount = input.amount ?? Number(existing.amount);
            const vatRate = input.vatRate ?? Number(existing.vatRate);
            const newVatAmount = amount * (vatRate / 100);
            vatAmount = new Decimal(newVatAmount.toFixed(2));
            totalAmount = new Decimal((amount + newVatAmount).toFixed(2));
        }

        const amountForPolicy = input.amount ?? Number(existing.amount);
        const receiptUrlForPolicy = input.receiptUrl !== undefined
            ? input.receiptUrl
            : existing.receiptUrl;
        const policyViolations = evaluateExpensePolicies({
            amount: amountForPolicy,
            receiptUrl: receiptUrlForPolicy ?? null,
        });

        // Build update data object - only include defined fields
        const updateData: Record<string, unknown> = {};
        if (input.vendorId !== undefined) updateData.vendorId = input.vendorId;
        if (input.accountId !== undefined) updateData.accountId = input.accountId;
        if (input.date !== undefined) updateData.date = new Date(input.date);
        if (input.description !== undefined) updateData.description = input.description;
        if (input.amount !== undefined) updateData.amount = new Decimal(input.amount);
        if (input.vatRate !== undefined) updateData.vatRate = new Decimal(input.vatRate);
        if (vatAmount !== undefined) updateData.vatAmount = vatAmount;
        if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
        if (input.isPaid !== undefined) updateData.isPaid = input.isPaid;
        if (input.receiptUrl !== undefined) updateData.receiptUrl = input.receiptUrl;
        if (input.notes !== undefined) updateData.notes = input.notes;
        updateData.policyViolations = policyViolations.length > 0 ? policyViolations : null;

        const expense = await prisma.expense.update({
            where: { id: expenseId },
            data: updateData,
            include: {
                vendor: {
                    select: { id: true, name: true },
                },
                account: {
                    select: { id: true, code: true, name: true },
                },
            },
        });

        return expense;
    },

    /**
     * Delete an expense
     */
    async deleteExpense(userId: string, expenseId: string) {
        const existing = await prisma.expense.findFirst({
            where: { id: expenseId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'EXPENSE_NOT_FOUND', 'Expense not found');
        }

        await prisma.expense.delete({
            where: { id: expenseId },
        });

        return { message: 'Expense deleted successfully' };
    },

    /**
     * Get expense summary statistics
     */
    async getExpenseSummary(userId: string, startDate?: string, endDate?: string) {
        const where: { userId: string; date?: { gte?: Date; lte?: Date } } = { userId };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const [totals, byAccount] = await Promise.all([
            prisma.expense.aggregate({
                where,
                _sum: {
                    amount: true,
                    vatAmount: true,
                    totalAmount: true,
                },
                _count: true,
            }),
            prisma.expense.groupBy({
                by: ['accountId'],
                where,
                _sum: { totalAmount: true },
                _count: true,
            }),
        ]);

        // Get account names
        const accountIds = byAccount.map((b) => b.accountId);
        const accounts = await prisma.account.findMany({
            where: { id: { in: accountIds } },
            select: { id: true, code: true, name: true },
        });

        const accountMap = new Map(accounts.map((a) => [a.id, a]));

        return {
            totalExpenses: totals._count,
            totalAmount: totals._sum.amount ?? 0,
            totalVat: totals._sum.vatAmount ?? 0,
            totalWithVat: totals._sum.totalAmount ?? 0,
            byAccount: byAccount.map((b) => ({
                account: accountMap.get(b.accountId),
                count: b._count,
                total: b._sum.totalAmount ?? 0,
            })),
        };
    },
};
