import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Progress bar component for visual feedback
 */

interface ProgressProps {
    value: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'danger';
    showLabel?: boolean;
    className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    size = 'md',
    variant = 'default',
    showLabel = false,
    className,
}) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    const variants = {
        default: 'bg-[var(--color-primary-600)]',
        success: 'bg-[var(--color-success-600)]',
        warning: 'bg-[var(--color-warning-600)]',
        danger: 'bg-[var(--color-danger-600)]',
    };

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                        Progress
                    </span>
                    <span className="text-sm font-medium text-[var(--color-neutral-700)]">
                        {clampedValue}%
                    </span>
                </div>
            )}
            <div className={cn('w-full bg-[var(--color-neutral-200)] rounded-full overflow-hidden', sizes[size])}>
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        variants[variant]
                    )}
                    style={{ width: `${clampedValue}%` }}
                    role="progressbar"
                    aria-valuenow={clampedValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
};

/**
 * Circular progress indicator
 */
interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    showLabel?: boolean;
    className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 120,
    strokeWidth = 8,
    variant = 'default',
    showLabel = true,
    className,
}) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (clampedValue / 100) * circumference;

    const variants = {
        default: 'stroke-[var(--color-primary-600)]',
        success: 'stroke-[var(--color-success-600)]',
        warning: 'stroke-[var(--color-warning-600)]',
        danger: 'stroke-[var(--color-danger-600)]',
    };

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="var(--color-neutral-200)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className={cn('transition-all duration-500 ease-out', variants[variant])}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[var(--color-neutral-900)]">
                        {clampedValue}%
                    </span>
                </div>
            )}
        </div>
    );
};
