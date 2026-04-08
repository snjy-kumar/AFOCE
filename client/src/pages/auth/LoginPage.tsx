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
        <div className="h-screen w-full flex overflow-hidden bg-white">
            {/* Left side - Fixed Content Area (Minimal White Design) */}
            <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between overflow-hidden h-full border-r border-slate-100 bg-white">
                
                <div className="space-y-12 max-h-full overflow-hidden flex flex-col pt-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="font-bold text-lg text-white">A</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">AFOCE</span>
                    </Link>

                    <div className="space-y-4 max-w-[420px]">
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">
                            Welcome back to Nepal's Smart Business OS
                        </h1>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">
                            Continue managing your invoices, tracking expenses, and staying IRD-compliant.
                        </p>
                    </div>

                    <div className="space-y-6 pt-4 flex-1">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1 text-sm bg-white">Bank-Grade Security</h3>
                                <p className="text-[0.8rem] text-slate-500 font-medium">Your data is encrypted and protected 24/7</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1 text-sm bg-white">Real-Time Sync</h3>
                                <p className="text-[0.8rem] text-slate-500 font-medium">Access your data from anywhere, anytime</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pb-4 pt-12 text-sm font-semibold text-slate-400">
                    © {new Date().getFullYear()} AFOCE. Built for Nepal's SMEs.
                </div>
            </div>

            {/* Right side - Form Area */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-slate-50/50">
                <div className="min-h-full flex items-center justify-center p-6 lg:p-8">
                    <div className="w-full max-w-md my-auto">
                        {/* Mobile logo */}
                        <div className="lg:hidden text-center mb-8">
                            <Link to="/" className="inline-flex items-center gap-2">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="font-bold text-lg text-white">A</span>
                                </div>
                                <span className="text-xl font-bold text-slate-900">AFOCE</span>
                            </Link>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Sign in</h2>
                            <p className="text-[0.95rem] text-slate-500 font-medium">Access your dashboard</p>
                        </div>

                        <Card className="shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden bg-white">
                            <CardBody className="p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-2">
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[0.75rem] font-bold text-slate-700 mb-1.5">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="you@business.com"
                                            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                                            error={errors.email?.message}
                                            {...register('email')}
                                            onFocus={clearError}
                                            className="h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[0.75rem] font-bold text-slate-700 mb-1.5">Password</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                                                error={errors.password?.message}
                                                {...register('password')}
                                                onFocus={clearError}
                                                className="h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm pt-1 mb-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-600 font-medium">Remember</span>
                                        </label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            Forgot?
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                        isLoading={isLoading}
                                    >
                                        Sign in
                                        <ArrowRight className="w-4 h-4 ml-1.5" />
                                    </Button>
                                </form>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-3 bg-white text-slate-400 font-medium">New to AFOCE?</span>
                                    </div>
                                </div>

                                <Link to="/register">
                                    <Button variant="outline" className="w-full h-11 rounded-lg border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
                                        Create account
                                    </Button>
                                </Link>
                            </CardBody>
                        </Card>

                        {/* Demo credentials */}
                        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs flex-1">
                                    <p className="font-semibold text-slate-900 mb-1">Demo Account</p>
                                    <div className="space-y-0.5 text-slate-600">
                                        <p>demo@nepal-accounting.com</p>
                                        <p>password123</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
