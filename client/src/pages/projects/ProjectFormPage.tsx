import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Common';
import { apiGet, apiPost, apiPut } from '../../lib/api';

interface ProjectFormData {
    name: string;
    nameNe: string;
    code: string;
    description: string;
    status: string;
    customerId: string;
    budget: string;
    currency: string;
    startDate: string;
    endDate: string;
    billable: boolean;
    billingRate: string;
    billingType: string;
    category: string;
    tags: string;
}

interface Customer {
    id: string;
    name: string;
}

const initialFormData: ProjectFormData = {
    name: '',
    nameNe: '',
    code: '',
    description: '',
    status: 'ACTIVE',
    customerId: '',
    budget: '',
    currency: 'NPR',
    startDate: '',
    endDate: '',
    billable: true,
    billingRate: '',
    billingType: 'hourly',
    category: '',
    tags: '',
};

export default function ProjectFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCustomers();
        fetchCategories();
        if (isEditing) {
            fetchProject();
        }
    }, [id]);

    const fetchCustomers = async () => {
        try {
            const response = await apiGet<{ customers: Customer[] }>('/customers');
            setCustomers(response.customers || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiGet<{ categories: string[] }>('/projects/categories');
            setCategories(response.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProject = async () => {
        setLoading(true);
        try {
            const project = await apiGet<Record<string, unknown>>(`/projects/${id}`);
            setFormData({
                name: (project.name as string) || '',
                nameNe: (project.nameNe as string) || '',
                code: (project.code as string) || '',
                description: (project.description as string) || '',
                status: (project.status as string) || 'ACTIVE',
                customerId: (project.customerId as string) || '',
                budget: project.budget ? String(project.budget) : '',
                currency: (project.currency as string) || 'NPR',
                startDate: project.startDate ? (project.startDate as string).split('T')[0] : '',
                endDate: project.endDate ? (project.endDate as string).split('T')[0] : '',
                billable: (project.billable as boolean) ?? true,
                billingRate: project.billingRate ? String(project.billingRate) : '',
                billingType: (project.billingType as string) || 'hourly',
                category: (project.category as string) || '',
                tags: ((project.tags as string[]) || []).join(', '),
            });
        } catch (error) {
            console.error('Failed to fetch project:', error);
            setError('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const payload = {
                name: formData.name,
                nameNe: formData.nameNe || undefined,
                code: formData.code,
                description: formData.description || undefined,
                status: formData.status,
                customerId: formData.customerId || undefined,
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
                currency: formData.currency,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
                billable: formData.billable,
                billingRate: formData.billingRate ? parseFloat(formData.billingRate) : undefined,
                billingType: formData.billingType || undefined,
                category: formData.category || undefined,
                tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
            };

            if (isEditing) {
                await apiPut(`/projects/${id}`, payload);
            } else {
                await apiPost('/projects', payload);
            }

            navigate('/projects');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to save project');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Project' : 'New Project'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditing ? 'Update project details' : 'Create a new project to track'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader title="Basic Information" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Project Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter project name"
                                required
                            />

                            <Input
                                label="Project Name (Nepali)"
                                name="nameNe"
                                value={formData.nameNe}
                                onChange={handleChange}
                                placeholder="परियोजनाको नाम"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Project Code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g., PROJ-001"
                                required
                            />

                            <Select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={[
                                    { value: 'ACTIVE', label: 'Active' },
                                    { value: 'ON_HOLD', label: 'On Hold' },
                                    { value: 'COMPLETED', label: 'Completed' },
                                    { value: 'CANCELLED', label: 'Cancelled' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Project description..."
                                rows={3}
                                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Customer"
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                options={[
                                    { value: '', label: 'No customer' },
                                    ...customers.map((customer) => ({ value: customer.id, label: customer.name })),
                                ]}
                            />

                            <Input
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g., Development, Consulting"
                                list="categories"
                            />
                            <datalist id="categories">
                                {categories.map((cat) => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>
                    </CardBody>
                </Card>

                {/* Timeline */}
                <Card>
                    <CardHeader title="Timeline" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                            />

                            <Input
                                label="End Date"
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Budget & Billing */}
                <Card>
                    <CardHeader title="Budget & Billing" />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Budget"
                                name="budget"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.budget}
                                onChange={handleChange}
                                placeholder="0.00"
                            />

                            <Select
                                label="Currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                options={[
                                    { value: 'NPR', label: 'NPR - Nepali Rupee' },
                                    { value: 'USD', label: 'USD - US Dollar' },
                                    { value: 'INR', label: 'INR - Indian Rupee' },
                                    { value: 'EUR', label: 'EUR - Euro' },
                                    { value: 'GBP', label: 'GBP - British Pound' },
                                ]}
                            />

                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="billable"
                                        checked={formData.billable}
                                        onChange={handleChange}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Billable Project</span>
                                </label>
                            </div>
                        </div>

                        {formData.billable && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Billing Rate"
                                    name="billingRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.billingRate}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />

                                <Select
                                    label="Billing Type"
                                    name="billingType"
                                    value={formData.billingType}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'hourly', label: 'Hourly' },
                                        { value: 'fixed', label: 'Fixed Price' },
                                        { value: 'retainer', label: 'Retainer' },
                                        { value: 'milestone', label: 'Milestone' },
                                    ]}
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Tags */}
                <Card>
                    <CardHeader title="Tags" />
                    <CardBody>
                        <Input
                            label="Tags (comma-separated)"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g., urgent, client-a, phase-1"
                        />
                    </CardBody>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/projects')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditing ? 'Update Project' : 'Create Project'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
