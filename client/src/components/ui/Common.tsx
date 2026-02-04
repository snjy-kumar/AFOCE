import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

// Re-export components from their individual files for backwards compatibility
export { StatusBadge, Badge } from './Badge';
export { EmptyState, NoResults } from './EmptyState';

/**
 * Spinner - Loading indicator component.
 */
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
            className={cn(
                'animate-spin text-[hsl(var(--primary))]',
                sizes[size],
                className
            )}
        />
    );
};

/**
 * LoadingOverlay - Full overlay with spinner and message.
 */
interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    message = 'Loading...',
}) => {
    return (
        <div className="absolute inset-0 bg-[hsl(var(--background))]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
                {message}
            </p>
        </div>
    );
};

/**
 * Avatar - User/entity avatar with image or initials fallback.
 */
interface AvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    name,
    size = 'md',
    className,
}) => {
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
                'rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
                'flex items-center justify-center font-medium',
                sizes[size],
                className
            )}
        >
            {initials}
        </div>
    );
};

/**
 * Divider - Horizontal line with optional label.
 */
interface DividerProps {
    label?: string;
    className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className }) => {
    if (label) {
        return (
            <div className={cn('flex items-center gap-4', className)}>
                <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {label}
                </span>
                <div className="flex-1 h-px bg-[hsl(var(--border))]" />
            </div>
        );
    }

    return <div className={cn('h-px bg-[hsl(var(--border))]', className)} />;
};
