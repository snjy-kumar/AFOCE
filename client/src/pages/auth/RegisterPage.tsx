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
    Building2,
    FileText,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    Shield,
    Zap,
    BarChart3
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

    // Password strength calculation
    const getPasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

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
        <div className="animate-fade-in min-h-screen flex">
            {/* Left side - Branding (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 mb-12 group">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                            <Calculator className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">AFOCE</span>
                    </Link>

                    <div className="space-y-4 max-w-lg">
                        <h1 className="text-5xl font-bold text-white mb-3 leading-[1.1] tracking-tight">
                            Start your journey with
                            <span className="block text-primary-100 mt-2">Nepal's Smart Business OS</span>
                        </h1>
                        <p className="text-lg text-primary-100/90 leading-relaxed">
                            Join thousands of Nepal businesses already automating their finances with AFOCE.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <h3 className="text-white/90 font-medium text-base mb-6">What you'll get:</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 text-white/95 hover:bg-white/5 p-3 rounded-lg transition-all duration-200 -ml-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1.5">13% VAT Automation</h4>
                                <p className="text-sm text-primary-100/80 leading-relaxed">Automatic IRD-compliant calculations</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-white/95 hover:bg-white/5 p-3 rounded-lg transition-all duration-200 -ml-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1.5">Smart Approval Workflows</h4>
                                <p className="text-sm text-primary-100/80 leading-relaxed">Enforce business policies automatically</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-white/95 hover:bg-white/5 p-3 rounded-lg transition-all duration-200 -ml-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1.5">Real-Time Analytics</h4>
                                <p className="text-sm text-primary-100/80 leading-relaxed">Track cash flow, invoices & expenses</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 text-white/90">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Bikram Sambat Native</h4>
                            <p className="text-sm text-primary-200">Full Nepali calendar support</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-primary-200 text-sm">
                    © 2026 AFOCE. Built for Nepal's SMEs.
                </div>
            </div>

            {/* Right side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-neutral-50 to-white overflow-y-auto">
                <div className="w-full max-w-lg">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-6">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                                <Calculator className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-neutral-900">AFOCE</span>
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">Create your account</h2>
                        <p className="text-base text-neutral-600 leading-relaxed">
                            Start your 14-day free trial. No credit card required.
                        </p>
                    </div>

                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <CardBody className="p-6 sm:p-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {error && (
                                    <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-danger-600 text-xs font-bold">!</span>
                                        </div>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Input
                                    label="Business Name"
                                    placeholder="Your Business Pvt. Ltd."
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Input
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            leftIcon={<Lock className="w-4 h-4" />}
                                            error={errors.password?.message}
                                            {...register('password')}
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

                                    <div className="relative">
                                        <Input
                                            label="Confirm Password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            leftIcon={<Lock className="w-4 h-4" />}
                                            error={errors.confirmPassword?.message}
                                            {...register('confirmPassword')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Strength */}
                                {password && (
                                    <div className="space-y-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1.5 flex-1 rounded-full transition-colors ${level <= passwordStrength
                                                        ? strengthColors[passwordStrength]
                                                        : 'bg-neutral-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-neutral-500">
                                            Password strength: <span className="font-medium">{strengthLabels[passwordStrength]}</span>
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                {/* Terms Checkbox */}
                                <div className="pt-2">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            {...register('agreeToTerms')}
                                            className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                                        />
                                        <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                                            I agree to the{' '}
                                            <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                                            {' '}and{' '}
                                            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                                        </span>
                                    </label>
                                    {errors.agreeToTerms && (
                                        <p className="text-danger-600 text-xs mt-1 ml-7">{errors.agreeToTerms.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    isLoading={isLoading}
                                >
                                    Create Account
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-neutral-500">Already have an account?</span>
                                </div>
                            </div>

                            <Link to="/login">
                                <Button variant="outline" className="w-full" size="lg">
                                    Sign in instead
                                </Button>
                            </Link>
                        </CardBody>
                    </Card>

                    {/* Trust indicators */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-600">
                        <span className="flex items-center gap-2 hover:text-neutral-900 transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-success-500" />
                            <span className="font-medium">14-day free trial</span>
                        </span>
                        <span className="flex items-center gap-2 hover:text-neutral-900 transition-colors">
                            <Shield className="w-4 h-4 text-primary-500" />
                            <span className="font-medium">No credit card required</span>
                        </span>
                        <span className="flex items-center gap-2 hover:text-neutral-900 transition-colors">
                            <Lock className="w-4 h-4 text-primary-500" />
                            <span className="font-medium">Bank-grade security</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
