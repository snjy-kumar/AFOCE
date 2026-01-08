import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Spinner, EmptyState, Badge } from '../../components/ui/Common';
import {
    Landmark,
    Plus,
    RefreshCw,
    Check,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Upload,
} from 'lucide-react';
import type { BankAccount, BankTransaction } from '../../types';

export const BankPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: '', bankName: '', accountNumber: '', currentBalance: 0 });

    const { data: bankAccounts, isLoading: loadingAccounts } = useQuery({
        queryKey: ['bank-accounts'],
        queryFn: () => apiGet<BankAccount[]>('/bank/accounts'),
    });

    const { data: transactions, isLoading: loadingTransactions } = useQuery({
        queryKey: ['bank-transactions', selectedAccountId],
        queryFn: () => apiGet<BankTransaction[]>(`/bank/accounts/${selectedAccountId}/transactions`),
        enabled: !!selectedAccountId,
    });

    const createAccountMutation = useMutation({
        mutationFn: (data: typeof newAccount) => apiPost('/bank/accounts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
            setIsAddAccountOpen(false);
            setNewAccount({ name: '', bankName: '', accountNumber: '', currentBalance: 0 });
        },
    });

    const reconcileMutation = useMutation({
        mutationFn: (transactionId: string) =>
            apiPut(`/bank/transactions/${transactionId}/reconcile`, { isReconciled: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
        },
    });

    React.useEffect(() => {
        if (bankAccounts?.length && !selectedAccountId) {
            setSelectedAccountId(bankAccounts[0].id);
        }
    }, [bankAccounts, selectedAccountId]);

    if (loadingAccounts) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    const selectedAccount = bankAccounts?.find((a) => a.id === selectedAccountId);

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Bank Reconciliation"
                subtitle="Match transactions with your bank statements"
                action={
                    <div className="flex gap-3">
                        <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
                            Import Statement
                        </Button>
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddAccountOpen(true)}>
                            Add Account
                        </Button>
                    </div>
                }
            />

            {/* Bank Account Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {bankAccounts?.map((account) => (
                    <Card
                        key={account.id}
                        className={`cursor-pointer transition-all ${selectedAccountId === account.id
                            ? 'ring-2 ring-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                            : 'hover:shadow-md'
                            }`}
                        onClick={() => setSelectedAccountId(account.id)}
                    >
                        <CardBody>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-[var(--color-neutral-500)]">{account.bankName}</p>
                                    <p className="font-medium text-[var(--color-neutral-900)]">{account.name}</p>
                                    <p className="text-xs text-[var(--color-neutral-400)]">
                                        •••• {account.accountNumber?.slice(-4)}
                                    </p>
                                </div>
                                <Landmark className="w-5 h-5 text-[var(--color-primary-500)]" />
                            </div>
                            <p className="mt-4 text-xl font-bold text-[var(--color-neutral-900)]">
                                {formatCurrency(account.currentBalance)}
                            </p>
                        </CardBody>
                    </Card>
                ))}

                {/* Add Account Card */}
                <Card
                    className="cursor-pointer border-2 border-dashed border-[var(--color-neutral-300)] hover:border-[var(--color-primary-400)] transition-colors"
                    onClick={() => setIsAddAccountOpen(true)}
                >
                    <CardBody className="flex flex-col items-center justify-center h-full min-h-[120px]">
                        <Plus className="w-8 h-8 text-[var(--color-neutral-400)]" />
                        <p className="mt-2 text-sm text-[var(--color-neutral-500)]">Add Account</p>
                    </CardBody>
                </Card>
            </div>

            {/* Transactions */}
            {selectedAccountId && (
                <Card>
                    <CardHeader
                        title={`${selectedAccount?.name} Transactions`}
                        action={
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Search..."
                                    leftIcon={<Search className="w-4 h-4" />}
                                    className="w-60"
                                />
                                <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
                                    Refresh
                                </Button>
                            </div>
                        }
                    />
                    {loadingTransactions ? (
                        <div className="flex items-center justify-center h-32">
                            <Spinner />
                        </div>
                    ) : (transactions?.length || 0) > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Date
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Description
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Reference
                                        </th>
                                        <th className="text-right p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Amount
                                        </th>
                                        <th className="text-center p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Status
                                        </th>
                                        <th className="text-center p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions?.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]"
                                        >
                                            <td className="p-4 text-sm text-[var(--color-neutral-600)]">
                                                {formatDate(tx.date)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {tx.type === 'CREDIT' ? (
                                                        <ArrowDownLeft className="w-4 h-4 text-[var(--color-success-500)]" />
                                                    ) : (
                                                        <ArrowUpRight className="w-4 h-4 text-[var(--color-danger-500)]" />
                                                    )}
                                                    <span className="text-[var(--color-neutral-900)]">{tx.description}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-[var(--color-neutral-500)]">
                                                {tx.reference || '-'}
                                            </td>
                                            <td className={`p-4 text-right font-medium ${tx.type === 'CREDIT'
                                                ? 'text-[var(--color-success-600)]'
                                                : 'text-[var(--color-danger-600)]'
                                                }`}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </td>
                                            <td className="p-4 text-center">
                                                {tx.isReconciled ? (
                                                    <Badge variant="success">Reconciled</Badge>
                                                ) : (
                                                    <Badge variant="warning">Pending</Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {!tx.isReconciled && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => reconcileMutation.mutate(tx.id)}
                                                        isLoading={reconcileMutation.isPending}
                                                    >
                                                        <Check className="w-4 h-4 text-[var(--color-success-600)]" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Landmark className="w-8 h-8" />}
                            title="No transactions"
                            description="Import a bank statement or add transactions manually"
                        />
                    )}
                </Card>
            )}

            {/* Add Bank Account Modal */}
            <Modal
                isOpen={isAddAccountOpen}
                onClose={() => setIsAddAccountOpen(false)}
                title="Add Bank Account"
                size="md"
            >
                <ModalBody className="space-y-4">
                    <Input
                        label="Account Name"
                        placeholder="e.g., Business Current Account"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Bank Name"
                        placeholder="e.g., Nepal Bank Ltd."
                        value={newAccount.bankName}
                        onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                        required
                    />
                    <Input
                        label="Account Number"
                        placeholder="Enter account number"
                        value={newAccount.accountNumber}
                        onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    />
                    <Input
                        label="Current Balance"
                        type="number"
                        placeholder="0.00"
                        value={newAccount.currentBalance}
                        onChange={(e) => setNewAccount({ ...newAccount, currentBalance: parseFloat(e.target.value) || 0 })}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => createAccountMutation.mutate(newAccount)}
                        isLoading={createAccountMutation.isPending}
                    >
                        Add Account
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default BankPage;
