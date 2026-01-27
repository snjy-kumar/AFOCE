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
    cashFlow?: {
        operating: { inflows: number; outflows: number; net: number };
        investing: { inflows: number; outflows: number; net: number };
        financing: { inflows: number; outflows: number; net: number };
        netCashFlow: number;
        openingBalance: number;
        closingBalance: number;
        period: { start: string; end: string };
    };
    vatSummary?: {
        period: { start: string; end: string };
        sales: { taxable: number; exempt: number; total: number };
        purchases: { taxable: number; exempt: number; total: number };
        outputVat: number;
        inputVat: number;
        netVatPayable: number;
        vatByRate: Array<{ rate: number; taxableAmount: number; vatAmount: number }>;
    };
    agingReceivables?: {
        asOfDate: string;
        current: AgingBucket;
        days1to30: AgingBucket;
        days31to60: AgingBucket;
        days61to90: AgingBucket;
        over90: AgingBucket;
        totalOutstanding: number;
    };
    agingPayables?: {
        asOfDate: string;
        current: AgingBucket;
        days1to30: AgingBucket;
        days31to60: AgingBucket;
        days61to90: AgingBucket;
        over90: AgingBucket;
        totalPayable: number;
    };
}

interface AgingBucket {
    count: number;
    total: number;
    invoices?: Array<{
        id: string;
        invoiceNumber: string;
        customer: string;
        issueDate: string;
        dueDate: string;
        total: number;
        paid: number;
        balance: number;
    }>;
    expenses?: Array<{
        id: string;
        expenseNumber: string;
        vendor: string;
        date: string;
        amount: number;
        description: string;
    }>;
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
            } else if (reportType === 'cash-flow') {
                return apiGet<ReportData['cashFlow']>(
                    `/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`
                );
            } else if (reportType === 'vat-summary') {
                return apiGet<ReportData['vatSummary']>(
                    `/reports/vat-summary?startDate=${startDate}&endDate=${endDate}`
                );
            } else if (reportType === 'aging-receivables') {
                return apiGet<ReportData['agingReceivables']>(
                    `/reports/ar-aging?asOfDate=${endDate}`
                );
            } else if (reportType === 'aging-payables') {
                return apiGet<ReportData['agingPayables']>(
                    `/reports/ap-aging?asOfDate=${endDate}`
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
            ) : reportType === 'cash-flow' && reportData ? (
                <CashFlowReport data={reportData as ReportData['cashFlow']} />
            ) : reportType === 'vat-summary' && reportData ? (
                <VatSummaryReport data={reportData as ReportData['vatSummary']} />
            ) : reportType === 'aging-receivables' && reportData ? (
                <AgingReceivablesReport data={reportData as ReportData['agingReceivables']} />
            ) : reportType === 'aging-payables' && reportData ? (
                <AgingPayablesReport data={reportData as ReportData['agingPayables']} />
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

// Cash Flow Report Component
interface CashFlowReportProps {
    data: ReportData['cashFlow'];
}

const CashFlowReport: React.FC<CashFlowReportProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Period Info */}
            <Card>
                <CardBody>
                    <p className="text-sm text-[var(--color-neutral-500)]">
                        Period: {new Date(data.period.start).toLocaleDateString()} - {new Date(data.period.end).toLocaleDateString()}
                    </p>
                </CardBody>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Opening Balance</p>
                        <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                            {formatCurrency(data.openingBalance)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Net Cash Flow</p>
                        <p className={`text-2xl font-bold ${data.netCashFlow >= 0 ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'}`}>
                            {formatCurrency(data.netCashFlow)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Closing Balance</p>
                        <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                            {formatCurrency(data.closingBalance)}
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Cash Flow Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader title="Operating Activities" />
                    <CardBody>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Inflows</span>
                                <span className="font-medium text-[var(--color-success-600)]">{formatCurrency(data.operating.inflows)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Outflows</span>
                                <span className="font-medium text-[var(--color-danger-600)]">{formatCurrency(data.operating.outflows)}</span>
                            </div>
                            <hr className="border-[var(--color-neutral-200)]" />
                            <div className="flex justify-between">
                                <span className="font-medium">Net Operating</span>
                                <span className={`font-bold ${data.operating.net >= 0 ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'}`}>
                                    {formatCurrency(data.operating.net)}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Investing Activities" />
                    <CardBody>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Inflows</span>
                                <span className="font-medium text-[var(--color-success-600)]">{formatCurrency(data.investing.inflows)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Outflows</span>
                                <span className="font-medium text-[var(--color-danger-600)]">{formatCurrency(data.investing.outflows)}</span>
                            </div>
                            <hr className="border-[var(--color-neutral-200)]" />
                            <div className="flex justify-between">
                                <span className="font-medium">Net Investing</span>
                                <span className={`font-bold ${data.investing.net >= 0 ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'}`}>
                                    {formatCurrency(data.investing.net)}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Financing Activities" />
                    <CardBody>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Inflows</span>
                                <span className="font-medium text-[var(--color-success-600)]">{formatCurrency(data.financing.inflows)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Outflows</span>
                                <span className="font-medium text-[var(--color-danger-600)]">{formatCurrency(data.financing.outflows)}</span>
                            </div>
                            <hr className="border-[var(--color-neutral-200)]" />
                            <div className="flex justify-between">
                                <span className="font-medium">Net Financing</span>
                                <span className={`font-bold ${data.financing.net >= 0 ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'}`}>
                                    {formatCurrency(data.financing.net)}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

// VAT Summary Report Component
interface VatSummaryReportProps {
    data: ReportData['vatSummary'];
}

const VatSummaryReport: React.FC<VatSummaryReportProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Period Info */}
            <Card>
                <CardBody>
                    <p className="text-sm text-[var(--color-neutral-500)]">
                        VAT Period: {new Date(data.period.start).toLocaleDateString()} - {new Date(data.period.end).toLocaleDateString()}
                    </p>
                </CardBody>
            </Card>

            {/* VAT Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Output VAT (Sales)</p>
                        <p className="text-2xl font-bold text-[var(--color-danger-600)]">
                            {formatCurrency(data.outputVat)}
                        </p>
                        <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                            On taxable sales of {formatCurrency(data.sales.taxable)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Input VAT (Purchases)</p>
                        <p className="text-2xl font-bold text-[var(--color-success-600)]">
                            {formatCurrency(data.inputVat)}
                        </p>
                        <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                            On taxable purchases of {formatCurrency(data.purchases.taxable)}
                        </p>
                    </CardBody>
                </Card>
                <Card className={data.netVatPayable >= 0 ? 'border-[var(--color-danger-200)]' : 'border-[var(--color-success-200)]'}>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">
                            {data.netVatPayable >= 0 ? 'VAT Payable to IRD' : 'VAT Refund Due'}
                        </p>
                        <p className={`text-2xl font-bold ${data.netVatPayable >= 0 ? 'text-[var(--color-danger-600)]' : 'text-[var(--color-success-600)]'}`}>
                            {formatCurrency(Math.abs(data.netVatPayable))}
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Sales and Purchases Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Sales Summary" />
                    <CardBody>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Taxable Sales</span>
                                <span className="font-medium">{formatCurrency(data.sales.taxable)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Exempt Sales</span>
                                <span className="font-medium">{formatCurrency(data.sales.exempt)}</span>
                            </div>
                            <hr className="border-[var(--color-neutral-200)]" />
                            <div className="flex justify-between">
                                <span className="font-medium">Total Sales</span>
                                <span className="font-bold">{formatCurrency(data.sales.total)}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Purchases Summary" />
                    <CardBody>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Taxable Purchases</span>
                                <span className="font-medium">{formatCurrency(data.purchases.taxable)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-neutral-600)]">Exempt Purchases</span>
                                <span className="font-medium">{formatCurrency(data.purchases.exempt)}</span>
                            </div>
                            <hr className="border-[var(--color-neutral-200)]" />
                            <div className="flex justify-between">
                                <span className="font-medium">Total Purchases</span>
                                <span className="font-bold">{formatCurrency(data.purchases.total)}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* VAT by Rate */}
            {data.vatByRate && data.vatByRate.length > 0 && (
                <Card>
                    <CardHeader title="VAT by Rate" />
                    <CardBody>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-neutral-200)]">
                                    <th className="text-left py-2 text-sm font-medium text-[var(--color-neutral-600)]">VAT Rate</th>
                                    <th className="text-right py-2 text-sm font-medium text-[var(--color-neutral-600)]">Taxable Amount</th>
                                    <th className="text-right py-2 text-sm font-medium text-[var(--color-neutral-600)]">VAT Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.vatByRate.map((rate, index) => (
                                    <tr key={index} className="border-b border-[var(--color-neutral-100)]">
                                        <td className="py-2">{rate.rate}%</td>
                                        <td className="text-right py-2">{formatCurrency(rate.taxableAmount)}</td>
                                        <td className="text-right py-2 font-medium">{formatCurrency(rate.vatAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

// ============================================
// AGING RECEIVABLES REPORT
// ============================================

interface AgingReceivablesReportProps {
    data: ReportData['agingReceivables'];
}

const AgingReceivablesReport: React.FC<AgingReceivablesReportProps> = ({ data }) => {
    if (!data) return null;

    const buckets = [
        { label: 'Current', data: data.current, color: 'var(--color-success-500)' },
        { label: '1-30 Days', data: data.days1to30, color: 'var(--color-warning-400)' },
        { label: '31-60 Days', data: data.days31to60, color: 'var(--color-warning-500)' },
        { label: '61-90 Days', data: data.days61to90, color: 'var(--color-danger-400)' },
        { label: 'Over 90 Days', data: data.over90, color: 'var(--color-danger-600)' },
    ];

    const chartData = buckets.map((b) => ({ name: b.label, value: b.data.total }));

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Total Outstanding</p>
                        <p className="text-2xl font-bold text-[var(--color-primary-600)]">
                            {formatCurrency(data.totalOutstanding)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">As of Date</p>
                        <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                            {data.asOfDate}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Total Invoices</p>
                        <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                            {buckets.reduce((sum, b) => sum + b.data.count, 0)}
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Aging Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Aging Distribution" />
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Bar dataKey="value" fill="#3b82f6">
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader title="Aging Breakdown" />
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                                <Pie
                                    data={chartData.filter((d) => d.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>

            {/* Aging Buckets */}
            {buckets.map((bucket) => (
                bucket.data.count > 0 && (
                    <Card key={bucket.label}>
                        <CardHeader
                            title={`${bucket.label} - ${formatCurrency(bucket.data.total)}`}
                            subtitle={`${bucket.data.count} invoice(s)`}
                        />
                        <CardBody className="p-0">
                            <table className="w-full">
                                <thead className="bg-[var(--color-neutral-50)]">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Invoice #</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Customer</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Issue Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Due Date</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Total</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Paid</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bucket.data.invoices?.map((inv) => (
                                        <tr key={inv.id} className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]">
                                            <td className="py-3 px-4 font-medium">{inv.invoiceNumber}</td>
                                            <td className="py-3 px-4">{inv.customer}</td>
                                            <td className="py-3 px-4">{new Date(inv.issueDate).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 text-right">{formatCurrency(inv.total)}</td>
                                            <td className="py-3 px-4 text-right">{formatCurrency(inv.paid)}</td>
                                            <td className="py-3 px-4 text-right font-bold text-[var(--color-danger-600)]">{formatCurrency(inv.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>
                )
            ))}
        </div>
    );
};

// ============================================
// AGING PAYABLES REPORT
// ============================================

interface AgingPayablesReportProps {
    data: ReportData['agingPayables'];
}

const AgingPayablesReport: React.FC<AgingPayablesReportProps> = ({ data }) => {
    if (!data) return null;

    const buckets = [
        { label: 'Current', data: data.current, color: 'var(--color-success-500)' },
        { label: '1-30 Days', data: data.days1to30, color: 'var(--color-warning-400)' },
        { label: '31-60 Days', data: data.days31to60, color: 'var(--color-warning-500)' },
        { label: '61-90 Days', data: data.days61to90, color: 'var(--color-danger-400)' },
        { label: 'Over 90 Days', data: data.over90, color: 'var(--color-danger-600)' },
    ];

    const chartData = buckets.map((b) => ({ name: b.label, value: b.data.total }));

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Total Payable</p>
                        <p className="text-2xl font-bold text-[var(--color-danger-600)]">
                            {formatCurrency(data.totalPayable)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">As of Date</p>
                        <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                            {data.asOfDate}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-sm text-[var(--color-neutral-500)]">Total Expenses</p>
                        <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                            {buckets.reduce((sum, b) => sum + b.data.count, 0)}
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Aging Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Aging Distribution" />
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Bar dataKey="value" fill="#ef4444">
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader title="Aging Breakdown" />
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                                <Pie
                                    data={chartData.filter((d) => d.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>

            {/* Aging Buckets */}
            {buckets.map((bucket) => (
                bucket.data.count > 0 && (
                    <Card key={bucket.label}>
                        <CardHeader
                            title={`${bucket.label} - ${formatCurrency(bucket.data.total)}`}
                            subtitle={`${bucket.data.count} expense(s)`}
                        />
                        <CardBody className="p-0">
                            <table className="w-full">
                                <thead className="bg-[var(--color-neutral-50)]">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Expense #</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Vendor</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Description</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bucket.data.expenses?.map((exp) => (
                                        <tr key={exp.id} className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]">
                                            <td className="py-3 px-4 font-medium">{exp.expenseNumber}</td>
                                            <td className="py-3 px-4">{exp.vendor}</td>
                                            <td className="py-3 px-4">{new Date(exp.date).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 max-w-[200px] truncate">{exp.description}</td>
                                            <td className="py-3 px-4 text-right font-bold text-[var(--color-danger-600)]">{formatCurrency(exp.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>
                )
            ))}
        </div>
    );
};

export default ReportsPage;
