import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../../lib/api';
import { formatDate, formatCurrency } from '../../lib/utils';
import { exportToExcel } from '../../lib/export';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useDebounce } from '../../hooks/useDebounce';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import { PageHeader } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Common';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tooltip } from '../../components/ui/Tooltip';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/common/Pagination';
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
    FileSpreadsheet,
    CheckSquare,
    Square,
    X,
} from 'lucide-react';
import type { Invoice } from '../../types';

const ITEMS_PER_PAGE = 10;

export const InvoicesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [statusFilter, setStatusFilter] = useState('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

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
            invoice.invoiceNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            invoice.customer?.name.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Bulk selection
    const bulkSelection = useBulkSelection(filteredInvoices);

    // Pagination logic
    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'n',
            ctrlKey: true,
            action: () => navigate('/invoices/new'),
            description: 'Create new invoice',
        },
    ]);

    // Export handlers
    const handleExportExcel = () => {
        exportToExcel(
            filteredInvoices,
            [
                { key: 'invoiceNumber', label: 'Invoice Number' },
                { key: 'customer.name', label: 'Customer' },
                { key: 'issueDate', label: 'Issue Date', format: (val) => formatDate(val) },
                { key: 'dueDate', label: 'Due Date', format: (val) => formatDate(val) },
                { key: 'status', label: 'Status' },
                { key: 'subtotal', label: 'Subtotal', format: (val) => formatCurrency(val) },
                { key: 'vatAmount', label: 'VAT', format: (val) => formatCurrency(val) },
                { key: 'total', label: 'Total', format: (val) => formatCurrency(val) },
                { key: 'paidAmount', label: 'Paid', format: (val) => formatCurrency(val) },
            ],
            'invoices'
        );
    };

    // Bulk delete handler
    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${bulkSelection.selectedCount} selected invoices?`)) {
            return;
        }

        const selectedItems = bulkSelection.getSelectedItems();
        await Promise.all(selectedItems.map(item => deleteMutation.mutateAsync(item.id)));
        bulkSelection.clearSelection();
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
    };

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
            <div className="animate-fade-in">
                <PageHeader title="Invoices" />
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="h-10 w-full sm:max-w-xs bg-[var(--color-neutral-200)] rounded-lg animate-pulse" />
                        <div className="h-10 w-full sm:max-w-xs bg-[var(--color-neutral-200)] rounded-lg animate-pulse" />
                    </div>
                    <Card>
                        <TableSkeleton rows={10} columns={6} />
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Invoices"
                subtitle={`${invoices?.length || 0} total invoices`}
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                            onClick={handleExportExcel}
                            disabled={filteredInvoices.length === 0}
                        >
                            Export
                        </Button>
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/invoices/new')}>
                            New Invoice
                        </Button>
                    </div>
                }
            />

            {/* Bulk Actions Bar */}
            {bulkSelection.selectedCount > 0 && (
                <div className="mb-4 p-4 bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-[var(--color-primary-600)]" />
                        <span className="font-medium text-[var(--color-primary-900)]">
                            {bulkSelection.selectedCount} invoice{bulkSelection.selectedCount > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            onClick={handleBulkDelete}
                        >
                            Delete Selected
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<X className="w-4 h-4" />}
                            onClick={bulkSelection.clearSelection}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

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
                <>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                                        <th className="w-12 p-4">
                                            <button
                                                onClick={bulkSelection.toggleAll}
                                                className="w-5 h-5 flex items-center justify-center text-[var(--color-neutral-600)] hover:text-[var(--color-primary-600)]"
                                                aria-label={bulkSelection.isAllSelected ? 'Deselect all' : 'Select all'}
                                            >
                                                {bulkSelection.isAllSelected ? (
                                                    <CheckSquare className="w-5 h-5" />
                                                ) : bulkSelection.isSomeSelected ? (
                                                    <Square className="w-5 h-5" strokeWidth={3} />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </th>
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
                                    {paginatedInvoices.map((invoice) => (
                                        <InvoiceRow
                                            key={invoice.id}
                                            invoice={invoice}
                                            onDelete={() => setDeletingId(invoice.id)}
                                            isSelected={bulkSelection.isSelected(invoice.id)}
                                            onToggleSelect={() => bulkSelection.toggleItem(invoice.id)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredInvoices.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            ) : (
                <EmptyState
                    icon={<FileText className="w-12 h-12 text-[var(--color-neutral-400)]" />}
                    title="No invoices found"
                    description={
                        searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your filters to see more results'
                            : 'Create your first invoice to get started tracking your billing'
                    }
                    action={
                        searchQuery || statusFilter !== 'all'
                            ? undefined
                            : {
                                label: 'Create Invoice',
                                onClick: () => navigate('/invoices/new'),
                                icon: <Plus className="w-4 h-4" />,
                            }
                    }
                />
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
    isSelected: boolean;
    onToggleSelect: () => void;
}

const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoice, onDelete, isSelected, onToggleSelect }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const isOverdue =
        invoice.status !== 'PAID' &&
        invoice.status !== 'CANCELLED' &&
        new Date(invoice.dueDate) < new Date();

    return (
        <tr className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)] transition-all duration-200">
            <td className="p-4">
                <Tooltip content={isSelected ? 'Deselect' : 'Select'}>
                    <button
                        onClick={onToggleSelect}
                        className="w-5 h-5 flex items-center justify-center text-[var(--color-neutral-600)] hover:text-[var(--color-primary-600)] transition-colors"
                        aria-label={isSelected ? 'Deselect' : 'Select'}
                    >
                        {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-[var(--color-primary-600)]" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                    </button>
                </Tooltip>
            </td>
            <td className="p-4">
                <Tooltip content="View invoice details">
                    <Link
                        to={`/invoices/${invoice.id}`}
                        className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] hover:underline transition-colors"
                    >
                        {invoice.invoiceNumber}
                    </Link>
                </Tooltip>
            </td>
            <td className="p-4">
                <span className="text-[var(--color-neutral-900)]">
                    {invoice.customer?.name || 'Unknown'}
                </span>
            </td>
            <td className="p-4 text-[var(--color-neutral-600)]">{formatDate(invoice.issueDate)}</td>
            <td className="p-4">
                {isOverdue && (
                    <Tooltip content="This invoice is overdue">
                        <span className="text-[var(--color-danger-600)] font-medium">
                            {formatDate(invoice.dueDate)}
                        </span>
                    </Tooltip>
                )}
                {!isOverdue && (
                    <span className="text-[var(--color-neutral-600)]">
                        {formatDate(invoice.dueDate)}
                    </span>
                )}
            </td>
            <td className="p-4 text-right font-medium text-[var(--color-neutral-900)]">
                {formatCurrency(invoice.total)}
            </td>
            <td className="p-4">
                <div className="flex flex-col items-center gap-2">
                    <StatusBadge status={isOverdue && invoice.status === 'SENT' ? 'OVERDUE' : invoice.status} />
                    {['PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(invoice.status) && (
                        <Badge
                            variant={
                                invoice.status === 'APPROVED'
                                    ? 'success'
                                    : invoice.status === 'REJECTED'
                                        ? 'danger'
                                        : 'warning'
                            }
                            size="sm"
                        >
                            {invoice.status === 'PENDING_APPROVAL' && '⏳ Pending Approval'}
                            {invoice.status === 'APPROVED' && '✓ Approved'}
                            {invoice.status === 'REJECTED' && '✗ Rejected'}
                        </Badge>
                    )}
                </div>
            </td>
            <td className="p-4 text-right">
                <div className="relative inline-block">
                    <Tooltip content="More actions">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors"
                        >
                            <MoreVertical className="w-4 h-4 text-[var(--color-neutral-400)]" />
                        </button>
                    </Tooltip>
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
