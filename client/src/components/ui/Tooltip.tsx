import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

/**
 * Tooltip - Accessible tooltip built on Radix UI.
 * Supports keyboard activation, screen readers, and proper positioning.
 */

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            'z-50 overflow-hidden rounded-md px-3 py-1.5 text-sm',
            'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]',
            'shadow-md',
            // Animations
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2',
            className
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ============================================
// Simple Tooltip Component (for easy usage)
// ============================================

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    className?: string;
}

/**
 * Tooltip - Simple tooltip wrapper for common use cases.
 * 
 * @example
 * <Tooltip content="Save changes">
 *   <Button>Save</Button>
 * </Tooltip>
 */
export function Tooltip({
    children,
    content,
    side = 'top',
    align = 'center',
    delayDuration = 200,
    className,
}: TooltipProps) {
    return (
        <TooltipProvider>
            <TooltipRoot delayDuration={delayDuration}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side={side} align={align} className={className}>
                    {content}
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
}

// Export primitives for advanced usage
export {
    TooltipProvider,
    TooltipRoot,
    TooltipTrigger,
    TooltipContent,
};
