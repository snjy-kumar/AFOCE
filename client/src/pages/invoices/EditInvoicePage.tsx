import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { apiGet, apiPatch, apiPost } from '../../lib/api';
import { formatDateForInput } from '../../lib/utils';
import { generateInvoicePDF } from '../../lib/pdfGenerator';
import { PageHeader } from '../../components/layout/Layout';
import { useDateFormat } from '../../lib/i18n';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Common';
import { WorkflowApproval } from '../../components/workflow/WorkflowApproval';
import { Plus, Trash2, Save, X, Download, Send } from 'lucide-react';
import type { Invoice, Customer, Account } from '../../types';

const invoiceSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    issueDate: z.string().min(1, 'Issue date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    vatRate: z.number().min(0).max(100),
    discountAmount: z.number().min(0),
    notes: z.string().optional(),
    terms: z.string().optional(),
    items: z.array(
        z.object({
            accountId: z.string().min(1, 'Account is required'),
            description: z.string().min(1, 'Description is required'),
            quantity: z.number().positive('Quantity must be positive'),
            rate: z.number().nonnegative('Rate must be non-negative'),
        })
    ).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const EditInvoicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { formatBSDate, useBikramSambat } = useDateFormat();

    const { data: invoice, isLoading: loadingInvoice } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => apiGet<Invoice>(`/invoices/${id}`),
        enabled: !!id,
    });

    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => apiGet<Customer[]>('/customers'),
    });

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => apiGet<Account[]>('/accounts?type=INCOME'),
    });

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            items: [{ accountId: '', description: '', quantity: 1, rate: 0 }],
            vatRate: 13,
            discountAmount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    // Populate form when invoice data loads
    useEffect(() => {
        if (invoice) {
            setValue('customerId', invoice.customerId);
            setValue('issueDate', formatDateForInput(new Date(invoice.issueDate)));
            setValue('dueDate', formatDateForInput(new Date(invoice.dueDate)));
            setValue('vatRate', Number(invoice.vatRate));
            setValue('discountAmount', Number(invoice.discountAmount));
            setValue('notes', invoice.notes || '');
            setValue('terms', invoice.terms || '');
            setValue('items', invoice.items.map(item => ({
                accountId: item.accountId,
                description: item.description,
                quantity: Number(item.quantity),
                rate: Number(item.rate),
            })));
        }
    }, [invoice, setValue]);

    const updateMutation = useMutation({
        mutationFn: (data: InvoiceFormData) => apiPatch(`/invoices/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            toast.success('Invoice updated successfully!');
            navigate('/invoices');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update invoice');
        },
    });

    const submitForApprovalMutation = useMutation({
        mutationFn: () => apiPost(`/workflow/invoices/${id}/submit-for-approval`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            toast.success('Invoice submitted for approval!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to submit for approval');
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => apiPost(`/workflow/invoices/${id}/approve`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Invoice approved!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve invoice');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (reason: string) => apiPost(`/workflow/invoices/${id}/reject`, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Invoice rejected');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject invoice');
        },
    });

    const handleDownloadPDF = () => {
        if (!invoice) return;

        const customer = customers?.find((c) => c.id === invoice.customerId);

        const invoiceTotal = invoice.subtotal + invoice.vatAmount - invoice.discountAmount;

        generateInvoicePDF(
            {
                id: Number(invoice.id),
                invoiceNumber: invoice.invoiceNumber,
                date: invoice.issueDate,
                dueDate: invoice.dueDate,
                customer: {
                    name: customer?.name || 'Unknown Customer',
                    email: customer?.email,
                    phone: customer?.phone,
                    address: customer?.address,
                    panNumber: customer?.panNumber,
                },
                items: invoice.items.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.rate,
                    total: item.quantity * item.rate,
                })),
                subtotal: invoice.subtotal,
                vatRate: invoice.vatRate,
                vatAmount: invoice.vatAmount,
                discountAmount: invoice.discountAmount,
                totalAmount: invoiceTotal,
                notes: invoice.notes,
                status: invoice.status,
            },
            {
                name: 'Your Business Name',
                address: 'Your Business Address',
                phone: '+977-1-XXXXXXX',
                email: 'business@example.com',
                panNumber: 'XXXXXXXXXXX',
            }
        );
        toast.success('PDF downloaded successfully!');
    };

    const onSubmit = (data: InvoiceFormData) => {
        // Ensure numeric fields are numbers (convert from string inputs)
        const formattedData = {
            ...data,
            vatRate: Number(data.vatRate),
            discountAmount: Number(data.discountAmount),
            items: data.items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                rate: Number(item.rate),
            })),
        };
        updateMutation.mutate(formattedData);
    };

    const items = watch('items');
    const vatRate = watch('vatRate');
    const discountAmount = watch('discountAmount');
    const issueDate = watch('issueDate');
    const dueDate = watch('dueDate');

    const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);
    const vatAmount = (subtotal - discountAmount) * (vatRate / 100);
    const total = subtotal - discountAmount + vatAmount;

    if (loadingInvoice) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="text-center py-12">
                <p className="text-neutral-600">Invoice not found</p>
                <Button onClick={() => navigate('/invoices')} className="mt-4">
                    Back to Invoices
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                title={`Edit Invoice ${invoice.invoiceNumber}`}
                subtitle="Update invoice details and line items"
                action={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            leftIcon={<Download className="w-4 h-4" />}
                            onClick={handleDownloadPDF}
                        >
                            Download PDF
                        </Button>
                        <Button
                            variant="outline"
                            leftIcon={<X className="w-4 h-4" />}
                            onClick={() => navigate('/invoices')}
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader title="Invoice Information" />
                    <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Customer"
                            options={[
                                { value: '', label: 'Select customer...' },
                                ...(customers || []).map(c => ({ value: c.id, label: c.name })),
                            ]}
                            error={errors.customerId?.message}
                            {...register('customerId')}
                        />
                        <Input
                            label="Issue Date"
                            type="date"
                            error={errors.issueDate?.message}
                            helperText={useBikramSambat && issueDate ? `BS: ${formatBSDate(issueDate)}` : undefined}
                            {...register('issueDate')}
                        />
                        <Input
                            label="Due Date"
                            type="date"
                            error={errors.dueDate?.message}
                            helperText={useBikramSambat && dueDate ? `BS: ${formatBSDate(dueDate)}` : undefined}
                            {...register('dueDate')}
                        />
                        <Input
                            label="VAT Rate (%)"
                            type="number"
                            step="0.01"
                            error={errors.vatRate?.message}
                            {...register('vatRate', { valueAsNumber: true })}
                        />
                        <Input
                            label="Discount Amount"
                            type="number"
                            step="0.01"
                            error={errors.discountAmount?.message}
                            {...register('discountAmount', { valueAsNumber: true })}
                        />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader
                        title="Line Items"
                        action={
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                leftIcon={<Plus className="w-4 h-4" />}
                                onClick={() => append({ accountId: '', description: '', quantity: 1, rate: 0 })}
                            >
                                Add Item
                            </Button>
                        }
                    />
                    <CardBody className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-4 items-start pb-4 border-b last:border-b-0">
                                <div className="col-span-12 md:col-span-3">
                                    <Select
                                        label={index === 0 ? 'Account' : undefined}
                                        options={[
                                            { value: '', label: 'Select account...' },
                                            ...(accounts || []).map(a => ({ value: a.id, label: `${a.code} - ${a.name}` })),
                                        ]}
                                        error={errors.items?.[index]?.accountId?.message}
                                        {...register(`items.${index}.accountId`)}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <Input
                                        label={index === 0 ? 'Description' : undefined}
                                        placeholder="Item description"
                                        error={errors.items?.[index]?.description?.message}
                                        {...register(`items.${index}.description`)}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <Input
                                        label={index === 0 ? 'Quantity' : undefined}
                                        type="number"
                                        step="0.01"
                                        error={errors.items?.[index]?.quantity?.message}
                                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <Input
                                        label={index === 0 ? 'Rate' : undefined}
                                        type="number"
                                        step="0.01"
                                        error={errors.items?.[index]?.rate?.message}
                                        {...register(`items.${index}.rate`, { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Totals */}
                        <div className="pt-4 space-y-2 text-right">
                            <div className="flex justify-end gap-4 text-sm">
                                <span className="text-neutral-600">Subtotal:</span>
                                <span className="font-medium min-w-[120px]">NPR {subtotal.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-end gap-4 text-sm text-orange-600">
                                    <span>Discount:</span>
                                    <span className="font-medium min-w-[120px]">-NPR {discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-end gap-4 text-sm">
                                <span className="text-neutral-600">VAT ({vatRate}%):</span>
                                <span className="font-medium min-w-[120px]">NPR {vatAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-end gap-4 text-lg font-bold pt-2 border-t">
                                <span>Total:</span>
                                <span className="min-w-[120px]">NPR {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Additional Information" />
                    <CardBody className="space-y-4">
                        <Input
                            label="Notes"
                            placeholder="Notes visible to customer..."
                            {...register('notes')}
                        />
                        <Input
                            label="Terms & Conditions"
                            placeholder="Payment terms and conditions..."
                            {...register('terms')}
                        />
                    </CardBody>
                </Card>

                {/* Workflow Approval Section */}
                <WorkflowApproval
                    status={invoice.status}
                    requiresApproval={Boolean(invoice.requiresApproval)}
                    approvedAt={invoice.approvedAt}
                    approvedBy={invoice.approver ? { name: invoice.approver.name || 'Unknown' } : undefined}
                    rejectedAt={invoice.rejectedAt}
                    rejectedBy={invoice.rejector ? { name: invoice.rejector.name || 'Unknown' } : undefined}
                    rejectionReason={invoice.rejectionReason}
                    onApprove={async () => {
                        await approveMutation.mutateAsync();
                    }}
                    onReject={async (reason: string) => {
                        await rejectMutation.mutateAsync(reason);
                    }}
                    canApprove={invoice.status === 'PENDING_APPROVAL'}
                />

                {/* Workflow Actions */}
                {invoice.status === 'DRAFT' && invoice.requiresApproval && (
                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-neutral-900">Ready to submit?</h3>
                                    <p className="text-sm text-neutral-600 mt-1">
                                        Submit this invoice for approval before sending to customer
                                    </p>
                                </div>
                                <Button
                                    onClick={() => submitForApprovalMutation.mutate()}
                                    disabled={submitForApprovalMutation.isPending}
                                    leftIcon={<Send className="w-4 h-4" />}
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
