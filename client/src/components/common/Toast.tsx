import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast notification system for user feedback
 */

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

interface ToastContextValue {
    showToast: (message: string, type: Toast['type'], duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
        (message: string, type: Toast['type'], duration: number = 5000) => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            const newToast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback(
        (message: string, duration?: number) => showToast(message, 'success', duration),
        [showToast]
    );

    const error = useCallback(
        (message: string, duration?: number) => showToast(message, 'error', duration),
        [showToast]
    );

    const warning = useCallback(
        (message: string, duration?: number) => showToast(message, 'warning', duration),
        [showToast]
    );

    const info = useCallback(
        (message: string, duration?: number) => showToast(message, 'info', duration),
        [showToast]
    );

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            {createPortal(<ToastContainer toasts={toasts} onRemove={removeToast} />, document.body)}
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const styles = {
        success: 'bg-white border-[var(--color-success-200)] text-[var(--color-success-700)]',
        error: 'bg-white border-[var(--color-danger-200)] text-[var(--color-danger-700)]',
        warning: 'bg-white border-[var(--color-warning-200)] text-[var(--color-warning-700)]',
        info: 'bg-white border-[var(--color-primary-200)] text-[var(--color-primary-700)]',
    };

    const iconColors = {
        success: 'text-[var(--color-success-600)]',
        error: 'text-[var(--color-danger-600)]',
        warning: 'text-[var(--color-warning-600)]',
        info: 'text-[var(--color-primary-600)]',
    };

    return (
        <div
            className={cn(
                'flex items-start gap-3 min-w-[320px] max-w-md p-4 rounded-lg border-2 shadow-lg pointer-events-auto',
                'animate-in slide-in-from-right-full fade-in-0 duration-300',
                styles[toast.type]
            )}
            role="alert"
        >
            <div className={cn('flex-shrink-0 mt-0.5', iconColors[toast.type])}>
                {icons[toast.type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-neutral-900)]">{toast.message}</p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] transition-colors"
                aria-label="Close notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
