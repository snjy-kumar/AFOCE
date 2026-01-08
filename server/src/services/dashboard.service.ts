import prisma from '../lib/prisma.js';

/**
 * Dashboard service - Real-time business overview
 */

export const dashboardService = {
    /**
     * Get comprehensive dashboard data
     */
    async getDashboardData(userId: string) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Run all queries in parallel for performance
        const [
            monthlyRevenue,
            monthlyExpenses,
            yearlyRevenue,
            yearlyExpenses,
            outstandingInvoices,
            overdueInvoices,
            recentInvoices,
            recentExpenses,
            invoicesByStatus,
            bankAccounts,
        ] = await Promise.all([
            // Monthly revenue (paid invoices)
            prisma.invoice.aggregate({
                where: {
                    userId,
                    status: 'PAID',
                    issueDate: { gte: startOfMonth, lte: endOfMonth },
                },
                _sum: { total: true, vatAmount: true },
                _count: true,
            }),

            // Monthly expenses
            prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: startOfMonth, lte: endOfMonth },
                },
                _sum: { totalAmount: true, vatAmount: true },
                _count: true,
            }),

            // Yearly revenue
            prisma.invoice.aggregate({
                where: {
                    userId,
                    status: 'PAID',
                    issueDate: { gte: startOfYear },
                },
                _sum: { total: true },
            }),

            // Yearly expenses
            prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: startOfYear },
                },
                _sum: { totalAmount: true },
            }),

            // Outstanding invoices (sent but not paid)
            prisma.invoice.aggregate({
                where: {
                    userId,
                    status: { in: ['SENT', 'PARTIALLY_PAID'] },
                },
                _sum: { total: true, paidAmount: true },
                _count: true,
            }),

            // Overdue invoices
            prisma.invoice.aggregate({
                where: {
                    userId,
                    status: 'OVERDUE',
                },
                _sum: { total: true, paidAmount: true },
                _count: true,
            }),

            // Recent invoices
            prisma.invoice.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    customer: { select: { name: true } },
                },
            }),

            // Recent expenses
            prisma.expense.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    vendor: { select: { name: true } },
                    account: { select: { name: true } },
                },
            }),

            // Invoices by status
            prisma.invoice.groupBy({
                by: ['status'],
                where: { userId },
                _count: true,
                _sum: { total: true },
            }),

            // Bank account balances
            prisma.bankAccount.findMany({
                where: { userId, isActive: true },
                select: {
                    id: true,
                    name: true,
                    currentBalance: true,
                },
            }),
        ]);

        // Calculate metrics
        const monthlyRevenueAmount = Number(monthlyRevenue._sum.total ?? 0);
        const monthlyExpenseAmount = Number(monthlyExpenses._sum.totalAmount ?? 0);
        const monthlyProfit = monthlyRevenueAmount - monthlyExpenseAmount;

        const yearlyRevenueAmount = Number(yearlyRevenue._sum.total ?? 0);
        const yearlyExpenseAmount = Number(yearlyExpenses._sum.totalAmount ?? 0);
        const yearlyProfit = yearlyRevenueAmount - yearlyExpenseAmount;

        const outstandingAmount =
            Number(outstandingInvoices._sum.total ?? 0) - Number(outstandingInvoices._sum.paidAmount ?? 0);
        const overdueAmount =
            Number(overdueInvoices._sum.total ?? 0) - Number(overdueInvoices._sum.paidAmount ?? 0);

        const totalCashBalance = bankAccounts.reduce(
            (sum, acc) => sum + Number(acc.currentBalance),
            0
        );

        return {
            overview: {
                monthlyRevenue: monthlyRevenueAmount,
                monthlyExpenses: monthlyExpenseAmount,
                monthlyProfit,
                monthlyVatCollected: Number(monthlyRevenue._sum.vatAmount ?? 0),
                monthlyVatPaid: Number(monthlyExpenses._sum.vatAmount ?? 0),
                yearlyRevenue: yearlyRevenueAmount,
                yearlyExpenses: yearlyExpenseAmount,
                yearlyProfit,
            },
            receivables: {
                outstanding: outstandingAmount,
                outstandingCount: outstandingInvoices._count,
                overdue: overdueAmount,
                overdueCount: overdueInvoices._count,
            },
            cashPosition: {
                totalBalance: totalCashBalance,
                accounts: bankAccounts.map((acc) => ({
                    id: acc.id,
                    name: acc.name,
                    balance: Number(acc.currentBalance),
                })),
            },
            invoicesByStatus: invoicesByStatus.map((s) => ({
                status: s.status,
                count: s._count,
                total: Number(s._sum.total ?? 0),
            })),
            recentTransactions: {
                invoices: recentInvoices.map((inv) => ({
                    id: inv.id,
                    type: 'invoice' as const,
                    number: inv.invoiceNumber,
                    customer: inv.customer.name,
                    amount: Number(inv.total),
                    status: inv.status,
                    date: inv.issueDate,
                })),
                expenses: recentExpenses.map((exp) => ({
                    id: exp.id,
                    type: 'expense' as const,
                    number: exp.expenseNumber,
                    vendor: exp.vendor?.name ?? 'N/A',
                    category: exp.account.name,
                    amount: Number(exp.totalAmount),
                    date: exp.date,
                })),
            },
        };
    },

    /**
     * Get quick stats for header/summary
     */
    async getQuickStats(userId: string) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [invoiceCount, expenseCount, customerCount, vendorCount] = await Promise.all([
            prisma.invoice.count({
                where: { userId, createdAt: { gte: thirtyDaysAgo } },
            }),
            prisma.expense.count({
                where: { userId, createdAt: { gte: thirtyDaysAgo } },
            }),
            prisma.customer.count({
                where: { userId, isActive: true },
            }),
            prisma.vendor.count({
                where: { userId, isActive: true },
            }),
        ]);

        return {
            invoicesLast30Days: invoiceCount,
            expensesLast30Days: expenseCount,
            activeCustomers: customerCount,
            activeVendors: vendorCount,
        };
    },
};
