import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Select - Accessible select component built on Radix UI.
 * Supports keyboard navigation, screen readers, and proper focus management.
 */

// Radix Primitives (exported for advanced usage)
const SelectRoot = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
        error?: boolean;
    }
>(({ className, children, error, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2',
            'bg-[hsl(var(--background))] text-sm',
            'ring-offset-[hsl(var(--background))]',
            'placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            '[&>span]:line-clamp-1',
            error
                ? 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive))]'
                : 'border-[hsl(var(--input))] focus:ring-[hsl(var(--ring))]',
            className
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn(
            'flex cursor-default items-center justify-center py-1',
            className
        )}
        {...props}
    >
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn(
            'flex cursor-default items-center justify-center py-1',
            className
        )}
        {...props}
    >
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg',
                'bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]',
                'border border-[hsl(var(--border))] shadow-lg',
                // Animations
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[side=bottom]:slide-in-from-top-2',
                'data-[side=left]:slide-in-from-right-2',
                'data-[side=right]:slide-in-from-left-2',
                'data-[side=top]:slide-in-from-bottom-2',
                position === 'popper' &&
                'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                className
            )}
            position={position}
            {...props}
        >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    'p-1',
                    position === 'popper' &&
                    'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
        {...props}
    />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            'relative flex w-full cursor-default select-none items-center',
            'rounded-md py-2 pl-8 pr-2 text-sm outline-none',
            'focus:bg-[hsl(var(--accent))] focus:text-[hsl(var(--accent-foreground))]',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            'transition-colors',
            className
        )}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-[hsl(var(--muted))]', className)}
        {...props}
    />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// ============================================
// Select Component (for backwards compatibility)
// ============================================
// This is the main export that matches the old API used throughout the app

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    // Support both old and new onChange signatures
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Select - Backwards-compatible select component.
 * Uses native select element to match existing API.
 * For Radix-based select, use SelectRoot with SelectTrigger, SelectContent, etc.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            options,
            placeholder,
            id,
            required,
            ...props
        },
        ref
    ) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                    >
                        {label}
                        {required && (
                            <span className="text-[hsl(var(--destructive))] ml-1">*</span>
                        )}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            'w-full px-3 py-2 pr-10 text-sm',
                            'bg-[hsl(var(--background))] rounded-lg border appearance-none',
                            'transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-offset-0',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error
                                ? 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive))]/20'
                                : 'border-[hsl(var(--input))] focus:ring-[hsl(var(--ring))]/20 focus:border-[hsl(var(--ring))]',
                            className
                        )}
                        required={required}
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
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    </div>
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
Select.displayName = 'Select';

// ============================================
// Radix Select Wrapper (for new implementations)
// ============================================

interface RadixSelectProps {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

/**
 * RadixSelect - Radix-based select for new implementations.
 * Provides better accessibility and keyboard navigation.
 */
export function RadixSelect({
    label,
    error,
    helperText,
    options,
    placeholder,
    value,
    onValueChange,
    disabled,
    required,
    className,
}: RadixSelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                    {label}
                    {required && (
                        <span className="text-[hsl(var(--destructive))] ml-1">*</span>
                    )}
                </label>
            )}
            <SelectRoot value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger error={!!error} className={className}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </SelectRoot>
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

export {
    Select,
    // Radix primitives for advanced usage
    SelectRoot,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
};
