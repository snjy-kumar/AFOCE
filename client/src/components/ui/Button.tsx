import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

        const variants = {
            primary: `
        bg-[var(--color-primary-600)] text-white shadow-md hover:shadow-lg
        hover:bg-[var(--color-primary-700)]
        focus:ring-[var(--color-primary-500)]
        active:bg-[var(--color-primary-800)]
      `,
            secondary: `
        bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border border-[var(--color-neutral-200)] shadow-sm
        hover:bg-[var(--color-neutral-200)] hover:shadow
        focus:ring-[var(--color-neutral-400)]
        active:bg-[var(--color-neutral-300)]
      `,
            outline: `
        border-2 border-[var(--color-neutral-300)] text-[var(--color-neutral-700)] bg-white shadow-sm hover:shadow
        hover:bg-[var(--color-neutral-50)] hover:border-[var(--color-neutral-400)]
        focus:ring-[var(--color-neutral-400)]
      `,
            ghost: `
        text-[var(--color-neutral-600)]
        hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)]
        focus:ring-[var(--color-neutral-400)]
      `,
            danger: `
        bg-[var(--color-danger-600)] text-white shadow-md hover:shadow-lg
        hover:bg-[var(--color-danger-700)]
        focus:ring-[var(--color-danger-500)]
        active:bg-[var(--color-danger-800)]
      `,
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : leftIcon ? (
                    leftIcon
                ) : null}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';
