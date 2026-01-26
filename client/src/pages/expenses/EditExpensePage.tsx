import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { apiGet, apiPatch, apiPost, API_BASE_URL } from '../../lib/api';
import { formatDateForInput } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Common';
import { FileUpload } from '../../components/common/FileUpload';
import { WorkflowApproval } from '../../components/workflow/WorkflowApproval';
import { Save, X, Send } from 'lucide-react';
import type { Expense, Vendor, Account } from '../../types';

const expenseSchema = z.object({
    vendorId: z.string().optional(),
    accountId: z.string().min(1, 'Expense category is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().min(1, 'Description is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    vatRate: z.coerce.number().min(0).max(100).default(13),
    isPaid: z.boolean().default(true),
    notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export const EditExpensePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);

    const { data: expense, isLoading: loadingExpense } = useQuery({
        queryKey: ['expense', id],
        queryFn: () => apiGet<Expense>(`/expenses/${id}`),
        enabled: !!id,
    });

    const { data: vendors } = useQuery({
        queryKey: ['vendors'],
        queryFn: () => apiGet<Vendor[]>('/vendors'),
    });

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => apiGet<Account[]>('/accounts?type=EXPENSE'),
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            vatRate: 13,
            isPaid: true,
        },
    });

    // Populate form when expense data loads
    useEffect(() => {
        if (expense) {
            setValue('vendorId', expense.vendorId || '');
            setValue('accountId', expense.accountId);
            setValue('date', formatDateForInput(new Date(expense.date)));
            setValue('description', expense.description);
            setValue('amount', Number(expense.amount));
            setValue('vatRate', Number(expense.vatRate));
            setValue('isPaid', expense.isPaid);
            setValue('notes', expense.notes || '');
        }
    }, [expense, setValue]);

    const updateMutation = useMutation({
        mutationFn: (data: ExpenseFormData) => apiPatch(`/expenses/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['expense', id] });
            toast.success('Expense updated successfully!');
            navigate('/expenses');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update expense');
        },
    });

    const submitForApprovalMutation = useMutation({
        mutationFn: () => apiPost(`/workflow/submit`, {
            entityType: 'EXPENSE',
            entityId: id,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense', id] });
            toast.success('Expense submitted for approval!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to submit for approval');
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => apiPost(`/workflow/approve`, {
            entityType: 'EXPENSE',
            entityId: id,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense', id] });
            toast.success('Expense approved!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve expense');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (reason: string) => apiPost(`/workflow/reject`, {
            entityType: 'EXPENSE',
            entityId: id,
            reason,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense', id] });
            toast.success('Expense rejected');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject expense');
        },
    });

    const onSubmit = async (data: ExpenseFormData) => {
        // Upload receipt if provided
        if (receiptFile) {
            setUploadingReceipt(true);
            try {
                const formData = new FormData();
                formData.append('file', receiptFile);
                formData.append('type', 'receipt');

                const response = await fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload receipt');
                }

                await response.json();
                // Note: Backend needs to be updated to handle receipt URL in expense update
                // For now, we'll just show success
                toast.success('Receipt uploaded successfully!');
            } catch (error) {
                toast.error('Failed to upload receipt');
                setUploadingReceipt(false);
                return;
            }
            setUploadingReceipt(false);
        }

        updateMutation.mutate(data);
    };

    const amount = watch('amount');
    const vatRate = watch('vatRate');
    const vatAmount = (amount || 0) * (vatRate / 100);
    const totalAmount = (amount || 0) + vatAmount;

    if (loadingExpense) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!expense) {
        return (
            <div className="text-center py-12">
                <p className="text-neutral-600">Expense not found</p>
                <Button onClick={() => navigate('/expenses')} className="mt-4">
                    Back to Expenses
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                title={`Edit Expense ${expense.expenseNumber}`}
                subtitle="Update expense details"
                action={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            leftIcon={<X className="w-4 h-4" />}
                            onClick={() => navigate('/expenses')}
                        >
                            Cancel
                        </Button>
                        <Button
                            leftIcon={<Save className="w-4 h-4" />}
                            onClick={handleSubmit(onSubmit)}
                            isLoading={updateMutation.isPending}
                        >
                            Save Changes
                        </Button>
                    </div>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader title="Expense Information" />
                    <CardBody className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Vendor (Optional)"
                                options={[
                                    { value: '', label: 'No vendor' },
                                    ...(vendors || []).map(v => ({ value: v.id, label: v.name })),
                                ]}
                                error={errors.vendorId?.message}
                                {...register('vendorId')}
                            />

                            <Select
                                label="Expense Category"
                                options={[
                                    { value: '', label: 'Select category...' },
                                    ...(accounts || []).map(a => ({ value: a.id, label: `${a.code} - ${a.name}` })),
                                ]}
                                error={errors.accountId?.message}
                                {...register('accountId')}
                            />

                            <Input
                                label="Date"
                                type="date"
                                error={errors.date?.message}
                                {...register('date')}
                            />

                            <Input
                                label="Amount (before VAT)"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                error={errors.amount?.message}
                                {...register('amount', { valueAsNumber: true })}
                            />

                            <Input
                                label="VAT Rate (%)"
                                type="number"
                                step="0.01"
                                error={errors.vatRate?.message}
                                {...register('vatRate', { valueAsNumber: true })}
                            />

                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                        {...register('isPaid')}
                                    />
                                    <span className="text-sm font-medium text-neutral-700">
                                        Mark as Paid
                                    </span>
                                </label>
                            </div>

                            <FileUpload
                                label="Receipt (Optional)"
                                accept="image/*,application/pdf"
                                maxSize={5}
                                onFileSelect={setReceiptFile}
                                currentFile={expense.receiptUrl || undefined}
                                uploadType="receipt"
                                disabled={uploadingReceipt}
                            />
                        </div>

                        <Input
                            label="Description"
                            placeholder="What was this expense for?"
                            error={errors.description?.message}
                            {...register('description')}
                        />

                        <Textarea
                            label="Notes"
                            placeholder="Additional notes..."
                            rows={3}
                            {...register('notes')}
                        />

                        {/* Calculation Summary */}
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Amount:</span>
                                <span className="font-medium">NPR {(amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">VAT ({vatRate}%):</span>
                                <span className="font-medium">NPR {vatAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total:</span>
                                <span>NPR {totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Workflow Approval Section */}
                {expense.workflowStatus && expense.workflowStatus !== 'NONE' && (
                    <WorkflowApproval
                        status={expense.workflowStatus}
                        onApprove={async () => { await approveMutation.mutateAsync(); }}
                        onReject={async (reason: string) => { await rejectMutation.mutateAsync(reason); }}
                        canApprove={true}
                    />
                )}

                {/* Submit for Approval Button */}
                {(!expense.workflowStatus || expense.workflowStatus === 'NONE') && (
                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-[var(--color-neutral-900)]">
                                        Ready to Submit?
                                    </h3>
                                    <p className="text-sm text-[var(--color-neutral-600)] mt-1">
                                        Submit this expense for workflow approval
                                    </p>
                                </div>
                                <Button
                                    leftIcon={<Send className="w-4 h-4" />}
                                    onClick={() => submitForApprovalMutation.mutate()}
                                    isLoading={submitForApprovalMutation.isPending}
                                >
                                    Submit for Approval
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </form>
        </div>
    );
};
