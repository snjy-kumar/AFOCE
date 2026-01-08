import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
}) => {
    // Close on escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[90vw]',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full bg-white rounded-xl shadow-xl animate-slide-up',
                    sizes[size]
                )}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-neutral-200)]">
                        <h2 className="text-lg font-semibold text-[var(--color-neutral-900)]">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors"
                        >
                            <X className="w-5 h-5 text-[var(--color-neutral-500)]" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => {
    return <div className={cn('p-6', className)}>{children}</div>;
};

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-3 px-6 py-4 bg-[var(--color-neutral-50)] border-t border-[var(--color-neutral-200)]',
                className
            )}
        >
            {children}
        </div>
    );
};
