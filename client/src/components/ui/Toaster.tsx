import { Toaster as SonnerToaster, toast } from 'sonner';

/**
 * Toast - Configured Sonner toaster for AFOCE.
 * Uses the app's design system colors and styling.
 */

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            expand={true}
            richColors
            closeButton
            toastOptions={{
                classNames: {
                    toast: `
                        group toast group-[.toaster]:bg-[hsl(var(--background))]
                        group-[.toaster]:text-[hsl(var(--foreground))]
                        group-[.toaster]:border-[hsl(var(--border))]
                        group-[.toaster]:shadow-lg
                        group-[.toaster]:rounded-lg
                    `,
                    description: 'group-[.toast]:text-[hsl(var(--muted-foreground))]',
                    actionButton: `
                        group-[.toast]:bg-[hsl(var(--primary))]
                        group-[.toast]:text-[hsl(var(--primary-foreground))]
                    `,
                    cancelButton: `
                        group-[.toast]:bg-[hsl(var(--muted))]
                        group-[.toast]:text-[hsl(var(--muted-foreground))]
                    `,
                    success: `
                        group-[.toaster]:bg-[hsl(var(--success))]/10
                        group-[.toaster]:border-[hsl(var(--success))]/30
                        group-[.toaster]:text-[hsl(var(--success))]
                    `,
                    error: `
                        group-[.toaster]:bg-[hsl(var(--destructive))]/10
                        group-[.toaster]:border-[hsl(var(--destructive))]/30
                        group-[.toaster]:text-[hsl(var(--destructive))]
                    `,
                    warning: `
                        group-[.toaster]:bg-[hsl(var(--warning))]/10
                        group-[.toaster]:border-[hsl(var(--warning))]/30
                        group-[.toaster]:text-[hsl(var(--warning))]
                    `,
                    info: `
                        group-[.toaster]:bg-[hsl(var(--primary))]/10
                        group-[.toaster]:border-[hsl(var(--primary))]/30
                        group-[.toaster]:text-[hsl(var(--primary))]
                    `,
                },
            }}
        />
    );
}

// Re-export toast function for convenience
export { toast };

/**
 * Helper functions for common toast types.
 * These provide a cleaner API with consistent styling.
 */
export const showToast = {
    success: (message: string, description?: string) => {
        toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
        toast.error(message, { description });
    },
    warning: (message: string, description?: string) => {
        toast.warning(message, { description });
    },
    info: (message: string, description?: string) => {
        toast.info(message, { description });
    },
    loading: (message: string) => {
        return toast.loading(message);
    },
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: unknown) => string);
        }
    ) => {
        return toast.promise(promise, messages);
    },
    dismiss: (id?: string | number) => {
        toast.dismiss(id);
    },
};
