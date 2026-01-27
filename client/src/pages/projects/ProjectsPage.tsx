import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Folder, FolderOpen, Clock, DollarSign, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { EmptyState, Spinner } from '../../components/ui/Common';
import { apiGet, apiDelete } from '../../lib/api';
// Currency formatter that supports different currencies
const formatCurrencyWithCode = (value: number, currency = 'NPR') => {
    return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

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
    category?: string;
    _count?: { entries: number };
}

interface ProjectsResponse {
    projects: Project[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface ProjectsSummary {
    totalProjects: number;
    byStatus: Record<string, number>;
    billableProjects: number;
    totalBudget: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
}

const statusColors: Record<string, string> = {
    ACTIVE: 'success',
    ON_HOLD: 'warning',
    COMPLETED: 'info',
    CANCELLED: 'danger',
};

const statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

export default function ProjectsPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [summary, setSummary] = useState<ProjectsSummary | null>(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([]);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; project: Project | null }>({
        open: false,
        project: null,
    });
    const [deleting, setDeleting] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pagination.page.toString());
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (categoryFilter) params.append('category', categoryFilter);

            const response = await apiGet<ProjectsResponse>(`/projects?${params.toString()}`);
            setProjects(response.projects);
            setPagination({
                page: response.pagination.page,
                totalPages: response.pagination.totalPages,
                total: response.pagination.total,
            });
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await apiGet<ProjectsSummary>('/projects/summary');
            setSummary(response);
        } catch (error) {
            console.error('Failed to fetch projects summary:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiGet<{ categories: string[] }>('/projects/categories');
            setCategories(response.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchSummary();
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [pagination.page, statusFilter, categoryFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchProjects();
    };

    const handleDelete = async () => {
        if (!deleteModal.project) return;

        setDeleting(true);
        try {
            await apiDelete(`/projects/${deleteModal.project.id}`);
            setDeleteModal({ open: false, project: null });
            fetchProjects();
            fetchSummary();
        } catch (error) {
            console.error('Failed to delete project:', error);
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-600">Track project budgets, time, and profitability</p>
                </div>
                <Button onClick={() => navigate('/projects/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Projects</p>
                                    <p className="text-2xl font-bold">{summary.totalProjects}</p>
                                    <p className="text-sm text-gray-500">
                                        {summary.byStatus.ACTIVE || 0} active
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Budget</p>
                                    <p className="text-2xl font-bold">{formatCurrencyWithCode(summary.totalBudget)}</p>
                                    <p className="text-sm text-gray-500">
                                        {summary.billableProjects} billable
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
                                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrencyWithCode(summary.totalRevenue)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Expenses: {formatCurrencyWithCode(summary.totalExpenses)}
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-100 rounded-full">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Net Profit</p>
                                    <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrencyWithCode(summary.netProfit)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {summary.totalRevenue > 0
                                            ? `${((summary.netProfit / summary.totalRevenue) * 100).toFixed(1)}% margin`
                                            : 'No revenue yet'}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader title="Filter Projects" />
                <CardBody>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search projects..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: 'ACTIVE', label: 'Active' },
                                { value: 'ON_HOLD', label: 'On Hold' },
                                { value: 'COMPLETED', label: 'Completed' },
                                { value: 'CANCELLED', label: 'Cancelled' },
                            ]}
                            className="w-full sm:w-[180px]"
                        />
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Categories' },
                                ...categories.map((cat) => ({ value: cat, label: cat })),
                            ]}
                            className="w-full sm:w-[180px]"
                        />
                        <Button type="submit">Search</Button>
                    </form>
                </CardBody>
            </Card>

            {/* Projects List */}
            <Card>
                <CardBody className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="py-12">
                            <EmptyState
                                icon={<Folder className="w-12 h-12" />}
                                title="No projects found"
                                description="Create your first project to get started"
                                action={
                                    <Button onClick={() => navigate('/projects/new')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Project
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Project
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Budget
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Timeline
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Entries
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {projects.map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/projects/${project.id}`}
                                                    className="flex items-center hover:text-blue-600"
                                                >
                                                    <FolderOpen className="w-5 h-5 mr-3 text-blue-500" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{project.name}</p>
                                                        <p className="text-sm text-gray-500">{project.code}</p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={statusColors[project.status] as 'success' | 'warning' | 'info' | 'danger'}>
                                                    {statusLabels[project.status]}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {project.category || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {project.budget ? (
                                                    <div>
                                                        <p className="font-medium">{formatCurrencyWithCode(project.budget, project.currency)}</p>
                                                        {project.billable && (
                                                            <p className="text-xs text-green-600">Billable</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div>
                                                    <p>Start: {formatDate(project.startDate)}</p>
                                                    <p>End: {formatDate(project.endDate)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="default">
                                                    {project._count?.entries || 0}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${project.id}/edit`)}>
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => setDeleteModal({ open: true, project })}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <p className="text-sm text-gray-600">
                                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, project: null })}
                title="Delete Project"
            >
                <ModalBody>
                    <p className="text-gray-600">
                        Are you sure you want to delete the project{' '}
                        <strong>{deleteModal.project?.name}</strong>? This will also delete all
                        project entries. This action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={() => setDeleteModal({ open: false, project: null })}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        isLoading={deleting}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
