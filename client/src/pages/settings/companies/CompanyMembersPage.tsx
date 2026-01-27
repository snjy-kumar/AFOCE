import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Crown, Shield, PenLine, Eye, Trash2, Mail } from 'lucide-react';
import { useCompanyStore, type CompanyMember } from '../../../stores/companyStore';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { cn } from '../../../lib/utils';

const roleOptions = [
    { value: 'OWNER', label: 'Owner - Full access' },
    { value: 'MANAGER', label: 'Manager - Approve and manage' },
    { value: 'ACCOUNTANT', label: 'Accountant - Create and edit' },
    { value: 'VIEWER', label: 'Viewer - Read-only' },
];

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

export default function CompanyMembersPage() {
    const navigate = useNavigate();
    const { id: companyId } = useParams<{ id: string }>();
    const { companies, fetchMembers, inviteMember, updateMemberRole, removeMember, error, clearError } = useCompanyStore();

    const company = companies.find((c) => c.id === companyId);
    const userRole = company?.role || company?.userRole;
    const canManageMembers = userRole === 'OWNER' || userRole === 'MANAGER';
    const isOwner = userRole === 'OWNER';

    const [members, setMembers] = useState<CompanyMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<string>('VIEWER');

    const loadMembers = useCallback(async () => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const data = await fetchMembers(companyId);
            setMembers(data);
        } catch {
            // Error handled in store
        } finally {
            setIsLoading(false);
        }
    }, [companyId, fetchMembers]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const handleInvite = async () => {
        if (!companyId) return;
        try {
            await inviteMember(companyId, inviteEmail, inviteRole);
            setInviteDialogOpen(false);
            setInviteEmail('');
            setInviteRole('VIEWER');
            loadMembers();
        } catch {
            // Error handled in store
        }
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        if (!companyId) return;
        try {
            await updateMemberRole(companyId, memberId, newRole);
            loadMembers();
        } catch {
            // Error handled in store
        }
    };

    const handleRemove = async () => {
        if (!companyId || !selectedMember) return;
        try {
            await removeMember(companyId, selectedMember.id);
            setRemoveDialogOpen(false);
            setSelectedMember(null);
            loadMembers();
        } catch {
            // Error handled in store
        }
    };

    return (
        <div className="p-6">
            <Button variant="ghost" onClick={() => navigate('/settings/companies')} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Companies
            </Button>

            <Card>
                <CardBody>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center">
                                <Users className="h-5 w-5 text-[var(--color-primary-600)]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">Team Members</h2>
                                <p className="text-sm text-[var(--color-neutral-600)]">
                                    {company?.name} - Manage who has access
                                </p>
                            </div>
                        </div>
                        {canManageMembers && (
                            <Button onClick={() => setInviteDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Invite Member
                            </Button>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                            {error}
                            <Button variant="ghost" size="sm" className="ml-2" onClick={clearError}>
                                Dismiss
                            </Button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-600)]"></div>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-[var(--color-neutral-400)] mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No team members</h3>
                            <p className="text-[var(--color-neutral-600)] mb-4">
                                Invite team members to collaborate
                            </p>
                            {canManageMembers && (
                                <Button onClick={() => setInviteDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Invite Member
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-neutral-200)]">
                                        <th className="text-left py-3 px-4 font-medium text-[var(--color-neutral-600)]">Member</th>
                                        <th className="text-left py-3 px-4 font-medium text-[var(--color-neutral-600)]">Role</th>
                                        {canManageMembers && (
                                            <th className="text-right py-3 px-4 font-medium text-[var(--color-neutral-600)]">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.id} className="border-b border-[var(--color-neutral-100)]">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
                                                        <span className="text-sm font-medium text-[var(--color-primary-700)]">
                                                            {(member.userName || 'U').charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-[var(--color-neutral-900)]">
                                                            {member.userName || 'Unknown'}
                                                        </div>
                                                        <div className="text-sm text-[var(--color-neutral-500)]">
                                                            {member.userEmail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {canManageMembers && (isOwner || member.role !== 'OWNER') ? (
                                                    <Select
                                                        value={member.role}
                                                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                        options={roleOptions.filter(r => isOwner || r.value !== 'OWNER')}
                                                        className="w-48"
                                                    />
                                                ) : (
                                                    <span className={cn(
                                                        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                                                        roleColors[member.role]
                                                    )}>
                                                        {roleIcons[member.role]}
                                                        {member.role}
                                                    </span>
                                                )}
                                            </td>
                                            {canManageMembers && (
                                                <td className="py-4 px-4 text-right">
                                                    {(isOwner || member.role !== 'OWNER') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                setSelectedMember(member);
                                                                setRemoveDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Invite Dialog */}
            <Modal isOpen={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} title="Invite Team Member">
                <ModalBody className="space-y-4">
                    <p className="text-[var(--color-neutral-600)] text-sm">
                        Send an invitation to join this company. They must have an account to be added.
                    </p>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[var(--color-neutral-500)]" />
                        <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            className="flex-1"
                        />
                    </div>
                    <Select
                        label="Role"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        options={roleOptions.filter(r => isOwner || r.value !== 'OWNER')}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={!inviteEmail}>
                        Send Invitation
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Remove Dialog */}
            <Modal isOpen={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)} title="Remove Team Member">
                <ModalBody>
                    <p className="text-[var(--color-neutral-600)]">
                        Are you sure you want to remove {selectedMember?.userName || selectedMember?.userEmail} from this company? They will lose access to all company data.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleRemove}>
                        Remove
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
