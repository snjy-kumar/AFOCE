import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner, EmptyState, StatusBadge } from '../../components/ui/Common';
import {
    Calculator,
    FileText,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    Plus,
} from 'lucide-react';
import type { VatRecord } from '../../types';

interface VatSummary {
    periodStart: string;
    periodEnd: string;
    salesVat: number;
    purchaseVat: number;
    netVat: number;
    salesCount: number;
    purchaseCount: number;
}

export const VatPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: vatRecords, isLoading } = useQuery({
        queryKey: ['vat-records'],
        queryFn: () => apiGet<VatRecord[]>('/vat'),
    });

    const { data: vatSummary } = useQuery({
        queryKey: ['vat-summary', startDate, endDate],
        queryFn: () => {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            return apiGet<VatSummary>(`/vat/summary?${params.toString()}`);
        },
        enabled: !!startDate && !!endDate,
    });

    const fileMutation = useMutation({
        mutationFn: (data: { periodStart: string; periodEnd: string; periodLabel: string }) =>
            apiPost('/vat', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vat-records'] });
            setIsModalOpen(false);
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="VAT Management"
                subtitle="Track and file your Value Added Tax"
                action={
                    <div className="flex gap-3">
                        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                            Export Report
                        </Button>
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                            File VAT Return
                        </Button>
                    </div>
                }
            />

            {/* Period Filter */}
            <Card className="mb-6">
                <CardBody>
                    <div className="flex flex-wrap items-end gap-4">
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
                        <Button variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                            This Month
                        </Button>
                        <Button variant="outline">This Quarter</Button>
                        <Button variant="outline">This Year</Button>
                    </div>
                </CardBody>
            </Card>

            {/* VAT Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-neutral-500)]">Output VAT (Sales)</p>
                                <p className="text-2xl font-bold text-[var(--color-success-600)]">
                                    {formatCurrency(vatSummary?.salesVat || 0)}
                                </p>
                                <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                                    {vatSummary?.salesCount || 0} invoices
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-success-50)] flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-[var(--color-success-600)]" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-neutral-500)]">Input VAT (Purchases)</p>
                                <p className="text-2xl font-bold text-[var(--color-danger-600)]">
                                    {formatCurrency(vatSummary?.purchaseVat || 0)}
                                </p>
                                <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                                    {vatSummary?.purchaseCount || 0} expenses
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-danger-50)] flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-[var(--color-danger-600)]" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--color-neutral-500)]">Net VAT Payable</p>
                                <p className={`text-2xl font-bold ${(vatSummary?.netVat || 0) >= 0 ? 'text-[var(--color-warning-600)]' : 'text-[var(--color-success-600)]'}`}>
                                    {formatCurrency(Math.abs(vatSummary?.netVat || 0))}
                                </p>
                                <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                                    {(vatSummary?.netVat || 0) >= 0 ? 'Amount to pay' : 'Credit balance'}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-warning-50)] flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-[var(--color-warning-600)]" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filed VAT Returns */}
            <Card>
                <CardHeader title="Filed VAT Returns" />
                {(vatRecords?.length || 0) > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Period
                                    </th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Output VAT
                                    </th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Input VAT
                                    </th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Net Payable
                                    </th>
                                    <th className="text-center p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Status
                                    </th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Filed Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {vatRecords?.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]"
                                    >
                                        <td className="p-4">
                                            <div className="font-medium text-[var(--color-neutral-900)]">
                                                {formatDate(record.periodStart)} - {formatDate(record.periodEnd)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-[var(--color-success-600)]">
                                            {formatCurrency(record.salesVat)}
                                        </td>
                                        <td className="p-4 text-right text-[var(--color-danger-600)]">
                                            {formatCurrency(record.purchaseVat)}
                                        </td>
                                        <td className="p-4 text-right font-medium">
                                            {formatCurrency(record.netVat)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={record.status} />
                                        </td>
                                        <td className="p-4 text-[var(--color-neutral-600)]">
                                            {record.filedDate ? formatDate(record.filedDate) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={<FileText className="w-8 h-8" />}
                        title="No VAT returns filed"
                        description="File your first VAT return to see it here"
                    />
                )}
            </Card>

            {/* File VAT Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="File VAT Return"
                size="md"
            >
                <ModalBody className="space-y-4">
                    <p className="text-sm text-[var(--color-neutral-600)]">
                        Select the period for which you want to file the VAT return.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Period Start"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                        <Input
                            label="Period End"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    {vatSummary && (
                        <div className="p-4 bg-[var(--color-neutral-50)] rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Output VAT</span>
                                <span className="font-medium">{formatCurrency(vatSummary.salesVat)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Input VAT</span>
                                <span className="font-medium">{formatCurrency(vatSummary.purchaseVat)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t pt-2">
                                <span>Net Payable</span>
                                <span>{formatCurrency(vatSummary.netVat)}</span>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            const periodLabel = startDate ? startDate.slice(0, 7) : '';
                            fileMutation.mutate({ periodStart: startDate, periodEnd: endDate, periodLabel });
                        }}
                        isLoading={fileMutation.isPending}
                        disabled={!startDate || !endDate}
                    >
                        File Return
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default VatPage;
