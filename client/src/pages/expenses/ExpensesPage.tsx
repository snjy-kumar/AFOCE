import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../../lib/api';
import { formatDate, formatCurrency } from '../../lib/utils';
import { exportToExcel } from '../../lib/export';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { PageHeader } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Spinner, EmptyState, Badge } from '../../components/ui/Common';
import { Pagination } from '../../components/common/Pagination';
import {
    Plus,
    Search,
    Receipt,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Image,
    FileSpreadsheet,
} from 'lucide-react';
import type { Expense } from '../../types';

const ITEMS_PER_PAGE = 10;

export const ExpensesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => apiGet<Expense[]>('/expenses'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiDelete(`/expenses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setDeletingId(null);
        },
    });

    const filteredExpenses = (expenses || []).filter(
        (expense) =>
            expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'n',
            ctrlKey: true,
            action: () => navigate('/expenses/new'),
            description: 'Create new expense',
        },
    ]);

    // Export handlers
    const handleExportExcel = () => {
        exportToExcel(
            filteredExpenses,
            [
                { key: 'expenseNumber', label: 'Expense Number' },
                { key: 'vendor.name', label: 'Vendor' },
                { key: 'date', label: 'Date', format: (val) => formatDate(val) },
                { key: 'description', label: 'Description' },
                { key: 'account.name', label: 'Category' },
                { key: 'amount', label: 'Amount', format: (val) => formatCurrency(val) },
                { key: 'vatAmount', label: 'VAT', format: (val) => formatCurrency(val) },
                { key: 'totalAmount', label: 'Total', format: (val) => formatCurrency(val) },
                { key: 'isPaid', label: 'Paid', format: (val) => val ? 'Yes' : 'No' },
            ],
            'expenses'
        );
    };

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
                title="Expenses"
                subtitle={`${expenses?.length || 0} total expenses`}
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                            onClick={handleExportExcel}
                            disabled={filteredExpenses.length === 0}
                        >
                            Export
                        </Button>
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/expenses/new')}>
                            Add Expense
                        </Button>
                    </div>
                }
            />

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search expenses..."
                    leftIcon={<Search className="w-4 h-4" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                />
            </div>

            {/* Expenses Table */}
            {filteredExpenses.length > 0 ? (
                <>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Expense
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Date
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Vendor
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Category
                                        </th>
                                        <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Amount
                                        </th>
                                        <th className="text-center p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Receipt
                                        </th>
                                        <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedExpenses.map((expense) => (
                                        <ExpenseRow
                                            key={expense.id}
                                            expense={expense}
                                            onDelete={() => setDeletingId(expense.id)}
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
                        totalItems={filteredExpenses.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </>
            ) : (
                <Card>
                    <EmptyState
                        icon={<Receipt className="w-8 h-8" />}
                        title="No expenses found"
                        description={
                            searchQuery
                                ? 'Try a different search term'
                                : 'Record your first expense to start tracking'
                        }
                        action={
                            !searchQuery && (
                                <Button onClick={() => navigate('/expenses/new')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Expense
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
                title="Delete Expense"
                size="sm"
            >
                <ModalBody>
                    <p className="text-[var(--color-neutral-600)]">
                        Are you sure you want to delete this expense? This action cannot be undone.
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

// Expense Row Component
interface ExpenseRowProps {
    expense: Expense;
    onDelete: () => void;
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({ expense, onDelete }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <tr className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)] transition-colors">
            <td className="p-4">
                <Link
                    to={`/expenses/${expense.id}`}
                    className="font-medium text-[var(--color-neutral-900)] hover:text-[var(--color-primary-600)]"
                >
                    {expense.description}
                </Link>
                <div className="text-xs text-[var(--color-neutral-500)]">{expense.expenseNumber}</div>
            </td>
            <td className="p-4 text-[var(--color-neutral-600)]">{formatDate(expense.date)}</td>
            <td className="p-4 text-[var(--color-neutral-600)]">{expense.vendor?.name || '-'}</td>
            <td className="p-4">
                <Badge variant="default">{expense.account?.name || 'Uncategorized'}</Badge>
            </td>
            <td className="p-4 text-right">
                <div className="font-medium text-[var(--color-danger-600)]">
                    -{formatCurrency(expense.totalAmount)}
                </div>
                {expense.vatAmount > 0 && (
                    <div className="text-xs text-[var(--color-neutral-500)]">
                        VAT: {formatCurrency(expense.vatAmount)}
                    </div>
                )}
            </td>
            <td className="p-4 text-center">
                {expense.receiptUrl ? (
                    <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-success-50)] text-[var(--color-success-600)]"
                    >
                        <Image className="w-4 h-4" />
                    </a>
                ) : (
                    <span className="text-[var(--color-neutral-400)]">-</span>
                )}
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
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-[var(--color-neutral-200)] py-1 z-10">
                                <button
                                    onClick={() => {
                                        navigate(`/expenses/${expense.id}`);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={() => {
                                        navigate(`/expenses/${expense.id}/edit`);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
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

export default ExpensesPage;
