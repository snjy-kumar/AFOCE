import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Badge variants using CVA for type-safe, composable styles.
 */
const badgeVariants = cva(
    'inline-flex items-center rounded-full border font-medium transition-colors',
    {
        variants: {
            variant: {
                default: `
                    bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]
                    border-[hsl(var(--primary))]/20
                `,
                secondary: `
                    bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]
                    border-transparent
                `,
                success: `
                    bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]
                    border-[hsl(var(--success))]/20
                `,
                warning: `
                    bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]
                    border-[hsl(var(--warning))]/20
                `,
                destructive: `
                    bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]
                    border-[hsl(var(--destructive))]/20
                `,
                outline: `
                    bg-transparent text-[hsl(var(--foreground))]
                    border-[hsl(var(--border))]
                `,
            },
            size: {
                sm: 'px-2 py-0.5 text-xs',
                default: 'px-2.5 py-1 text-xs',
                lg: 'px-3 py-1.5 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, size, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(badgeVariants({ variant, size }), className)}
            {...props}
        />
    )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };

// ============================================
// Legacy Status Badge (backwards compatibility)
// ============================================

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusVariantMap: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
    DRAFT: 'secondary',
    SENT: 'warning',
    PAID: 'success',
    PARTIALLY_PAID: 'warning',
    OVERDUE: 'destructive',
    CANCELLED: 'destructive',
    PENDING: 'warning',
    PENDING_APPROVAL: 'warning',
    APPROVED: 'success',
    REJECTED: 'destructive',
    FILED: 'default',
    ACTIVE: 'success',
    INACTIVE: 'secondary',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variant = statusVariantMap[status] || 'secondary';
    const displayText = status.replace(/_/g, ' ').toLowerCase();

    return (
        <Badge variant={variant} className={cn('capitalize', className)}>
            {displayText}
        </Badge>
    );
}
