import { Decimal } from '@prisma/client/runtime/client';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { VatPeriodQuery, CreateVatRecordInput, UpdateVatRecordInput } from '../schemas/vat.schema.js';
import type { VatRecordStatus } from '../generated/prisma/client.js';

/**
 * VAT Management service - Nepal IRD compliance
 * Handles VAT calculations, summaries, and IRD-format exports
 */

export const vatService = {
    /**
     * Get all VAT records for a user
     */
    async getVatRecords(userId: string, query: VatPeriodQuery) {
        const where: {
            userId: string;
            status?: VatRecordStatus;
            periodLabel?: { startsWith: string };
        } = { userId };

        if (query.status) {
            where.status = query.status;
        }

        if (query.year) {
            where.periodLabel = { startsWith: query.year };
        }

        const records = await prisma.vatRecord.findMany({
            where,
            orderBy: { periodStart: 'desc' },
        });

        return records;
    },

    /**
     * Get VAT record by ID
     */
    async getVatRecordById(userId: string, recordId: string) {
        const record = await prisma.vatRecord.findFirst({
            where: { id: recordId, userId },
        });

        if (!record) {
            throw new ApiError(404, 'VAT_RECORD_NOT_FOUND', 'VAT record not found');
        }

        return record;
    },

    /**
     * Calculate VAT for a period based on invoices and expenses
     */
    async calculateVatForPeriod(userId: string, periodStart: Date, periodEnd: Date) {
        // Get sales VAT (VAT collected from customers)
        const salesVat = await prisma.invoice.aggregate({
            where: {
                userId,
                status: { not: 'CANCELLED' },
                issueDate: {
                    gte: periodStart,
                    lte: periodEnd,
                },
            },
            _sum: {
                vatAmount: true,
                subtotal: true,
                total: true,
            },
            _count: true,
        });

        // Get purchase VAT (VAT paid on expenses/purchases)
        const purchaseVat = await prisma.expense.aggregate({
            where: {
                userId,
                date: {
                    gte: periodStart,
                    lte: periodEnd,
                },
            },
            _sum: {
                vatAmount: true,
                amount: true,
                totalAmount: true,
            },
            _count: true,
        });

        const salesVatAmount = Number(salesVat._sum.vatAmount ?? 0);
        const purchaseVatAmount = Number(purchaseVat._sum.vatAmount ?? 0);
        const netVat = salesVatAmount - purchaseVatAmount;

        return {
            sales: {
                count: salesVat._count,
                subtotal: Number(salesVat._sum.subtotal ?? 0),
                vatAmount: salesVatAmount,
                total: Number(salesVat._sum.total ?? 0),
            },
            purchases: {
                count: purchaseVat._count,
                amount: Number(purchaseVat._sum.amount ?? 0),
                vatAmount: purchaseVatAmount,
                total: Number(purchaseVat._sum.totalAmount ?? 0),
            },
            netVat,
            vatPayable: netVat > 0 ? netVat : 0,
            vatRefundable: netVat < 0 ? Math.abs(netVat) : 0,
        };
    },

    /**
     * Create or update a VAT record for a period
     */
    async createVatRecord(userId: string, input: CreateVatRecordInput) {
        const periodStart = new Date(input.periodStart);
        const periodEnd = new Date(input.periodEnd);

        // Check if record already exists
        const existing = await prisma.vatRecord.findFirst({
            where: { userId, periodLabel: input.periodLabel },
        });

        if (existing) {
            throw new ApiError(409, 'PERIOD_EXISTS', `VAT record for ${input.periodLabel} already exists`);
        }

        // Calculate VAT for the period
        const calculation = await this.calculateVatForPeriod(userId, periodStart, periodEnd);

        const record = await prisma.vatRecord.create({
            data: {
                userId,
                periodStart,
                periodEnd,
                periodLabel: input.periodLabel,
                salesVat: new Decimal(calculation.sales.vatAmount),
                purchaseVat: new Decimal(calculation.purchases.vatAmount),
                netVat: new Decimal(calculation.netVat),
            },
        });

        return record;
    },

    /**
     * Recalculate VAT for an existing record
     */
    async recalculateVatRecord(userId: string, recordId: string) {
        const record = await prisma.vatRecord.findFirst({
            where: { id: recordId, userId },
        });

        if (!record) {
            throw new ApiError(404, 'VAT_RECORD_NOT_FOUND', 'VAT record not found');
        }

        if (record.status !== 'PENDING') {
            throw new ApiError(400, 'RECORD_FILED', 'Cannot recalculate a filed or paid VAT record');
        }

        const calculation = await this.calculateVatForPeriod(userId, record.periodStart, record.periodEnd);

        const updated = await prisma.vatRecord.update({
            where: { id: recordId },
            data: {
                salesVat: new Decimal(calculation.sales.vatAmount),
                purchaseVat: new Decimal(calculation.purchases.vatAmount),
                netVat: new Decimal(calculation.netVat),
            },
        });

        return updated;
    },

    /**
     * Update VAT record status
     */
    async updateVatRecord(userId: string, recordId: string, input: UpdateVatRecordInput) {
        const record = await prisma.vatRecord.findFirst({
            where: { id: recordId, userId },
        });

        if (!record) {
            throw new ApiError(404, 'VAT_RECORD_NOT_FOUND', 'VAT record not found');
        }

        // Build update data object - only include defined fields
        const updateData: Record<string, unknown> = {};
        if (input.status !== undefined) updateData.status = input.status;
        if (input.filedDate !== undefined) updateData.filedDate = new Date(input.filedDate);
        if (input.notes !== undefined) updateData.notes = input.notes;

        const updated = await prisma.vatRecord.update({
            where: { id: recordId },
            data: updateData,
        });

        return updated;
    },

    /**
     * Generate IRD-format VAT return data
     * This creates JSON data in format expected by Nepal IRD
     */
    async generateIrdReport(userId: string, recordId: string) {
        const record = await prisma.vatRecord.findFirst({
            where: { id: recordId, userId },
        });

        if (!record) {
            throw new ApiError(404, 'VAT_RECORD_NOT_FOUND', 'VAT record not found');
        }

        // Get user/business info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                businessName: true,
                panNumber: true,
                vatNumber: true,
                address: true,
            },
        });

        // Get detailed invoice data for the period
        const invoices = await prisma.invoice.findMany({
            where: {
                userId,
                status: { not: 'CANCELLED' },
                issueDate: {
                    gte: record.periodStart,
                    lte: record.periodEnd,
                },
            },
            include: {
                customer: {
                    select: { name: true, panNumber: true },
                },
            },
            orderBy: { invoiceNumber: 'asc' },
        });

        // Get detailed expense data
        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                date: {
                    gte: record.periodStart,
                    lte: record.periodEnd,
                },
            },
            include: {
                vendor: {
                    select: { name: true, panNumber: true },
                },
            },
            orderBy: { date: 'asc' },
        });

        // Build IRD-format report
        const irdReport = {
            submissionInfo: {
                fiscalYear: record.periodLabel.split('-')[0],
                taxPeriod: record.periodLabel,
                submissionDate: new Date().toISOString().split('T')[0],
            },
            taxpayerInfo: {
                panNumber: user?.panNumber ?? '',
                vatNumber: user?.vatNumber ?? '',
                businessName: user?.businessName ?? '',
                address: user?.address ?? '',
            },
            salesRegister: {
                totalSales: Number(record.salesVat) / 0.13, // Calculate from VAT at 13%
                totalVatCollected: Number(record.salesVat),
                invoiceCount: invoices.length,
                invoices: invoices.map((inv) => ({
                    invoiceNumber: inv.invoiceNumber,
                    invoiceDate: inv.issueDate.toISOString().split('T')[0],
                    customerName: inv.customer.name,
                    customerPan: inv.customer.panNumber ?? '',
                    taxableAmount: Number(inv.subtotal),
                    vatAmount: Number(inv.vatAmount),
                    totalAmount: Number(inv.total),
                })),
            },
            purchaseRegister: {
                totalPurchases: Number(record.purchaseVat) / 0.13,
                totalVatPaid: Number(record.purchaseVat),
                expenseCount: expenses.length,
                purchases: expenses.map((exp) => ({
                    billNumber: exp.expenseNumber,
                    billDate: exp.date.toISOString().split('T')[0],
                    vendorName: exp.vendor?.name ?? 'Unknown',
                    vendorPan: exp.vendor?.panNumber ?? '',
                    taxableAmount: Number(exp.amount),
                    vatAmount: Number(exp.vatAmount),
                    totalAmount: Number(exp.totalAmount),
                })),
            },
            vatSummary: {
                vatCollected: Number(record.salesVat),
                vatPaid: Number(record.purchaseVat),
                netVat: Number(record.netVat),
                vatPayable: Number(record.netVat) > 0 ? Number(record.netVat) : 0,
                vatRefundable: Number(record.netVat) < 0 ? Math.abs(Number(record.netVat)) : 0,
            },
        };

        // Save to record
        await prisma.vatRecord.update({
            where: { id: recordId },
            data: { irdReportJson: irdReport },
        });

        return irdReport;
    },

    /**
     * Get VAT summary for dashboard
     */
    async getVatSummary(userId: string) {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const currentMonth = await this.calculateVatForPeriod(userId, startOfMonth, endOfMonth);

        // Get pending VAT records
        const pendingRecords = await prisma.vatRecord.findMany({
            where: { userId, status: 'PENDING' },
            orderBy: { periodStart: 'desc' },
            take: 3,
        });

        return {
            currentMonth,
            pendingRecords,
        };
    },
};
