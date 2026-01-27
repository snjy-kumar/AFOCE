import prisma from '../lib/prisma.js';

/**
 * AI-Powered Features Service
 * - Auto-categorization of expenses
 * - Invoice data extraction (OCR placeholder)
 * - Anomaly detection
 * - Cash flow predictions
 */

// Common expense categories with keywords for matching
const EXPENSE_CATEGORIES = [
    {
        category: 'Office Supplies',
        keywords: ['stationery', 'paper', 'pen', 'printer', 'ink', 'toner', 'office', 'supplies', 'stapler', 'folder'],
        accountCode: '5100',
    },
    {
        category: 'Utilities',
        keywords: ['electricity', 'water', 'internet', 'phone', 'mobile', 'broadband', 'wifi', 'utility', 'nea', 'ntc', 'ncell'],
        accountCode: '5200',
    },
    {
        category: 'Rent',
        keywords: ['rent', 'lease', 'office space', 'building', 'property', 'monthly rent'],
        accountCode: '5300',
    },
    {
        category: 'Travel & Transport',
        keywords: ['travel', 'taxi', 'fuel', 'petrol', 'diesel', 'bus', 'flight', 'hotel', 'accommodation', 'pathao', 'uber', 'indrive'],
        accountCode: '5400',
    },
    {
        category: 'Food & Entertainment',
        keywords: ['food', 'meal', 'lunch', 'dinner', 'restaurant', 'tea', 'coffee', 'snacks', 'entertainment', 'client meeting'],
        accountCode: '5500',
    },
    {
        category: 'Professional Services',
        keywords: ['legal', 'accounting', 'consulting', 'audit', 'lawyer', 'advocate', 'ca', 'chartered', 'professional'],
        accountCode: '5600',
    },
    {
        category: 'Marketing & Advertising',
        keywords: ['marketing', 'advertising', 'facebook', 'google ads', 'promotion', 'branding', 'social media', 'campaign'],
        accountCode: '5700',
    },
    {
        category: 'Software & Subscriptions',
        keywords: ['software', 'subscription', 'license', 'saas', 'cloud', 'hosting', 'domain', 'microsoft', 'google', 'zoom'],
        accountCode: '5800',
    },
    {
        category: 'Maintenance & Repairs',
        keywords: ['repair', 'maintenance', 'fix', 'service', 'plumber', 'electrician', 'technician', 'ac', 'computer'],
        accountCode: '5900',
    },
    {
        category: 'Insurance',
        keywords: ['insurance', 'premium', 'policy', 'coverage', 'health', 'vehicle', 'property'],
        accountCode: '6000',
    },
];

// Vendor category mappings based on common Nepal vendors
const VENDOR_MAPPINGS: Record<string, string> = {
    'nepal electricity authority': 'Utilities',
    'nea': 'Utilities',
    'ntc': 'Utilities',
    'ncell': 'Utilities',
    'worldlink': 'Utilities',
    'vianet': 'Utilities',
    'subisu': 'Utilities',
    'pathao': 'Travel & Transport',
    'indrive': 'Travel & Transport',
    'daraz': 'Office Supplies',
    'hamrobazar': 'Office Supplies',
    'bhatbhateni': 'Food & Entertainment',
    'salesberry': 'Food & Entertainment',
    'bigmart': 'Food & Entertainment',
};

export const aiService = {
    /**
     * Auto-categorize an expense based on description and vendor
     */
    async categorizeExpense(description: string, vendorName?: string, userId?: string): Promise<{
        category: string;
        accountCode: string;
        confidence: number;
        suggestedAccountId?: string;
    }> {
        const text = `${description} ${vendorName || ''}`.toLowerCase();
        
        // Check vendor mappings first (higher confidence)
        if (vendorName) {
            const vendorLower = vendorName.toLowerCase();
            for (const [vendor, category] of Object.entries(VENDOR_MAPPINGS)) {
                if (vendorLower.includes(vendor)) {
                    const categoryData = EXPENSE_CATEGORIES.find(c => c.category === category);
                    if (categoryData) {
                        const account = userId ? await this.findAccountByCode(userId, categoryData.accountCode) : null;
                        return {
                            category: categoryData.category,
                            accountCode: categoryData.accountCode,
                            confidence: 0.9,
                            suggestedAccountId: account?.id,
                        };
                    }
                }
            }
        }
        
        // Score each category based on keyword matches
        let bestMatch = { category: 'Other', accountCode: '5999', score: 0 };
        
        for (const cat of EXPENSE_CATEGORIES) {
            let score = 0;
            for (const keyword of cat.keywords) {
                if (text.includes(keyword)) {
                    score += keyword.length; // Longer matches get higher scores
                }
            }
            if (score > bestMatch.score) {
                bestMatch = { category: cat.category, accountCode: cat.accountCode, score };
            }
        }
        
        // Calculate confidence based on score
        const confidence = bestMatch.score > 0 ? Math.min(0.8, bestMatch.score * 0.1) : 0.1;
        
        // Find matching account if userId provided
        const account = userId && bestMatch.accountCode !== '5999' 
            ? await this.findAccountByCode(userId, bestMatch.accountCode) 
            : null;
        
        return {
            category: bestMatch.category,
            accountCode: bestMatch.accountCode,
            confidence,
            suggestedAccountId: account?.id,
        };
    },

    /**
     * Find account by code for a user
     */
    async findAccountByCode(userId: string, code: string) {
        return prisma.account.findFirst({
            where: { userId, code },
        });
    },

    /**
     * Extract data from receipt/invoice image (placeholder for OCR integration)
     * In production, this would integrate with services like:
     * - Google Cloud Vision
     * - AWS Textract
     * - Azure Form Recognizer
     */
    async extractFromImage(imageUrl: string): Promise<{
        vendor?: string;
        date?: string;
        amount?: number;
        vatAmount?: number;
        items?: Array<{ description: string; amount: number }>;
        panNumber?: string;
        confidence: number;
    }> {
        // Placeholder implementation
        console.log(`OCR extraction requested for: ${imageUrl}`);
        
        // In production, call OCR API here
        // For now, return empty result indicating manual entry needed
        return {
            confidence: 0,
        };
    },

    /**
     * Detect anomalies in financial data
     */
    async detectAnomalies(userId: string): Promise<Array<{
        type: 'EXPENSE_SPIKE' | 'UNUSUAL_TRANSACTION' | 'DUPLICATE_PAYMENT' | 'MISSING_RECEIPT';
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        description: string;
        entityId?: string;
        entityType?: string;
    }>> {
        const anomalies: Array<{
            type: 'EXPENSE_SPIKE' | 'UNUSUAL_TRANSACTION' | 'DUPLICATE_PAYMENT' | 'MISSING_RECEIPT';
            severity: 'LOW' | 'MEDIUM' | 'HIGH';
            description: string;
            entityId?: string;
            entityType?: string;
        }> = [];
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        
        // 1. Check for expense spikes (compared to previous period)
        const [currentPeriodExpenses, previousPeriodExpenses] = await Promise.all([
            prisma.expense.aggregate({
                where: { userId, date: { gte: thirtyDaysAgo } },
                _sum: { totalAmount: true },
            }),
            prisma.expense.aggregate({
                where: { userId, date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
                _sum: { totalAmount: true },
            }),
        ]);
        
        const currentTotal = Number(currentPeriodExpenses._sum.totalAmount ?? 0);
        const previousTotal = Number(previousPeriodExpenses._sum.totalAmount ?? 0);
        
        if (previousTotal > 0 && currentTotal > previousTotal * 1.5) {
            anomalies.push({
                type: 'EXPENSE_SPIKE',
                severity: currentTotal > previousTotal * 2 ? 'HIGH' : 'MEDIUM',
                description: `Expenses increased by ${Math.round((currentTotal / previousTotal - 1) * 100)}% compared to previous period`,
            });
        }
        
        // 2. Check for potential duplicate payments
        const recentExpenses = await prisma.expense.findMany({
            where: { userId, date: { gte: thirtyDaysAgo } },
            include: { vendor: { select: { name: true } } },
        });
        
        const expenseGroups = new Map<string, typeof recentExpenses>();
        for (const expense of recentExpenses) {
            const key = `${expense.vendorId || 'no-vendor'}-${expense.totalAmount.toString()}`;
            if (!expenseGroups.has(key)) {
                expenseGroups.set(key, []);
            }
            expenseGroups.get(key)!.push(expense);
        }
        
        for (const [, group] of expenseGroups) {
            if (group.length >= 2) {
                // Check if expenses are within 7 days of each other
                for (let i = 0; i < group.length - 1; i++) {
                    const diff = Math.abs(group[i].date.getTime() - group[i + 1].date.getTime());
                    if (diff < 7 * 24 * 60 * 60 * 1000) {
                        anomalies.push({
                            type: 'DUPLICATE_PAYMENT',
                            severity: 'MEDIUM',
                            description: `Potential duplicate: ${group[i].vendor?.name || 'Unknown'} - NPR ${group[i].totalAmount} on ${group[i].date.toDateString()} and ${group[i + 1].date.toDateString()}`,
                            entityId: group[i].id,
                            entityType: 'expense',
                        });
                        break;
                    }
                }
            }
        }
        
        // 3. Check for missing receipts on large expenses
        const largeExpensesWithoutReceipts = await prisma.expense.findMany({
            where: {
                userId,
                amount: { gt: 5000 },
                receiptUrl: null,
                date: { gte: thirtyDaysAgo },
            },
            take: 10,
        });
        
        for (const expense of largeExpensesWithoutReceipts) {
            anomalies.push({
                type: 'MISSING_RECEIPT',
                severity: Number(expense.amount) > 10000 ? 'HIGH' : 'LOW',
                description: `Expense ${expense.expenseNumber} (NPR ${expense.amount}) is missing receipt`,
                entityId: expense.id,
                entityType: 'expense',
            });
        }
        
        return anomalies;
    },

    /**
     * Predict cash flow for next periods
     */
    async predictCashFlow(userId: string, periods: number = 3): Promise<Array<{
        period: string;
        predictedInflow: number;
        predictedOutflow: number;
        predictedBalance: number;
        confidence: number;
    }>> {
        // Get historical data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const [invoices, expenses] = await Promise.all([
            prisma.invoice.findMany({
                where: { userId, issueDate: { gte: sixMonthsAgo }, status: 'PAID' },
                select: { issueDate: true, total: true },
            }),
            prisma.expense.findMany({
                where: { userId, date: { gte: sixMonthsAgo } },
                select: { date: true, totalAmount: true },
            }),
        ]);
        
        // Group by month
        const monthlyData: Record<string, { inflow: number; outflow: number }> = {};
        
        for (const inv of invoices) {
            const month = inv.issueDate.toISOString().slice(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { inflow: 0, outflow: 0 };
            monthlyData[month].inflow += Number(inv.total);
        }
        
        for (const exp of expenses) {
            const month = exp.date.toISOString().slice(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { inflow: 0, outflow: 0 };
            monthlyData[month].outflow += Number(exp.totalAmount);
        }
        
        // Calculate averages
        const months = Object.keys(monthlyData).sort();
        const avgInflow = months.length > 0 
            ? months.reduce((sum, m) => sum + monthlyData[m].inflow, 0) / months.length 
            : 0;
        const avgOutflow = months.length > 0 
            ? months.reduce((sum, m) => sum + monthlyData[m].outflow, 0) / months.length 
            : 0;
        
        // Generate predictions (simple moving average - in production use ML models)
        const predictions = [];
        const now = new Date();
        
        for (let i = 1; i <= periods; i++) {
            const futureDate = new Date(now);
            futureDate.setMonth(futureDate.getMonth() + i);
            
            // Add some variance (±10%)
            const variance = 0.9 + Math.random() * 0.2;
            const predictedInflow = Math.round(avgInflow * variance);
            const predictedOutflow = Math.round(avgOutflow * variance);
            
            predictions.push({
                period: futureDate.toISOString().slice(0, 7),
                predictedInflow,
                predictedOutflow,
                predictedBalance: predictedInflow - predictedOutflow,
                confidence: months.length >= 3 ? 0.7 : 0.4,
            });
        }
        
        return predictions;
    },

    /**
     * Get business insights based on data
     */
    async getBusinessInsights(userId: string): Promise<Array<{
        type: 'TIP' | 'WARNING' | 'OPPORTUNITY';
        title: string;
        description: string;
        actionUrl?: string;
    }>> {
        const insights: Array<{
            type: 'TIP' | 'WARNING' | 'OPPORTUNITY';
            title: string;
            description: string;
            actionUrl?: string;
        }> = [];
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Check overdue invoices
        const overdueInvoices = await prisma.invoice.count({
            where: { userId, status: 'OVERDUE' },
        });
        
        if (overdueInvoices > 0) {
            insights.push({
                type: 'WARNING',
                title: `${overdueInvoices} Overdue Invoice${overdueInvoices > 1 ? 's' : ''}`,
                description: 'Send payment reminders to improve cash flow',
                actionUrl: '/invoices?status=overdue',
            });
        }
        
        // Check VAT filing deadline
        const currentMonth = now.getMonth();
        if (currentMonth === 3 || currentMonth === 6 || currentMonth === 9 || currentMonth === 0) {
            insights.push({
                type: 'TIP',
                title: 'Quarterly VAT Filing Due Soon',
                description: 'Prepare your VAT return before the 25th of this month',
                actionUrl: '/vat',
            });
        }
        
        // Check expense categorization
        const uncategorizedExpenses = await prisma.expense.count({
            where: {
                userId,
                date: { gte: thirtyDaysAgo },
                description: { contains: 'miscellaneous' },
            },
        });
        
        if (uncategorizedExpenses > 5) {
            insights.push({
                type: 'TIP',
                title: 'Review Expense Categories',
                description: `${uncategorizedExpenses} expenses marked as miscellaneous. Proper categorization improves reporting.`,
                actionUrl: '/expenses',
            });
        }
        
        // Opportunity: recurring customers
        const topCustomers = await prisma.invoice.groupBy({
            by: ['customerId'],
            where: { userId, status: 'PAID' },
            _count: { id: true },
            _sum: { total: true },
            orderBy: { _sum: { total: 'desc' } },
            take: 5,
        });
        
        if (topCustomers.length > 0 && topCustomers[0]._count.id >= 3) {
            insights.push({
                type: 'OPPORTUNITY',
                title: 'Loyal Customer Identified',
                description: 'Consider offering loyalty discounts to your top customers',
                actionUrl: '/customers',
            });
        }
        
        return insights;
    },
};

export default aiService;
