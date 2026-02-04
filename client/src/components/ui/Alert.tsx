import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Alert variants using CVA.
 */
const alertVariants = cva(
    'relative w-full rounded-lg border p-4 flex gap-3',
    {
        variants: {
            variant: {
                default: `
                    bg-[hsl(var(--background))] border-[hsl(var(--border))]
                    text-[hsl(var(--foreground))]
                `,
                success: `
                    bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30
                    text-[hsl(var(--success))]
                `,
                warning: `
                    bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30
                    text-[hsl(var(--warning))]
                `,
                destructive: `
                    bg-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))]/30
                    text-[hsl(var(--destructive))]
                `,
                // Alias for 'destructive' for backwards compatibility
                error: `
                    bg-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))]/30
                    text-[hsl(var(--destructive))]
                `,
                info: `
                    bg-[hsl(var(--primary))]/10 border-[hsl(var(--primary))]/30
                    text-[hsl(var(--primary))]
                `,
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    default: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    destructive: AlertCircle,
    error: AlertCircle, // Alias for destructive
    info: Info,
};

// Omit React event handlers that conflict with Framer Motion's types
type ConflictingMotionProps =
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onDragOver';

export interface AlertProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | ConflictingMotionProps>,
    VariantProps<typeof alertVariants> {
    title?: string;
    onClose?: () => void;
    showIcon?: boolean;
}

/**
 * Alert - Displays a callout for user attention.
 * Supports multiple variants and optional close button.
 */
function Alert({
    className,
    variant = 'default',
    title,
    children,
    onClose,
    showIcon = true,
    ...props
}: AlertProps) {
    const IconComponent = iconMap[variant || 'default'];

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        >
            {showIcon && (
                <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className="h-5 w-5" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                {title && (
                    <h5 className="mb-1 font-semibold leading-none tracking-tight">
                        {title}
                    </h5>
                )}
                <div className="text-sm opacity-90">{children}</div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity rounded-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </motion.div>
    );
}

const AlertTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
        {...props}
    />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('text-sm [&_p]:leading-relaxed', className)}
        {...props}
    />
));
AlertDescription.displayName = 'AlertDescription';

// Wrapper for AnimatePresence
export function AlertContainer({ children }: { children: React.ReactNode }) {
    return <AnimatePresence mode="sync">{children}</AnimatePresence>;
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
