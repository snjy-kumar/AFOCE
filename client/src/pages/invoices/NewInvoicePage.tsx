import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiGet, apiPost } from '../../lib/api';
import { formatCurrency, formatDateForInput } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Common';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import type { Customer, Account, Invoice } from '../../types';

const invoiceItemSchema = z.object({
    accountId: z.string().min(1, 'Account is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    rate: z.coerce.number().min(0, 'Rate must be positive'),
});

const invoiceSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    issueDate: z.string().min(1, 'Issue date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    notes: z.string().optional(),
    terms: z.string().optional(),
    discountAmount: z.coerce.number().min(0).default(0),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const NewInvoicePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: customers, isLoading: loadingCustomers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => apiGet<Customer[]>('/customers'),
    });

    const { data: accounts, isLoading: loadingAccounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => apiGet<Account[]>('/accounts'),
    });

    const createMutation = useMutation({
        mutationFn: (data: InvoiceFormData) => apiPost<Invoice>('/invoices', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            navigate('/invoices');
        },
    });

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema) as any,
        defaultValues: {
            issueDate: formatDateForInput(new Date()),
            dueDate: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            items: [{ accountId: '', description: '', quantity: 1, rate: 0 }],
            discountAmount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const watchItems = watch('items');
    const watchDiscount = watch('discountAmount') || 0;

    const subtotal = watchItems.reduce((sum, item) => {
        return sum + (item.quantity || 0) * (item.rate || 0);
    }, 0);

    const vatRate = 13;
    const vatAmount = (subtotal - watchDiscount) * (vatRate / 100);
    const total = subtotal - watchDiscount + vatAmount;

    const incomeAccounts = (accounts || []).filter((a) => a.type === 'INCOME');

    if (loadingCustomers || loadingAccounts) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="New Invoice"
                subtitle="Create a new sales invoice"
                action={
                    <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/invoices')}>
                        Back
                    </Button>
                }
            />

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data as InvoiceFormData))}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer & Dates */}
                        <Card>
                            <CardHeader title="Invoice Details" />
                            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select
                                    label="Customer"
                                    options={(customers || []).map((c) => ({ value: c.id, label: c.name }))}
                                    placeholder="Select customer"
                                    error={errors.customerId?.message}
                                    required
                                    {...register('customerId')}
                                />
                                <Input
                                    label="Issue Date"
                                    type="date"
                                    error={errors.issueDate?.message}
                                    required
                                    {...register('issueDate')}
                                />
                                <Input
                                    label="Due Date"
                                    type="date"
                                    error={errors.dueDate?.message}
                                    required
                                    {...register('dueDate')}
                                />
                            </CardBody>
                        </Card>

                        {/* Line Items */}
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
                                    <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                                        <div className="col-span-3">
                                            <Select
                                                label={index === 0 ? 'Account' : undefined}
                                                options={incomeAccounts.map((a) => ({ value: a.id, label: a.name }))}
                                                placeholder="Account"
                                                error={errors.items?.[index]?.accountId?.message}
                                                {...register(`items.${index}.accountId`)}
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <Input
                                                label={index === 0 ? 'Description' : undefined}
                                                placeholder="Description"
                                                error={errors.items?.[index]?.description?.message}
                                                {...register(`items.${index}.description`)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                label={index === 0 ? 'Qty' : undefined}
                                                type="number"
                                                min={1}
                                                error={errors.items?.[index]?.quantity?.message}
                                                {...register(`items.${index}.quantity`)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                label={index === 0 ? 'Rate' : undefined}
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                error={errors.items?.[index]?.rate?.message}
                                                {...register(`items.${index}.rate`)}
                                            />
                                        </div>
                                        <div className="col-span-1 flex items-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-[var(--color-danger-600)]"
                                                onClick={() => fields.length > 1 && remove(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardHeader title="Additional Information" />
                            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Textarea
                                    label="Notes"
                                    placeholder="Notes visible to customer..."
                                    {...register('notes')}
                                />
                                <Textarea
                                    label="Terms & Conditions"
                                    placeholder="Payment terms..."
                                    {...register('terms')}
                                />
                            </CardBody>
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader title="Summary" />
                            <CardBody className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-neutral-600)]">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Input
                                        label="Discount"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        className="flex-1"
                                        {...register('discountAmount')}
                                    />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-neutral-600)]">VAT ({vatRate}%)</span>
                                    <span className="font-medium">{formatCurrency(vatAmount)}</span>
                                </div>

                                <div className="border-t border-[var(--color-neutral-200)] pt-4 flex justify-between">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-lg font-bold text-[var(--color-primary-600)]">
                                        {formatCurrency(total)}
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    leftIcon={<Save className="w-4 h-4" />}
                                    isLoading={createMutation.isPending}
                                >
                                    Create Invoice
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewInvoicePage;
