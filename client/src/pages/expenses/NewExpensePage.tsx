import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/api';
import { formatCurrency, formatDateForInput } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Common';
import { FileUpload } from '../../components/common/FileUpload';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import type { Vendor, Account, Expense } from '../../types';

const expenseSchema = z.object({
    vendorId: z.string().optional(),
    accountId: z.string().min(1, 'Category is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().min(1, 'Description is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    vatRate: z.number().min(0).max(100).default(13),
    notes: z.string().optional(),
    isPaid: z.boolean().default(true),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export const NewExpensePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);

    const { data: vendors, isLoading: loadingVendors } = useQuery({
        queryKey: ['vendors'],
        queryFn: () => apiGet<Vendor[]>('/vendors'),
    });

    const { data: accounts, isLoading: loadingAccounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => apiGet<Account[]>('/accounts'),
    });

    const createMutation = useMutation({
        mutationFn: (data: ExpenseFormData) => apiPost<Expense>('/expenses', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense created successfully!');
            navigate('/expenses');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create expense');
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
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload receipt');
                }

                const uploadResult = await response.json();
                toast.success('Receipt uploaded successfully!');
            } catch (error) {
                toast.error('Failed to upload receipt');
                setUploadingReceipt(false);
                return;
            }
            setUploadingReceipt(false);
        }

        createMutation.mutate(data);
    };

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            date: formatDateForInput(new Date()),
            amount: 0,
            vatRate: 13,
            isPaid: true,
        },
    });

    const amount = watch('amount') || 0;
    const vatRate = watch('vatRate') || 0;
    const vatAmount = amount * (vatRate / 100);
    const total = amount + vatAmount;

    const expenseAccounts = (accounts || []).filter((a) => a.type === 'EXPENSE');

    if (loadingVendors || loadingAccounts) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="New Expense"
                subtitle="Record a business expense"
                action={
                    <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/expenses')}>
                        Back
                    </Button>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader title="Expense Details" />
                            <CardBody className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Category"
                                        options={expenseAccounts.map((a) => ({ value: a.id, label: a.name }))}
                                        placeholder="Select category"
                                        error={errors.accountId?.message}
                                        required
                                        {...register('accountId')}
                                    />
                                    <Select
                                        label="Vendor"
                                        options={[
                                            { value: '', label: 'No vendor' },
                                            ...(vendors || []).map((v) => ({ value: v.id, label: v.name })),
                                        ]}
                                        {...register('vendorId')}
                                    />
                                </div>

                                <Input
                                    label="Description"
                                    placeholder="What was this expense for?"
                                    error={errors.description?.message}
                                    required
                                    {...register('description')}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Date"
                                        type="date"
                                        error={errors.date?.message}
                                        required
                                        {...register('date')}
                                    />
                                    <Input
                                        label="Amount (excl. VAT)"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        error={errors.amount?.message}
                                        required
                                        {...register('amount')}
                                    />
                                    <Input
                                        label="VAT Rate (%)"
                                        type="number"
                                        min={0}
                                        max={100}
                                        {...register('vatRate')}
                                    />
                                </div>

                                <Textarea
                                    label="Notes"
                                    placeholder="Additional notes..."
                                    {...register('notes')}
                                />

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPaid"
                                        className="w-4 h-4 rounded border-[var(--color-neutral-300)]"
                                        {...register('isPaid')}
                                    />
                                    <label htmlFor="isPaid" className="text-sm text-[var(--color-neutral-700)]">
                                        This expense has been paid
                                    </label>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader title="Receipt" />
                            <CardBody>
                                <FileUpload
                                    accept="image/*,application/pdf"
                                    maxSize={5}
                                    onFileSelect={setReceiptFile}
                                    uploadType="receipt"
                                    disabled={uploadingReceipt}
                                />
                            </CardBody>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader title="Summary" />
                            <CardBody className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-neutral-600)]">Amount</span>
                                    <span className="font-medium">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-neutral-600)]">VAT ({vatRate}%)</span>
                                    <span className="font-medium">{formatCurrency(vatAmount)}</span>
                                </div>
                                <div className="border-t border-[var(--color-neutral-200)] pt-4 flex justify-between">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-lg font-bold text-[var(--color-danger-600)]">
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
                                    Save Expense
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewExpensePage;
