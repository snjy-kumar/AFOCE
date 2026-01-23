import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * Spinner component for loading states
 */

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    className,
    label,
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <Loader2
                className={cn(
                    'animate-spin text-[var(--color-primary-600)]',
                    sizes[size],
                    className
                )}
            />
            {label && (
                <p className="text-sm text-[var(--color-neutral-600)]">{label}</p>
            )}
        </div>
    );
};

/**
 * Full page loader
 */
export const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
            <Spinner size="lg" label={label} />
        </div>
    );
};
