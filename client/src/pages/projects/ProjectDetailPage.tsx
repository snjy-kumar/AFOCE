import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Clock, DollarSign, Calendar, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner, EmptyState } from '../../components/ui/Common';
import { apiGet, apiPost, apiDelete } from '../../lib/api';

// Currency formatter that supports different currencies
const formatCurrency = (value: number, currency = 'NPR') => {
    return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

interface ProjectEntry {
    id: string;
    type: 'REVENUE' | 'EXPENSE' | 'TIME' | 'MILESTONE';
    description: string;
    notes?: string;
    amount?: number;
    hours?: number;
    date: string;
    isBillable: boolean;
}

interface ProjectTotals {
    revenue: number;
    expenses: number;
    hours: number;
    profit: number;
}

interface Project {
    id: string;
    name: string;
    nameNe?: string;
    code: string;
    description?: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    budget?: number;
    currency: string;
    startDate?: string;
    endDate?: string;
    billable: boolean;
    billingRate?: number;
    billingType?: string;
    category?: string;
    tags: string[];
    entries: ProjectEntry[];
    totals: ProjectTotals;
}

const statusColors: Record<string, string> = {
    ACTIVE: 'success',
    ON_HOLD: 'warning',
    COMPLETED: 'info',
    CANCELLED: 'danger',
};

const entryTypeColors: Record<string, string> = {
    REVENUE: 'success',
    EXPENSE: 'danger',
    TIME: 'info',
    MILESTONE: 'default',
};

interface EntryFormData {
    type: string;
    description: string;
    notes: string;
    amount: string;
    hours: string;
    date: string;
    isBillable: boolean;
}

const initialEntryForm: EntryFormData = {
    type: 'TIME',
    description: '',
    notes: '',
    amount: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    isBillable: true,
};

export default function ProjectDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [entryModal, setEntryModal] = useState(false);
    const [entryForm, setEntryForm] = useState<EntryFormData>(initialEntryForm);
    const [savingEntry, setSavingEntry] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; entry: ProjectEntry | null }>({
        open: false,
        entry: null,
    });
    const [deleting, setDeleting] = useState(false);

    const fetchProject = async () => {
        setLoading(true);
        try {
            const response = await apiGet<Project>(`/projects/${id}`);
            setProject(response);
        } catch (error) {
            console.error('Failed to fetch project:', error);
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleEntryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setEntryForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingEntry(true);

        try {
            await apiPost(`/projects/${id}/entries`, {
                type: entryForm.type,
                description: entryForm.description,
                notes: entryForm.notes || undefined,
                amount: entryForm.amount ? parseFloat(entryForm.amount) : undefined,
                hours: entryForm.hours ? parseFloat(entryForm.hours) : undefined,
                date: entryForm.date,
                isBillable: entryForm.isBillable,
            });

            setEntryModal(false);
            setEntryForm(initialEntryForm);
            fetchProject();
        } catch (error) {
            console.error('Failed to add entry:', error);
        } finally {
            setSavingEntry(false);
        }
    };

    const handleDeleteEntry = async () => {
        if (!deleteModal.entry) return;

        setDeleting(true);
        try {
            await apiDelete(`/projects/${id}/entries/${deleteModal.entry.id}`);
            setDeleteModal({ open: false, entry: null });
            fetchProject();
        } catch (error) {
            console.error('Failed to delete entry:', error);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const budgetUsed = project.budget ? ((project.totals.expenses / project.budget) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                            <Badge variant={statusColors[project.status] as 'success' | 'warning' | 'info' | 'danger'}>
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-gray-600">{project.code}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/projects/${id}/edit`}>
                        <Button variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <Button onClick={() => setEntryModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Entry
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Revenue</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(project.totals.revenue, project.currency)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Expenses</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {formatCurrency(project.totals.expenses, project.currency)}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <DollarSign className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Hours</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {project.totals.hours.toFixed(1)}h
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Profit</p>
                                <p className={`text-2xl font-bold ${project.totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(project.totals.profit, project.currency)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Project Details & Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader title="Project Details" />
                    <CardBody className="space-y-4">
                        {project.description && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Description</p>
                                <p className="text-gray-900">{project.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Start Date</p>
                                <p className="text-gray-900">{formatDate(project.startDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">End Date</p>
                                <p className="text-gray-900">{formatDate(project.endDate)}</p>
                            </div>
                        </div>

                        {project.category && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Category</p>
                                <p className="text-gray-900">{project.category}</p>
                            </div>
                        )}

                        {project.billable && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Billing Rate</p>
                                    <p className="text-gray-900">
                                        {project.billingRate ? formatCurrency(project.billingRate, project.currency) : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Billing Type</p>
                                    <p className="text-gray-900 capitalize">{project.billingType || '-'}</p>
                                </div>
                            </div>
                        )}

                        {project.tags && project.tags.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                                <div className="flex flex-wrap gap-1">
                                    {project.tags.map((tag) => (
                                        <Badge key={tag} variant="default">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader title="Budget Overview" />
                    <CardBody>
                        {project.budget ? (
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Budget Used</span>
                                    <span className="font-medium">
                                        {formatCurrency(project.totals.expenses, project.currency)} / {formatCurrency(project.budget, project.currency)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className={`h-4 rounded-full ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {budgetUsed.toFixed(1)}% of budget used
                                    {budgetUsed > 100 && ` (${(budgetUsed - 100).toFixed(1)}% over budget)`}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500">No budget set for this project</p>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Entries */}
            <Card>
                <CardHeader
                    title="Project Entries"
                    action={
                        <Button size="sm" onClick={() => setEntryModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Entry
                        </Button>
                    }
                />
                <CardBody className="p-0">
                    {project.entries.length === 0 ? (
                        <div className="py-12">
                            <EmptyState
                                icon={<Calendar className="w-12 h-12" />}
                                title="No entries yet"
                                description="Add your first entry to track progress"
                                action={
                                    <Button onClick={() => setEntryModal(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Entry
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hours</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Billable</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {project.entries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(entry.date)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={entryTypeColors[entry.type] as 'success' | 'danger' | 'info' | 'default'}>
                                                    {entry.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-900">{entry.description}</p>
                                                {entry.notes && <p className="text-xs text-gray-500">{entry.notes}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {entry.hours ? `${entry.hours}h` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium">
                                                {entry.amount ? formatCurrency(entry.amount, project.currency) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {entry.isBillable ? (
                                                    <span className="text-green-600">✓</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteModal({ open: true, entry })}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Add Entry Modal */}
            <Modal
                isOpen={entryModal}
                onClose={() => setEntryModal(false)}
                title="Add Project Entry"
            >
                <form onSubmit={handleAddEntry}>
                    <ModalBody className="space-y-4">
                        <Select
                            label="Entry Type"
                            name="type"
                            value={entryForm.type}
                            onChange={handleEntryChange}
                            options={[
                                { value: 'TIME', label: 'Time' },
                                { value: 'REVENUE', label: 'Revenue' },
                                { value: 'EXPENSE', label: 'Expense' },
                                { value: 'MILESTONE', label: 'Milestone' },
                            ]}
                        />

                        <Input
                            label="Description"
                            name="description"
                            value={entryForm.description}
                            onChange={handleEntryChange}
                            placeholder="What was done?"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                            <textarea
                                name="notes"
                                value={entryForm.notes}
                                onChange={handleEntryChange}
                                placeholder="Additional notes..."
                                rows={2}
                                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {(entryForm.type === 'TIME' || entryForm.type === 'MILESTONE') && (
                                <Input
                                    label="Hours"
                                    name="hours"
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    value={entryForm.hours}
                                    onChange={handleEntryChange}
                                    placeholder="0.00"
                                />
                            )}

                            {(entryForm.type === 'REVENUE' || entryForm.type === 'EXPENSE' || entryForm.type === 'MILESTONE') && (
                                <Input
                                    label={`Amount (${project.currency})`}
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={entryForm.amount}
                                    onChange={handleEntryChange}
                                    placeholder="0.00"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Date"
                                name="date"
                                type="date"
                                value={entryForm.date}
                                onChange={handleEntryChange}
                            />

                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isBillable"
                                        checked={entryForm.isBillable}
                                        onChange={handleEntryChange}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Billable</span>
                                </label>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={() => setEntryModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={savingEntry}>
                            Add Entry
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Delete Entry Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, entry: null })}
                title="Delete Entry"
            >
                <ModalBody>
                    <p className="text-gray-600">
                        Are you sure you want to delete this entry? This action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setDeleteModal({ open: false, entry: null })}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteEntry} isLoading={deleting}>
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
