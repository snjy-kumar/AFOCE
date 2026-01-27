import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Common';
import { PageHeader } from '../../components/layout/Layout';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    Receipt,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw
} from 'lucide-react';
import { apiGet } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

interface KPIs {
    ytdRevenue: number;
    ytdExpenses: number;
    ytdProfit: number;
    profitMargin: string;
    revenueGrowthYoY: string;
    expenseGrowthYoY: string;
}

interface TrendData {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    invoiceCount: number;
    expenseCount: number;
}

interface CustomerMetrics {
    total: number;
    active: number;
    avgRevenuePerCustomer: number;
    topCustomers: Array<{
        id: string;
        name: string;
        invoiceCount: number;
        totalRevenue: number;
    }>;
}

interface VendorMetrics {
    total: number;
    active: number;
    avgSpendingPerVendor: number;
    topVendors: Array<{
        id: string;
        name: string;
        expenseCount: number;
        totalSpent: number;
    }>;
}

interface InvoiceMetrics {
    byStatus: Array<{
        status: string;
        count: number;
        total: number;
    }>;
    last30Days: {
        count: number;
        total: number;
    };
    avgDaysToPayment: number;
    collectionRate: number;
}

interface ExpenseBreakdown {
    categories: Array<{
        category: string;
        amount: number;
        percentage: string;
    }>;
    total: number;
}

interface BIData {
    kpis: KPIs;
    trends: TrendData[];
    customers: CustomerMetrics;
    vendors: VendorMetrics;
    invoices: InvoiceMetrics;
    expenseBreakdown: ExpenseBreakdown;
}

interface ComparativeData {
    periodType: string;
    current: {
        revenue: number;
        expenses: number;
        profit: number;
        invoiceCount: number;
        expenseCount: number;
    };
    previous: {
        revenue: number;
        expenses: number;
        profit: number;
        invoiceCount: number;
        expenseCount: number;
    };
    changes: {
        revenue: string;
        expenses: string;
        profit: string;
    };
}

export const AnalyticsPage: React.FC = () => {
    const [biData, setBiData] = useState<BIData | null>(null);
    const [comparativeData, setComparativeData] = useState<ComparativeData | null>(null);
    const [comparePeriod, setComparePeriod] = useState('month');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'vendors' | 'comparison'>('overview');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchComparative();
    }, [comparePeriod]);

    async function fetchData() {
        try {
            setLoading(true);
            const response = await apiGet<BIData>('/analytics/bi');
            setBiData(response);
            setError(null);
        } catch (err) {
            setError('Failed to load analytics data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchComparative() {
        try {
            const response = await apiGet<ComparativeData>(`/analytics/compare?period=${comparePeriod}`);
            setComparativeData(response);
        } catch (err) {
            console.error('Failed to load comparative data:', err);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchData}>Retry</Button>
            </div>
        );
    }

    if (!biData) return null;

    const { kpis, customers, vendors, invoices, expenseBreakdown, trends } = biData;

    const periodOptions = [
        { value: 'month', label: 'Month over Month' },
        { value: 'quarter', label: 'Quarter over Quarter' },
        { value: 'year', label: 'Year over Year' },
    ];

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Business Intelligence"
                subtitle="Comprehensive analytics and insights"
                action={
                    <Button leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
                        Refresh
                    </Button>
                }
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[var(--color-neutral-500)]">YTD Revenue</span>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(kpis.ytdRevenue)}</p>
                        <p className="text-xs text-[var(--color-neutral-500)] flex items-center gap-1 mt-1">
                            {parseFloat(kpis.revenueGrowthYoY) >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                            {kpis.revenueGrowthYoY}% from last year
                        </p>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[var(--color-neutral-500)]">YTD Expenses</span>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(kpis.ytdExpenses)}</p>
                        <p className="text-xs text-[var(--color-neutral-500)] flex items-center gap-1 mt-1">
                            {parseFloat(kpis.expenseGrowthYoY) >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-red-500" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-green-500" />
                            )}
                            {kpis.expenseGrowthYoY}% from last year
                        </p>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[var(--color-neutral-500)]">YTD Profit</span>
                            <Receipt className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className={`text-2xl font-bold ${kpis.ytdProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(kpis.ytdProfit)}
                        </p>
                        <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                            {kpis.profitMargin}% profit margin
                        </p>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[var(--color-neutral-500)]">Collection Rate</span>
                            <Calendar className="h-4 w-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold">{invoices.collectionRate.toFixed(1)}%</p>
                        <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                            Avg {invoices.avgDaysToPayment} days to payment
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-[var(--color-neutral-200)]">
                {['overview', 'customers', 'vendors', 'comparison'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                        className={`px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab
                                ? 'text-[var(--color-primary-600)] border-b-2 border-[var(--color-primary-600)]'
                                : 'text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Monthly Trends */}
                        <Card>
                            <CardHeader title="Monthly Trends" subtitle="Revenue and profit over time" />
                            <CardBody>
                                <div className="space-y-4">
                                    {trends.slice(-6).map((month) => (
                                        <div key={month.month} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{month.month}</span>
                                                <span className={month.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(month.profit)}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{
                                                        width: `${Math.min((month.revenue / Math.max(...trends.map(t => t.revenue || 1))) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Expense Breakdown */}
                        <Card>
                            <CardHeader title="Expense Breakdown" subtitle="Top expense categories (YTD)" />
                            <CardBody>
                                <div className="space-y-4">
                                    {expenseBreakdown.categories.slice(0, 6).map((cat) => (
                                        <div key={cat.category} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{cat.category}</span>
                                                <span className="font-medium">{formatCurrency(cat.amount)}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500"
                                                    style={{ width: `${parseFloat(cat.percentage)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Invoice Status */}
                    <Card>
                        <CardHeader title="Invoice Status Distribution" subtitle="Breakdown by payment status" />
                        <CardBody>
                            <div className="flex flex-wrap gap-4">
                                {invoices.byStatus.map((status) => (
                                    <div key={status.status} className="flex-1 min-w-[150px] p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge
                                                variant={
                                                    status.status === 'PAID' ? 'success' :
                                                        status.status === 'OVERDUE' ? 'danger' :
                                                            status.status === 'SENT' ? 'info' : 'neutral'
                                                }
                                            >
                                                {status.status}
                                            </Badge>
                                            <span className="text-2xl font-bold">{status.count}</span>
                                        </div>
                                        <p className="text-sm text-[var(--color-neutral-500)]">{formatCurrency(status.total)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[var(--color-neutral-500)]">Total Customers</span>
                                    <Users className="h-4 w-4 text-[var(--color-neutral-400)]" />
                                </div>
                                <p className="text-2xl font-bold">{customers.total}</p>
                                <p className="text-xs text-[var(--color-neutral-500)]">{customers.active} active</p>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[var(--color-neutral-500)]">Avg Revenue/Customer</span>
                                </div>
                                <p className="text-2xl font-bold">{formatCurrency(customers.avgRevenuePerCustomer)}</p>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[var(--color-neutral-500)]">Last 30 Days</span>
                                    <Calendar className="h-4 w-4 text-[var(--color-neutral-400)]" />
                                </div>
                                <p className="text-2xl font-bold">{invoices.last30Days.count} invoices</p>
                                <p className="text-xs text-[var(--color-neutral-500)]">{formatCurrency(invoices.last30Days.total)}</p>
                            </CardBody>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader title="Top Customers" subtitle="By total revenue" />
                        <CardBody>
                            <div className="space-y-4">
                                {customers.topCustomers.map((customer, index) => (
                                    <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-[var(--color-neutral-400)]">#{index + 1}</span>
                                            <div>
                                                <p className="font-medium">{customer.name}</p>
                                                <p className="text-sm text-[var(--color-neutral-500)]">{customer.invoiceCount} invoices</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-green-600">{formatCurrency(customer.totalRevenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[var(--color-neutral-500)]">Total Vendors</span>
                                    <Building2 className="h-4 w-4 text-[var(--color-neutral-400)]" />
                                </div>
                                <p className="text-2xl font-bold">{vendors.total}</p>
                                <p className="text-xs text-[var(--color-neutral-500)]">{vendors.active} active</p>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[var(--color-neutral-500)]">Avg Spending/Vendor</span>
                                </div>
                                <p className="text-2xl font-bold">{formatCurrency(vendors.avgSpendingPerVendor)}</p>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[var(--color-neutral-500)]">Total YTD Spending</span>
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                </div>
                                <p className="text-2xl font-bold">{formatCurrency(kpis.ytdExpenses)}</p>
                            </CardBody>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader title="Top Vendors" subtitle="By total spending" />
                        <CardBody>
                            <div className="space-y-4">
                                {vendors.topVendors.map((vendor, index) => (
                                    <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-[var(--color-neutral-400)]">#{index + 1}</span>
                                            <div>
                                                <p className="font-medium">{vendor.name}</p>
                                                <p className="text-sm text-[var(--color-neutral-500)]">{vendor.expenseCount} expenses</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-red-600">{formatCurrency(vendor.totalSpent)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Comparison Tab */}
            {activeTab === 'comparison' && (
                <div className="space-y-6">
                    <Card>
                        <CardBody>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Compare Period:</span>
                                <Select
                                    options={periodOptions}
                                    value={comparePeriod}
                                    onChange={(e) => setComparePeriod(e.target.value)}
                                    className="w-60"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {comparativeData && (
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader title="Revenue" />
                                <CardBody>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-[var(--color-neutral-500)]">Current Period</p>
                                            <p className="text-2xl font-bold">{formatCurrency(comparativeData.current.revenue)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[var(--color-neutral-500)]">Previous Period</p>
                                            <p className="text-lg">{formatCurrency(comparativeData.previous.revenue)}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 ${parseFloat(comparativeData.changes.revenue) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {parseFloat(comparativeData.changes.revenue) >= 0 ? (
                                                <ArrowUpRight className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4" />
                                            )}
                                            <span className="font-medium">{comparativeData.changes.revenue}%</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardHeader title="Expenses" />
                                <CardBody>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-[var(--color-neutral-500)]">Current Period</p>
                                            <p className="text-2xl font-bold">{formatCurrency(comparativeData.current.expenses)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[var(--color-neutral-500)]">Previous Period</p>
                                            <p className="text-lg">{formatCurrency(comparativeData.previous.expenses)}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 ${parseFloat(comparativeData.changes.expenses) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {parseFloat(comparativeData.changes.expenses) >= 0 ? (
                                                <ArrowUpRight className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4" />
                                            )}
                                            <span className="font-medium">{comparativeData.changes.expenses}%</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardHeader title="Profit" />
                                <CardBody>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-[var(--color-neutral-500)]">Current Period</p>
                                            <p className={`text-2xl font-bold ${comparativeData.current.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(comparativeData.current.profit)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[var(--color-neutral-500)]">Previous Period</p>
                                            <p className={`text-lg ${comparativeData.previous.profit >= 0 ? '' : 'text-red-600'}`}>
                                                {formatCurrency(comparativeData.previous.profit)}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-2 ${parseFloat(comparativeData.changes.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {parseFloat(comparativeData.changes.profit) >= 0 ? (
                                                <ArrowUpRight className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4" />
                                            )}
                                            <span className="font-medium">{comparativeData.changes.profit}%</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
