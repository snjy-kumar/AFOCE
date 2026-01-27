import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { Sidebar, Header } from './Sidebar';
import { GlobalSearch } from '../common/GlobalSearch';

export const DashboardLayout: React.FC = () => {
    const { isAuthenticated, token } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // Global keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'k',
            ctrlKey: true,
            action: () => setSearchOpen(true),
            description: 'Open global search',
        },
    ]);

    // Redirect to login if not authenticated
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)]">
            {/* Sidebar - Fixed on desktop */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onSearchClick={() => setSearchOpen(true)}
            />

            {/* Main content - with left margin for fixed sidebar on desktop */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                {/* Mobile header */}
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    onSearchClick={() => setSearchOpen(true)}
                />

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Global Search */}
            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
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

// Auth layout (for login/register pages) - Full width for split-screen design
export const AuthLayout: React.FC = () => {
    const { isAuthenticated, token } = useAuthStore();

    // Redirect to dashboard if already authenticated
    if (isAuthenticated && token) {
        return <Navigate to="/dashboard" replace />;
    }

    // Full-width layout - auth pages handle their own layout
    return <Outlet />;
};
