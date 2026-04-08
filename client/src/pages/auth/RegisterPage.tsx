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
    Mail,
    Lock,
    FileText,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    Shield,
    Zap,
    BarChart3,
    Building2
} from 'lucide-react';

const registerSchema = z.object({
    businessName: z.string().min(2, 'Business name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain number'),
    confirmPassword: z.string(),
    panNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register: registerUser, isLoading, error, clearError } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            agreeToTerms: false,
        },
    });

    const password = watch('password', '');

    const getPasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength <= 5 ? strength : 5;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'];

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser({
                email: data.email,
                password: data.password,
                businessName: data.businessName,
                panNumber: data.panNumber,
                vatNumber: data.vatNumber,
            });
            toast.success('Account created successfully! Welcome to AFOCE.');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Registration failed');
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
                            Start your journey with Nepal's Smart Business OS
                        </h1>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">
                            Join thousands of Nepal businesses already automating their finances with AFOCE.
                        </p>
                    </div>

                    <div className="relative z-10 w-full pt-4 max-w-sm">
                        <h3 className="text-slate-900 font-bold mb-4">What you'll get:</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1 text-sm bg-white">13% VAT Automation</h4>
                                    <p className="text-[0.8rem] text-slate-500 font-medium leading-relaxed">Automatic IRD-compliant calculations</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1 text-sm bg-white">Smart Approval Workflows</h4>
                                    <p className="text-[0.8rem] text-slate-500 font-medium leading-relaxed">Enforce business policies automatically</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1 text-sm bg-white">Real-Time Analytics</h4>
                                    <p className="text-[0.8rem] text-slate-500 font-medium leading-relaxed">Track cash flow, invoices & expenses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pb-4 pt-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[0.8rem] font-bold text-slate-900 leading-none">Bikram Sambat Native</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form Area */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-slate-50/50">
                <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-[460px] my-auto">
                        {/* Mobile logo */}
                        <div className="lg:hidden text-center mb-4">
                            <Link to="/" className="inline-flex items-center gap-2">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="font-bold text-lg text-white">A</span>
                                </div>
                                <span className="text-xl font-bold text-slate-900">AFOCE</span>
                            </Link>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 mb-1.5 tracking-tight">Create your account</h2>
                            <p className="text-[0.9rem] text-slate-500 font-medium">
                                Start your 14-day free trial.
                            </p>
                        </div>

                        <Card className="shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden mb-6">
                            <CardBody className="p-6">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-2">
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Business Name</label>
                                        <Input
                                            type="text"
                                            placeholder="Your Business Pvt. Ltd."
                                            leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
                                            error={errors.businessName?.message}
                                            {...register('businessName')}
                                            onFocus={clearError}
                                            className="h-10 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="you@business.com"
                                            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                                            error={errors.email?.message}
                                            {...register('email')}
                                            onFocus={clearError}
                                            className="h-10 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Password</label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                                                    error={errors.password?.message}
                                                    {...register('password')}
                                                    className="h-10 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">Confirm Password</label>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                                                    error={errors.confirmPassword?.message}
                                                    {...register('confirmPassword')}
                                                    className="h-10 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                                    tabIndex={-1}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password Strength */}
                                    {password && password.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1.5 flex-1 rounded-full transition-colors ${level <= passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0">
                                        <div>
                                            <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">PAN Number</label>
                                            <Input
                                                placeholder="Optional"
                                                leftIcon={<FileText className="w-4 h-4 text-slate-400" />}
                                                {...register('panNumber')}
                                                className="h-10 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[0.7rem] font-bold text-slate-700 mb-1">VAT Number</label>
                                            <Input
                                                placeholder="Optional"
                                                leftIcon={<FileText className="w-4 h-4 text-slate-400" />}
                                                {...register('vatNumber')}
                                                className="h-10 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Terms Checkbox */}
                                    <div className="pt-1 pb-1">
                                        <label className="flex items-start gap-2.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                {...register('agreeToTerms')}
                                                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-slate-600">
                                                I agree to the <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Privacy Policy</a>
                                            </span>
                                        </label>
                                        {errors.agreeToTerms && (
                                            <p className="text-red-500 text-xs font-semibold mt-1 ml-6">{errors.agreeToTerms.message}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
                                        isLoading={isLoading}
                                    >
                                        Create Account
                                        <ArrowRight className="w-4 h-4 ml-1.5" />
                                    </Button>
                                </form>
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-3 bg-white text-slate-400 font-medium tracking-wide">Already have an account?</span>
                                    </div>
                                </div>

                                <Link to="/login" className="w-full">
                                    <Button variant="outline" className="w-full h-10 rounded-lg border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 text-sm">
                                        Sign in instead
                                    </Button>
                                </Link>
                            </CardBody>
                        </Card>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-5 text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest pb-4">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                14-day trial
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-blue-500" />
                                No credit card required
                            </span>
                        </div>                 </div>
                </div>
            </div>
        </div>
    );
};
