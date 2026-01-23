import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Badge component for status indicators and labels
 */

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className,
}) => {
    const variants = {
        default: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] border-[var(--color-primary-200)]',
        success: 'bg-[var(--color-success-100)] text-[var(--color-success-700)] border-[var(--color-success-200)]',
        warning: 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)] border-[var(--color-warning-200)]',
        danger: 'bg-[var(--color-danger-100)] text-[var(--color-danger-700)] border-[var(--color-danger-200)]',
        info: 'bg-blue-100 text-blue-700 border-blue-200',
        neutral: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border-[var(--color-neutral-200)]',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full border',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
};
