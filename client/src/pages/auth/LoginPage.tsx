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
        <div className="animate-fade-in min-h-screen flex">
            {/* Left side - Branding (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Calculator className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">AFOCE</span>
                    </Link>

                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Welcome back to
                        <span className="block text-primary-200">Nepal's Smart Business OS</span>
                    </h1>
                    <p className="text-lg text-primary-100 leading-relaxed max-w-md">
                        Continue managing your invoices, tracking expenses, and staying IRD-compliant.
                    </p>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-start gap-4 text-white/90">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Bank-Grade Security</h3>
                            <p className="text-sm text-primary-200">Your data is encrypted and protected 24/7</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 text-white/90">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Real-Time Sync</h3>
                            <p className="text-sm text-primary-200">Access your data from anywhere, anytime</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-primary-200 text-sm">
                    © 2026 AFOCE. Built for Nepal's SMEs.
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-neutral-50 to-white">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                                <Calculator className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-neutral-900">AFOCE</span>
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Sign in</h2>
                        <p className="text-neutral-600">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    <Card className="shadow-xl border-0">
                        <CardBody className="p-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {error && (
                                    <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-danger-600 text-xs font-bold">!</span>
                                        </div>
                                        <span>{error}</span>
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
                                        className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                                        />
                                        <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                                            Remember me
                                        </span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    isLoading={isLoading}
                                >
                                    Sign in
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-neutral-500">New to AFOCE?</span>
                                </div>
                            </div>

                            <Link to="/register">
                                <Button variant="outline" className="w-full" size="lg">
                                    Create an account
                                </Button>
                            </Link>
                        </CardBody>
                    </Card>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-100">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-primary-900 mb-1">Demo Account Available</p>
                                <p className="text-primary-700">
                                    <span className="font-mono bg-primary-100 px-1.5 py-0.5 rounded text-xs">demo@nepal-accounting.com</span>
                                    <span className="mx-2">/</span>
                                    <span className="font-mono bg-primary-100 px-1.5 py-0.5 rounded text-xs">password123</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-8 flex items-center justify-center gap-6 text-xs text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-success-500" />
                            SSL Secured
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-primary-500" />
                            Bank-Grade Security
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
