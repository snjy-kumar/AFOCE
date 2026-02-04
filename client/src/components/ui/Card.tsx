import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Card variants using CVA for consistent styling.
 */
const cardVariants = cva(
    'rounded-xl border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] overflow-hidden transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'border-[hsl(var(--border))] shadow-sm',
                elevated: 'border-[hsl(var(--border))] shadow-lg hover:shadow-xl',
                ghost: 'border-transparent shadow-none bg-transparent',
                interactive: `
                    border-[hsl(var(--border))] shadow-sm cursor-pointer
                    hover:shadow-lg hover:border-[hsl(var(--primary))]/30 hover:-translate-y-0.5
                `,
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant }), className)}
            {...props}
        />
    )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        title?: string;
        subtitle?: string;
        action?: React.ReactNode;
    }
>(({ className, title, subtitle, action, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex items-center justify-between gap-4 px-6 py-4 border-b border-[hsl(var(--border))]',
            className
        )}
        {...props}
    >
        {children || (
            <>
                <div className="flex-1 min-w-0">
                    {title && (
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-[hsl(var(--foreground))]">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </>
        )}
    </div>
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'text-lg font-semibold leading-none tracking-tight',
            className
        )}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-[hsl(var(--muted-foreground))]', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

const CardBody = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
));
CardBody.displayName = 'CardBody';

// Alias for shadcn/ui compatibility
const CardContent = CardBody;

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex items-center px-6 py-4 bg-[hsl(var(--muted))]/50 border-t border-[hsl(var(--border))]',
            className
        )}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardBody,
    CardContent,
    CardFooter,
    cardVariants,
};
