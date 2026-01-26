import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, EmptyState } from '../../components/ui/Common';
import { StatsSkeleton } from '../../components/ui/Skeleton';
import { Tooltip } from '../../components/ui/Tooltip';
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
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import type { DashboardStats } from '../../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const DashboardPage: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => apiGet<DashboardStats>('/dashboard'),
    });

    if (isLoading) {
        return (
            <div className="animate-fade-in">
                <PageHeader title="Dashboard" subtitle="Overview of your business finances" />
                <StatsSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white rounded-lg border border-[var(--color-neutral-200)] p-6 h-80 animate-pulse" />
                    <div className="bg-white rounded-lg border border-[var(--color-neutral-200)] p-6 h-80 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your business finances"
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

            {/* Workflow Status Alerts - Enhanced with Action Buttons */}
            {stats && (stats.pendingApprovals > 0 || stats.overdueInvoices > 0 || stats.missingReceipts > 0) && (
                <Card className="mb-6 border-l-4 border-l-primary-600">
                    <CardHeader 
                        title="Workflow Status" 
                        subtitle="Action items requiring your attention - take action now"
                    />
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {stats.pendingApprovals > 0 && (
                                <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-warning-700" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-neutral-900">{stats.pendingApprovals} Pending Approvals</div>
                                            <div className="text-sm text-neutral-600">₹{(stats.pendingApprovalsValue || 0).toLocaleString()} total value</div>
                                        </div>
                                    </div>
                                    <Link to="/invoices?status=PENDING_APPROVAL">
                                        <Button variant="outline" size="sm" className="w-full border-warning-300 text-warning-700 hover:bg-warning-100">
                                            Review & Approve
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {stats.overdueInvoices > 0 && (
                                <div className="p-4 bg-danger-50 rounded-lg border border-danger-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-danger-700" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-neutral-900">{stats.overdueInvoices} Overdue Invoices</div>
                                            <div className="text-sm text-neutral-600">Follow up needed</div>
                                        </div>
                                    </div>
                                    <Link to="/invoices?status=OVERDUE">
                                        <Button variant="outline" size="sm" className="w-full border-danger-300 text-danger-700 hover:bg-danger-100">
                                            Send Reminders
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {stats.missingReceipts > 0 && (
                                <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                                            <Receipt className="w-5 h-5 text-warning-700" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-neutral-900">{stats.missingReceipts} Missing Receipts</div>
                                            <div className="text-sm text-neutral-600">Expenses &gt;₹5,000</div>
                                        </div>
                                    </div>
                                    <Link to="/expenses?filter=missing_receipt">
                                        <Button variant="outline" size="sm" className="w-full border-warning-300 text-warning-700 hover:bg-warning-100">
                                            Review Expenses
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    change={12.5}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="primary"
                />
                <StatCard
                    title="Total Expenses"
                    value={formatCurrency(stats?.totalExpenses || 0)}
                    change={-3.2}
                    icon={<TrendingDown className="w-5 h-5" />}
                    color="danger"
                />
                <StatCard
                    title="Net Profit"
                    value={formatCurrency(stats?.netProfit || 0)}
                    change={8.1}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="success"
                />
                <StatCard
                    title="Outstanding"
                    value={formatCurrency(stats?.outstandingInvoices || 0)}
                    subtitle="Pending invoices"
                    icon={<FileText className="w-5 h-5" />}
                    color="warning"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader title="Revenue Overview" subtitle="Monthly revenue trend" />
                    <CardBody>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.monthlyRevenue || []}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        tickFormatter={(value) => `Rs.${value / 1000}k`}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                        formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Expense Categories */}
                <Card>
                    <CardHeader title="Expenses by Category" />
                    <CardBody>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.expensesByCategory || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="amount"
                                        nameKey="category"
                                    >
                                        {(stats?.expensesByCategory || []).map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value) => formatCurrency(value as number)}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {(stats?.expensesByCategory || []).slice(0, 4).map((item, index) => (
                                <div key={item.category} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-[var(--color-neutral-600)]">{item.category}</span>
                                    </div>
                                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <Card>
                    <CardHeader
                        title="Recent Invoices"
                        action={
                            <Link
                                to="/invoices"
                                className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1"
                            >
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        }
                    />
                    <div className="overflow-x-auto">
                        {(stats?.recentInvoices || []).length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-neutral-200)]">
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Invoice
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Customer
                                        </th>
                                        <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Amount
                                        </th>
                                        <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats?.recentInvoices || []).slice(0, 5).map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)] transition-all duration-200"
                                        >
                                            <td className="p-4">
                                                <Tooltip content="View invoice details">
                                                    <Link
                                                        to={`/invoices/${invoice.id}`}
                                                        className="font-medium text-[var(--color-neutral-900)] hover:text-[var(--color-primary-600)] transition-colors"
                                                    >
                                                        {invoice.invoiceNumber}
                                                    </Link>
                                                </Tooltip>
                                                <div className="text-xs text-[var(--color-neutral-500)]">
                                                    {formatDate(invoice.issueDate)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-[var(--color-neutral-600)]">
                                                {invoice.customer?.name || 'N/A'}
                                            </td>
                                            <td className="p-4 text-right font-medium">
                                                {formatCurrency(invoice.total)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <StatusBadge status={invoice.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
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
                                className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1"
                            >
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        }
                    />
                    <div className="overflow-x-auto">
                        {(stats?.recentExpenses || []).length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-neutral-200)]">
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Description
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Category
                                        </th>
                                        <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats?.recentExpenses || []).slice(0, 5).map((expense) => (
                                        <tr
                                            key={expense.id}
                                            className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)] transition-all duration-200"
                                        >
                                            <td className="p-4">
                                                <Tooltip content="View expense details">
                                                    <Link
                                                        to={`/expenses/${expense.id}`}
                                                        className="font-medium text-[var(--color-neutral-900)] hover:text-[var(--color-primary-600)] transition-colors"
                                                    >
                                                        {expense.description}
                                                    </Link>
                                                </Tooltip>
                                                <div className="text-xs text-[var(--color-neutral-500)]">
                                                    {formatDate(expense.date)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-[var(--color-neutral-600)]">
                                                {expense.account?.name || 'N/A'}
                                            </td>
                                            <td className="p-4 text-right font-medium text-[var(--color-danger-600)]">
                                                -{formatCurrency(expense.totalAmount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
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
                        )}
                    </div>
                </Card>
            </div>

            {/* VAT Summary */}
            {stats?.vatPayable !== undefined && (
                <Card className="mt-6">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-warning-50)] flex items-center justify-center">
                                    <Calculator className="w-6 h-6 text-[var(--color-warning-600)]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[var(--color-neutral-500)]">VAT Payable (This Period)</p>
                                    <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                                        {formatCurrency(stats.vatPayable)}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline">
                                <Link to="/vat">View VAT Details</Link>
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, subtitle, icon, color }) => {
    const colors = {
        primary: 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)]',
        success: 'bg-[var(--color-success-50)] text-[var(--color-success-600)]',
        warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-600)]',
        danger: 'bg-[var(--color-danger-50)] text-[var(--color-danger-600)]',
    };

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardBody>
                <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg ${colors[color]} transition-transform hover:scale-110 duration-200`}>{icon}</div>
                    {change !== undefined && (
                        <Tooltip content={`${change >= 0 ? 'Increase' : 'Decrease'} from last period`}>
                            <div
                                className={`flex items-center gap-0.5 text-sm font-medium ${change >= 0 ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'
                                    }`}
                            >
                                {change >= 0 ? (
                                    <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4" />
                                )}
                                {Math.abs(change)}%
                            </div>
                        </Tooltip>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-sm text-[var(--color-neutral-500)]">{title}</p>
                    <p className="text-2xl font-bold text-[var(--color-neutral-900)] mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-[var(--color-neutral-400)] mt-1">{subtitle}</p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default DashboardPage;
