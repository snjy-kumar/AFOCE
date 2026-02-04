import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Input - Accessible form input with label, error states, and icons.
 * Uses HSL color variables for consistent theming.
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, leftIcon, rightIcon, id, type, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                    >
                        {label}
                        {props.required && (
                            <span className="text-[hsl(var(--destructive))] ml-1">*</span>
                        )}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        className={cn(
                            // Base styles
                            'flex h-10 w-full rounded-lg border px-3 py-2 text-sm',
                            'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]',
                            'ring-offset-[hsl(var(--background))]',
                            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                            'placeholder:text-[hsl(var(--muted-foreground))]',
                            // Focus states
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                            'transition-all duration-200',
                            // Error state
                            error
                                ? 'border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]'
                                : 'border-[hsl(var(--input))] focus-visible:ring-[hsl(var(--ring))]',
                            // Disabled state
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            // Icon padding
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-[hsl(var(--destructive))]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

/**
 * Textarea - Multi-line text input with consistent styling.
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                    >
                        {label}
                        {props.required && (
                            <span className="text-[hsl(var(--destructive))] ml-1">*</span>
                        )}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        // Base styles
                        'flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm',
                        'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]',
                        'ring-offset-[hsl(var(--background))]',
                        'placeholder:text-[hsl(var(--muted-foreground))]',
                        // Focus states
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        'transition-all duration-200',
                        // Error state
                        error
                            ? 'border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]'
                            : 'border-[hsl(var(--input))] focus-visible:ring-[hsl(var(--ring))]',
                        // Disabled state
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        className
                    )}
                    rows={4}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-[hsl(var(--destructive))]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
