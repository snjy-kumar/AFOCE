import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
            return savedTheme || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                'relative inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300',
                'bg-neutral-100 hover:bg-neutral-200',
                'dark:bg-neutral-800 dark:hover:bg-neutral-700',
                className
            )}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className="relative w-10 h-5 rounded-full bg-neutral-300 dark:bg-neutral-600 transition-colors">
                <div
                    className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300',
                        theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                />
            </div>
            <div className="flex items-center gap-2">
                {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-warning-600" />
                ) : (
                    <Moon className="w-4 h-4 text-primary-400" />
                )}
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {theme === 'light' ? 'Light' : 'Dark'}
                </span>
            </div>
        </button>
    );
};

export default ThemeToggle;
