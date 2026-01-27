import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../lib/api';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner, EmptyState } from '../../components/ui/Common';
import {
    BookOpen,
    ChevronRight,
    ChevronDown,
    Plus,
    Folder,
    FolderOpen,
    Edit2,
    Trash2,
    X,
} from 'lucide-react';
import type { Account } from '../../types';
import toast from 'react-hot-toast';

interface AccountFormData {
    code: string;
    name: string;
    nameNe?: string;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
    parentId?: string;
    description?: string;
}

export const AccountsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [formData, setFormData] = useState<AccountFormData>({
        code: '',
        name: '',
        nameNe: '',
        type: 'ASSET',
        parentId: '',
        description: '',
    });

    const { data: accounts, isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => apiGet<Account[]>('/accounts'),
    });

    const createMutation = useMutation({
        mutationFn: (data: AccountFormData) => apiPost<Account>('/accounts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Account created successfully');
            closeModal();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create account');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AccountFormData> }) =>
            apiPatch<Account>(`/accounts/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Account updated successfully');
            closeModal();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update account');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiDelete(`/accounts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Account deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete account');
        },
    });

    const openCreateModal = () => {
        setEditingAccount(null);
        setFormData({
            code: '',
            name: '',
            nameNe: '',
            type: 'ASSET',
            parentId: '',
            description: '',
        });
        setShowModal(true);
    };

    const openEditModal = (account: Account) => {
        setEditingAccount(account);
        setFormData({
            code: account.code,
            name: account.name,
            nameNe: account.nameNe || '',
            type: account.type,
            parentId: account.parentId || '',
            description: account.description || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAccount(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            parentId: formData.parentId || undefined,
            nameNe: formData.nameNe || undefined,
            description: formData.description || undefined,
        };
        if (editingAccount) {
            updateMutation.mutate({ id: editingAccount.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (account: Account) => {
        if (account.isSystem) {
            toast.error('Cannot delete system accounts');
            return;
        }
        if (window.confirm(`Delete account "${account.name}"? This action cannot be undone.`)) {
            deleteMutation.mutate(account.id);
        }
    };

    const accountsByType = React.useMemo(() => {
        if (!accounts) return {};
        return accounts.reduce((acc, account) => {
            if (!acc[account.type]) acc[account.type] = [];
            acc[account.type].push(account);
            return acc;
        }, {} as Record<string, Account[]>);
    }, [accounts]);

    const typeLabels: Record<string, { label: string; color: string }> = {
        ASSET: { label: 'Assets', color: 'text-blue-600 bg-blue-50' },
        LIABILITY: { label: 'Liabilities', color: 'text-red-600 bg-red-50' },
        EQUITY: { label: 'Equity', color: 'text-purple-600 bg-purple-50' },
        INCOME: { label: 'Income', color: 'text-green-600 bg-green-50' },
        EXPENSE: { label: 'Expenses', color: 'text-orange-600 bg-orange-50' },
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
                title="Chart of Accounts"
                subtitle={`${accounts?.length || 0} accounts configured`}
                action={
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                        Add Account
                    </Button>
                }
            />

            {(accounts?.length || 0) > 0 ? (
                <div className="space-y-6">
                    {Object.entries(accountsByType).map(([type, typeAccounts]) => (
                        <AccountTypeSection
                            key={type}
                            type={type}
                            label={typeLabels[type]?.label || type}
                            color={typeLabels[type]?.color || 'text-gray-600 bg-gray-50'}
                            accounts={typeAccounts}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <EmptyState
                        icon={<BookOpen className="w-8 h-8" />}
                        title="No accounts found"
                        description="Set up your chart of accounts to start tracking finances"
                        action={
                            <Button onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Account
                            </Button>
                        }
                    />
                </Card>
            )}

            {/* Account Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editingAccount ? 'Edit Account' : 'New Account'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 1001"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountFormData['type'] })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="ASSET">Asset</option>
                                        <option value="LIABILITY">Liability</option>
                                        <option value="EQUITY">Equity</option>
                                        <option value="INCOME">Income</option>
                                        <option value="EXPENSE">Expense</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Name (English) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Cash in Bank"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Name (Nepali)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameNe}
                                    onChange={(e) => setFormData({ ...formData, nameNe: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., बैंकमा नगद"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent Account
                                </label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">None (Top-level account)</option>
                                    {accounts?.filter(a => a.type === formData.type && a.id !== editingAccount?.id).map(a => (
                                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Optional description for this account"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    isLoading={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingAccount ? 'Update Account' : 'Create Account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

interface AccountTypeSectionProps {
    type: string;
    label: string;
    color: string;
    accounts: Account[];
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
}

const AccountTypeSection: React.FC<AccountTypeSectionProps> = ({
    label,
    color,
    accounts,
    onEdit,
    onDelete,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Card>
            <CardHeader>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${color}`}>
                            {label}
                        </span>
                        <span className="text-sm text-[var(--color-neutral-500)]">
                            {accounts.length} accounts
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-[var(--color-neutral-400)]" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                    )}
                </button>
            </CardHeader>
            {isExpanded && (
                <CardBody className="pt-0">
                    <div className="space-y-1">
                        {accounts.map((account) => (
                            <AccountRow
                                key={account.id}
                                account={account}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </CardBody>
            )}
        </Card>
    );
};

interface AccountRowProps {
    account: Account;
    depth?: number;
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
}

const AccountRow: React.FC<AccountRowProps> = ({ account, depth = 0, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = account.children && account.children.length > 0;

    return (
        <>
            <div
                className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-neutral-50)]"
                style={{ paddingLeft: `${(depth * 24) + 12}px` }}
            >
                {hasChildren ? (
                    <button onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? (
                            <FolderOpen className="w-4 h-4 text-[var(--color-warning-500)]" />
                        ) : (
                            <Folder className="w-4 h-4 text-[var(--color-warning-500)]" />
                        )}
                    </button>
                ) : (
                    <div className="w-4" />
                )}
                <span className="text-sm font-mono text-[var(--color-neutral-500)]">
                    {account.code}
                </span>
                <span className="flex-1 text-sm text-[var(--color-neutral-900)]">
                    {account.name}
                </span>
                {account.nameNe && (
                    <span className="text-sm text-[var(--color-neutral-500)]">
                        {account.nameNe}
                    </span>
                )}
                {account.isSystem && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]">
                        System
                    </span>
                )}
                {/* Action buttons - visible on hover */}
                <div className="hidden group-hover:flex items-center gap-1">
                    <button
                        onClick={() => onEdit(account)}
                        className="p-1.5 hover:bg-blue-50 rounded text-[var(--color-neutral-400)] hover:text-blue-600 transition-colors"
                        title="Edit account"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    {!account.isSystem && (
                        <button
                            onClick={() => onDelete(account)}
                            className="p-1.5 hover:bg-red-50 rounded text-[var(--color-neutral-400)] hover:text-red-600 transition-colors"
                            title="Delete account"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            {hasChildren && isExpanded && (
                <>
                    {account.children!.map((child) => (
                        <AccountRow
                            key={child.id}
                            account={child}
                            depth={depth + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </>
            )}
        </>
    );
};

export default AccountsPage;
