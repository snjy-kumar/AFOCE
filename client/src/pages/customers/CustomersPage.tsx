import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Spinner, EmptyState, Avatar } from '../../components/ui/Common';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Search,
    Users,
    MoreVertical,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    FileText,
} from 'lucide-react';
import type { Customer, CustomerFormData } from '../../types';

const customerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').or(z.literal('')).optional(),
    phone: z.string().optional(),
    panNumber: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
});

export const CustomersPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: () => apiGet<Customer[]>('/customers'),
    });

    const createMutation = useMutation({
        mutationFn: (data: CustomerFormData) => apiPost<Customer>('/customers', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            closeModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CustomerFormData }) =>
            apiPut<Customer>(`/customers/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiDelete(`/customers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setDeletingId(null);
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
    });

    const openModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            reset(customer);
        } else {
            setEditingCustomer(null);
            reset({ name: '', email: '', phone: '', panNumber: '', address: '', notes: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        reset();
    };

    const onSubmit = (data: CustomerFormData) => {
        if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const filteredCustomers = (customers || []).filter(
        (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone?.includes(searchQuery)
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Customers"
                subtitle={`${customers?.length || 0} total customers`}
                action={
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => openModal()}>
                        Add Customer
                    </Button>
                }
            />

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search customers..."
                    leftIcon={<Search className="w-4 h-4" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                />
            </div>

            {/* Customer Grid */}
            {filteredCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCustomers.map((customer) => (
                        <CustomerCard
                            key={customer.id}
                            customer={customer}
                            onEdit={() => openModal(customer)}
                            onDelete={() => setDeletingId(customer.id)}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <EmptyState
                        icon={<Users className="w-8 h-8" />}
                        title="No customers found"
                        description={
                            searchQuery
                                ? 'Try a different search term'
                                : 'Add your first customer to get started'
                        }
                        action={
                            !searchQuery && (
                                <Button onClick={() => openModal()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Customer
                                </Button>
                            )
                        }
                    />
                </Card>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
                size="md"
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody className="space-y-4">
                        <Input
                            label="Customer Name"
                            placeholder="Enter customer name"
                            error={errors.name?.message}
                            {...register('name')}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="email@example.com"
                                leftIcon={<Mail className="w-4 h-4" />}
                                error={errors.email?.message}
                                {...register('email')}
                            />
                            <Input
                                label="Phone"
                                placeholder="+977-..."
                                leftIcon={<Phone className="w-4 h-4" />}
                                {...register('phone')}
                            />
                        </div>

                        <Input
                            label="PAN Number"
                            placeholder="Customer's PAN"
                            leftIcon={<FileText className="w-4 h-4" />}
                            helperText="Required for VAT invoices"
                            {...register('panNumber')}
                        />

                        <Textarea
                            label="Address"
                            placeholder="Enter address"
                            {...register('address')}
                        />

                        <Textarea
                            label="Notes"
                            placeholder="Additional notes..."
                            {...register('notes')}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingCustomer ? 'Update' : 'Create'} Customer
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                title="Delete Customer"
                size="sm"
            >
                <ModalBody>
                    <p className="text-[var(--color-neutral-600)]">
                        Are you sure you want to delete this customer? This action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setDeletingId(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => deletingId && deleteMutation.mutate(deletingId)}
                        isLoading={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

// Customer Card Component
interface CustomerCardProps {
    customer: Customer;
    onEdit: () => void;
    onDelete: () => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardBody>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar name={customer.name} size="md" />
                        <div>
                            <h3 className="font-medium text-[var(--color-neutral-900)]">{customer.name}</h3>
                            {customer.panNumber && (
                                <p className="text-xs text-[var(--color-neutral-500)]">
                                    PAN: {customer.panNumber}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 rounded hover:bg-[var(--color-neutral-100)]"
                        >
                            <MoreVertical className="w-4 h-4 text-[var(--color-neutral-400)]" />
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-[var(--color-neutral-200)] py-1 z-10">
                                    <button
                                        onClick={() => {
                                            onEdit();
                                            setShowMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete();
                                            setShowMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)]"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                            <Mail className="w-4 h-4 text-[var(--color-neutral-400)]" />
                            <span className="truncate">{customer.email}</span>
                        </div>
                    )}
                    {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                            <Phone className="w-4 h-4 text-[var(--color-neutral-400)]" />
                            {customer.phone}
                        </div>
                    )}
                    {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                            <MapPin className="w-4 h-4 text-[var(--color-neutral-400)]" />
                            <span className="truncate">{customer.address}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)] text-xs text-[var(--color-neutral-400)]">
                    Added {formatDate(customer.createdAt)}
                </div>
            </CardBody>
        </Card>
    );
};

export default CustomersPage;
