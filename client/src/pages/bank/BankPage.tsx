import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../lib/api';
import { formatCurrency, formatDate, formatDateForInput } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
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
    Link2,
    Undo2,
} from 'lucide-react';
import type { BankAccount, BankTransaction } from '../../types';

type BankSummaryResponse = {
    accounts: Array<{
        id: string;
        name: string;
        bankName?: string | null;
        currentBalance: number;
        transactionCount: number;
        unreconciledCount: number;
    }>;
    summary: {
        totalAccounts: number;
        totalBalance: number;
        totalUnreconciled: number;
    };
};

type BankTransactionsResponse = {
    transactions: BankTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    summary: {
        unreconciledCount: number;
        currentBalance: number;
    };
};

type SuggestionResponse = {
    type: 'invoices' | 'expenses';
    matches: Array<any>;
};

export const BankPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: '', bankName: '', accountNumber: '', currentBalance: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'reconciled' | 'unreconciled'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [statementFormat, setStatementFormat] = useState<'standard' | 'nabil' | 'nic_asia' | 'global_ime'>('standard');
    const [statementContent, setStatementContent] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

    const { data: bankAccounts, isLoading: loadingAccounts } = useQuery({
        queryKey: ['bank-accounts'],
        queryFn: () => apiGet<BankAccount[]>('/bank/accounts'),
    });

    const { data: bankSummary } = useQuery({
        queryKey: ['bank-summary'],
        queryFn: () => apiGet<BankSummaryResponse>('/bank/summary'),
    });

    const { data: transactionResponse, isLoading: loadingTransactions, refetch: refetchTransactions } = useQuery({
        queryKey: ['bank-transactions', selectedAccountId, statusFilter, typeFilter, startDate, endDate],
        queryFn: () => {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            const reconciledValue = statusFilter === 'all' ? 'all' : statusFilter === 'reconciled' ? 'true' : 'false';
            params.append('reconciled', reconciledValue);
            params.append('type', typeFilter);
            return apiGet<BankTransactionsResponse>(
                `/bank/accounts/${selectedAccountId}/transactions?${params.toString()}`
            );
        },
        enabled: !!selectedAccountId,
    });

    const { data: suggestions, isLoading: loadingSuggestions } = useQuery({
        queryKey: ['bank-suggestions', selectedTransaction?.id],
        queryFn: () => apiGet<SuggestionResponse>(`/bank/transactions/${selectedTransaction?.id}/suggestions`),
        enabled: !!selectedTransaction,
    });

    const createAccountMutation = useMutation({
        mutationFn: (data: typeof newAccount) => apiPost('/bank/accounts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['bank-summary'] });
            setIsAddAccountOpen(false);
            setNewAccount({ name: '', bankName: '', accountNumber: '', currentBalance: 0 });
        },
    });

    const reconcileMutation = useMutation({
        mutationFn: ({ transactionId, invoiceId, expenseId }: { transactionId: string; invoiceId?: string; expenseId?: string }) =>
            apiPost(`/bank/transactions/${transactionId}/reconcile`, { invoiceId, expenseId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['bank-summary'] });
        },
    });

    const unreconcileMutation = useMutation({
        mutationFn: (transactionId: string) => apiPost(`/bank/transactions/${transactionId}/unreconcile`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['bank-summary'] });
        },
    });

    const importStatementMutation = useMutation({
        mutationFn: () => apiPost(`/bank/${selectedAccountId}/import-statement`, {
            content: statementContent,
            format: statementFormat,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['bank-summary'] });
            setIsImportOpen(false);
            setStatementContent('');
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
    const transactions = transactionResponse?.transactions ?? [];
    const filteredTransactions = transactions.filter((tx) => {
        if (!searchQuery) return true;
        const haystack = `${tx.description} ${tx.reference ?? ''}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Bank Reconciliation"
                subtitle="Match transactions with your bank statements"
                action={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            leftIcon={<Upload className="w-4 h-4" />}
                            onClick={() => setIsImportOpen(true)}
                            disabled={!selectedAccountId}
                        >
                            Import Statement
                        </Button>
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddAccountOpen(true)}>
                            Add Account
                        </Button>
                    </div>
                }
            />

            {bankSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardBody>
                            <p className="text-sm text-[var(--color-neutral-500)]">Total Balance</p>
                            <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                                {formatCurrency(Number(bankSummary.summary.totalBalance))}
                            </p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <p className="text-sm text-[var(--color-neutral-500)]">Unreconciled Transactions</p>
                            <p className="text-2xl font-bold text-[var(--color-warning-600)]">
                                {bankSummary.summary.totalUnreconciled}
                            </p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <p className="text-sm text-[var(--color-neutral-500)]">Active Accounts</p>
                            <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                                {bankSummary.summary.totalAccounts}
                            </p>
                        </CardBody>
                    </Card>
                </div>
            )}

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
                            {bankSummary?.accounts && (
                                <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                                    {bankSummary.accounts.find((item) => item.id === account.id)?.unreconciledCount ?? 0} unreconciled
                                </p>
                            )}
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
                            <div className="flex flex-wrap items-center gap-2">
                                <Input
                                    placeholder="Search..."
                                    leftIcon={<Search className="w-4 h-4" />}
                                    className="w-56"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Status' },
                                        { value: 'reconciled', label: 'Reconciled' },
                                        { value: 'unreconciled', label: 'Unreconciled' },
                                    ]}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'reconciled' | 'unreconciled')}
                                    className="w-36"
                                />
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Types' },
                                        { value: 'credit', label: 'Credits' },
                                        { value: 'debit', label: 'Debits' },
                                    ]}
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value as 'all' | 'credit' | 'debit')}
                                    className="w-32"
                                />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-36"
                                    placeholder={formatDateForInput(new Date())}
                                />
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-36"
                                    placeholder={formatDateForInput(new Date())}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<RefreshCw className="w-4 h-4" />}
                                    onClick={() => refetchTransactions()}
                                >
                                    Refresh
                                </Button>
                            </div>
                        }
                    />
                    {loadingTransactions ? (
                        <div className="flex items-center justify-center h-32">
                            <Spinner />
                        </div>
                    ) : (filteredTransactions.length || 0) > 0 ? (
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
                                            Match
                                        </th>
                                        <th className="text-center p-4 text-sm font-medium text-[var(--color-neutral-600)]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]"
                                        >
                                            <td className="p-4 text-sm text-[var(--color-neutral-600)]">
                                                {formatDate(tx.date)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {tx.type === 'credit' ? (
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
                                            <td className={`p-4 text-right font-medium ${tx.type === 'credit'
                                                ? 'text-[var(--color-success-600)]'
                                                : 'text-[var(--color-danger-600)]'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </td>
                                            <td className="p-4 text-center">
                                                {tx.reconciled ? (
                                                    <Badge variant="success">Reconciled</Badge>
                                                ) : (
                                                    <Badge variant="warning">Pending</Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-sm">
                                                {tx.invoice ? (
                                                    <span className="text-[var(--color-primary-600)]">
                                                        Invoice {tx.invoice.invoiceNumber}
                                                    </span>
                                                ) : tx.expense ? (
                                                    <span className="text-[var(--color-primary-600)]">
                                                        Expense {tx.expense.expenseNumber}
                                                    </span>
                                                ) : (
                                                    <span className="text-[var(--color-neutral-400)]">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {tx.reconciled ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => unreconcileMutation.mutate(tx.id)}
                                                        isLoading={unreconcileMutation.isPending}
                                                    >
                                                        <Undo2 className="w-4 h-4 text-[var(--color-neutral-600)]" />
                                                    </Button>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedTransaction(tx);
                                                                setIsMatchModalOpen(true);
                                                            }}
                                                        >
                                                            <Link2 className="w-4 h-4 text-[var(--color-primary-600)]" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => reconcileMutation.mutate({ transactionId: tx.id })}
                                                            isLoading={reconcileMutation.isPending}
                                                        >
                                                            <Check className="w-4 h-4 text-[var(--color-success-600)]" />
                                                        </Button>
                                                    </div>
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

            {/* Match Suggestions Modal */}
            <Modal
                isOpen={isMatchModalOpen}
                onClose={() => {
                    setIsMatchModalOpen(false);
                    setSelectedTransaction(null);
                }}
                title="Match Transaction"
                size="md"
            >
                <ModalBody className="space-y-4">
                    {selectedTransaction && (
                        <div className="rounded-lg border border-[var(--color-neutral-200)] p-4">
                            <p className="text-sm text-[var(--color-neutral-500)]">Transaction</p>
                            <p className="font-medium text-[var(--color-neutral-900)]">
                                {selectedTransaction.description}
                            </p>
                            <p className="text-sm text-[var(--color-neutral-600)]">
                                {formatDate(selectedTransaction.date)} • {selectedTransaction.type}
                            </p>
                            <p className="text-sm font-semibold text-[var(--color-neutral-900)]">
                                {selectedTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                            </p>
                        </div>
                    )}

                    {loadingSuggestions ? (
                        <div className="flex items-center justify-center py-6">
                            <Spinner />
                        </div>
                    ) : suggestions?.matches?.length ? (
                        <div className="space-y-3">
                            <p className="text-sm text-[var(--color-neutral-600)]">Suggested matches</p>
                            {suggestions.matches.map((match: any) => (
                                <button
                                    key={match.id}
                                    className="w-full rounded-lg border border-[var(--color-neutral-200)] p-3 text-left hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)] transition"
                                    onClick={() => {
                                        if (!selectedTransaction) return;
                                        reconcileMutation.mutate({
                                            transactionId: selectedTransaction.id,
                                            invoiceId: suggestions.type === 'invoices' ? match.id : undefined,
                                            expenseId: suggestions.type === 'expenses' ? match.id : undefined,
                                        });
                                        setIsMatchModalOpen(false);
                                        setSelectedTransaction(null);
                                    }}
                                >
                                    {suggestions.type === 'invoices' ? (
                                        <div>
                                            <p className="font-medium">Invoice {match.invoiceNumber}</p>
                                            <p className="text-sm text-[var(--color-neutral-600)]">
                                                {match.customer?.name || 'Customer'} • {formatCurrency(match.total)}
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-medium">Expense {match.expenseNumber}</p>
                                            <p className="text-sm text-[var(--color-neutral-600)]">
                                                {match.vendor?.name || 'Vendor'} • {formatCurrency(match.totalAmount)}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-[var(--color-neutral-500)]">
                            No suggested matches found for this transaction.
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => {
                        setIsMatchModalOpen(false);
                        setSelectedTransaction(null);
                    }}>
                        Close
                    </Button>
                    {selectedTransaction && (
                        <Button
                            onClick={() => reconcileMutation.mutate({ transactionId: selectedTransaction.id })}
                            isLoading={reconcileMutation.isPending}
                        >
                            Reconcile Without Match
                        </Button>
                    )}
                </ModalFooter>
            </Modal>

            {/* Import Statement Modal */}
            <Modal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                title="Import Bank Statement"
                size="lg"
            >
                <ModalBody className="space-y-4">
                    <Select
                        label="Statement Format"
                        options={[
                            { value: 'standard', label: 'Standard CSV' },
                            { value: 'nabil', label: 'Nabil Bank' },
                            { value: 'nic_asia', label: 'NIC Asia' },
                            { value: 'global_ime', label: 'Global IME' },
                        ]}
                        value={statementFormat}
                        onChange={(e) => setStatementFormat(e.target.value as 'standard' | 'nabil' | 'nic_asia' | 'global_ime')}
                    />
                    <Textarea
                        label="Statement Content"
                        placeholder="Paste CSV content here"
                        rows={8}
                        value={statementContent}
                        onChange={(e) => setStatementContent(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => importStatementMutation.mutate()}
                        isLoading={importStatementMutation.isPending}
                        disabled={!statementContent.trim() || !selectedAccountId}
                    >
                        Import Statement
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default BankPage;
