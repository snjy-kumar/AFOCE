import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api';
import { Modal, ModalBody } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Search, FileText, Receipt, Users, Building2 } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import type { Invoice, Expense, Customer, Vendor } from '../../types';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

type SearchResult = {
    type: 'invoice' | 'expense' | 'customer' | 'vendor';
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    href: string;
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    const { data: invoices } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => apiGet<Invoice[]>('/invoices'),
        enabled: isOpen,
    });

    const { data: expenses } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => apiGet<Expense[]>('/expenses'),
        enabled: isOpen,
    });

    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => apiGet<Customer[]>('/customers'),
        enabled: isOpen,
    });

    const { data: vendors } = useQuery({
        queryKey: ['vendors'],
        queryFn: () => apiGet<Vendor[]>('/vendors'),
        enabled: isOpen,
    });

    // Filter and combine results
    const results: SearchResult[] = React.useMemo(() => {
        if (!query.trim()) return [];

        const searchQuery = query.toLowerCase();
        const items: SearchResult[] = [];

        // Search invoices
        (invoices || []).forEach(invoice => {
            if (
                invoice.invoiceNumber.toLowerCase().includes(searchQuery) ||
                invoice.customer?.name.toLowerCase().includes(searchQuery)
            ) {
                items.push({
                    type: 'invoice',
                    id: invoice.id,
                    title: invoice.invoiceNumber,
                    subtitle: `${invoice.customer?.name} • ${formatCurrency(invoice.total)}`,
                    icon: <FileText className="w-4 h-4" />,
                    href: `/invoices/${invoice.id}/edit`,
                });
            }
        });

        // Search expenses
        (expenses || []).forEach(expense => {
            if (
                expense.expenseNumber.toLowerCase().includes(searchQuery) ||
                expense.description.toLowerCase().includes(searchQuery) ||
                expense.vendor?.name.toLowerCase().includes(searchQuery)
            ) {
                items.push({
                    type: 'expense',
                    id: expense.id,
                    title: expense.expenseNumber,
                    subtitle: `${expense.description} • ${formatCurrency(expense.totalAmount)}`,
                    icon: <Receipt className="w-4 h-4" />,
                    href: `/expenses/${expense.id}/edit`,
                });
            }
        });

        // Search customers
        (customers || []).forEach(customer => {
            if (
                customer.name.toLowerCase().includes(searchQuery) ||
                customer.email?.toLowerCase().includes(searchQuery)
            ) {
                items.push({
                    type: 'customer',
                    id: customer.id,
                    title: customer.name,
                    subtitle: customer.email || 'No email',
                    icon: <Users className="w-4 h-4" />,
                    href: `/customers`,
                });
            }
        });

        // Search vendors
        (vendors || []).forEach(vendor => {
            if (
                vendor.name.toLowerCase().includes(searchQuery) ||
                vendor.email?.toLowerCase().includes(searchQuery)
            ) {
                items.push({
                    type: 'vendor',
                    id: vendor.id,
                    title: vendor.name,
                    subtitle: vendor.email || 'No email',
                    icon: <Building2 className="w-4 h-4" />,
                    href: `/vendors`,
                });
            }
        });

        return items.slice(0, 10); // Limit to 10 results
    }, [query, invoices, expenses, customers, vendors]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault();
                navigate(results[selectedIndex].href);
                handleClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, results, selectedIndex, navigate]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleClose = () => {
        setQuery('');
        setSelectedIndex(0);
        onClose();
    };

    const handleResultClick = (href: string) => {
        navigate(href);
        handleClose();
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'invoice': return 'text-blue-600 bg-blue-50';
            case 'expense': return 'text-red-600 bg-red-50';
            case 'customer': return 'text-green-600 bg-green-50';
            case 'vendor': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title=""
            size="lg"
        >
            <ModalBody className="p-0">
                <div className="border-b border-[var(--color-neutral-200)] p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-neutral-400)]" />
                        <Input
                            type="text"
                            placeholder="Search invoices, expenses, customers, vendors..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {!query.trim() ? (
                        <div className="p-8 text-center text-[var(--color-neutral-500)]">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">Start typing to search...</p>
                            <p className="text-xs mt-2">Search across invoices, expenses, customers, and vendors</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-8 text-center text-[var(--color-neutral-500)]">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No results found</p>
                            <p className="text-xs mt-2">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleResultClick(result.href)}
                                    className={cn(
                                        'w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-neutral-50)] transition-colors text-left',
                                        index === selectedIndex && 'bg-[var(--color-primary-50)]'
                                    )}
                                >
                                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', getTypeColor(result.type))}>
                                        {result.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-neutral-900)] truncate">
                                            {result.title}
                                        </p>
                                        <p className="text-xs text-[var(--color-neutral-600)] truncate">
                                            {result.subtitle}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        'text-xs px-2 py-1 rounded-full font-medium capitalize',
                                        getTypeColor(result.type)
                                    )}>
                                        {result.type}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-[var(--color-neutral-200)] p-3 bg-[var(--color-neutral-50)]">
                    <div className="flex items-center justify-between text-xs text-[var(--color-neutral-600)]">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white border border-[var(--color-neutral-300)] rounded">↑</kbd>
                                <kbd className="px-1.5 py-0.5 bg-white border border-[var(--color-neutral-300)] rounded">↓</kbd>
                                to navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white border border-[var(--color-neutral-300)] rounded">↵</kbd>
                                to select
                            </span>
                        </div>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white border border-[var(--color-neutral-300)] rounded">Esc</kbd>
                            to close
                        </span>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
};
