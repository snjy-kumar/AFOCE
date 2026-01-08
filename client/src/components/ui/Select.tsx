import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-[var(--color-danger-500)] ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            `w-full px-4 py-2.5 text-sm rounded-lg border transition-all duration-200
               bg-white text-[var(--color-neutral-900)]
               focus:outline-none focus:ring-2 focus:ring-offset-0
               appearance-none cursor-pointer`,
                            error
                                ? 'border-[var(--color-danger-500)] focus:ring-[var(--color-danger-200)] focus:border-[var(--color-danger-500)]'
                                : 'border-[var(--color-neutral-300)] focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-500)]',
                            props.disabled && 'bg-[var(--color-neutral-100)] cursor-not-allowed',
                            !props.value && 'text-[var(--color-neutral-400)]',
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-neutral-400)]">
                        <ChevronDown className="w-4 h-4" />
                    </div>
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

Select.displayName = 'Select';
