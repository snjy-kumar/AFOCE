import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * Button variants using class-variance-authority (CVA).
 * This is the shadcn/ui pattern for type-safe, composable component variants.
 */
const buttonVariants = cva(
    // Base styles applied to all buttons
    `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg
     font-medium transition-all duration-200 ease-out
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
     disabled:pointer-events-none disabled:opacity-50
     active:scale-[0.98]`,
    {
        variants: {
            variant: {
                default: `
                    bg-[hsl(var(--primary))] text-white shadow-md
                    hover:bg-[hsl(var(--primary))]/90 hover:shadow-lg hover:-translate-y-0.5
                    focus-visible:ring-[hsl(var(--primary))]
                `,
                destructive: `
                    bg-[hsl(var(--destructive))] text-white shadow-md
                    hover:bg-[hsl(var(--destructive))]/90 hover:shadow-lg
                    focus-visible:ring-[hsl(var(--destructive))]
                `,
                // Alias for 'destructive' for backwards compatibility
                danger: `
                    bg-[hsl(var(--destructive))] text-white shadow-md
                    hover:bg-[hsl(var(--destructive))]/90 hover:shadow-lg
                    focus-visible:ring-[hsl(var(--destructive))]
                `,
                outline: `
                    border-2 border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))]
                    shadow-sm hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--accent-foreground))]/20
                    focus-visible:ring-[hsl(var(--ring))]
                `,
                secondary: `
                    bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-sm
                    hover:bg-[hsl(var(--secondary))]/80 hover:shadow
                    focus-visible:ring-[hsl(var(--secondary))]
                `,
                ghost: `
                    text-[hsl(var(--foreground))]
                    hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]
                `,
                link: `
                    text-[hsl(var(--primary))] underline-offset-4
                    hover:underline
                `,
            },
            size: {
                sm: 'h-9 px-3 text-sm',
                md: 'h-10 px-4 text-sm', // Alias for default
                default: 'h-10 px-4 text-sm',
                lg: 'h-12 px-6 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={cn(buttonVariants({ variant, size, className }))}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="shrink-0">{leftIcon}</span>
                ) : null}
                {children}
                {!isLoading && rightIcon && (
                    <span className="shrink-0">{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
