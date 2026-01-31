import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import {
    Calculator,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Shield,
    Zap,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

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
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed');
        }
    };

    return (
        <div className="animate-fade-in min-h-screen flex overflow-hidden">
            {/* Left side - Branding (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 flex-col justify-between relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 mb-8 group">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">AFOCE</span>
                    </Link>

                    <div className="space-y-3 max-w-lg">
                        <h1 className="text-4xl font-bold text-white mb-2 leading-tight">
                            Welcome back to
                            <span className="block text-primary-100 mt-1">Nepal's Smart Business OS</span>
                        </h1>
                        <p className="text-base text-primary-100/90">
                            Continue managing your invoices, tracking expenses, and staying IRD-compliant.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 space-y-3">
                    <div className="flex items-start gap-3 text-white/95 hover:bg-white/5 p-2 rounded-lg transition-all duration-200">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1 text-sm">Bank-Grade Security</h3>
                            <p className="text-xs text-primary-100/80">Your data is encrypted and protected 24/7</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 text-white/95 hover:bg-white/5 p-2 rounded-lg transition-all duration-200">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1 text-sm">Real-Time Sync</h3>
                            <p className="text-xs text-primary-100/80">Access your data from anywhere, anytime</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-primary-200 text-xs">
                    © 2026 AFOCE. Built for Nepal's SMEs.
                </div>
            </div>

            {/* Right side - Login Form (Optimized for single screen) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-neutral-50 to-white overflow-y-auto">
                <div className="w-full max-w-md my-auto">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-4">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-neutral-900">AFOCE</span>
                        </Link>
                    </div>

                    <div className="text-center mb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">Sign in</h2>
                        <p className="text-sm text-neutral-600">Access your dashboard</p>
                    </div>

                    <Card className="shadow-xl border-0">
                        <CardBody className="p-5 sm:p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                                {error && (
                                    <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-xs flex items-center gap-2">
                                        <span className="font-medium">{error}</span>
                                    </div>
                                )}

                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@business.com"
                                    leftIcon={<Mail className="w-4 h-4" />}
                                    error={errors.email?.message}
                                    {...register('email')}
                                    onFocus={clearError}
                                />

                                <div className="relative">
                                    <Input
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="w-4 h-4" />}
                                        error={errors.password?.message}
                                        {...register('password')}
                                        onFocus={clearError}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-3.5 h-3.5 rounded border-neutral-300 text-primary-600"
                                        />
                                        <span className="text-neutral-600">Remember</span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Forgot?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="md"
                                    isLoading={isLoading}
                                >
                                    Sign in
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-white text-neutral-500">New to AFOCE?</span>
                                </div>
                            </div>

                            <Link to="/register">
                                <Button variant="outline" className="w-full" size="md">
                                    Create account
                                </Button>
                            </Link>
                        </CardBody>
                    </Card>

                    {/* Demo credentials - Compact */}
                    <div className="mt-3 p-3 rounded-lg bg-primary-50 border border-primary-200">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs flex-1">
                                <p className="font-semibold text-primary-900 mb-1">Demo Account</p>
                                <div className="space-y-0.5 text-primary-700">
                                    <p><code className="bg-white px-1.5 py-0.5 rounded text-xs">demo@nepal-accounting.com</code></p>
                                    <p><code className="bg-white px-1.5 py-0.5 rounded text-xs">password123</code></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
