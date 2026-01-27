import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Building2, Check, Plus, Settings } from 'lucide-react';
import { useCompanyStore, type Company } from '../../stores/companyStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export function CompanySelector() {
    const navigate = useNavigate();
    const { companies, activeCompany, fetchCompanies, setActiveCompany, isLoading } = useCompanyStore();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectCompany = async (company: Company) => {
        await setActiveCompany(company);
        setOpen(false);
        window.location.reload();
    };

    const handleCreateCompany = () => {
        setOpen(false);
        navigate('/settings/companies/new');
    };

    const handleManageCompanies = () => {
        setOpen(false);
        navigate('/settings/companies');
    };

    if (companies.length === 0 && !isLoading) {
        return (
            <Button variant="outline" size="sm" onClick={handleCreateCompany} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Company
            </Button>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                disabled={isLoading}
                className={cn(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg',
                    'bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)]',
                    'hover:bg-[var(--color-neutral-100)] transition-colors',
                    'text-sm font-medium text-[var(--color-neutral-700)]'
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-[var(--color-primary-600)]" />
                    <span className="truncate">{activeCompany?.name || 'Select company...'}</span>
                </div>
                <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[var(--color-neutral-200)] z-50 max-h-[300px] overflow-y-auto">
                    <div className="p-2">
                        <div className="text-xs font-semibold text-[var(--color-neutral-500)] px-2 py-1.5">
                            Switch Company
                        </div>
                        <div className="border-b border-[var(--color-neutral-100)] my-1" />
                        {companies.map((company) => (
                            <button
                                key={company.id}
                                onClick={() => handleSelectCompany(company)}
                                className={cn(
                                    'w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md',
                                    'text-left text-sm hover:bg-[var(--color-neutral-100)]',
                                    activeCompany?.id === company.id && 'bg-[var(--color-primary-50)]'
                                )}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium text-[var(--color-neutral-900)]">
                                        {company.name}
                                    </span>
                                    {company.role && (
                                        <span className="text-xs text-[var(--color-neutral-500)]">
                                            {company.role}
                                        </span>
                                    )}
                                </div>
                                {activeCompany?.id === company.id && (
                                    <Check className="h-4 w-4 text-[var(--color-primary-600)]" />
                                )}
                            </button>
                        ))}
                        <div className="border-t border-[var(--color-neutral-100)] my-1" />
                        <button
                            onClick={handleCreateCompany}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left text-sm hover:bg-[var(--color-neutral-100)]"
                        >
                            <Plus className="h-4 w-4" />
                            Create New Company
                        </button>
                        <button
                            onClick={handleManageCompanies}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left text-sm hover:bg-[var(--color-neutral-100)]"
                        >
                            <Settings className="h-4 w-4" />
                            Manage Companies
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
