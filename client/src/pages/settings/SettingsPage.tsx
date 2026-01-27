import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { apiPut } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { useI18n } from '../../lib/i18n';
import { PageHeader } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar, Divider } from '../../components/ui/Common';
import {
    Building2,
    Mail,
    Phone,
    FileText,
    Globe,
    Save,
    Key,
    Bell,
    Palette,
    Coins,
    ChevronRight,
    Building,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User as UserType } from '../../types';

const profileSchema = z.object({
    businessName: z.string().min(1, 'Business name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    address: z.string().optional(),
    panNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    language: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SettingsPage: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const {
        useBikramSambat,
        emailNotifications,
        invoiceBranding,
        setLanguage,
        setUseBikramSambat,
        setEmailNotifications,
        setInvoiceBranding,
    } = usePreferencesStore();
    const { t, setLanguage: setI18nLanguage, setUseBikramSambat: setI18nBS } = useI18n();

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors, isDirty: profileDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            businessName: user?.businessName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
            panNumber: user?.panNumber || '',
            vatNumber: user?.vatNumber || '',
            language: user?.language || 'en',
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    const profileMutation = useMutation({
        mutationFn: (data: ProfileFormData) => apiPut('/auth/profile', data),
        onSuccess: (data) => {
            updateProfile(data as UserType);
            toast.success('Profile updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update profile');
        },
    });

    const passwordMutation = useMutation({
        mutationFn: (data: PasswordFormData) => apiPut('/auth/password', data),
        onSuccess: () => {
            resetPassword();
            toast.success('Password updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update password');
        },
    });

    const handlePreferenceChange = (preference: string, value: boolean | string) => {
        switch (preference) {
            case 'emailNotifications':
                setEmailNotifications(value as boolean);
                break;
            case 'invoiceBranding':
                setInvoiceBranding(value as boolean);
                break;
            case 'bikramSambatDates':
                setUseBikramSambat(value as boolean);
                setI18nBS(value as boolean);
                break;
            case 'language':
                const lang = value as 'en' | 'ne';
                setLanguage(lang);
                setI18nLanguage(lang);
                break;
        }
        toast.success(t('success.saved'));
    };

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Settings"
                subtitle="Manage your account and preferences"
            />

            <div className="max-w-4xl space-y-6">
                {/* Quick Links Section */}
                <Card>
                    <CardHeader title="Configuration" subtitle="Additional settings and configuration" />
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                to="/settings/currencies"
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Coins className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--color-neutral-900)]">Currencies</p>
                                        <p className="text-sm text-[var(--color-neutral-500)]">
                                            Manage currencies & exchange rates
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                            </Link>
                            <Link
                                to="/settings/companies"
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Building className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--color-neutral-900)]">Companies</p>
                                        <p className="text-sm text-[var(--color-neutral-500)]">
                                            Manage multiple companies
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[var(--color-neutral-400)]" />
                            </Link>
                        </div>
                    </CardBody>
                </Card>

                {/* Profile Section */}
                <Card>
                    <CardHeader title="Business Profile" subtitle="Update your business information" />
                    <CardBody>
                        <form onSubmit={handleProfileSubmit((data) => profileMutation.mutate(data))}>
                            <div className="flex items-center gap-6 mb-6">
                                <Avatar name={user?.businessName || 'Business'} size="lg" />
                                <div>
                                    <h3 className="text-lg font-medium text-[var(--color-neutral-900)]">
                                        {user?.businessName}
                                    </h3>
                                    <p className="text-sm text-[var(--color-neutral-500)]">{user?.email}</p>
                                    <Button variant="outline" size="sm" className="mt-2">
                                        Change Logo
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Business Name"
                                    leftIcon={<Building2 className="w-4 h-4" />}
                                    error={profileErrors.businessName?.message}
                                    {...registerProfile('businessName')}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    leftIcon={<Mail className="w-4 h-4" />}
                                    error={profileErrors.email?.message}
                                    {...registerProfile('email')}
                                    required
                                />
                                <Input
                                    label="Phone"
                                    leftIcon={<Phone className="w-4 h-4" />}
                                    {...registerProfile('phone')}
                                />
                                <Select
                                    label="Language"
                                    options={[
                                        { value: 'en', label: 'English' },
                                        { value: 'ne', label: 'नेपाली (Nepali)' },
                                    ]}
                                    {...registerProfile('language')}
                                />
                                <Input
                                    label="PAN Number"
                                    leftIcon={<FileText className="w-4 h-4" />}
                                    helperText="Permanent Account Number"
                                    {...registerProfile('panNumber')}
                                />
                                <Input
                                    label="VAT Number"
                                    leftIcon={<FileText className="w-4 h-4" />}
                                    helperText="VAT Registration Number"
                                    {...registerProfile('vatNumber')}
                                />
                            </div>

                            <div className="mt-4">
                                <Textarea
                                    label="Business Address"
                                    placeholder="Enter your business address"
                                    {...registerProfile('address')}
                                />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="submit"
                                    leftIcon={<Save className="w-4 h-4" />}
                                    isLoading={profileMutation.isPending}
                                    disabled={!profileDirty}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

                {/* Password Section */}
                <Card>
                    <CardHeader title="Change Password" subtitle="Update your account password" />
                    <CardBody>
                        <form onSubmit={handlePasswordSubmit((data) => passwordMutation.mutate(data))}>
                            <div className="max-w-md space-y-4">
                                <Input
                                    label="Current Password"
                                    type="password"
                                    leftIcon={<Key className="w-4 h-4" />}
                                    error={passwordErrors.currentPassword?.message}
                                    {...registerPassword('currentPassword')}
                                />
                                <Input
                                    label="New Password"
                                    type="password"
                                    leftIcon={<Key className="w-4 h-4" />}
                                    error={passwordErrors.newPassword?.message}
                                    {...registerPassword('newPassword')}
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    leftIcon={<Key className="w-4 h-4" />}
                                    error={passwordErrors.confirmPassword?.message}
                                    {...registerPassword('confirmPassword')}
                                />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    leftIcon={<Key className="w-4 h-4" />}
                                    isLoading={passwordMutation.isPending}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

                {/* Preferences Section */}
                <Card>
                    <CardHeader title="Preferences" subtitle="Customize your experience" />
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-[var(--color-neutral-400)]" />
                                    <div>
                                        <p className="font-medium text-[var(--color-neutral-900)]">Email Notifications</p>
                                        <p className="text-sm text-[var(--color-neutral-500)]">
                                            Receive email updates about invoices and payments
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={emailNotifications}
                                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <Palette className="w-5 h-5 text-[var(--color-neutral-400)]" />
                                    <div>
                                        <p className="font-medium text-[var(--color-neutral-900)]">Invoice Branding</p>
                                        <p className="text-sm text-[var(--color-neutral-500)]">
                                            Show your logo on invoices
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={invoiceBranding}
                                        onChange={(e) => handlePreferenceChange('invoiceBranding', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-[var(--color-neutral-400)]" />
                                    <div>
                                        <p className="font-medium text-[var(--color-neutral-900)]">Nepali Date Display</p>
                                        <p className="text-sm text-[var(--color-neutral-500)]">
                                            Show dates in Bikram Sambat (B.S.) calendar
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={useBikramSambat}
                                        onChange={(e) => handlePreferenceChange('bikramSambatDates', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Danger Zone */}
                <Card className="border-[var(--color-danger-200)]">
                    <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--color-neutral-900)]">Delete Account</p>
                                <p className="text-sm text-[var(--color-neutral-500)]">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <Button variant="danger">Delete Account</Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
