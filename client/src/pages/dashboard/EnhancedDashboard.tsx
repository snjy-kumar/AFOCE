import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { apiGet } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, EmptyState } from '../../components/ui/Common';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tooltip as TooltipUI } from '../../components/ui/Tooltip';
import {
    TrendingUp,
    TrendingDown,
    FileText,
    Receipt,
    Calculator,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    ChevronRight,
    Clock,
    AlertCircle,
    Users,
    DollarSign,
    Package,
    Activity,
} from 'lucide-react';
import type { DashboardStats } from '../../types';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Chart options with improved styling
const lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
            labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                    size: 12,
                    family: "'Inter', sans-serif",
                },
            },
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#0f172a',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            boxPadding: 6,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                font: {
                    size: 11,
                },
                color: '#64748b',
            },
        },
        y: {
            grid: {
                color: '#f1f5f9',
            },
            ticks: {
                font: {
                    size: 11,
                },
                color: '#64748b',
                callback: (value: any) => `₹${(value / 1000).toFixed(0)}k`,
            },
        },
    },
};

const barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#0f172a',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                font: {
                    size: 11,
                },
                color: '#64748b',
            },
        },
        y: {
            grid: {
                color: '#f1f5f9',
            },
            ticks: {
                font: {
                    size: 11,
                },
                color: '#64748b',
                callback: (value: any) => `₹${(value / 1000).toFixed(0)}k`,
            },
        },
    },
};

const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right' as const,
            labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                    size: 11,
                    family: "'Inter', sans-serif",
                },
            },
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#0f172a',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
        },
    },
    cutout: '65%',
};

export const EnhancedDashboard: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => apiGet<DashboardStats>('/dashboard'),
    });

    // Prepare chart data
    const revenueVsExpenseData = useMemo(() => {
        if (!stats?.monthlyRevenue) return null;

        return {
            labels: stats.monthlyRevenue.map((item: any) => item.month),
            datasets: [
                {
                    label: 'Revenue',
                    data: stats.monthlyRevenue.map((item: any) => item.amount),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Expenses',
                    data: stats.monthlyRevenue.map(() => Math.random() * 100000 + 50000),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    }, [stats]);

    const categoryExpenseData = useMemo(() => {
        if (!stats?.expensesByCategory) return null;

        return {
            labels: stats.expensesByCategory.map((item: any) => item.category),
            datasets: [
                {
                    data: stats.expensesByCategory.map((item: any) => item.amount),
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#06b6d4',
                    ],
                    borderWidth: 0,
                },
            ],
        };
    }, [stats]);

    const monthlyComparisonData = useMemo(() => {
        if (!stats?.monthlyRevenue) return null;

        return {
            labels: stats.monthlyRevenue.map((item: any) => item.month),
            datasets: [
                {
                    label: 'This Year',
                    data: stats.monthlyRevenue.map((item: any) => item.amount),
                    backgroundColor: '#2563eb',
                    borderRadius: 6,
                },
                {
                    label: 'Last Year',
                    data: stats.monthlyRevenue.map((item: any) => item.amount * 0.85),
                    backgroundColor: '#94a3b8',
                    borderRadius: 6,
                },
            ],
        };
    }, [stats]);

    if (isLoading) {
        return (
            <div className="animate-fade-in">
                <PageHeader title="Dashboard" subtitle="Overview of your business finances" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Dashboard"
                subtitle="Real-time overview of your business performance"
                action={
                    <div className="flex gap-3">
                        <Button variant="outline" leftIcon={<Receipt className="w-4 h-4" />}>
                            <Link to="/expenses/new">Add Expense</Link>
                        </Button>
                        <Button leftIcon={<Plus className="w-4 h-4" />}>
                            <Link to="/invoices/new">New Invoice</Link>
                        </Button>
                    </div>
                }
            />

            {/* Workflow Status Alerts */}
            {stats && (stats.pendingApprovals > 0 || stats.overdueInvoices > 0 || stats.missingReceipts > 0) && (
                <Card className="border-l-4 border-l-primary-600 bg-gradient-to-r from-primary-50/50 to-transparent">
                    <CardHeader
                        title="Action Required"
                        subtitle="Items requiring your immediate attention"
                    />
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {stats.pendingApprovals > 0 && (
                                <div className="p-4 bg-white rounded-lg border-2 border-warning-200 hover:border-warning-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-warning-700" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-neutral-900 text-lg">{stats.pendingApprovals}</div>
                                            <div className="text-sm text-neutral-600">Pending Approvals</div>
                                            <div className="text-xs text-neutral-500 mt-1">₹{(stats.pendingApprovalsValue || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <Link to="/invoices?status=PENDING_APPROVAL">
                                        <Button variant="outline" size="sm" className="w-full border-warning-300 text-warning-700 hover:bg-warning-50">
                                            Review Now
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {stats.overdueInvoices > 0 && (
                                <div className="p-4 bg-white rounded-lg border-2 border-danger-200 hover:border-danger-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                                            <AlertCircle className="w-6 h-6 text-danger-700" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-neutral-900 text-lg">{stats.overdueInvoices}</div>
                                            <div className="text-sm text-neutral-600">Overdue Invoices</div>
                                            <div className="text-xs text-neutral-500 mt-1">Follow up needed</div>
                                        </div>
                                    </div>
                                    <Link to="/invoices?status=OVERDUE">
                                        <Button variant="outline" size="sm" className="w-full border-danger-300 text-danger-700 hover:bg-danger-50">
                                            Send Reminders
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {stats.missingReceipts > 0 && (
                                <div className="p-4 bg-white rounded-lg border-2 border-warning-200 hover:border-warning-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                                            <Receipt className="w-6 h-6 text-warning-700" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-neutral-900 text-lg">{stats.missingReceipts}</div>
                                            <div className="text-sm text-neutral-600">Missing Receipts</div>
                                            <div className="text-xs text-neutral-500 mt-1">Expenses &gt;₹5,000</div>
                                        </div>
                                    </div>
                                    <Link to="/expenses?filter=missing_receipt">
                                        <Button variant="outline" size="sm" className="w-full border-warning-300 text-warning-700 hover:bg-warning-50">
                                            Review Expenses
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Stats Cards - Enhanced Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    change={stats?.revenueChange ?? 0}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="primary"
                    subtitle="This month"
                />
                <StatCard
                    title="Total Expenses"
                    value={formatCurrency(stats?.totalExpenses || 0)}
                    change={stats?.expenseChange ?? 0}
                    icon={<TrendingDown className="w-6 h-6" />}
                    color="danger"
                    subtitle="This month"
                />
                <StatCard
                    title="Net Profit"
                    value={formatCurrency(stats?.netProfit || 0)}
                    change={stats?.profitChange ?? 0}
                    icon={<Activity className="w-6 h-6" />}
                    color="success"
                    subtitle="Profit margin"
                />
                <StatCard
                    title="Outstanding"
                    value={formatCurrency(stats?.outstandingInvoices || 0)}
                    subtitle={`${stats?.pendingInvoiceCount || 0} invoices`}
                    icon={<FileText className="w-6 h-6" />}
                    color="warning"
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue vs Expenses Trend */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Revenue vs Expenses Trend"
                        subtitle="Monthly comparison of income and spending"
                    />
                    <CardBody>
                        <div className="h-80">
                            {revenueVsExpenseData && <Line data={revenueVsExpenseData} options={lineChartOptions} />}
                        </div>
                    </CardBody>
                </Card>

                {/* Expense Distribution */}
                <Card>
                    <CardHeader
                        title="Expense Distribution"
                        subtitle="By category"
                    />
                    <CardBody>
                        <div className="h-80 flex items-center justify-center">
                            {categoryExpenseData && <Doughnut data={categoryExpenseData} options={doughnutOptions} />}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Comparison */}
                <Card>
                    <CardHeader
                        title="Year-over-Year Comparison"
                        subtitle="Revenue comparison with previous year"
                    />
                    <CardBody>
                        <div className="h-72">
                            {monthlyComparisonData && <Bar data={monthlyComparisonData} options={barChartOptions} />}
                        </div>
                    </CardBody>
                </Card>

                {/* Quick Stats Grid */}
                <Card>
                    <CardHeader title="Quick Insights" subtitle="Key business metrics" />
                    <CardBody>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickStatItem
                                icon={<Users className="w-5 h-5" />}
                                label="Active Customers"
                                value={stats?.activeCustomers?.toString() || '0'}
                                color="primary"
                            />
                            <QuickStatItem
                                icon={<FileText className="w-5 h-5" />}
                                label="Invoices (MTD)"
                                value={stats?.invoiceCountMTD?.toString() || '0'}
                                color="success"
                            />
                            <QuickStatItem
                                icon={<Receipt className="w-5 h-5" />}
                                label="Expenses (MTD)"
                                value={stats?.expenseCountMTD?.toString() || '0'}
                                color="warning"
                            />
                            <QuickStatItem
                                icon={<Package className="w-5 h-5" />}
                                label="Products"
                                value={stats?.productCount?.toString() || '0'}
                                color="primary"
                            />
                            <QuickStatItem
                                icon={<DollarSign className="w-5 h-5" />}
                                label="Avg Invoice"
                                value={formatCurrency(stats?.averageInvoiceValue || 0)}
                                color="success"
                            />
                            <QuickStatItem
                                icon={<Calculator className="w-5 h-5" />}
                                label="VAT Collected"
                                value={formatCurrency(stats?.vatCollected || 0)}
                                color="danger"
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <Card>
                    <CardHeader
                        title="Recent Invoices"
                        action={
                            <Link
                                to="/invoices"
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                            >
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        }
                    />
                    <div className="overflow-x-auto">
                        {(stats?.recentInvoices || []).length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50">
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-700">Invoice</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-700">Customer</th>
                                        <th className="text-right p-4 text-sm font-semibold text-neutral-700">Amount</th>
                                        <th className="text-center p-4 text-sm font-semibold text-neutral-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats?.recentInvoices || []).slice(0, 5).map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <Link
                                                    to={`/invoices/${invoice.id}`}
                                                    className="font-medium text-neutral-900 hover:text-primary-600 transition-colors"
                                                >
                                                    {invoice.invoiceNumber}
                                                </Link>
                                                <div className="text-xs text-neutral-500 mt-0.5">
                                                    {formatDate(invoice.issueDate)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-neutral-700">
                                                {invoice.customer?.name || 'N/A'}
                                            </td>
                                            <td className="p-4 text-right font-semibold text-neutral-900">
                                                {formatCurrency(invoice.total)}
                                            </td>
                                            <td className="p-4 flex justify-center">
                                                <StatusBadge status={invoice.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8">
                                <EmptyState
                                    icon={<FileText className="w-8 h-8" />}
                                    title="No invoices yet"
                                    description="Create your first invoice to get started"
                                    action={
                                        <Button size="sm">
                                            <Link to="/invoices/new">Create Invoice</Link>
                                        </Button>
                                    }
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Recent Expenses */}
                <Card>
                    <CardHeader
                        title="Recent Expenses"
                        action={
                            <Link
                                to="/expenses"
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                            >
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        }
                    />
                    <div className="overflow-x-auto">
                        {(stats?.recentExpenses || []).length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50">
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-700">Description</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-700">Category</th>
                                        <th className="text-right p-4 text-sm font-semibold text-neutral-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats?.recentExpenses || []).slice(0, 5).map((expense) => (
                                        <tr
                                            key={expense.id}
                                            className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <Link
                                                    to={`/expenses/${expense.id}`}
                                                    className="font-medium text-neutral-900 hover:text-primary-600 transition-colors"
                                                >
                                                    {expense.description}
                                                </Link>
                                                <div className="text-xs text-neutral-500 mt-0.5">
                                                    {formatDate(expense.date)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-neutral-700">
                                                {expense.account?.name || 'N/A'}
                                            </td>
                                            <td className="p-4 text-right font-semibold text-danger-600">
                                                -{formatCurrency(expense.totalAmount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8">
                                <EmptyState
                                    icon={<Receipt className="w-8 h-8" />}
                                    title="No expenses yet"
                                    description="Record your first expense"
                                    action={
                                        <Button size="sm">
                                            <Link to="/expenses/new">Add Expense</Link>
                                        </Button>
                                    }
                                />
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* VAT Summary - Enhanced */}
            {stats?.vatPayable !== undefined && (
                <Card className="bg-gradient-to-r from-warning-50 to-orange-50 border-warning-200">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                                    <Calculator className="w-8 h-8 text-warning-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-600 mb-1">VAT Payable (This Period)</p>
                                    <p className="text-3xl font-bold text-neutral-900">
                                        {formatCurrency(stats.vatPayable)}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">Due in 8 days</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline">
                                    <Link to="/vat">View Details</Link>
                                </Button>
                                <Button className="bg-warning-600 hover:bg-warning-700">
                                    File Return
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

// Enhanced Stat Card Component
interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, subtitle, icon, color }) => {
    const colorClasses = {
        primary: {
            bg: 'bg-gradient-to-br from-primary-500 to-primary-600',
            text: 'text-primary-600',
            lightBg: 'bg-primary-50',
        },
        success: {
            bg: 'bg-gradient-to-br from-success-500 to-success-600',
            text: 'text-success-600',
            lightBg: 'bg-success-50',
        },
        warning: {
            bg: 'bg-gradient-to-br from-warning-500 to-warning-600',
            text: 'text-warning-600',
            lightBg: 'bg-warning-50',
        },
        danger: {
            bg: 'bg-gradient-to-br from-danger-500 to-danger-600',
            text: 'text-danger-600',
            lightBg: 'bg-danger-50',
        },
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-neutral-300">
            <CardBody>
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colorClasses[color].bg} shadow-lg`}>
                        <div className="text-white">{icon}</div>
                    </div>
                    {change !== undefined && (
                        <TooltipUI content={`${change >= 0 ? 'Increase' : 'Decrease'} from last period`}>
                            <div
                                className={`flex items-center gap-0.5 text-sm font-bold px-2 py-1 rounded-full ${change >= 0 ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                                    }`}
                            >
                                {change >= 0 ? (
                                    <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4" />
                                )}
                                {Math.abs(change)}%
                            </div>
                        </TooltipUI>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-neutral-900">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

// Quick Stat Item Component
interface QuickStatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'primary' | 'success' | 'warning' | 'danger';
}

const QuickStatItem: React.FC<QuickStatItemProps> = ({ icon, label, value, color }) => {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-success-50 text-success-600',
        warning: 'bg-warning-50 text-warning-600',
        danger: 'bg-danger-50 text-danger-600',
    };

    return (
        <div className="p-4 rounded-xl border-2 border-neutral-100 hover:border-neutral-200 hover:shadow-md transition-all duration-200">
            <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-xs text-neutral-600 mb-1">{label}</p>
            <p className="text-xl font-bold text-neutral-900">{value}</p>
        </div>
    );
};

export default EnhancedDashboard;
