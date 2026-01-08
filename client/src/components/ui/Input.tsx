import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-[var(--color-danger-500)] ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            `w-full px-4 py-2.5 text-sm rounded-lg border transition-all duration-200
               bg-white text-[var(--color-neutral-900)]
               placeholder:text-[var(--color-neutral-400)]
               focus:outline-none focus:ring-2 focus:ring-offset-0`,
                            error
                                ? 'border-[var(--color-danger-500)] focus:ring-[var(--color-danger-200)] focus:border-[var(--color-danger-500)]'
                                : 'border-[var(--color-neutral-300)] focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-500)]',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            props.disabled && 'bg-[var(--color-neutral-100)] cursor-not-allowed',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-[var(--color-danger-600)]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-[var(--color-neutral-500)]">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea Component
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
                        className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-[var(--color-danger-500)] ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        `w-full px-4 py-2.5 text-sm rounded-lg border transition-all duration-200
             bg-white text-[var(--color-neutral-900)]
             placeholder:text-[var(--color-neutral-400)]
             focus:outline-none focus:ring-2 focus:ring-offset-0
             resize-none`,
                        error
                            ? 'border-[var(--color-danger-500)] focus:ring-[var(--color-danger-200)] focus:border-[var(--color-danger-500)]'
                            : 'border-[var(--color-neutral-300)] focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-500)]',
                        props.disabled && 'bg-[var(--color-neutral-100)] cursor-not-allowed',
                        className
                    )}
                    rows={4}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-[var(--color-danger-600)]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-[var(--color-neutral-500)]">{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
