import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { apiGet, apiPatch, apiDelete } from '../../lib/api';
import {
    Settings,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Shield
} from 'lucide-react';

interface WorkflowRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    action: 'REQUIRE_APPROVAL' | 'BLOCK' | 'WARN';
    isActive: boolean;
    priority: number;
    createdAt: string;
}

export const AdminPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);

    // Fetch workflow rules from real API
    const { data: rules = [], isLoading } = useQuery({
        queryKey: ['workflow-rules'],
        queryFn: () => apiGet<WorkflowRule[]>('/admin/workflow-rules'),
    });

    const toggleRuleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            apiPatch(`/admin/workflow-rules/${id}`, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
        },
    });

    const deleteRuleMutation = useMutation({
        mutationFn: (id: string) => apiDelete(`/admin/workflow-rules/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
        },
    });

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'REQUIRE_APPROVAL':
                return <Badge variant="warning">Requires Approval</Badge>;
            case 'BLOCK':
                return <Badge variant="danger">Block</Badge>;
            case 'WARN':
                return <Badge variant="info">Warning</Badge>;
            default:
                return <Badge variant="neutral">{action}</Badge>;
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'REQUIRE_APPROVAL':
                return <AlertTriangle className="w-5 h-5 text-warning-600" />;
            case 'BLOCK':
                return <XCircle className="w-5 h-5 text-danger-600" />;
            case 'WARN':
                return <AlertTriangle className="w-5 h-5 text-primary-600" />;
            default:
                return <Shield className="w-5 h-5 text-neutral-600" />;
        }
    };

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Admin Panel"
                subtitle="Manage workflow rules and system settings"
                action={
                    <Button
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => {
                            setEditingRule(null);
                            setShowRuleModal(true);
                        }}
                    >
                        Add Rule
                    </Button>
                }
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-neutral-900">{rules.length}</div>
                                <div className="text-sm text-neutral-600">Total Rules</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-neutral-900">
                                    {rules.filter((r) => r.isActive).length}
                                </div>
                                <div className="text-sm text-neutral-600">Active Rules</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-warning-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-neutral-900">
                                    {rules.filter((r) => r.action === 'REQUIRE_APPROVAL').length}
                                </div>
                                <div className="text-sm text-neutral-600">Approval Rules</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-danger-50 rounded-lg flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-danger-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-neutral-900">
                                    {rules.filter((r) => r.action === 'BLOCK').length}
                                </div>
                                <div className="text-sm text-neutral-600">Block Rules</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Workflow Rules */}
            <Card>
                <CardHeader title="Workflow Rules" subtitle="Configure business policies and approval workflows" />
                <div className="divide-y divide-neutral-200">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <p className="mt-4 text-neutral-600">Loading workflow rules...</p>
                        </div>
                    ) : rules.length === 0 ? (
                        <div className="p-12 text-center">
                            <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Rules Configured</h3>
                            <p className="text-neutral-600 mb-4">Create your first workflow rule to enforce business policies</p>
                            <Button onClick={() => setShowRuleModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
                                Add First Rule
                            </Button>
                        </div>
                    ) : (
                        rules.map((rule) => (
                            <div key={rule.id} className="p-6 hover:bg-neutral-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-1">{getActionIcon(rule.action)}</div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-semibold text-neutral-900">{rule.name}</h3>
                                                    {getActionBadge(rule.action)}
                                                    {!rule.isActive && <Badge variant="neutral">Inactive</Badge>}
                                                </div>
                                                <p className="text-neutral-600">{rule.description}</p>
                                            </div>
                                        </div>

                                        {/* Condition */}
                                        <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                            <div className="text-xs font-medium text-neutral-500 mb-1">CONDITION</div>
                                            <code className="text-sm text-neutral-700 font-mono">{rule.condition}</code>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                leftIcon={<Edit2 className="w-3 h-3" />}
                                                onClick={() => {
                                                    setEditingRule(rule);
                                                    setShowRuleModal(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this rule?')) {
                                                        deleteRuleMutation.mutate(rule.id);
                                                    }
                                                }}
                                                leftIcon={<Trash2 className="w-3 h-3" />}
                                                className="border-danger-300 text-danger-600 hover:bg-danger-50"
                                            >
                                                Delete
                                            </Button>
                                            <div className="ml-auto">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={rule.isActive}
                                                        onChange={(e) => {
                                                            toggleRuleMutation.mutate({
                                                                id: rule.id,
                                                                isActive: e.target.checked,
                                                            });
                                                        }}
                                                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="text-sm text-neutral-700">Active</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Rule Modal */}
            <Modal
                isOpen={showRuleModal}
                onClose={() => {
                    setShowRuleModal(false);
                    setEditingRule(null);
                }}
                title={editingRule ? 'Edit Workflow Rule' : 'Create Workflow Rule'}
                size="lg"
            >
                <div className="p-6">
                    <p className="text-neutral-600 mb-6">
                        Define business rules to automate approvals and enforce policies across your organization.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Rule Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g., High Value Invoice Approval"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                rows={3}
                                placeholder="Describe what this rule does..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Condition</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                placeholder="e.g., invoice.total > 50000"
                            />
                            <p className="text-xs text-neutral-500 mt-1">Use JavaScript-like expressions</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Action</label>
                            <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                <option value="REQUIRE_APPROVAL">Require Approval</option>
                                <option value="BLOCK">Block Action</option>
                                <option value="WARN">Show Warning</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-neutral-700">Enable this rule</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRuleModal(false);
                                setEditingRule(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={() => setShowRuleModal(false)}>
                            {editingRule ? 'Update Rule' : 'Create Rule'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminPage;
