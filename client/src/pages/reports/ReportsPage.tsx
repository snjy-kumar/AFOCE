import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api';
import { formatCurrency, formatDateForInput } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Common';
import {
    BarChart3,
    Download,
    FileText,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

interface ReportData {
    profitLoss?: {
        revenue: number;
        expenses: number;
        netProfit: number;
        revenueBreakdown: Array<{ category: string; amount: number }>;
        expenseBreakdown: Array<{ category: string; amount: number }>;
    };
    balanceSheet?: {
        assets: number;
        liabilities: number;
        equity: number;
        assetBreakdown: Array<{ name: string; amount: number }>;
        liabilityBreakdown: Array<{ name: string; amount: number }>;
    };
}

export const ReportsPage: React.FC = () => {
    const [reportType, setReportType] = useState('profit-loss');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return formatDateForInput(date);
    });
    const [endDate, setEndDate] = useState(() => formatDateForInput(new Date()));

    const { data: reportData, isLoading, refetch } = useQuery({
        queryKey: ['reports', reportType, startDate, endDate],
        queryFn: async () => {
            if (reportType === 'profit-loss') {
                return apiGet<ReportData['profitLoss']>(
                    `/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`
                );
            } else if (reportType === 'balance-sheet') {
                return apiGet<ReportData['balanceSheet']>(
                    `/reports/balance-sheet?asOfDate=${endDate}`
                );
            }
            return null;
        },
    });

    const handleExport = () => {
        // In a real implementation, this would trigger a PDF download
        alert('Export functionality would download a PDF report');
    };

    const reportTypes = [
        { value: 'profit-loss', label: 'Profit & Loss Statement' },
        { value: 'balance-sheet', label: 'Balance Sheet' },
        { value: 'cash-flow', label: 'Cash Flow Statement' },
        { value: 'aging-receivables', label: 'Aging Receivables' },
        { value: 'aging-payables', label: 'Aging Payables' },
        { value: 'vat-summary', label: 'VAT Summary Report' },
    ];

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Financial Reports"
                subtitle="Generate and analyze business reports"
                action={
                    <Button leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>
                        Export PDF
                    </Button>
                }
            />

            {/* Report Filters */}
            <Card className="mb-6">
                <CardBody>
                    <div className="flex flex-wrap items-end gap-4">
                        <Select
                            label="Report Type"
                            options={reportTypes}
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-60"
                        />
                        <Input
                            label="From"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-40"
                        />
                        <Input
                            label="To"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-40"
                        />
                        <Button onClick={() => refetch()} leftIcon={<BarChart3 className="w-4 h-4" />}>
                            Generate Report
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : reportType === 'profit-loss' && reportData ? (
                <ProfitLossReport data={reportData as ReportData['profitLoss']} />
            ) : reportType === 'balance-sheet' && reportData ? (
                <BalanceSheetReport data={reportData as ReportData['balanceSheet']} />
            ) : (
                <Card>
                    <CardBody className="py-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-[var(--color-neutral-400)]" />
                        <h3 className="mt-4 text-lg font-medium text-[var(--color-neutral-900)]">
                            Select a Report
                        </h3>
                        <p className="mt-2 text-[var(--color-neutral-500)]">
                            Choose a report type and date range, then click Generate Report
                        </p>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

interface ProfitLossReportProps {
    data: ReportData['profitLoss'];
}

const ProfitLossReport: React.FC<ProfitLossReportProps> = ({ data }) => {
    if (!data) return null;

    const revenueBreakdown = data.revenueBreakdown || [];
    const expenseBreakdown = data.expenseBreakdown || [];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Total Revenue</p>
                        <p className="text-2xl font-bold text-[var(--color-success-600)]">
                            {formatCurrency(data.revenue)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Total Expenses</p>
                        <p className="text-2xl font-bold text-[var(--color-danger-600)]">
                            {formatCurrency(data.expenses)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Net Profit</p>
                        <p className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'}`}>
                            {formatCurrency(data.netProfit)}
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Revenue by Category" />
                    <CardBody>
                        {revenueBreakdown.length > 0 ? (
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueBreakdown}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs.${v / 1000}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-neutral-500">
                                No revenue data available
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Expense Breakdown" />
                    <CardBody>
                        {expenseBreakdown.length > 0 ? (
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie
                                            data={expenseBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="amount"
                                            nameKey="category"
                                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        >
                                            {expenseBreakdown.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-neutral-500">
                                No expense data available
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

interface BalanceSheetReportProps {
    data: ReportData['balanceSheet'];
}

const BalanceSheetReport: React.FC<BalanceSheetReportProps> = ({ data }) => {
    if (!data) return null;

    const assetBreakdown = data.assetBreakdown || [];
    const liabilityBreakdown = data.liabilityBreakdown || [];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Total Assets</p>
                        <p className="text-2xl font-bold text-[var(--color-success-600)]">
                            {formatCurrency(data.assets)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Total Liabilities</p>
                        <p className="text-2xl font-bold text-[var(--color-danger-600)]">
                            {formatCurrency(data.liabilities)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Equity</p>
                        <p className="text-2xl font-bold text-[var(--color-primary-600)]">
                            {formatCurrency(data.equity)}
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Asset Breakdown" />
                    <CardBody>
                        {assetBreakdown.length > 0 ? (
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={assetBreakdown}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs.${v / 1000}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-neutral-500">
                                No asset data available
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Liability Breakdown" />
                    <CardBody>
                        {liabilityBreakdown.length > 0 ? (
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie
                                            data={liabilityBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="amount"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        >
                                            {liabilityBreakdown.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-neutral-500">
                                No liability data available
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default ReportsPage;
