import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { Calculator, Mail, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { apiPost } from '../../lib/api';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await apiPost('/auth/forgot-password', { email: data.email });
            setSubmittedEmail(data.email);
            setIsSubmitted(true);
            toast.success('Password reset instructions sent!');
        } catch (error) {
            // Always show success to prevent email enumeration
            setSubmittedEmail(data.email);
            setIsSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
                    <p className="text-white/70 mt-2 max-w-xs mx-auto">
                        We've sent password reset instructions to your email address
                    </p>
                </div>

                <Card className="backdrop-blur-sm bg-white/95">
                    <CardBody className="p-8 text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8 text-primary-600" />
                            </div>
                            <p className="text-neutral-700 mb-2">
                                We sent a password reset link to:
                            </p>
                            <p className="font-semibold text-neutral-900 text-lg">
                                {submittedEmail}
                            </p>
                        </div>

                        <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-neutral-900 mb-2">What's next?</h3>
                            <ul className="space-y-2 text-sm text-neutral-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 font-bold">1.</span>
                                    Check your email inbox (and spam folder)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 font-bold">2.</span>
                                    Click the reset link in the email
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 font-bold">3.</span>
                                    Create a new secure password
                                </li>
                            </ul>
                        </div>

                        <p className="text-sm text-neutral-500 mb-4">
                            Didn't receive the email? Check your spam folder or try again in a few minutes.
                        </p>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Try another email
                        </Button>
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

    return (
        <div className="animate-fade-in">
            {/* Logo */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                    <Calculator className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
                <p className="text-white/70 mt-2 max-w-xs mx-auto">
                    No worries! Enter your email and we'll send you reset instructions.
                </p>
            </div>

            <Card className="backdrop-blur-sm bg-white/95">
                <CardBody className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Security notice */}
                        <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                            <Shield className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-primary-800">
                                <p className="font-medium">Secure Password Reset</p>
                                <p className="text-primary-600 mt-0.5">
                                    The reset link will expire in 1 hour for your security.
                                </p>
                            </div>
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@business.com"
                            leftIcon={<Mail className="w-4 h-4" />}
                            error={errors.email?.message}
                            {...register('email')}
                            autoFocus
                        />

                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Send Reset Instructions
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

            {/* Help Section */}
            <div className="mt-8 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <p className="text-sm text-white/80 text-center">
                    Need help? Contact us at{' '}
                    <a href="mailto:support@afoce.com" className="text-white underline">
                        support@afoce.com
                    </a>
                </p>
            </div>
        </div>
    );
};
