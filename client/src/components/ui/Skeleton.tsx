import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Skeleton - Loading placeholder components.
 * Uses HSL color system for consistent theming.
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'shimmer' | 'none';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'rectangular', animation = 'pulse', ...props }, ref) => {
        const variantClasses = {
            text: 'rounded h-4',
            circular: 'rounded-full',
            rectangular: 'rounded-lg',
        };

        const animationClasses = {
            pulse: 'animate-pulse',
            shimmer: [
                'animate-shimmer',
                'bg-gradient-to-r',
                'from-[hsl(var(--muted))]',
                'via-[hsl(var(--muted))]/50',
                'to-[hsl(var(--muted))]',
                'bg-[length:200%_100%]',
            ].join(' '),
            none: '',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'bg-[hsl(var(--muted))]',
                    variantClasses[variant],
                    animationClasses[animation],
                    className
                )}
                {...props}
            />
        );
    }
);
Skeleton.displayName = 'Skeleton';

/**
 * TableSkeleton - Skeleton for data tables.
 */
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
    rows = 5,
    columns = 5,
}) => {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-10 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton key={j} className="h-12 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
};

/**
 * CardSkeleton - Skeleton for card components.
 */
export const CardSkeleton: React.FC = () => {
    return (
        <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
};

/**
 * StatsSkeleton - Skeleton for dashboard stat cards.
 */
export const StatsSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-6"
                >
                    <Skeleton className="h-4 w-20 mb-4" />
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
            ))}
        </div>
    );
};

/**
 * FormSkeleton - Skeleton for form layouts.
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
    return (
        <div className="space-y-6">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
            </div>
        </div>
    );
};
