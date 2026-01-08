import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { Calculator, Mail, Lock, Building2, FileText } from 'lucide-react';

const registerSchema = z.object({
    businessName: z.string().min(2, 'Business name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    panNumber: z.string().optional(),
    vatNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register: registerUser, isLoading, error, clearError } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser({
                email: data.email,
                password: data.password,
                businessName: data.businessName,
                panNumber: data.panNumber,
                vatNumber: data.vatNumber,
            });
            navigate('/dashboard');
        } catch {
            // Error is handled in store
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Logo */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                    <Calculator className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Create Account</h1>
                <p className="text-white/70 mt-1">Start managing your finances</p>
            </div>

            <Card className="backdrop-blur-sm bg-white/95">
                <CardBody className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-[var(--color-danger-50)] text-[var(--color-danger-700)] text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Business Name"
                            placeholder="Your Business Ltd."
                            leftIcon={<Building2 className="w-4 h-4" />}
                            error={errors.businessName?.message}
                            {...register('businessName')}
                            onFocus={clearError}
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@business.com"
                            leftIcon={<Mail className="w-4 h-4" />}
                            error={errors.email?.message}
                            {...register('email')}
                            onFocus={clearError}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                leftIcon={<Lock className="w-4 h-4" />}
                                error={errors.password?.message}
                                {...register('password')}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                leftIcon={<Lock className="w-4 h-4" />}
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="PAN Number"
                                placeholder="Optional"
                                leftIcon={<FileText className="w-4 h-4" />}
                                {...register('panNumber')}
                                helperText="Permanent Account Number"
                            />

                            <Input
                                label="VAT Number"
                                placeholder="Optional"
                                leftIcon={<FileText className="w-4 h-4" />}
                                {...register('vatNumber')}
                                helperText="VAT Registration Number"
                            />
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--color-neutral-600)]">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
