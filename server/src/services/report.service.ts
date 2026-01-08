import prisma from '../lib/prisma.js';
import type { ReportDateRange } from '../schemas/report.schema.js';

/**
 * Report service - Financial reporting
 * Generates Profit & Loss, Balance Sheet, Sales Summary, Expense Summary, and Aging Reports
 */

export const reportService = {
    /**
     * Profit & Loss Statement
     */
    async getProfitAndLoss(userId: string, dateRange: ReportDateRange) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        // Get income from invoices
        const income = await prisma.invoice.findMany({
            where: {
                userId,
                status: { not: 'CANCELLED' },
                issueDate: { gte: startDate, lte: endDate },
            },
            include: {
                items: {
                    include: {
                        account: { select: { id: true, code: true, name: true } },
                    },
                },
            },
        });

        // Aggregate income by account
        const incomeByAccount = new Map<string, { account: { id: string; code: string; name: string }; amount: number }>();
        for (const invoice of income) {
            for (const item of invoice.items) {
                const existing = incomeByAccount.get(item.accountId);
                const amount = Number(item.amount);
                if (existing) {
                    existing.amount += amount;
                } else {
                    incomeByAccount.set(item.accountId, { account: item.account, amount });
                }
            }
        }

        // Get expenses
        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
            },
            include: {
                account: { select: { id: true, code: true, name: true } },
            },
        });

        // Aggregate expenses by account
        const expenseByAccount = new Map<string, { account: { id: string; code: string; name: string }; amount: number }>();
        for (const expense of expenses) {
            const existing = expenseByAccount.get(expense.accountId);
            const amount = Number(expense.totalAmount);
            if (existing) {
                existing.amount += amount;
            } else {
                expenseByAccount.set(expense.accountId, { account: expense.account, amount });
            }
        }

        const totalIncome = Array.from(incomeByAccount.values()).reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = Array.from(expenseByAccount.values()).reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        return {
            period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
            income: {
                items: Array.from(incomeByAccount.values()).map((item) => ({
                    account: item.account,
                    amount: item.amount,
                })),
                total: totalIncome,
            },
            expenses: {
                items: Array.from(expenseByAccount.values()).map((item) => ({
                    account: item.account,
                    amount: item.amount,
                })),
                total: totalExpenses,
            },
            netProfit,
            profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : '0',
        };
    },

    /**
     * Balance Sheet
     */
    async getBalanceSheet(userId: string, asOfDate: string) {
        const date = new Date(asOfDate);

        // Calculate receivables (unpaid invoices)
        const receivables = await prisma.invoice.aggregate({
            where: {
                userId,
                status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
                issueDate: { lte: date },
            },
            _sum: { total: true, paidAmount: true },
        });

        const totalReceivables = Number(receivables._sum.total ?? 0) - Number(receivables._sum.paidAmount ?? 0);

        // Calculate payables (unpaid expenses)
        const payables = await prisma.expense.aggregate({
            where: {
                userId,
                isPaid: false,
                date: { lte: date },
            },
            _sum: { totalAmount: true },
        });

        const totalPayables = Number(payables._sum.totalAmount ?? 0);

        // Get total income up to date
        const totalIncome = await prisma.invoice.aggregate({
            where: {
                userId,
                status: 'PAID',
                issueDate: { lte: date },
            },
            _sum: { total: true },
        });

        // Get total expenses up to date
        const totalExpenses = await prisma.expense.aggregate({
            where: {
                userId,
                date: { lte: date },
            },
            _sum: { totalAmount: true },
        });

        const retainedEarnings = Number(totalIncome._sum.total ?? 0) - Number(totalExpenses._sum.totalAmount ?? 0);

        // Get bank balances
        const bankAccounts = await prisma.bankAccount.findMany({
            where: { userId, isActive: true },
            select: { name: true, currentBalance: true },
        });

        const totalCash = bankAccounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

        // Build balance sheet structure
        const assets = {
            current: {
                cash: totalCash,
                accountsReceivable: totalReceivables,
                items: bankAccounts.map((acc) => ({
                    name: acc.name,
                    amount: Number(acc.currentBalance),
                })),
            },
            total: totalCash + totalReceivables,
        };

        const liabilities = {
            current: {
                accountsPayable: totalPayables,
            },
            total: totalPayables,
        };

        const equity = {
            retainedEarnings,
            total: retainedEarnings,
        };

        return {
            asOfDate,
            assets,
            liabilities,
            equity,
            totalLiabilitiesAndEquity: liabilities.total + equity.total,
            isBalanced: Math.abs(assets.total - (liabilities.total + equity.total)) < 0.01,
        };
    },

    /**
     * Sales Summary Report
     */
    async getSalesSummary(userId: string, dateRange: ReportDateRange) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        // Get invoices grouped by status
        const byStatus = await prisma.invoice.groupBy({
            by: ['status'],
            where: {
                userId,
                issueDate: { gte: startDate, lte: endDate },
            },
            _count: true,
            _sum: { total: true, vatAmount: true, paidAmount: true },
        });

        // Get invoices by customer
        const byCustomer = await prisma.invoice.groupBy({
            by: ['customerId'],
            where: {
                userId,
                status: { not: 'CANCELLED' },
                issueDate: { gte: startDate, lte: endDate },
            },
            _count: true,
            _sum: { total: true },
            orderBy: { _sum: { total: 'desc' } },
            take: 10,
        });

        // Get customer names
        const customerIds = byCustomer.map((c) => c.customerId);
        const customers = await prisma.customer.findMany({
            where: { id: { in: customerIds } },
            select: { id: true, name: true },
        });
        const customerMap = new Map(customers.map((c) => [c.id, c.name]));

        // Monthly breakdown
        const invoices = await prisma.invoice.findMany({
            where: {
                userId,
                status: { not: 'CANCELLED' },
                issueDate: { gte: startDate, lte: endDate },
            },
            select: { issueDate: true, total: true },
        });

        const byMonth = new Map<string, number>();
        for (const inv of invoices) {
            const monthKey = `${inv.issueDate.getFullYear()}-${String(inv.issueDate.getMonth() + 1).padStart(2, '0')}`;
            byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + Number(inv.total));
        }

        const totals = byStatus.reduce(
            (acc, item) => {
                if (item.status !== 'CANCELLED') {
                    acc.totalSales += Number(item._sum.total ?? 0);
                    acc.totalVat += Number(item._sum.vatAmount ?? 0);
                    acc.totalPaid += Number(item._sum.paidAmount ?? 0);
                    acc.invoiceCount += item._count;
                }
                return acc;
            },
            { totalSales: 0, totalVat: 0, totalPaid: 0, invoiceCount: 0 }
        );

        return {
            period: dateRange,
            totals,
            byStatus: byStatus.map((s) => ({
                status: s.status,
                count: s._count,
                total: Number(s._sum.total ?? 0),
                vatAmount: Number(s._sum.vatAmount ?? 0),
            })),
            topCustomers: byCustomer.map((c) => ({
                customerId: c.customerId,
                customerName: customerMap.get(c.customerId) ?? 'Unknown',
                invoiceCount: c._count,
                total: Number(c._sum.total ?? 0),
            })),
            byMonth: Array.from(byMonth.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, total]) => ({ month, total })),
        };
    },

    /**
     * Expense Summary Report
     */
    async getExpenseSummary(userId: string, dateRange: ReportDateRange) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        // By account/category
        const byAccount = await prisma.expense.groupBy({
            by: ['accountId'],
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
            },
            _count: true,
            _sum: { amount: true, vatAmount: true, totalAmount: true },
            orderBy: { _sum: { totalAmount: 'desc' } },
        });

        // Get account names
        const accountIds = byAccount.map((a) => a.accountId);
        const accounts = await prisma.account.findMany({
            where: { id: { in: accountIds } },
            select: { id: true, code: true, name: true },
        });
        const accountMap = new Map(accounts.map((a) => [a.id, a]));

        // By vendor
        const byVendor = await prisma.expense.groupBy({
            by: ['vendorId'],
            where: {
                userId,
                vendorId: { not: null },
                date: { gte: startDate, lte: endDate },
            },
            _count: true,
            _sum: { totalAmount: true },
            orderBy: { _sum: { totalAmount: 'desc' } },
            take: 10,
        });

        // Get vendor names
        const vendorIds = byVendor.filter((v) => v.vendorId).map((v) => v.vendorId as string);
        const vendors = await prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, name: true },
        });
        const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

        // Monthly breakdown
        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
            },
            select: { date: true, totalAmount: true },
        });

        const byMonth = new Map<string, number>();
        for (const exp of expenses) {
            const monthKey = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, '0')}`;
            byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + Number(exp.totalAmount));
        }

        const totals = byAccount.reduce(
            (acc, item) => {
                acc.totalAmount += Number(item._sum.amount ?? 0);
                acc.totalVat += Number(item._sum.vatAmount ?? 0);
                acc.totalWithVat += Number(item._sum.totalAmount ?? 0);
                acc.expenseCount += item._count;
                return acc;
            },
            { totalAmount: 0, totalVat: 0, totalWithVat: 0, expenseCount: 0 }
        );

        return {
            period: dateRange,
            totals,
            byCategory: byAccount.map((a) => ({
                account: accountMap.get(a.accountId),
                count: a._count,
                amount: Number(a._sum.amount ?? 0),
                vatAmount: Number(a._sum.vatAmount ?? 0),
                total: Number(a._sum.totalAmount ?? 0),
            })),
            topVendors: byVendor.map((v) => ({
                vendorId: v.vendorId,
                vendorName: v.vendorId ? vendorMap.get(v.vendorId) ?? 'Unknown' : 'No Vendor',
                expenseCount: v._count,
                total: Number(v._sum.totalAmount ?? 0),
            })),
            byMonth: Array.from(byMonth.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, total]) => ({ month, total })),
        };
    },

    /**
     * Accounts Receivable Aging Report
     */
    async getARAgingReport(userId: string, asOfDate?: string) {
        const date = asOfDate ? new Date(asOfDate) : new Date();

        const invoices = await prisma.invoice.findMany({
            where: {
                userId,
                status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
                issueDate: { lte: date },
            },
            include: {
                customer: { select: { id: true, name: true } },
            },
            orderBy: { dueDate: 'asc' },
        });

        // Calculate aging buckets
        const aging = {
            current: [] as typeof invoices,
            days1to30: [] as typeof invoices,
            days31to60: [] as typeof invoices,
            days61to90: [] as typeof invoices,
            over90: [] as typeof invoices,
        };

        for (const invoice of invoices) {
            const balance = Number(invoice.total) - Number(invoice.paidAmount);
            if (balance <= 0) continue;

            const daysPastDue = Math.floor((date.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysPastDue <= 0) {
                aging.current.push(invoice);
            } else if (daysPastDue <= 30) {
                aging.days1to30.push(invoice);
            } else if (daysPastDue <= 60) {
                aging.days31to60.push(invoice);
            } else if (daysPastDue <= 90) {
                aging.days61to90.push(invoice);
            } else {
                aging.over90.push(invoice);
            }
        }

        const calculateBucket = (invoices: typeof aging.current) => ({
            count: invoices.length,
            total: invoices.reduce((sum, inv) => sum + Number(inv.total) - Number(inv.paidAmount), 0),
            invoices: invoices.map((inv) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                customer: inv.customer.name,
                issueDate: inv.issueDate,
                dueDate: inv.dueDate,
                total: Number(inv.total),
                paid: Number(inv.paidAmount),
                balance: Number(inv.total) - Number(inv.paidAmount),
            })),
        });

        return {
            asOfDate: date.toISOString().split('T')[0],
            current: calculateBucket(aging.current),
            days1to30: calculateBucket(aging.days1to30),
            days31to60: calculateBucket(aging.days31to60),
            days61to90: calculateBucket(aging.days61to90),
            over90: calculateBucket(aging.over90),
            totalOutstanding: invoices.reduce((sum, inv) => sum + Number(inv.total) - Number(inv.paidAmount), 0),
        };
    },

    /**
     * Accounts Payable Aging Report
     */
    async getAPAgingReport(userId: string, asOfDate?: string) {
        const date = asOfDate ? new Date(asOfDate) : new Date();

        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                isPaid: false,
                date: { lte: date },
            },
            include: {
                vendor: { select: { id: true, name: true } },
            },
            orderBy: { date: 'asc' },
        });

        // Calculate aging buckets
        const aging = {
            current: [] as typeof expenses,
            days1to30: [] as typeof expenses,
            days31to60: [] as typeof expenses,
            days61to90: [] as typeof expenses,
            over90: [] as typeof expenses,
        };

        for (const expense of expenses) {
            const daysOld = Math.floor((date.getTime() - expense.date.getTime()) / (1000 * 60 * 60 * 24));

            if (daysOld <= 0) {
                aging.current.push(expense);
            } else if (daysOld <= 30) {
                aging.days1to30.push(expense);
            } else if (daysOld <= 60) {
                aging.days31to60.push(expense);
            } else if (daysOld <= 90) {
                aging.days61to90.push(expense);
            } else {
                aging.over90.push(expense);
            }
        }

        const calculateBucket = (expenses: typeof aging.current) => ({
            count: expenses.length,
            total: expenses.reduce((sum, exp) => sum + Number(exp.totalAmount), 0),
            expenses: expenses.map((exp) => ({
                id: exp.id,
                expenseNumber: exp.expenseNumber,
                vendor: exp.vendor?.name ?? 'No Vendor',
                date: exp.date,
                amount: Number(exp.totalAmount),
                description: exp.description,
            })),
        });

        return {
            asOfDate: date.toISOString().split('T')[0],
            current: calculateBucket(aging.current),
            days1to30: calculateBucket(aging.days1to30),
            days31to60: calculateBucket(aging.days31to60),
            days61to90: calculateBucket(aging.days61to90),
            over90: calculateBucket(aging.over90),
            totalPayable: expenses.reduce((sum, exp) => sum + Number(exp.totalAmount), 0),
        };
    },
};
