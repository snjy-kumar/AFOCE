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
        
        // Previous month for comparison
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Run all queries in parallel for performance
        const [
            monthlyRevenue,
            monthlyExpenses,
            prevMonthRevenue,
            prevMonthExpenses,
            yearlyRevenue,
            yearlyExpenses,
            outstandingInvoices,
            overdueInvoices,
            recentInvoices,
            recentExpenses,
            invoicesByStatus,
            bankAccounts,
            pendingApprovals,
            missingReceipts,
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
            
            // Previous month revenue (for comparison)
            prisma.invoice.aggregate({
                where: {
                    userId,
                    status: 'PAID',
                    issueDate: { gte: startOfPrevMonth, lte: endOfPrevMonth },
                },
                _sum: { total: true },
            }),
            
            // Previous month expenses (for comparison)
            prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
                },
                _sum: { totalAmount: true },
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

            // Pending approvals (invoices waiting for approval)
            prisma.invoice.aggregate({
                where: {
                    userId,
                    status: 'PENDING_APPROVAL',
                },
                _sum: { total: true },
                _count: true,
            }),

            // Missing receipts (expenses over threshold without receipt)
            prisma.expense.count({
                where: {
                    userId,
                    amount: { gt: 5000 },
                    receiptUrl: null,
                },
            }),
        ]);

        // Get monthly revenue data for the last 6 months
        const monthlyRevenueData = await this.getMonthlyRevenueData(userId, 6);
        
        // Get expense breakdown by category
        const expensesByCategoryData = await this.getExpensesByCategory(userId, startOfMonth, endOfMonth);
        
        // Get additional stats
        const [activeCustomers, productCount, invoiceCountMTD, expenseCountMTD] = await Promise.all([
            prisma.customer.count({ where: { userId, isActive: true } }),
            prisma.product.count({ where: { userId } }),
            prisma.invoice.count({ where: { userId, issueDate: { gte: startOfMonth, lte: endOfMonth } } }),
            prisma.expense.count({ where: { userId, date: { gte: startOfMonth, lte: endOfMonth } } }),
        ]);
        
        // Calculate average invoice value
        const avgInvoiceValue = monthlyRevenue._count > 0 ? monthlyRevenueAmount / monthlyRevenue._count : 0;
        const vatCollected = Number(monthlyRevenue._sum.vatAmount ?? 0);

        // Calculate metrics
        const monthlyRevenueAmount = Number(monthlyRevenue._sum.total ?? 0);
        const monthlyExpenseAmount = Number(monthlyExpenses._sum.totalAmount ?? 0);
        const monthlyProfit = monthlyRevenueAmount - monthlyExpenseAmount;
        
        // Previous month values for comparison
        const prevMonthRevenueAmount = Number(prevMonthRevenue._sum.total ?? 0);
        const prevMonthExpenseAmount = Number(prevMonthExpenses._sum.totalAmount ?? 0);
        const prevMonthProfit = prevMonthRevenueAmount - prevMonthExpenseAmount;
        
        // Calculate percentage changes (handle division by zero)
        const calculateChange = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };
        
        const revenueChange = calculateChange(monthlyRevenueAmount, prevMonthRevenueAmount);
        const expenseChange = calculateChange(monthlyExpenseAmount, prevMonthExpenseAmount);
        const profitChange = calculateChange(monthlyProfit, prevMonthProfit);
        const yearlyRevenueAmount = Number(yearlyRevenue._sum.total ?? 0);
        const yearlyExpenseAmount = Number(yearlyExpenses._sum.totalAmount ?? 0);
        const yearlyProfit = yearlyRevenueAmount - yearlyExpenseAmount;

        const outstandingAmount =
            Number(outstandingInvoices._sum.total ?? 0) - Number(outstandingInvoices._sum.paidAmount ?? 0);

        const totalCashBalance = bankAccounts.reduce(
            (sum, acc) => sum + Number(acc.currentBalance),
            0
        );

        return {
            // Frontend expects these exact field names
            totalRevenue: monthlyRevenueAmount,
            totalExpenses: monthlyExpenseAmount,
            netProfit: monthlyProfit,
            outstandingInvoices: outstandingAmount,
            vatPayable: Number(monthlyRevenue._sum.vatAmount ?? 0) - Number(monthlyExpenses._sum.vatAmount ?? 0),
            
            // Period-over-period change percentages (NEW)
            revenueChange,
            expenseChange,
            profitChange,
            
            // Workflow metrics (for frontend workflow alerts)
            pendingApprovals: pendingApprovals._count,
            pendingApprovalsValue: Number(pendingApprovals._sum.total ?? 0),
            overdueInvoices: overdueInvoices._count,
            missingReceipts,
            
            // Additional stats for enhanced dashboard
            activeCustomers,
            productCount,
            invoiceCountMTD,
            expenseCountMTD,
            averageInvoiceValue: avgInvoiceValue,
            vatCollected,
            pendingInvoiceCount: outstandingInvoices._count,

            // Additional detailed data
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
            workflow: {
                pendingApprovals: pendingApprovals._count,
                pendingApprovalsValue: Number(pendingApprovals._sum.total ?? 0),
                overdueInvoices: overdueInvoices._count,
                missingReceipts,
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
            
            // Frontend expects these as top-level arrays (not nested)
            recentInvoices: recentInvoices.map((inv) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                customer: inv.customer,
                total: Number(inv.total),
                status: inv.status,
                issueDate: inv.issueDate,
                createdAt: inv.createdAt,
            })),
            recentExpenses: recentExpenses.map((exp) => ({
                id: exp.id,
                expenseNumber: exp.expenseNumber,
                vendor: exp.vendor,
                account: exp.account,
                totalAmount: Number(exp.totalAmount),
                date: exp.date,
                createdAt: exp.createdAt,
                description: exp.description,
            })),
            
            // Chart data with real data from queries
            monthlyRevenue: monthlyRevenueData,
            expensesByCategory: expensesByCategoryData,
        };
    },
    
    /**
     * Get monthly revenue data for charts
     */
    async getMonthlyRevenueData(userId: string, monthsBack: number = 6) {
        const months = [];
        const now = new Date();
        
        for (let i = monthsBack - 1; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            
            const revenue = await prisma.invoice.aggregate({
                where: {
                    userId,
                    status: 'PAID',
                    issueDate: { gte: monthStart, lte: monthEnd },
                },
                _sum: { total: true },
            });
            
            months.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
                amount: Number(revenue._sum.total ?? 0),
            });
        }
        
        return months;
    },
    
    /**
     * Get expenses by category for charts
     */
    async getExpensesByCategory(userId: string, startDate: Date, endDate: Date) {
        const expenses = await prisma.expense.groupBy({
            by: ['accountId'],
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
            },
            _sum: { totalAmount: true },
            _count: true,
        });
        
        // Get account names
        const accountIds = expenses.map(e => e.accountId).filter(Boolean) as string[];
        const accounts = await prisma.account.findMany({
            where: { id: { in: accountIds } },
            select: { id: true, name: true },
        });
        
        const accountMap = new Map(accounts.map(a => [a.id, a.name]));
        
        return expenses.map(e => ({
            category: accountMap.get(e.accountId!) || 'Uncategorized',
            amount: Number(e._sum.totalAmount ?? 0),
            count: e._count,
        })).filter(e => e.amount > 0).slice(0, 6); // Top 6 categories
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
