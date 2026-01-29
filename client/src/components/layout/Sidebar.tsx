import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../ui/Common';
import { NotificationCenter } from '../common/NotificationCenter';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { CompanySelector } from '../common/CompanySelector';
import { apiGet } from '../../lib/api';
import {
    LayoutDashboard,
    FileText,
    Receipt,
    Users,
    Building2,
    BookOpen,
    Calculator,
    Landmark,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Search,
    Shield,
    Bell,
    TrendingUp,
    Package,
    FolderKanban,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Vendors', href: '/vendors', icon: Building2 },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Accounts', href: '/accounts', icon: BookOpen },
    { name: 'VAT', href: '/vat', icon: Calculator },
    { name: 'Bank', href: '/bank', icon: Landmark },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Admin', href: '/admin', icon: Shield },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSearchClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onSearchClick }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--color-neutral-200)] shadow-lg lg:shadow-none transform transition-transform duration-300 flex flex-col',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-neutral-200)]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-[var(--color-neutral-900)]">Nepal</h1>
                            <p className="text-xs text-[var(--color-neutral-500)]">Accounting</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-neutral-100)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Company Selector */}
                <div className="px-3 py-2 border-b border-[var(--color-neutral-200)]">
                    <CompanySelector />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {/* Search button */}
                    {onSearchClick && (
                        <button
                            onClick={() => {
                                onSearchClick();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg text-sm font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)] transition-all duration-200"
                        >
                            <Search className="w-5 h-5" />
                            <span>Search</span>
                            <span className="ml-auto text-xs text-[var(--color-neutral-400)]">Ctrl+K</span>
                        </button>
                    )}

                    <ul className="space-y-1">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.href}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                                                : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)]'
                                        )
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User section */}
                <div className="p-3 border-t border-[var(--color-neutral-200)]">
                    {/* Language Switcher for Desktop */}
                    <div className="mb-2 hidden lg:block">
                        <LanguageSwitcher compact={false} />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors"
                        >
                            <Avatar name={user?.businessName || 'User'} size="sm" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-[var(--color-neutral-900)] truncate">
                                    {user?.businessName || 'Business'}
                                </p>
                                <p className="text-xs text-[var(--color-neutral-500)] truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <ChevronDown
                                className={cn(
                                    'w-4 h-4 text-[var(--color-neutral-400)] transition-transform',
                                    showUserMenu && 'rotate-180'
                                )}
                            />
                        </button>

                        {/* User dropdown */}
                        {showUserMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-[var(--color-neutral-200)] py-1 animate-slide-up">
                                <NavLink
                                    to="/settings"
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        onClose();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)]"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

// Header for mobile
interface HeaderProps {
    onMenuClick: () => void;
    onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onSearchClick }) => {
    const [showNotifications, setShowNotifications] = React.useState(false);

    // Fetch notification count
    const { data: notificationData } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => apiGet<{ notifications: any[]; unreadCount: number }>('/workflow/notifications'),
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const notifications = Array.isArray(notificationData?.notifications)
        ? notificationData.notifications
        : [];

    const unreadCount = typeof notificationData?.unreadCount === 'number'
        ? notificationData.unreadCount
        : notifications.filter((n: any) => n?.status !== 'READ').length;

    return (
        <header className="h-16 bg-white border-b border-[var(--color-neutral-200)] flex items-center px-4 lg:hidden">
            <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-[var(--color-neutral-100)]"
            >
                <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 flex justify-center">
                <span className="text-lg font-semibold text-[var(--color-neutral-900)]">
                    AFOCE
                </span>
            </div>
            <div className="flex items-center gap-1">
                {/* Language Switcher */}
                <LanguageSwitcher compact />

                {/* Notification bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 rounded-lg hover:bg-[var(--color-neutral-100)] relative"
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {/* Unread badge */}
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[1.25rem] h-5 px-1 bg-[var(--color-danger-500)] text-white text-xs font-semibold rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <NotificationCenter
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />
                </div>

                {onSearchClick && (
                    <button
                        onClick={onSearchClick}
                        className="p-2 rounded-lg hover:bg-[var(--color-neutral-100)]"
                        title="Search (Ctrl+K)"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                )}
            </div>
        </header>
    );
};
