import prisma from '../lib/prisma.js';

/**
 * Advanced Analytics Service
 * - Business Intelligence Dashboard
 * - Trend Analysis
 * - Forecasting
 * - KPI Tracking
 */

export const analyticsService = {
    /**
     * Get comprehensive business intelligence data
     */
    async getBusinessIntelligence(userId: string) {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

        // Get all necessary data in parallel
        const [
            ytdRevenue,
            ytdExpenses,
            lastYearRevenue,
            lastYearExpenses,
            monthlyData,
            customerMetrics,
            vendorMetrics,
            invoiceMetrics,
            expenseByCategory,
        ] = await Promise.all([
            // YTD Revenue
            prisma.invoice.aggregate({
                where: { userId, status: 'PAID', issueDate: { gte: startOfYear } },
                _sum: { total: true },
            }),
            // YTD Expenses
            prisma.expense.aggregate({
                where: { userId, date: { gte: startOfYear } },
                _sum: { totalAmount: true },
            }),
            // Last Year Revenue
            prisma.invoice.aggregate({
                where: { userId, status: 'PAID', issueDate: { gte: startOfLastYear, lte: endOfLastYear } },
                _sum: { total: true },
            }),
            // Last Year Expenses
            prisma.expense.aggregate({
                where: { userId, date: { gte: startOfLastYear, lte: endOfLastYear } },
                _sum: { totalAmount: true },
            }),
            // Monthly data for last 12 months
            this.getMonthlyTrends(userId, 12),
            // Customer metrics
            this.getCustomerMetrics(userId),
            // Vendor metrics
            this.getVendorMetrics(userId),
            // Invoice metrics
            this.getInvoiceMetrics(userId),
            // Expense by category
            this.getExpenseByCategory(userId, startOfYear),
        ]);

        const ytdRevenueAmount = Number(ytdRevenue._sum.total ?? 0);
        const ytdExpenseAmount = Number(ytdExpenses._sum.totalAmount ?? 0);
        const lastYearRevenueAmount = Number(lastYearRevenue._sum.total ?? 0);
        const lastYearExpenseAmount = Number(lastYearExpenses._sum.totalAmount ?? 0);

        // Calculate growth rates
        const revenueGrowth = lastYearRevenueAmount > 0 
            ? ((ytdRevenueAmount - lastYearRevenueAmount) / lastYearRevenueAmount * 100) 
            : 0;
        const expenseGrowth = lastYearExpenseAmount > 0 
            ? ((ytdExpenseAmount - lastYearExpenseAmount) / lastYearExpenseAmount * 100) 
            : 0;

        return {
            kpis: {
                ytdRevenue: ytdRevenueAmount,
                ytdExpenses: ytdExpenseAmount,
                ytdProfit: ytdRevenueAmount - ytdExpenseAmount,
                profitMargin: ytdRevenueAmount > 0 
                    ? ((ytdRevenueAmount - ytdExpenseAmount) / ytdRevenueAmount * 100).toFixed(1)
                    : '0',
                revenueGrowthYoY: revenueGrowth.toFixed(1),
                expenseGrowthYoY: expenseGrowth.toFixed(1),
            },
            trends: monthlyData,
            customers: customerMetrics,
            vendors: vendorMetrics,
            invoices: invoiceMetrics,
            expenseBreakdown: expenseByCategory,
        };
    },

    /**
     * Get monthly trends for charts
     */
    async getMonthlyTrends(userId: string, months: number = 12) {
        const data: Array<{
            month: string;
            revenue: number;
            expenses: number;
            profit: number;
            invoiceCount: number;
            expenseCount: number;
        }> = [];

        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthLabel = startOfMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

            const [revenue, expenses] = await Promise.all([
                prisma.invoice.aggregate({
                    where: {
                        userId,
                        status: 'PAID',
                        issueDate: { gte: startOfMonth, lte: endOfMonth },
                    },
                    _sum: { total: true },
                    _count: true,
                }),
                prisma.expense.aggregate({
                    where: {
                        userId,
                        date: { gte: startOfMonth, lte: endOfMonth },
                    },
                    _sum: { totalAmount: true },
                    _count: true,
                }),
            ]);

            const revenueAmount = Number(revenue._sum.total ?? 0);
            const expenseAmount = Number(expenses._sum.totalAmount ?? 0);

            data.push({
                month: monthLabel,
                revenue: revenueAmount,
                expenses: expenseAmount,
                profit: revenueAmount - expenseAmount,
                invoiceCount: revenue._count,
                expenseCount: expenses._count,
            });
        }

        return data;
    },

    /**
     * Get customer analytics
     */
    async getCustomerMetrics(userId: string) {
        const customers = await prisma.customer.findMany({
            where: { userId, isActive: true },
            include: {
                invoices: {
                    where: { status: 'PAID' },
                    select: { total: true },
                },
            },
        });

        // Calculate customer lifetime value
        const customerData = customers.map(c => ({
            id: c.id,
            name: c.name,
            invoiceCount: c.invoices.length,
            totalRevenue: c.invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
        }));

        // Sort by revenue
        customerData.sort((a, b) => b.totalRevenue - a.totalRevenue);

        const totalCustomers = customers.length;
        const activeCustomers = customerData.filter(c => c.invoiceCount > 0).length;
        const avgRevenuePerCustomer = totalCustomers > 0 
            ? customerData.reduce((sum, c) => sum + c.totalRevenue, 0) / totalCustomers 
            : 0;

        return {
            total: totalCustomers,
            active: activeCustomers,
            avgRevenuePerCustomer: Math.round(avgRevenuePerCustomer),
            topCustomers: customerData.slice(0, 5),
        };
    },

    /**
     * Get vendor analytics
     */
    async getVendorMetrics(userId: string) {
        const vendors = await prisma.vendor.findMany({
            where: { userId, isActive: true },
            include: {
                expenses: {
                    select: { totalAmount: true },
                },
            },
        });

        const vendorData = vendors.map(v => ({
            id: v.id,
            name: v.name,
            expenseCount: v.expenses.length,
            totalSpent: v.expenses.reduce((sum, exp) => sum + Number(exp.totalAmount), 0),
        }));

        // Sort by spending
        vendorData.sort((a, b) => b.totalSpent - a.totalSpent);

        const totalVendors = vendors.length;
        const activeVendors = vendorData.filter(v => v.expenseCount > 0).length;
        const avgSpendingPerVendor = totalVendors > 0 
            ? vendorData.reduce((sum, v) => sum + v.totalSpent, 0) / totalVendors 
            : 0;

        return {
            total: totalVendors,
            active: activeVendors,
            avgSpendingPerVendor: Math.round(avgSpendingPerVendor),
            topVendors: vendorData.slice(0, 5),
        };
    },

    /**
     * Get invoice analytics
     */
    async getInvoiceMetrics(userId: string) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [byStatus, recentInvoices, avgPaymentDays] = await Promise.all([
            prisma.invoice.groupBy({
                by: ['status'],
                where: { userId },
                _count: true,
                _sum: { total: true },
            }),
            prisma.invoice.findMany({
                where: { userId, createdAt: { gte: thirtyDaysAgo } },
                select: { total: true, status: true },
            }),
            // Calculate average days to payment for paid invoices
            prisma.invoice.findMany({
                where: { userId, status: 'PAID' },
                select: { issueDate: true, updatedAt: true },
                take: 100,
                orderBy: { updatedAt: 'desc' },
            }),
        ]);

        // Calculate average payment time
        let totalDays = 0;
        let paidCount = 0;
        for (const inv of avgPaymentDays) {
            const days = Math.floor((inv.updatedAt.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24));
            if (days > 0 && days < 365) {
                totalDays += days;
                paidCount++;
            }
        }
        const avgDaysToPayment = paidCount > 0 ? Math.round(totalDays / paidCount) : 0;

        const statusBreakdown = byStatus.map(s => ({
            status: s.status,
            count: s._count,
            total: Number(s._sum.total ?? 0),
        }));

        const last30DaysTotal = recentInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
        const last30DaysCount = recentInvoices.length;

        return {
            byStatus: statusBreakdown,
            last30Days: {
                count: last30DaysCount,
                total: last30DaysTotal,
            },
            avgDaysToPayment,
            collectionRate: byStatus.length > 0 
                ? (statusBreakdown.find(s => s.status === 'PAID')?.count ?? 0) / 
                  statusBreakdown.reduce((sum, s) => sum + s.count, 0) * 100
                : 0,
        };
    },

    /**
     * Get expense breakdown by category/account
     */
    async getExpenseByCategory(userId: string, startDate: Date) {
        const expenses = await prisma.expense.findMany({
            where: { userId, date: { gte: startDate } },
            include: {
                account: { select: { name: true, type: true } },
            },
        });

        const byCategory = new Map<string, number>();
        for (const exp of expenses) {
            const category = exp.account?.name ?? 'Uncategorized';
            byCategory.set(category, (byCategory.get(category) ?? 0) + Number(exp.totalAmount));
        }

        const categories = Array.from(byCategory.entries())
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);

        const total = categories.reduce((sum, c) => sum + c.amount, 0);

        return {
            categories: categories.slice(0, 10).map(c => ({
                ...c,
                percentage: total > 0 ? ((c.amount / total) * 100).toFixed(1) : '0',
            })),
            total,
        };
    },

    /**
     * Get seasonal patterns analysis
     */
    async getSeasonalPatterns(userId: string) {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        const invoices = await prisma.invoice.findMany({
            where: { userId, status: 'PAID', issueDate: { gte: twoYearsAgo } },
            select: { issueDate: true, total: true },
        });

        // Group by month of year
        const monthlyPatterns = new Array(12).fill(0).map(() => ({ total: 0, count: 0 }));
        
        for (const inv of invoices) {
            const month = inv.issueDate.getMonth();
            monthlyPatterns[month].total += Number(inv.total);
            monthlyPatterns[month].count++;
        }

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        return monthlyPatterns.map((p, i) => ({
            month: monthNames[i],
            avgRevenue: p.count > 0 ? Math.round(p.total / p.count) : 0,
            invoiceCount: p.count,
        }));
    },

    /**
     * Get comparative analysis (current vs previous period)
     */
    async getComparativeAnalysis(userId: string, periodType: 'month' | 'quarter' | 'year' = 'month') {
        const now = new Date();
        let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

        switch (periodType) {
            case 'year':
                currentStart = new Date(now.getFullYear(), 0, 1);
                currentEnd = now;
                previousStart = new Date(now.getFullYear() - 1, 0, 1);
                previousEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            case 'quarter':
                const currentQuarter = Math.floor(now.getMonth() / 3);
                currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
                currentEnd = now;
                previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
                previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
                break;
            default: // month
                currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
                currentEnd = now;
                previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        const [currentRevenue, previousRevenue, currentExpenses, previousExpenses] = await Promise.all([
            prisma.invoice.aggregate({
                where: { userId, status: 'PAID', issueDate: { gte: currentStart, lte: currentEnd } },
                _sum: { total: true },
                _count: true,
            }),
            prisma.invoice.aggregate({
                where: { userId, status: 'PAID', issueDate: { gte: previousStart, lte: previousEnd } },
                _sum: { total: true },
                _count: true,
            }),
            prisma.expense.aggregate({
                where: { userId, date: { gte: currentStart, lte: currentEnd } },
                _sum: { totalAmount: true },
                _count: true,
            }),
            prisma.expense.aggregate({
                where: { userId, date: { gte: previousStart, lte: previousEnd } },
                _sum: { totalAmount: true },
                _count: true,
            }),
        ]);

        const current = {
            revenue: Number(currentRevenue._sum.total ?? 0),
            expenses: Number(currentExpenses._sum.totalAmount ?? 0),
            invoiceCount: currentRevenue._count,
            expenseCount: currentExpenses._count,
        };

        const previous = {
            revenue: Number(previousRevenue._sum.total ?? 0),
            expenses: Number(previousExpenses._sum.totalAmount ?? 0),
            invoiceCount: previousRevenue._count,
            expenseCount: previousExpenses._count,
        };

        return {
            periodType,
            current: {
                ...current,
                profit: current.revenue - current.expenses,
            },
            previous: {
                ...previous,
                profit: previous.revenue - previous.expenses,
            },
            changes: {
                revenue: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1) : '100',
                expenses: previous.expenses > 0 ? ((current.expenses - previous.expenses) / previous.expenses * 100).toFixed(1) : '100',
                profit: previous.revenue - previous.expenses !== 0 
                    ? (((current.revenue - current.expenses) - (previous.revenue - previous.expenses)) / Math.abs(previous.revenue - previous.expenses) * 100).toFixed(1)
                    : '100',
            },
        };
    },
};

export default analyticsService;
