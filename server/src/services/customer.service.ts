import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { CreateCustomerInput, UpdateCustomerInput, CustomerQuery } from '../schemas/customer.schema.js';

/**
 * Customer service - Customer database management
 */

export const customerService = {
    /**
     * Get all customers for a user with optional filters
     */
    async getCustomers(userId: string, query: CustomerQuery) {
        const where: {
            userId: string;
            isActive?: boolean;
            OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { email: { contains: string; mode: 'insensitive' } }>;
        } = { userId };

        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { invoices: true },
                },
            },
        });

        return customers;
    },

    /**
     * Get customer by ID
     */
    async getCustomerById(userId: string, customerId: string) {
        const customer = await prisma.customer.findFirst({
            where: { id: customerId, userId },
            include: {
                invoices: {
                    take: 10,
                    orderBy: { issueDate: 'desc' },
                    select: {
                        id: true,
                        invoiceNumber: true,
                        issueDate: true,
                        total: true,
                        status: true,
                    },
                },
                _count: {
                    select: { invoices: true },
                },
            },
        });

        if (!customer) {
            throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
        }

        return customer;
    },

    /**
     * Create a new customer
     */
    async createCustomer(userId: string, input: CreateCustomerInput) {
        const customer = await prisma.customer.create({
            data: {
                userId,
                name: input.name,
                email: input.email ?? null,
                phone: input.phone ?? null,
                panNumber: input.panNumber ?? null,
                address: input.address ?? null,
                notes: input.notes ?? null,
            },
        });

        return customer;
    },

    /**
     * Update a customer
     */
    async updateCustomer(userId: string, customerId: string, input: UpdateCustomerInput) {
        // Check customer exists and belongs to user
        const existing = await prisma.customer.findFirst({
            where: { id: customerId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
        }

        // Build update data object - only include defined fields
        const updateData: Record<string, string | boolean | null> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.email !== undefined) updateData.email = input.email || null;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.panNumber !== undefined) updateData.panNumber = input.panNumber;
        if (input.address !== undefined) updateData.address = input.address;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        const customer = await prisma.customer.update({
            where: { id: customerId },
            data: updateData,
        });

        return customer;
    },

    /**
     * Delete a customer
     */
    async deleteCustomer(userId: string, customerId: string) {
        // Check customer exists and belongs to user
        const existing = await prisma.customer.findFirst({
            where: { id: customerId, userId },
            include: {
                _count: {
                    select: { invoices: true },
                },
            },
        });

        if (!existing) {
            throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
        }

        // Check for linked invoices
        if (existing._count.invoices > 0) {
            throw new ApiError(400, 'HAS_INVOICES', 'Cannot delete customer with existing invoices');
        }

        await prisma.customer.delete({
            where: { id: customerId },
        });

        return { message: 'Customer deleted successfully' };
    },
};
