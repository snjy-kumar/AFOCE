import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Spinner, EmptyState } from '../../components/ui/Common';
import { Badge } from '../../components/ui/Badge';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    AlertTriangle,
    Package,
    TrendingUp,
    Boxes,
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    nameNe?: string;
    sku: string;
    description?: string;
    category?: string;
    costPrice: number;
    sellingPrice: number;
    vatRate: number;
    isVatExempt: boolean;
    currentStock: number;
    reorderLevel: number;
    reorderQuantity: number;
    unit: string;
    isActive: boolean;
    createdAt: string;
}

interface ProductsResponse {
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface ValuationResponse {
    totalCostValue: number;
    totalRetailValue: number;
    totalItems: number;
    productCount: number;
    potentialProfit: number;
    profitMargin: string;
}

export const InventoryPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; product?: Product }>({ open: false });

    // Fetch products
    const { data, isLoading } = useQuery({
        queryKey: ['products', search, category, showLowStock, page],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', '20');
            if (search) params.set('search', search);
            if (category) params.set('category', category);
            if (showLowStock) params.set('lowStock', 'true');
            return apiGet<ProductsResponse>(`/inventory/products?${params.toString()}`);
        },
    });

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['product-categories'],
        queryFn: () => apiGet<string[]>('/inventory/categories'),
    });

    // Fetch valuation
    const { data: valuation } = useQuery({
        queryKey: ['inventory-valuation'],
        queryFn: () => apiGet<ValuationResponse>('/inventory/valuation'),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (productId: string) => apiDelete(`/inventory/products/${productId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-valuation'] });
            setDeleteModal({ open: false });
        },
    });

    const handleDelete = () => {
        if (deleteModal.product) {
            deleteMutation.mutate(deleteModal.product.id);
        }
    };

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...(categories?.map((c) => ({ value: c, label: c })) || []),
    ];

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Inventory Management"
                subtitle="Manage products and stock levels"
                action={
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/inventory/new')}>
                        Add Product
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[var(--color-primary-100)]">
                            <Package className="w-6 h-6 text-[var(--color-primary-600)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-neutral-500)]">Total Products</p>
                            <p className="text-2xl font-bold">{valuation?.productCount ?? 0}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[var(--color-success-100)]">
                            <Boxes className="w-6 h-6 text-[var(--color-success-600)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-neutral-500)]">Total Stock</p>
                            <p className="text-2xl font-bold">{valuation?.totalItems ?? 0}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[var(--color-warning-100)]">
                            <TrendingUp className="w-6 h-6 text-[var(--color-warning-600)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-neutral-500)]">Stock Value</p>
                            <p className="text-2xl font-bold">{formatCurrency(valuation?.totalCostValue ?? 0)}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[var(--color-danger-100)]">
                            <AlertTriangle className="w-6 h-6 text-[var(--color-danger-600)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-neutral-500)]">Potential Profit</p>
                            <p className="text-2xl font-bold text-[var(--color-success-600)]">
                                {formatCurrency(valuation?.potentialProfit ?? 0)}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardBody>
                    <div className="flex flex-wrap items-end gap-4">
                        <Input
                            label="Search"
                            placeholder="Search by name or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                            className="w-64"
                        />
                        <Select
                            label="Category"
                            options={categoryOptions}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-48"
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showLowStock}
                                onChange={(e) => setShowLowStock(e.target.checked)}
                                className="w-4 h-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)]"
                            />
                            <span className="text-sm text-[var(--color-neutral-700)]">Show Low Stock Only</span>
                        </label>
                    </div>
                </CardBody>
            </Card>

            {/* Products Table */}
            <Card>
                <CardBody className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : !data?.products.length ? (
                        <EmptyState
                            icon={<Package className="w-8 h-8" />}
                            title="No products found"
                            description="Add your first product to start managing inventory"
                            action={
                                <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/inventory/new')}>
                                    Add Product
                                </Button>
                            }
                        />
                    ) : (
                        <table className="w-full">
                            <thead className="bg-[var(--color-neutral-50)]">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Product</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">SKU</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Category</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Cost</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Price</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Stock</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-neutral-600)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.products.map((product) => {
                                    const isLowStock = product.currentStock <= product.reorderLevel;
                                    return (
                                        <tr key={product.id} className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]">
                                            <td className="py-3 px-4">
                                                <Link to={`/inventory/${product.id}`} className="font-medium text-[var(--color-primary-600)] hover:underline">
                                                    {product.name}
                                                </Link>
                                                {product.nameNe && (
                                                    <p className="text-sm text-[var(--color-neutral-500)]">{product.nameNe}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-sm">{product.sku}</td>
                                            <td className="py-3 px-4">{product.category || '-'}</td>
                                            <td className="py-3 px-4 text-right">{formatCurrency(Number(product.costPrice))}</td>
                                            <td className="py-3 px-4 text-right">{formatCurrency(Number(product.sellingPrice))}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={isLowStock ? 'text-[var(--color-danger-600)] font-bold' : ''}>
                                                    {product.currentStock} {product.unit}
                                                </span>
                                                {isLowStock && (
                                                    <AlertTriangle className="inline-block w-4 h-4 ml-1 text-[var(--color-danger-500)]" />
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {product.isActive ? (
                                                    <Badge variant="success">Active</Badge>
                                                ) : (
                                                    <Badge variant="warning">Inactive</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/inventory/${product.id}/edit`)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteModal({ open: true, product })}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-[var(--color-danger-500)]" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </CardBody>
            </Card>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-[var(--color-neutral-600)]">
                        Page {page} of {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === data.pagination.totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false })}>
                <ModalBody>
                    <h3 className="text-lg font-semibold mb-2">Delete Product</h3>
                    <p>Are you sure you want to delete <strong>{deleteModal.product?.name}</strong>?</p>
                    <p className="text-sm text-[var(--color-neutral-500)] mt-2">
                        This action cannot be undone. All stock movement history will also be deleted.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setDeleteModal({ open: false })}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default InventoryPage;
