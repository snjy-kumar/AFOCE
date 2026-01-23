import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when a component error occurs
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = (): void => {
        window.location.href = '/dashboard';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-[var(--color-neutral-50)] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-[var(--color-danger-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-[var(--color-danger-600)]" />
                        </div>

                        <h1 className="text-2xl font-bold text-[var(--color-neutral-900)] mb-2">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-[var(--color-neutral-600)] mb-6">
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-[var(--color-neutral-100)] rounded-lg text-left">
                                <p className="text-xs font-mono text-[var(--color-danger-600)] mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="text-xs text-[var(--color-neutral-600)]">
                                        <summary className="cursor-pointer font-medium mb-1">
                                            Stack trace
                                        </summary>
                                        <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                leftIcon={<Home className="w-4 h-4" />}
                                onClick={this.handleGoHome}
                            >
                                Go to Dashboard
                            </Button>
                            <Button
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                                onClick={this.handleReset}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
