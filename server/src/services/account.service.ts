import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { CreateAccountInput, UpdateAccountInput, AccountQuery } from '../schemas/account.schema.js';
import type { AccountType } from '@prisma/client';

/**
 * Account service - Chart of Accounts business logic
 */

export const accountService = {
    /**
     * Get all accounts for a user with optional filters
     */
    async getAccounts(userId: string, query: AccountQuery) {
        const where: {
            userId: string;
            type?: AccountType;
            isActive?: boolean;
            OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { code: { contains: string } }>;
        } = { userId };

        if (query.type) {
            where.type = query.type;
        }

        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search } },
            ];
        }

        const accounts = await prisma.account.findMany({
            where,
            orderBy: [{ type: 'asc' }, { code: 'asc' }],
            include: {
                parent: {
                    select: { id: true, code: true, name: true },
                },
                _count: {
                    select: { children: true },
                },
            },
        });

        return accounts;
    },

    /**
     * Get account by ID
     */
    async getAccountById(userId: string, accountId: string) {
        const account = await prisma.account.findFirst({
            where: { id: accountId, userId },
            include: {
                parent: {
                    select: { id: true, code: true, name: true },
                },
                children: {
                    select: { id: true, code: true, name: true, type: true, isActive: true },
                    orderBy: { code: 'asc' },
                },
            },
        });

        if (!account) {
            throw new ApiError(404, 'ACCOUNT_NOT_FOUND', 'Account not found');
        }

        return account;
    },

    /**
     * Create a new account
     */
    async createAccount(userId: string, input: CreateAccountInput) {
        // Check if code already exists for this user
        const existingAccount = await prisma.account.findFirst({
            where: { userId, code: input.code },
        });

        if (existingAccount) {
            throw new ApiError(409, 'ACCOUNT_CODE_EXISTS', `Account code ${input.code} already exists`);
        }

        // Validate parent account if provided
        if (input.parentId) {
            const parentAccount = await prisma.account.findFirst({
                where: { id: input.parentId, userId },
            });

            if (!parentAccount) {
                throw new ApiError(404, 'PARENT_NOT_FOUND', 'Parent account not found');
            }

            // Parent must be same type
            if (parentAccount.type !== input.type) {
                throw new ApiError(400, 'TYPE_MISMATCH', 'Child account must have same type as parent');
            }
        }

        const account = await prisma.account.create({
            data: {
                userId,
                code: input.code,
                name: input.name,
                nameNe: input.nameNe ?? null,
                type: input.type,
                description: input.description ?? null,
                parentId: input.parentId ?? null,
            },
            include: {
                parent: {
                    select: { id: true, code: true, name: true },
                },
            },
        });

        return account;
    },

    /**
     * Update an account
     */
    async updateAccount(userId: string, accountId: string, input: UpdateAccountInput) {
        // Check account exists and belongs to user
        const existingAccount = await prisma.account.findFirst({
            where: { id: accountId, userId },
        });

        if (!existingAccount) {
            throw new ApiError(404, 'ACCOUNT_NOT_FOUND', 'Account not found');
        }

        // System accounts cannot be modified
        if (existingAccount.isSystem) {
            throw new ApiError(403, 'SYSTEM_ACCOUNT', 'System accounts cannot be modified');
        }

        // Build update data object - only include defined fields
        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.nameNe !== undefined) updateData.nameNe = input.nameNe;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.parentId !== undefined) updateData.parentId = input.parentId;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        const account = await prisma.account.update({
            where: { id: accountId },
            data: updateData,
            include: {
                parent: {
                    select: { id: true, code: true, name: true },
                },
            },
        });

        return account;
    },

    /**
     * Delete an account
     */
    async deleteAccount(userId: string, accountId: string) {
        // Check account exists and belongs to user
        const existingAccount = await prisma.account.findFirst({
            where: { id: accountId, userId },
            include: {
                _count: {
                    select: { children: true, invoiceItems: true, expenses: true },
                },
            },
        });

        if (!existingAccount) {
            throw new ApiError(404, 'ACCOUNT_NOT_FOUND', 'Account not found');
        }

        // System accounts cannot be deleted
        if (existingAccount.isSystem) {
            throw new ApiError(403, 'SYSTEM_ACCOUNT', 'System accounts cannot be deleted');
        }

        // Check for child accounts
        if (existingAccount._count.children > 0) {
            throw new ApiError(400, 'HAS_CHILDREN', 'Cannot delete account with child accounts');
        }

        // Check for linked transactions
        if (existingAccount._count.invoiceItems > 0 || existingAccount._count.expenses > 0) {
            throw new ApiError(400, 'HAS_TRANSACTIONS', 'Cannot delete account with linked transactions');
        }

        await prisma.account.delete({
            where: { id: accountId },
        });

        return { message: 'Account deleted successfully' };
    },

    /**
     * Get accounts as a tree structure
     */
    async getAccountTree(userId: string) {
        const accounts = await prisma.account.findMany({
            where: { userId, isActive: true },
            orderBy: [{ type: 'asc' }, { code: 'asc' }],
        });

        // Build tree structure
        type AccountWithChildren = typeof accounts[0] & { children: AccountWithChildren[] };
        const accountMap = new Map<string, AccountWithChildren>();
        const roots: AccountWithChildren[] = [];

        // First pass: create map
        for (const account of accounts) {
            accountMap.set(account.id, { ...account, children: [] });
        }

        // Second pass: build tree
        for (const account of accounts) {
            const node = accountMap.get(account.id);
            if (!node) continue;

            if (account.parentId) {
                const parent = accountMap.get(account.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            } else {
                roots.push(node);
            }
        }

        return roots;
    },
};
