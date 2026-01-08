import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Sidebar, Header } from './Sidebar';

export const DashboardLayout: React.FC = () => {
    const { isAuthenticated, token } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Redirect to login if not authenticated
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)] flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

// Page wrapper with title
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-neutral-900)]">{title}</h1>
                {subtitle && (
                    <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{subtitle}</p>
                )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
};

// Auth layout (for login/register pages)
export const AuthLayout: React.FC = () => {
    const { isAuthenticated, token } = useAuthStore();

    // Redirect to dashboard if already authenticated
    if (isAuthenticated && token) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-600)] via-[var(--color-primary-700)] to-[var(--color-primary-900)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
};
