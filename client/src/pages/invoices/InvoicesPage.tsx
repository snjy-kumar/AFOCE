import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../../lib/api';
import { formatDate, formatCurrency } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Spinner, EmptyState, StatusBadge } from '../../components/ui/Common';
import {
    Plus,
    Search,
    FileText,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Download,
    Send,
} from 'lucide-react';
import type { Invoice } from '../../types';

export const InvoicesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: invoices, isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => apiGet<Invoice[]>('/invoices'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiDelete(`/invoices/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setDeletingId(null);
        },
    });

    const filteredInvoices = (invoices || []).filter((invoice) => {
        const matchesSearch =
            invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'SENT', label: 'Sent' },
        { value: 'PAID', label: 'Paid' },
        { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
        { value: 'OVERDUE', label: 'Overdue' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];

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
                title="Invoices"
                subtitle={`${invoices?.length || 0} total invoices`}
                action={
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/invoices/new')}>
                        New Invoice
                    </Button>
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search invoices..."
                    leftIcon={<Search className="w-4 h-4" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="sm:max-w-xs"
                />
                <Select
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="sm:max-w-xs"
                />
            </div>

            {/* Invoice Table */}
            {filteredInvoices.length > 0 ? (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Invoice
                                    </th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Customer
                                    </th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Issue Date
                                    </th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Due Date
                                    </th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Amount
                                    </th>
                                    <th className="text-center p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Status
                                    </th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <InvoiceRow
                                        key={invoice.id}
                                        invoice={invoice}
                                        onDelete={() => setDeletingId(invoice.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <Card>
                    <EmptyState
                        icon={<FileText className="w-8 h-8" />}
                        title="No invoices found"
                        description={
                            searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first invoice to get started'
                        }
                        action={
                            !searchQuery &&
                            statusFilter === 'all' && (
                                <Button onClick={() => navigate('/invoices/new')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Invoice
                                </Button>
                            )
                        }
                    />
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                title="Delete Invoice"
                size="sm"
            >
                <ModalBody>
                    <p className="text-[var(--color-neutral-600)]">
                        Are you sure you want to delete this invoice? This action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setDeletingId(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => deletingId && deleteMutation.mutate(deletingId)}
                        isLoading={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

// Invoice Row Component
interface InvoiceRowProps {
    invoice: Invoice;
    onDelete: () => void;
}

const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoice, onDelete }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const isOverdue =
        invoice.status !== 'PAID' &&
        invoice.status !== 'CANCELLED' &&
        new Date(invoice.dueDate) < new Date();

    return (
        <tr className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)] transition-colors">
            <td className="p-4">
                <Link
                    to={`/invoices/${invoice.id}`}
                    className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
                >
                    {invoice.invoiceNumber}
                </Link>
            </td>
            <td className="p-4">
                <span className="text-[var(--color-neutral-900)]">
                    {invoice.customer?.name || 'Unknown'}
                </span>
            </td>
            <td className="p-4 text-[var(--color-neutral-600)]">{formatDate(invoice.issueDate)}</td>
            <td className="p-4">
                <span className={isOverdue ? 'text-[var(--color-danger-600)] font-medium' : 'text-[var(--color-neutral-600)]'}>
                    {formatDate(invoice.dueDate)}
                </span>
            </td>
            <td className="p-4 text-right font-medium text-[var(--color-neutral-900)]">
                {formatCurrency(invoice.total)}
            </td>
            <td className="p-4 text-center">
                <StatusBadge status={isOverdue && invoice.status === 'SENT' ? 'OVERDUE' : invoice.status} />
            </td>
            <td className="p-4 text-right">
                <div className="relative inline-block">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-lg hover:bg-[var(--color-neutral-100)]"
                    >
                        <MoreVertical className="w-4 h-4 text-[var(--color-neutral-400)]" />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-[var(--color-neutral-200)] py-1 z-10">
                                <button
                                    onClick={() => {
                                        navigate(`/invoices/${invoice.id}`);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={() => {
                                        navigate(`/invoices/${invoice.id}/edit`);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                {invoice.status === 'DRAFT' && (
                                    <button
                                        onClick={() => setShowMenu(false)}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]"
                                    >
                                        <Send className="w-4 h-4" />
                                        Send
                                    </button>
                                )}
                                {invoice.pdfUrl && (
                                    <button
                                        onClick={() => setShowMenu(false)}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        onDelete();
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)]"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default InvoicesPage;
