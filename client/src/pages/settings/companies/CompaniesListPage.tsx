import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Users, Settings, Trash2, LogOut, Crown, Shield, Eye, PenLine } from 'lucide-react';
import { useCompanyStore, type Company } from '../../../stores/companyStore';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { cn } from '../../../lib/utils';

const roleIcons: Record<string, React.ReactNode> = {
    OWNER: <Crown className="h-4 w-4" />,
    MANAGER: <Shield className="h-4 w-4" />,
    ACCOUNTANT: <PenLine className="h-4 w-4" />,
    VIEWER: <Eye className="h-4 w-4" />,
};

const roleColors: Record<string, string> = {
    OWNER: 'bg-yellow-100 text-yellow-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    ACCOUNTANT: 'bg-green-100 text-green-800',
    VIEWER: 'bg-gray-100 text-gray-800',
};

export default function CompaniesListPage() {
    const navigate = useNavigate();
    const { companies, activeCompany, fetchCompanies, deleteCompany, leaveCompany, setActiveCompany, isLoading } = useCompanyStore();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleDelete = async () => {
        if (selectedCompany) {
            await deleteCompany(selectedCompany.id);
            setDeleteDialogOpen(false);
            setSelectedCompany(null);
        }
    };

    const handleLeave = async () => {
        if (selectedCompany) {
            await leaveCompany(selectedCompany.id);
            setLeaveDialogOpen(false);
            setSelectedCompany(null);
        }
    };

    const handleSetActive = async (company: Company) => {
        await setActiveCompany(company);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-neutral-900)]">Companies</h1>
                    <p className="text-[var(--color-neutral-600)]">
                        Manage your companies and team members
                    </p>
                </div>
                <Button onClick={() => navigate('/settings/companies/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Company
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-600)]"></div>
                </div>
            ) : companies.length === 0 ? (
                <Card>
                    <CardBody className="flex flex-col items-center justify-center py-12">
                        <Building2 className="h-12 w-12 text-[var(--color-neutral-400)] mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
                        <p className="text-[var(--color-neutral-600)] text-center mb-4">
                            Create your first company to start managing your finances
                        </p>
                        <Button onClick={() => navigate('/settings/companies/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Company
                        </Button>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => (
                        <Card
                            key={company.id}
                            className={cn(
                                'relative',
                                activeCompany?.id === company.id && 'ring-2 ring-[var(--color-primary-500)]'
                            )}
                        >
                            {activeCompany?.id === company.id && (
                                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-[var(--color-primary-500)] text-white text-xs font-medium rounded-full">
                                    Active
                                </div>
                            )}
                            <CardBody className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-[var(--color-primary-600)]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[var(--color-neutral-900)]">
                                                {company.name}
                                            </h3>
                                            {company.nameNe && (
                                                <p className="text-sm text-[var(--color-neutral-500)]">
                                                    {company.nameNe}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {company.role && (
                                        <span className={cn(
                                            'flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                                            roleColors[company.role]
                                        )}>
                                            {roleIcons[company.role]}
                                            {company.role}
                                        </span>
                                    )}
                                </div>

                                <div className="text-sm space-y-1 text-[var(--color-neutral-600)]">
                                    {company.panNumber && <p>PAN: {company.panNumber}</p>}
                                    {company.vatNumber && <p>VAT: {company.vatNumber}</p>}
                                    <p>Currency: {company.currency}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {activeCompany?.id !== company.id && (
                                        <Button variant="outline" size="sm" onClick={() => handleSetActive(company)}>
                                            Set Active
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/settings/companies/${company.id}`)}
                                    >
                                        <Settings className="mr-1 h-3 w-3" />
                                        Settings
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/settings/companies/${company.id}/members`)}
                                    >
                                        <Users className="mr-1 h-3 w-3" />
                                        Members
                                    </Button>

                                    {company.role === 'OWNER' ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                            onClick={() => {
                                                setSelectedCompany(company);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            Delete
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                            onClick={() => {
                                                setSelectedCompany(company);
                                                setLeaveDialogOpen(true);
                                            }}
                                        >
                                            <LogOut className="mr-1 h-3 w-3" />
                                            Leave
                                        </Button>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Dialog */}
            <Modal
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                title="Delete Company"
            >
                <ModalBody>
                    <p className="text-[var(--color-neutral-600)]">
                        Are you sure you want to delete "{selectedCompany?.name}"? This action cannot be undone and all data associated with this company will be permanently deleted.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Leave Dialog */}
            <Modal
                isOpen={leaveDialogOpen}
                onClose={() => setLeaveDialogOpen(false)}
                title="Leave Company"
            >
                <ModalBody>
                    <p className="text-[var(--color-neutral-600)]">
                        Are you sure you want to leave "{selectedCompany?.name}"? You will lose access to all data associated with this company.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleLeave}>
                        Leave
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
