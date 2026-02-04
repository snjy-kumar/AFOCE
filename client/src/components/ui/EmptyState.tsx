import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * EmptyState - Placeholder for empty lists/pages with optional CTA.
 * Includes subtle animation for visual appeal.
 */

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
                'flex flex-col items-center justify-center py-12 px-6 text-center',
                className
            )}
        >
            {icon && (
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                        'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    )}
                >
                    {icon}
                </motion.div>
            )}
            <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">
                {title}
            </h3>
            {description && (
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-sm">
                    {description}
                </p>
            )}
            {action && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-6"
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    );
};

/**
 * NoResults - Specific empty state for search results.
 */
interface NoResultsProps {
    query?: string;
    onClear?: () => void;
}

export const NoResults: React.FC<NoResultsProps> = ({ query, onClear }) => {
    return (
        <EmptyState
            icon={
                <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            }
            title="No results found"
            description={
                query
                    ? `No results found for "${query}". Try adjusting your search.`
                    : 'No results match your current filters.'
            }
            action={
                onClear && (
                    <button
                        onClick={onClear}
                        className="text-sm text-[hsl(var(--primary))] hover:underline"
                    >
                        Clear search
                    </button>
                )
            }
        />
    );
};
