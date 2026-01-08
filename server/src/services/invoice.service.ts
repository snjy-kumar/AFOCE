import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type {
    CreateInvoiceInput,
    UpdateInvoiceInput,
    UpdateInvoiceStatusInput,
    InvoiceQuery,
    InvoiceItemInput,
} from '../schemas/invoice.schema.js';
import type { InvoiceStatus } from '@prisma/client';

/**
 * Invoice service - Sales invoicing business logic
 */

// Helper to calculate invoice totals
function calculateInvoiceTotals(
    items: InvoiceItemInput[],
    vatRate: number,
    discountAmount: number
) {
    const subtotal = items.reduce((sum, item) => {
        return sum + item.quantity * item.rate;
    }, 0);

    const vatAmount = (subtotal - discountAmount) * (vatRate / 100);
    const total = subtotal - discountAmount + vatAmount;

    return {
        subtotal: new Decimal(subtotal.toFixed(2)),
        vatAmount: new Decimal(vatAmount.toFixed(2)),
        total: new Decimal(total.toFixed(2)),
    };
}

// Generate sequential invoice number for user
async function generateInvoiceNumber(userId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();

    // Get last invoice number for this year
    const lastInvoice = await prisma.invoice.findFirst({
        where: {
            userId,
            invoiceNumber: {
                startsWith: `INV-${year}-`,
            },
        },
        orderBy: { invoiceNumber: 'desc' },
        select: { invoiceNumber: true },
    });

    let nextNumber = 1;
    if (lastInvoice) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
        nextNumber = lastNumber + 1;
    }

    return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

export const invoiceService = {
    /**
     * Get all invoices for a user with filters and pagination
     */
    async getInvoices(userId: string, query: InvoiceQuery) {
        const where: {
            userId: string;
            status?: InvoiceStatus;
            customerId?: string;
            issueDate?: { gte?: Date; lte?: Date };
        } = { userId };

        if (query.status) {
            where.status = query.status;
        }

        if (query.customerId) {
            where.customerId = query.customerId;
        }

        if (query.startDate || query.endDate) {
            where.issueDate = {};
            if (query.startDate) {
                where.issueDate.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.issueDate.lte = new Date(query.endDate);
            }
        }

        const skip = (query.page - 1) * query.limit;

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: { issueDate: 'desc' },
                include: {
                    customer: {
                        select: { id: true, name: true, email: true },
                    },
                    _count: {
                        select: { items: true },
                    },
                },
            }),
            prisma.invoice.count({ where }),
        ]);

        return {
            invoices,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    },

    /**
     * Get invoice by ID with full details
     */
    async getInvoiceById(userId: string, invoiceId: string) {
        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, userId },
            include: {
                customer: true,
                items: {
                    include: {
                        account: {
                            select: { id: true, code: true, name: true },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        if (!invoice) {
            throw new ApiError(404, 'INVOICE_NOT_FOUND', 'Invoice not found');
        }

        return invoice;
    },

    /**
     * Create a new invoice
     */
    async createInvoice(userId: string, input: CreateInvoiceInput) {
        // Validate customer exists
        const customer = await prisma.customer.findFirst({
            where: { id: input.customerId, userId },
        });

        if (!customer) {
            throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
        }

        // Validate all account IDs
        const accountIds = input.items.map((item) => item.accountId);
        const accounts = await prisma.account.findMany({
            where: { id: { in: accountIds }, userId, type: 'INCOME' },
        });

        if (accounts.length !== accountIds.length) {
            throw new ApiError(400, 'INVALID_ACCOUNTS', 'One or more income accounts are invalid');
        }

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber(userId);

        // Calculate totals
        const totals = calculateInvoiceTotals(input.items, input.vatRate, input.discountAmount);

        // Create invoice with items
        const invoice = await prisma.invoice.create({
            data: {
                userId,
                invoiceNumber,
                customerId: input.customerId,
                issueDate: new Date(input.issueDate),
                dueDate: new Date(input.dueDate),
                vatRate: new Decimal(input.vatRate),
                discountAmount: new Decimal(input.discountAmount),
                subtotal: totals.subtotal,
                vatAmount: totals.vatAmount,
                total: totals.total,
                notes: input.notes ?? null,
                terms: input.terms ?? null,
                items: {
                    create: input.items.map((item, index) => ({
                        accountId: item.accountId,
                        description: item.description,
                        quantity: new Decimal(item.quantity),
                        rate: new Decimal(item.rate),
                        amount: new Decimal((item.quantity * item.rate).toFixed(2)),
                        sortOrder: index,
                    })),
                },
            },
            include: {
                customer: true,
                items: {
                    include: {
                        account: {
                            select: { id: true, code: true, name: true },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        return invoice;
    },

    /**
     * Update an invoice (only drafts can be fully updated)
     */
    async updateInvoice(userId: string, invoiceId: string, input: UpdateInvoiceInput) {
        const existing = await prisma.invoice.findFirst({
            where: { id: invoiceId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'INVOICE_NOT_FOUND', 'Invoice not found');
        }

        if (existing.status !== 'DRAFT') {
            throw new ApiError(400, 'INVOICE_NOT_DRAFT', 'Only draft invoices can be updated');
        }

        // If items are being updated, recalculate totals
        let totals: ReturnType<typeof calculateInvoiceTotals> | undefined;
        if (input.items) {
            const vatRate = input.vatRate ?? Number(existing.vatRate);
            const discountAmount = input.discountAmount ?? Number(existing.discountAmount);
            totals = calculateInvoiceTotals(input.items, vatRate, discountAmount);
        }

        // Build update data object - only include defined fields
        const updateData: Record<string, unknown> = {};
        if (input.customerId !== undefined) updateData.customerId = input.customerId;
        if (input.issueDate !== undefined) updateData.issueDate = new Date(input.issueDate);
        if (input.dueDate !== undefined) updateData.dueDate = new Date(input.dueDate);
        if (input.vatRate !== undefined) updateData.vatRate = new Decimal(input.vatRate);
        if (input.discountAmount !== undefined) updateData.discountAmount = new Decimal(input.discountAmount);
        if (totals) {
            updateData.subtotal = totals.subtotal;
            updateData.vatAmount = totals.vatAmount;
            updateData.total = totals.total;
        }
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.terms !== undefined) updateData.terms = input.terms;
        if (input.items) {
            updateData.items = {
                deleteMany: {},
                create: input.items.map((item, index) => ({
                    accountId: item.accountId,
                    description: item.description,
                    quantity: new Decimal(item.quantity),
                    rate: new Decimal(item.rate),
                    amount: new Decimal((item.quantity * item.rate).toFixed(2)),
                    sortOrder: index,
                })),
            };
        }

        // Update invoice
        const invoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: updateData,
            include: {
                customer: true,
                items: {
                    include: {
                        account: {
                            select: { id: true, code: true, name: true },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        return invoice;
    },

    /**
     * Update invoice status
     */
    async updateInvoiceStatus(userId: string, invoiceId: string, input: UpdateInvoiceStatusInput) {
        const existing = await prisma.invoice.findFirst({
            where: { id: invoiceId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'INVOICE_NOT_FOUND', 'Invoice not found');
        }

        const updateData: { status: InvoiceStatus; paidAmount?: Decimal } = {
            status: input.status,
        };

        if (input.status === 'PAID') {
            updateData.paidAmount = existing.total;
        } else if (input.status === 'PARTIALLY_PAID' && input.paidAmount !== undefined) {
            updateData.paidAmount = new Decimal(input.paidAmount);
        }

        const invoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: updateData,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return invoice;
    },

    /**
     * Delete an invoice
     */
    async deleteInvoice(userId: string, invoiceId: string) {
        const existing = await prisma.invoice.findFirst({
            where: { id: invoiceId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'INVOICE_NOT_FOUND', 'Invoice not found');
        }

        if (existing.status !== 'DRAFT' && existing.status !== 'CANCELLED') {
            throw new ApiError(400, 'CANNOT_DELETE', 'Only draft or cancelled invoices can be deleted');
        }

        await prisma.invoice.delete({
            where: { id: invoiceId },
        });

        return { message: 'Invoice deleted successfully' };
    },

    /**
     * Get invoice summary statistics
     */
    async getInvoiceSummary(userId: string, startDate?: string, endDate?: string) {
        const where: { userId: string; issueDate?: { gte?: Date; lte?: Date } } = { userId };

        if (startDate || endDate) {
            where.issueDate = {};
            if (startDate) where.issueDate.gte = new Date(startDate);
            if (endDate) where.issueDate.lte = new Date(endDate);
        }

        const [totals, statusCounts] = await Promise.all([
            prisma.invoice.aggregate({
                where,
                _sum: {
                    total: true,
                    paidAmount: true,
                    vatAmount: true,
                },
                _count: true,
            }),
            prisma.invoice.groupBy({
                by: ['status'],
                where,
                _count: true,
                _sum: { total: true },
            }),
        ]);

        return {
            totalInvoices: totals._count,
            totalAmount: totals._sum.total ?? 0,
            totalPaid: totals._sum.paidAmount ?? 0,
            totalVat: totals._sum.vatAmount ?? 0,
            outstanding: Number(totals._sum.total ?? 0) - Number(totals._sum.paidAmount ?? 0),
            byStatus: statusCounts.map((s) => ({
                status: s.status,
                count: s._count,
                total: s._sum.total ?? 0,
            })),
        };
    },
};
