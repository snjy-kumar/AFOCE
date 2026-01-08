import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { Calculator, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
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
                <h1 className="text-2xl font-bold text-white">Nepal Accounting</h1>
                <p className="text-white/70 mt-1">Sign in to your account</p>
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
                            label="Email Address"
                            type="email"
                            placeholder="you@business.com"
                            leftIcon={<Mail className="w-4 h-4" />}
                            error={errors.email?.message}
                            {...register('email')}
                            onFocus={clearError}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            leftIcon={<Lock className="w-4 h-4" />}
                            error={errors.password?.message}
                            {...register('password')}
                            onFocus={clearError}
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                                />
                                <span className="text-sm text-[var(--color-neutral-600)]">Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Sign in
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--color-neutral-600)]">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardBody>
            </Card>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <p className="text-sm text-white/80 text-center">
                    <strong>Demo:</strong> demo@nepal-accounting.com / password123
                </p>
            </div>
        </div>
    );
};
