import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

// Badge Component
interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
    const variants = {
        default: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
        success: 'bg-[var(--color-success-50)] text-[var(--color-success-700)]',
        warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-600)]',
        danger: 'bg-[var(--color-danger-50)] text-[var(--color-danger-700)]',
        info: 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};

// Status Badge - Maps status strings to badge variants
interface StatusBadgeProps {
    status: string;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    const variantMap: Record<string, BadgeProps['variant']> = {
        DRAFT: 'info',
        SENT: 'warning',
        PAID: 'success',
        PARTIALLY_PAID: 'warning',
        OVERDUE: 'danger',
        CANCELLED: 'danger',
        PENDING: 'warning',
        FILED: 'info',
    };

    return (
        <Badge variant={variantMap[status] || 'default'} className={className}>
            {status.replace('_', ' ')}
        </Badge>
    );
};

// Spinner Component
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <Loader2
            className={cn('animate-spin text-[var(--color-primary-600)]', sizes[size], className)}
        />
    );
};

// Loading Overlay
interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-[var(--color-neutral-600)]">{message}</p>
        </div>
    );
};

// Empty State Component
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {icon && (
                <div className="w-16 h-16 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center mb-4 text-[var(--color-neutral-400)]">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-[var(--color-neutral-900)]">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-[var(--color-neutral-500)] max-w-sm">{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

// Avatar Component
interface AvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn('rounded-full object-cover', sizes[size], className)}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-medium',
                sizes[size],
                className
            )}
        >
            {initials}
        </div>
    );
};

// Divider Component
interface DividerProps {
    label?: string;
    className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className }) => {
    if (label) {
        return (
            <div className={cn('flex items-center gap-4', className)}>
                <div className="flex-1 h-px bg-[var(--color-neutral-200)]" />
                <span className="text-sm text-[var(--color-neutral-500)]">{label}</span>
                <div className="flex-1 h-px bg-[var(--color-neutral-200)]" />
            </div>
        );
    }

    return <div className={cn('h-px bg-[var(--color-neutral-200)]', className)} />;
};
