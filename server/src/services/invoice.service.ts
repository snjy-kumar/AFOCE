import { Decimal } from '@prisma/client/runtime/client';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type {
    CreateInvoiceInput,
    UpdateInvoiceInput,
    UpdateInvoiceStatusInput,
    InvoiceQuery,
    InvoiceItemInput,
} from '../schemas/invoice.schema.js';
import type { InvoiceStatus, Prisma } from '../generated/prisma/client.js';

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

function incrementInvoiceNumber(base: string, offset: number): string {
    const parts = base.split('-');
    if (parts.length < 3) return base;
    const sequence = parseInt(parts[2], 10);
    if (Number.isNaN(sequence)) return base;
    const next = sequence + offset;
    parts[2] = next.toString().padStart(4, '0');
    return parts.join('-');
}

export const invoiceService = {
    /**
     * Get all invoices for a user with filters and pagination
     */
    async getInvoices(userId: string, query: InvoiceQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

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

        const skip = (page - 1) * limit;

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: limit,
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
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
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
                approver: {
                    select: { id: true, name: true },
                },
                rejector: {
                    select: { id: true, name: true },
                },
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

        // Calculate totals
        const { subtotal, vatAmount, total } = calculateInvoiceTotals(
            input.items,
            input.vatRate,
            input.discountAmount
        );

        // Generate invoice number and retry on unique constraint collisions
        const baseInvoiceNumber = await generateInvoiceNumber(userId);
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const invoiceNumber =
                attempt === 0 ? baseInvoiceNumber : incrementInvoiceNumber(baseInvoiceNumber, attempt);
            try {
                const invoice = await prisma.invoice.create({
                    data: {
                        userId,
                        invoiceNumber,
                        customerId: input.customerId,
                        issueDate: new Date(input.issueDate),
                        dueDate: new Date(input.dueDate),
                        status: 'DRAFT',
                        subtotal,
                        vatRate: new Decimal(input.vatRate),
                        vatAmount,
                        discountAmount: new Decimal(input.discountAmount || 0),
                        total,
                        paidAmount: new Decimal(0),
                        notes: input.notes,
                        terms: input.terms,
                        items: {
                            create: input.items.map((item, index) => ({
                                accountId: item.accountId,
                                description: item.description,
                                quantity: new Decimal(item.quantity),
                                rate: new Decimal(item.rate),
                                amount: new Decimal(item.quantity * item.rate),
                                sortOrder: index,
                            })),
                        },
                    },
                    include: {
                        customer: {
                            select: { id: true, name: true, email: true },
                        },
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
            } catch (error) {
                if (
                    typeof error === 'object' &&
                    error &&
                    'code' in error &&
                    (error as { code?: string }).code === 'P2002'
                ) {
                    if (attempt < 4) {
                        continue;
                    }
                    throw new ApiError(409, 'DUPLICATE_INVOICE_NUMBER', 'Invoice number already exists');
                }
                throw error;
            }
        }

        throw new ApiError(500, 'INVOICE_CREATE_FAILED', 'Unable to create invoice');
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
                approver: {
                    select: { id: true, name: true },
                },
                rejector: {
                    select: { id: true, name: true },
                },
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
            byStatus: statusCounts.map((s: Prisma.InvoiceGroupByOutputType) => ({
                status: s.status,
                count: s._count,
                total: s._sum?.total ?? 0,
            })),
        };
    },
};
