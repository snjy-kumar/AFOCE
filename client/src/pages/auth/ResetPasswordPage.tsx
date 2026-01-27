import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { Calculator, Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { apiPost } from '../../lib/api';

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const token = searchParams.get('token');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const password = watch('password', '');

    // Password strength indicator
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
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

    useEffect(() => {
        // Validate token on mount
        if (!token) {
            setIsValidToken(false);
            return;
        }

        // Token format validation (basic check)
        if (token.length < 20) {
            setIsValidToken(false);
            return;
        }

        setIsValidToken(true);
    }, [token]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return;

        setIsLoading(true);
        try {
            await apiPost('/auth/reset-password', {
                token,
                password: data.password,
            });
            setIsSubmitted(true);
            toast.success('Password reset successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    // Invalid or expired token
    if (isValidToken === false) {
        return (
            <div className="animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/20 backdrop-blur-sm mb-4">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Invalid or Expired Link</h1>
                    <p className="text-white/70 mt-2 max-w-xs mx-auto">
                        This password reset link is invalid or has expired.
                    </p>
                </div>

                <Card className="backdrop-blur-sm bg-white/95">
                    <CardBody className="p-8 text-center">
                        <p className="text-neutral-600 mb-6">
                            Password reset links expire after 1 hour for security reasons.
                            Please request a new password reset link.
                        </p>

                        <Link to="/forgot-password">
                            <Button className="w-full" size="lg">
                                Request New Reset Link
                            </Button>
                        </Link>
                    </CardBody>
                </Card>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Success state
    if (isSubmitted) {
        return (
            <div className="animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-500/20 backdrop-blur-sm mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Password Reset Complete!</h1>
                    <p className="text-white/70 mt-2 max-w-xs mx-auto">
                        Your password has been successfully updated.
                    </p>
                </div>

                <Card className="backdrop-blur-sm bg-white/95">
                    <CardBody className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-neutral-600 mb-6">
                            You can now sign in with your new password.
                            Make sure to remember it or save it securely.
                        </p>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => navigate('/login')}
                        >
                            Sign In Now
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Loading token validation
    if (isValidToken === null) {
        return (
            <div className="animate-fade-in text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
                <p className="text-white">Validating reset link...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                    <Calculator className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Create New Password</h1>
                <p className="text-white/70 mt-2 max-w-xs mx-auto">
                    Choose a strong password to secure your account
                </p>
            </div>

            <Card className="backdrop-blur-sm bg-white/95">
                <CardBody className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="relative">
                            <Input
                                label="New Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                leftIcon={<Lock className="w-4 h-4" />}
                                error={errors.password?.message}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${level <= passwordStrength
                                                    ? strengthColors[passwordStrength - 1]
                                                    : 'bg-neutral-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-neutral-500">
                                    Password strength: <span className="font-medium">{strengthLabels[passwordStrength - 1] || 'Too weak'}</span>
                                </p>
                            </div>
                        )}

                        <div className="relative">
                            <Input
                                label="Confirm New Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                leftIcon={<Lock className="w-4 h-4" />}
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-neutral-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-neutral-700 mb-2">Password must have:</p>
                            <ul className="space-y-1 text-sm">
                                {[
                                    { label: 'At least 8 characters', check: password.length >= 8 },
                                    { label: 'One uppercase letter', check: /[A-Z]/.test(password) },
                                    { label: 'One lowercase letter', check: /[a-z]/.test(password) },
                                    { label: 'One number', check: /[0-9]/.test(password) },
                                ].map((req, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <CheckCircle2
                                            className={`w-4 h-4 ${req.check ? 'text-green-500' : 'text-neutral-300'}`}
                                        />
                                        <span className={req.check ? 'text-neutral-700' : 'text-neutral-400'}>
                                            {req.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Reset Password
                        </Button>
                    </form>
                </CardBody>
            </Card>

            <div className="mt-6 text-center">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
};
