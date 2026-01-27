import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { useCompanyStore, type Company } from '../../../stores/companyStore';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

const currencies = [
    { value: 'NPR', label: 'NPR - Nepalese Rupee' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
];

const fiscalMonths = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April (Shrawan)' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

export default function CompanyFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = id && id !== 'new';

    const { companies, createCompany, updateCompany, isLoading, error, clearError } = useCompanyStore();

    const [formData, setFormData] = useState<Partial<Company>>({
        name: '',
        nameNe: '',
        panNumber: '',
        vatNumber: '',
        address: '',
        phone: '',
        email: '',
        fiscalYearStart: 4,
        currency: 'NPR',
        vatRate: 13,
    });

    useEffect(() => {
        if (isEditMode) {
            const company = companies.find((c) => c.id === id);
            if (company) {
                setFormData({
                    name: company.name,
                    nameNe: company.nameNe || '',
                    panNumber: company.panNumber || '',
                    vatNumber: company.vatNumber || '',
                    address: company.address || '',
                    phone: company.phone || '',
                    email: company.email || '',
                    fiscalYearStart: company.fiscalYearStart || 4,
                    currency: company.currency || 'NPR',
                    vatRate: company.vatRate || 13,
                });
            }
        }
    }, [isEditMode, id, companies]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearError();
    };

    const handleSelectChange = (name: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditMode) {
                await updateCompany(id!, formData);
            } else {
                await createCompany(formData);
            }
            navigate('/settings/companies');
        } catch {
            // Error is handled in the store
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/settings/companies')} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Companies
            </Button>

            <Card>
                <CardBody>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-[var(--color-primary-600)]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">
                                {isEditMode ? 'Edit Company' : 'Create New Company'}
                            </h2>
                            <p className="text-sm text-[var(--color-neutral-600)]">
                                {isEditMode ? 'Update your company information' : 'Set up a new company for your business'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Company Name *"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Enter company name"
                                required
                            />
                            <Input
                                label="Company Name (Nepali)"
                                name="nameNe"
                                value={formData.nameNe || ''}
                                onChange={handleChange}
                                placeholder="कम्पनीको नाम"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="PAN Number"
                                name="panNumber"
                                value={formData.panNumber || ''}
                                onChange={handleChange}
                                placeholder="Permanent Account Number"
                            />
                            <Input
                                label="VAT Number"
                                name="vatNumber"
                                value={formData.vatNumber || ''}
                                onChange={handleChange}
                                placeholder="VAT Registration Number"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                placeholder="company@example.com"
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                placeholder="+977-"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                placeholder="Enter company address"
                                rows={3}
                                className="w-full px-3 py-2 border border-[var(--color-neutral-200)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <Select
                                label="Currency"
                                value={formData.currency || 'NPR'}
                                onChange={(e) => handleSelectChange('currency', e.target.value)}
                                options={currencies}
                            />
                            <Select
                                label="Fiscal Year Start"
                                value={String(formData.fiscalYearStart || 4)}
                                onChange={(e) => handleSelectChange('fiscalYearStart', parseInt(e.target.value))}
                                options={fiscalMonths}
                            />
                            <Input
                                label="VAT Rate (%)"
                                name="vatRate"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.vatRate || 13}
                                onChange={(e) => handleSelectChange('vatRate', parseFloat(e.target.value) || 0)}
                                placeholder="13"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t border-[var(--color-neutral-200)]">
                            <Button variant="outline" type="button" onClick={() => navigate('/settings/companies')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Company'}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
