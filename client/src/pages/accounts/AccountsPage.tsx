import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api';
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
} from 'lucide-react';
import type { Account } from '../../types';

export const AccountsPage: React.FC = () => {
    const { data: accounts, isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => apiGet<Account[]>('/accounts'),
    });

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
                    <Button leftIcon={<Plus className="w-4 h-4" />}>
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
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Account
                            </Button>
                        }
                    />
                </Card>
            )}
        </div>
    );
};

interface AccountTypeSectionProps {
    type: string;
    label: string;
    color: string;
    accounts: Account[];
}

const AccountTypeSection: React.FC<AccountTypeSectionProps> = ({
    label,
    color,
    accounts,
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
                            <AccountRow key={account.id} account={account} />
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
}

const AccountRow: React.FC<AccountRowProps> = ({ account, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = account.children && account.children.length > 0;

    return (
        <>
            <div
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-neutral-50)] cursor-pointer"
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
            </div>
            {hasChildren && isExpanded && (
                <>
                    {account.children!.map((child) => (
                        <AccountRow key={child.id} account={child} depth={depth + 1} />
                    ))}
                </>
            )}
        </>
    );
};

export default AccountsPage;
