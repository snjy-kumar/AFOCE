import React from 'react';
import { cn } from '../../lib/utils';
import { FileText, Plus } from 'lucide-react';
import { Button } from './Button';

/**
 * Empty state component for better UX when no data exists
 */

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                'animate-in fade-in-0 duration-500',
                className
            )}
        >
            {/* Icon */}
            <div className="mb-4 p-3 rounded-full bg-[var(--color-neutral-100)]">
                {icon || <FileText className="w-12 h-12 text-[var(--color-neutral-400)]" />}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-[var(--color-neutral-900)] mb-2">
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-sm text-[var(--color-neutral-600)] max-w-md mb-6">
                    {description}
                </p>
            )}

            {/* Action */}
            {action && (
                <Button onClick={action.onClick} className="gap-2">
                    {action.icon || <Plus className="w-4 h-4" />}
                    {action.label}
                </Button>
            )}
        </div>
    );
};
