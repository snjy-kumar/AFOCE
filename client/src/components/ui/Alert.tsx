import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Alert/Banner component for important messages
 */

interface AlertProps {
    variant?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    children: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    children,
    onClose,
    className,
}) => {
    const variants = {
        success: {
            container: 'bg-[var(--color-success-50)] border-[var(--color-success-200)] text-[var(--color-success-900)]',
            icon: <CheckCircle2 className="w-5 h-5 text-[var(--color-success-600)]" />,
        },
        error: {
            container: 'bg-[var(--color-danger-50)] border-[var(--color-danger-200)] text-[var(--color-danger-900)]',
            icon: <AlertCircle className="w-5 h-5 text-[var(--color-danger-600)]" />,
        },
        warning: {
            container: 'bg-[var(--color-warning-50)] border-[var(--color-warning-200)] text-[var(--color-warning-900)]',
            icon: <AlertTriangle className="w-5 h-5 text-[var(--color-warning-600)]" />,
        },
        info: {
            container: 'bg-[var(--color-primary-50)] border-[var(--color-primary-200)] text-[var(--color-primary-900)]',
            icon: <Info className="w-5 h-5 text-[var(--color-primary-600)]" />,
        },
    };

    const config = variants[variant];

    return (
        <div
            className={cn(
                'rounded-lg border p-4 flex gap-3',
                'animate-in slide-in-from-top-2 fade-in-0 duration-300',
                config.container,
                className
            )}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1 min-w-0">
                {title && (
                    <h4 className="font-semibold mb-1">{title}</h4>
                )}
                <div className="text-sm">{children}</div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Close alert"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
