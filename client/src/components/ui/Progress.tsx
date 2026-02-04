import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Progress - Linear progress indicator with animations.
 */

interface ProgressProps {
    value: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'destructive';
    showLabel?: boolean;
    animated?: boolean;
    className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    size = 'md',
    variant = 'default',
    showLabel = false,
    animated = true,
    className,
}) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    const variants = {
        default: 'bg-[hsl(var(--primary))]',
        success: 'bg-[hsl(var(--success))]',
        warning: 'bg-[hsl(var(--warning))]',
        destructive: 'bg-[hsl(var(--destructive))]',
    };

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Progress
                    </span>
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {clampedValue}%
                    </span>
                </div>
            )}
            <div
                className={cn(
                    'w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden',
                    sizes[size]
                )}
            >
                <motion.div
                    className={cn('h-full rounded-full', variants[variant])}
                    initial={animated ? { width: 0 } : false}
                    animate={{ width: `${clampedValue}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
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
 * CircularProgress - Circular/ring progress indicator.
 */
interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    variant?: 'default' | 'success' | 'warning' | 'destructive';
    showLabel?: boolean;
    animated?: boolean;
    className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 120,
    strokeWidth = 8,
    variant = 'default',
    showLabel = true,
    animated = true,
    className,
}) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (clampedValue / 100) * circumference;

    const getStrokeColor = () => {
        switch (variant) {
            case 'success':
                return 'hsl(var(--success))';
            case 'warning':
                return 'hsl(var(--warning))';
            case 'destructive':
                return 'hsl(var(--destructive))';
            default:
                return 'hsl(var(--primary))';
        }
    };

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center',
                className
            )}
        >
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getStrokeColor()}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    initial={animated ? { strokeDashoffset: circumference } : false}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    strokeLinecap="round"
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className="text-xl font-bold text-[hsl(var(--foreground))]"
                        initial={animated ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {clampedValue}%
                    </motion.span>
                </div>
            )}
        </div>
    );
};
