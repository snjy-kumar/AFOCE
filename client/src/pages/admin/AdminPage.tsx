import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../lib/api';
import {
    Settings,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Shield,
    FileText
} from 'lucide-react';

// Workflow Rule types matching backend
type RuleType = 'APPROVAL' | 'VALIDATION' | 'COMPLIANCE' | 'NOTIFICATION' | 'AUTOMATION';
type EntityType = 'INVOICE' | 'EXPENSE' | 'CUSTOMER' | 'VENDOR' | 'PAYMENT';
type RuleAction = 'REQUIRE_APPROVAL' | 'REQUIRE_ATTACHMENT' | 'BLOCK_CREATION' | 'SHOW_WARNING' | 'SEND_NOTIFICATION' | 'AUTO_ASSIGN' | 'CALCULATE_FIELD';
type RuleSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

interface WorkflowRule {
    id: string;
    name: string;
    description: string;
    ruleType: RuleType;
    entityType: EntityType;
    condition: any; // AST structure
    action: RuleAction;
    actionParams?: any;
    severity: RuleSeverity;
    priority: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Form schema
const ruleFormSchema = z.object({
    name: z.string().min(1, 'Rule name is required').max(100),
    description: z.string().min(1, 'Description is required').max(500),
    ruleType: z.enum(['APPROVAL', 'VALIDATION', 'COMPLIANCE', 'NOTIFICATION', 'AUTOMATION']),
    entityType: z.enum(['INVOICE', 'EXPENSE', 'CUSTOMER', 'VENDOR', 'PAYMENT']),
    conditionField: z.string().min(1, 'Field is required'),
    conditionOperator: z.enum(['>', '<', '>=', '<=', '==', '!=', 'contains', 'startsWith', 'endsWith']),
    conditionValue: z.string().min(1, 'Value is required'),
    action: z.enum(['REQUIRE_APPROVAL', 'REQUIRE_ATTACHMENT', 'BLOCK_CREATION', 'SHOW_WARNING', 'SEND_NOTIFICATION', 'AUTO_ASSIGN', 'CALCULATE_FIELD']),
    severity: z.enum(['CRITICAL', 'WARNING', 'INFO']),
    priority: z.coerce.number().min(1).max(1000).default(100),
    isActive: z.boolean().default(true),
});

type RuleFormData = z.infer<typeof ruleFormSchema>;

// Common field options by entity type
const FIELD_OPTIONS: Record<EntityType, { value: string; label: string }[]> = {
    INVOICE: [
        { value: 'total', label: 'Total Amount' },
        { value: 'subtotal', label: 'Subtotal' },
        { value: 'vatAmount', label: 'VAT Amount' },
        { value: 'status', label: 'Status' },
        { value: 'customerId', label: 'Customer ID' },
        { value: 'dueDate', label: 'Due Date' },
    ],
    EXPENSE: [
        { value: 'amount', label: 'Amount' },
        { value: 'totalAmount', label: 'Total Amount' },
        { value: 'vatAmount', label: 'VAT Amount' },
        { value: 'hasReceipt', label: 'Has Receipt' },
        { value: 'vendorId', label: 'Vendor ID' },
        { value: 'category', label: 'Category' },
    ],
    CUSTOMER: [
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'panNumber', label: 'PAN Number' },
    ],
    VENDOR: [
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'panNumber', label: 'PAN Number' },
    ],
    PAYMENT: [
        { value: 'amount', label: 'Amount' },
        { value: 'method', label: 'Payment Method' },
    ],
};

export const AdminPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);

    // Fetch workflow rules from real API
    const { data: rules = [], isLoading } = useQuery({
        queryKey: ['workflow-rules'],
        queryFn: () => apiGet<WorkflowRule[]>('/admin/workflow-rules'),
    });

    // Form setup
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RuleFormData>({
        resolver: zodResolver(ruleFormSchema) as any,
        defaultValues: {
            ruleType: 'VALIDATION',
            entityType: 'INVOICE',
            conditionOperator: '>',
            action: 'SHOW_WARNING',
            severity: 'WARNING',
            priority: 100,
            isActive: true,
        },
    });

    const watchedEntityType = watch('entityType');

    // Populate form when editing
    useEffect(() => {
        if (editingRule) {
            // Parse condition from AST
            const condition = editingRule.condition || {};
            setValue('name', editingRule.name);
            setValue('description', editingRule.description);
            setValue('ruleType', editingRule.ruleType);
            setValue('entityType', editingRule.entityType);
            setValue('conditionField', condition.field || '');
            setValue('conditionOperator', condition.operator || '>');
            setValue('conditionValue', String(condition.value || ''));
            setValue('action', editingRule.action);
            setValue('severity', editingRule.severity);
            setValue('priority', editingRule.priority);
            setValue('isActive', editingRule.isActive);
        } else {
            reset();
        }
    }, [editingRule, setValue, reset]);

    // Create rule mutation
    const createRuleMutation = useMutation({
        mutationFn: (data: any) => apiPost('/admin/workflow-rules', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
            toast.success('Rule created successfully!');
            setShowRuleModal(false);
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create rule');
        },
    });

    // Update rule mutation
    const updateRuleMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiPatch(`/admin/workflow-rules/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
            toast.success('Rule updated successfully!');
            setShowRuleModal(false);
            setEditingRule(null);
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update rule');
        },
    });

    const toggleRuleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            apiPatch(`/admin/workflow-rules/${id}`, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
            toast.success('Rule status updated');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update rule');
        },
    });

    const deleteRuleMutation = useMutation({
        mutationFn: (id: string) => apiDelete(`/admin/workflow-rules/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
            toast.success('Rule deleted');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete rule');
        },
    });

    // Form submission
    const onSubmit = (formData: RuleFormData) => {
        // Build condition AST
        const condition = {
            type: 'comparison',
            field: formData.conditionField,
            operator: formData.conditionOperator,
            value: isNaN(Number(formData.conditionValue))
                ? formData.conditionValue
                : Number(formData.conditionValue),
        };

        const ruleData = {
            name: formData.name,
            description: formData.description,
            ruleType: formData.ruleType,
            entityType: formData.entityType,
            condition,
            action: formData.action,
            severity: formData.severity,
            priority: formData.priority,
            isActive: formData.isActive,
        };

        if (editingRule) {
            updateRuleMutation.mutate({ id: editingRule.id, data: ruleData });
        } else {
            createRuleMutation.mutate(ruleData);
        }
    };

    const getActionBadge = (action: RuleAction) => {
        switch (action) {
            case 'REQUIRE_APPROVAL':
                return <Badge variant="warning">Requires Approval</Badge>;
            case 'BLOCK_CREATION':
                return <Badge variant="danger">Block</Badge>;
            case 'SHOW_WARNING':
                return <Badge variant="info">Warning</Badge>;
            case 'REQUIRE_ATTACHMENT':
                return <Badge variant="warning">Attachment Required</Badge>;
            case 'SEND_NOTIFICATION':
                return <Badge variant="info">Notify</Badge>;
            case 'AUTO_ASSIGN':
                return <Badge variant="success">Auto-Assign</Badge>;
            case 'CALCULATE_FIELD':
                return <Badge variant="neutral">Calculate</Badge>;
            default:
                return <Badge variant="neutral">{action}</Badge>;
        }
    };

    const getSeverityBadge = (severity: RuleSeverity) => {
        switch (severity) {
            case 'CRITICAL':
                return <Badge variant="danger">Critical</Badge>;
            case 'WARNING':
                return <Badge variant="warning">Warning</Badge>;
            case 'INFO':
                return <Badge variant="info">Info</Badge>;
            default:
                return <Badge variant="neutral">{severity}</Badge>;
        }
    };

    const getActionIcon = (action: RuleAction) => {
        switch (action) {
            case 'REQUIRE_APPROVAL':
                return <AlertTriangle className="w-5 h-5 text-warning-600" />;
            case 'BLOCK_CREATION':
                return <XCircle className="w-5 h-5 text-danger-600" />;
            case 'SHOW_WARNING':
                return <AlertTriangle className="w-5 h-5 text-primary-600" />;
            case 'REQUIRE_ATTACHMENT':
                return <FileText className="w-5 h-5 text-warning-600" />;
            default:
                return <Shield className="w-5 h-5 text-neutral-600" />;
        }
    };

    const formatCondition = (condition: any): string => {
        if (!condition) return 'No condition';
        if (typeof condition === 'string') return condition;
        if (condition.type === 'comparison') {
            return `${condition.field} ${condition.operator} ${condition.value}`;
        }
        return JSON.stringify(condition);
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
                                    {rules.filter((r) => r.action === 'BLOCK_CREATION').length}
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
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <div className="text-xs font-medium text-neutral-500 mb-1">CONDITION</div>
                                                    <code className="text-sm text-neutral-700 font-mono">{formatCondition(rule.condition)}</code>
                                                </div>
                                                <div className="ml-auto flex gap-2">
                                                    <Badge variant="neutral">{rule.entityType}</Badge>
                                                    {getSeverityBadge(rule.severity)}
                                                </div>
                                            </div>
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
                    reset();
                }}
                title={editingRule ? 'Edit Workflow Rule' : 'Create Workflow Rule'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit as any)} className="p-6">
                    <p className="text-neutral-600 mb-6">
                        Define business rules to automate approvals and enforce policies across your organization.
                    </p>

                    <div className="space-y-4">
                        <Input
                            label="Rule Name"
                            placeholder="e.g., High Value Invoice Approval"
                            error={errors.name?.message}
                            {...register('name')}
                        />

                        <Textarea
                            label="Description"
                            placeholder="Describe what this rule does..."
                            rows={2}
                            error={errors.description?.message}
                            {...register('description')}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Rule Type"
                                options={[
                                    { value: 'VALIDATION', label: 'Validation' },
                                    { value: 'APPROVAL', label: 'Approval' },
                                    { value: 'COMPLIANCE', label: 'Compliance' },
                                    { value: 'NOTIFICATION', label: 'Notification' },
                                    { value: 'AUTOMATION', label: 'Automation' },
                                ]}
                                error={errors.ruleType?.message}
                                {...register('ruleType')}
                            />

                            <Select
                                label="Entity Type"
                                options={[
                                    { value: 'INVOICE', label: 'Invoice' },
                                    { value: 'EXPENSE', label: 'Expense' },
                                    { value: 'CUSTOMER', label: 'Customer' },
                                    { value: 'VENDOR', label: 'Vendor' },
                                    { value: 'PAYMENT', label: 'Payment' },
                                ]}
                                error={errors.entityType?.message}
                                {...register('entityType')}
                            />
                        </div>

                        {/* Condition Builder */}
                        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                            <label className="block text-sm font-medium text-neutral-700 mb-3">Condition</label>
                            <div className="grid grid-cols-3 gap-3">
                                <Select
                                    label="Field"
                                    options={[
                                        { value: '', label: 'Select field...' },
                                        ...FIELD_OPTIONS[watchedEntityType],
                                    ]}
                                    error={errors.conditionField?.message}
                                    {...register('conditionField')}
                                />

                                <Select
                                    label="Operator"
                                    options={[
                                        { value: '>', label: 'Greater than (>)' },
                                        { value: '<', label: 'Less than (<)' },
                                        { value: '>=', label: 'Greater or equal (>=)' },
                                        { value: '<=', label: 'Less or equal (<=)' },
                                        { value: '==', label: 'Equals (==)' },
                                        { value: '!=', label: 'Not equals (!=)' },
                                        { value: 'contains', label: 'Contains' },
                                    ]}
                                    error={errors.conditionOperator?.message}
                                    {...register('conditionOperator')}
                                />

                                <Input
                                    label="Value"
                                    placeholder="e.g., 50000"
                                    error={errors.conditionValue?.message}
                                    {...register('conditionValue')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Select
                                label="Action"
                                options={[
                                    { value: 'SHOW_WARNING', label: 'Show Warning' },
                                    { value: 'REQUIRE_APPROVAL', label: 'Require Approval' },
                                    { value: 'REQUIRE_ATTACHMENT', label: 'Require Attachment' },
                                    { value: 'BLOCK_CREATION', label: 'Block Creation' },
                                    { value: 'SEND_NOTIFICATION', label: 'Send Notification' },
                                ]}
                                error={errors.action?.message}
                                {...register('action')}
                            />

                            <Select
                                label="Severity"
                                options={[
                                    { value: 'INFO', label: 'Info' },
                                    { value: 'WARNING', label: 'Warning' },
                                    { value: 'CRITICAL', label: 'Critical' },
                                ]}
                                error={errors.severity?.message}
                                {...register('severity')}
                            />

                            <Input
                                label="Priority"
                                type="number"
                                placeholder="100"
                                error={errors.priority?.message}
                                {...register('priority')}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    {...register('isActive')}
                                />
                                <span className="text-sm text-neutral-700">Enable this rule</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowRuleModal(false);
                                setEditingRule(null);
                                reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting || createRuleMutation.isPending || updateRuleMutation.isPending}
                        >
                            {editingRule ? 'Update Rule' : 'Create Rule'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminPage;
