import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '../../lib/api';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { Save, ArrowLeft } from 'lucide-react';

interface ProductFormData {
    name: string;
    nameNe: string;
    sku: string;
    description: string;
    category: string;
    costPrice: string;
    sellingPrice: string;
    vatRate: string;
    isVatExempt: boolean;
    currentStock: string;
    reorderLevel: string;
    reorderQuantity: string;
    unit: string;
    isActive: boolean;
}

const initialFormData: ProductFormData = {
    name: '',
    nameNe: '',
    sku: '',
    description: '',
    category: '',
    costPrice: '0',
    sellingPrice: '0',
    vatRate: '13',
    isVatExempt: false,
    currentStock: '0',
    reorderLevel: '10',
    reorderQuantity: '50',
    unit: 'pcs',
    isActive: true,
};

const unitOptions = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'ltr', label: 'Liters (ltr)' },
    { value: 'mtr', label: 'Meters (mtr)' },
    { value: 'box', label: 'Boxes' },
    { value: 'pack', label: 'Packs' },
    { value: 'dozen', label: 'Dozens' },
    { value: 'unit', label: 'Units' },
];

export const ProductFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<ProductFormData>(initialFormData);
    const [error, setError] = useState<string | null>(null);

    // Fetch product for edit
    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => apiGet<ProductFormData>(`/inventory/products/${id}`),
        enabled: isEdit,
    });

    // Fetch categories for suggestions
    const { data: categories } = useQuery({
        queryKey: ['product-categories'],
        queryFn: () => apiGet<string[]>('/inventory/categories'),
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                nameNe: product.nameNe || '',
                sku: product.sku || '',
                description: product.description || '',
                category: product.category || '',
                costPrice: String(product.costPrice || '0'),
                sellingPrice: String(product.sellingPrice || '0'),
                vatRate: String(product.vatRate || '13'),
                isVatExempt: product.isVatExempt || false,
                currentStock: String(product.currentStock || '0'),
                reorderLevel: String(product.reorderLevel || '10'),
                reorderQuantity: String(product.reorderQuantity || '50'),
                unit: product.unit || 'pcs',
                isActive: product.isActive !== false,
            });
        }
    }, [product]);

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: async (data: ProductFormData) => {
            const payload = {
                ...data,
                costPrice: parseFloat(data.costPrice) || 0,
                sellingPrice: parseFloat(data.sellingPrice) || 0,
                vatRate: parseFloat(data.vatRate) || 13,
                currentStock: parseInt(data.currentStock) || 0,
                reorderLevel: parseInt(data.reorderLevel) || 10,
                reorderQuantity: parseInt(data.reorderQuantity) || 50,
            };

            if (isEdit) {
                return apiPut(`/inventory/products/${id}`, payload);
            }
            return apiPost('/inventory/products', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-valuation'] });
            navigate('/inventory');
        },
        onError: (err: Error) => {
            setError(err.message || 'Failed to save product');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('Product name is required');
            return;
        }
        if (!formData.sku.trim()) {
            setError('SKU is required');
            return;
        }

        mutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-600)]"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <PageHeader
                title={isEdit ? 'Edit Product' : 'Add New Product'}
                subtitle={isEdit ? `Editing ${product?.name}` : 'Create a new product for inventory'}
                action={
                    <Button variant="ghost" onClick={() => navigate('/inventory')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
                    </Button>
                }
            />

            {error && (
                <Alert variant="error" className="mb-6">
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader title="Product Information" />
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Product Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Name (Nepali)"
                                    name="nameNe"
                                    value={formData.nameNe}
                                    onChange={handleChange}
                                    placeholder="नेपाली नाम"
                                />
                                <Input
                                    label="SKU"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    required
                                    disabled={isEdit}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        list="category-options"
                                        className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                                        placeholder="Enter or select category"
                                    />
                                    <datalist id="category-options">
                                        {categories?.map((c) => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                                    />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader title="Pricing & Tax" />
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Cost Price"
                                    type="number"
                                    name="costPrice"
                                    value={formData.costPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                                <Input
                                    label="Selling Price"
                                    type="number"
                                    name="sellingPrice"
                                    value={formData.sellingPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                                <Input
                                    label="VAT Rate (%)"
                                    type="number"
                                    name="vatRate"
                                    value={formData.vatRate}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                />
                                <label className="flex items-center gap-2 cursor-pointer md:col-span-3">
                                    <input
                                        type="checkbox"
                                        name="isVatExempt"
                                        checked={formData.isVatExempt}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)]"
                                    />
                                    <span className="text-sm text-[var(--color-neutral-700)]">VAT Exempt</span>
                                </label>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Stock */}
                    <Card>
                        <CardHeader title="Stock Management" />
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {!isEdit && (
                                    <Input
                                        label="Opening Stock"
                                        type="number"
                                        name="currentStock"
                                        value={formData.currentStock}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                )}
                                <Input
                                    label="Reorder Level"
                                    type="number"
                                    name="reorderLevel"
                                    value={formData.reorderLevel}
                                    onChange={handleChange}
                                    min="0"
                                />
                                <Input
                                    label="Reorder Quantity"
                                    type="number"
                                    name="reorderQuantity"
                                    value={formData.reorderQuantity}
                                    onChange={handleChange}
                                    min="0"
                                />
                                <Select
                                    label="Unit"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    options={unitOptions}
                                />
                            </div>
                            {isEdit && (
                                <p className="text-sm text-[var(--color-neutral-500)] mt-4">
                                    Note: Stock can only be adjusted via stock movements (purchase, sale, adjustment).
                                </p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Status */}
                    <Card>
                        <CardHeader title="Status" />
                        <CardBody>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)]"
                                />
                                <span className="text-sm text-[var(--color-neutral-700)]">Active Product</span>
                            </label>
                        </CardBody>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Button variant="ghost" type="button" onClick={() => navigate('/inventory')}>
                            Cancel
                        </Button>
                        <Button type="submit" leftIcon={<Save className="w-4 h-4" />} isLoading={mutation.isPending}>
                            {isEdit ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;
