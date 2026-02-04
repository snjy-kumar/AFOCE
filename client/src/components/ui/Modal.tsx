import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// Animation variants
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const contentVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 10,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: {
            duration: 0.15,
        },
    },
};

interface ModalProps {
    // New API (Radix-style)
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    // Legacy API (backwards compatibility)
    isOpen?: boolean;
    onClose?: () => void;
    // Common props
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    children: React.ReactNode;
    className?: string;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
};

/**
 * Modal - Accessible dialog component with smooth animations.
 * Built on Radix UI Dialog + Framer Motion.
 * 
 * Supports both:
 * - New API: open, onOpenChange
 * - Legacy API: isOpen, onClose (for backwards compatibility)
 */
export function Modal({
    open,
    onOpenChange,
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
    className,
}: ModalProps) {
    // Support both APIs
    const isModalOpen = open ?? isOpen ?? false;
    const handleOpenChange = (value: boolean) => {
        if (onOpenChange) {
            onOpenChange(value);
        } else if (onClose && !value) {
            onClose();
        }
    };


    return (
        <Dialog.Root open={isModalOpen} onOpenChange={handleOpenChange}>
            <AnimatePresence>
                {isModalOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={overlayVariants}
                                transition={{ duration: 0.2 }}
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                className={cn(
                                    'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
                                    sizeClasses[size],
                                    'bg-[hsl(var(--card))] rounded-xl shadow-2xl border border-[hsl(var(--border))]',
                                    'focus:outline-none max-h-[85vh] overflow-y-auto',
                                    className
                                )}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={contentVariants}
                            >
                                {title ? (
                                    <>
                                        <ModalHeader>{title}</ModalHeader>
                                        <ModalBody>{children}</ModalBody>
                                    </>
                                ) : (
                                    children
                                )}
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}

interface ModalHeaderProps {
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

export function ModalHeader({
    children,
    className,
    showCloseButton = true,
}: ModalHeaderProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]',
                className
            )}
        >
            <Dialog.Title className="text-lg font-semibold text-[hsl(var(--foreground))]">
                {children}
            </Dialog.Title>
            {showCloseButton && (
                <Dialog.Close asChild>
                    <button
                        className={cn(
                            'rounded-lg p-2 text-[hsl(var(--muted-foreground))]',
                            'hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
                            'transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
                        )}
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </Dialog.Close>
            )}
        </div>
    );
}

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
    return (
        <div className={cn('px-6 py-4', className)}>
            <Dialog.Description asChild>
                <div>{children}</div>
            </Dialog.Description>
        </div>
    );
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-3 px-6 py-4',
                'border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50',
                className
            )}
        >
            {children}
        </div>
    );
}

// Re-export Dialog primitives for advanced usage
export { Dialog };
