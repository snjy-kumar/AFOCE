/**
 * Language Switcher Component
 * 
 * Allows users to toggle between English and Nepali languages.
 * Also includes option to toggle Bikram Sambat date display.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Calendar, Check } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface LanguageSwitcherProps {
    showDateToggle?: boolean;
    compact?: boolean;
    className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    showDateToggle = true,
    compact = false,
    className = '',
}) => {
    const { language, setLanguage, useBikramSambat, setUseBikramSambat } = useI18n();
    const { setLanguage: setStoreLang, setUseBikramSambat: setStoreBS } = usePreferencesStore();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync both stores
    const handleLanguageChange = (lang: 'en' | 'ne') => {
        setLanguage(lang);
        setStoreLang(lang);
        setIsOpen(false);
    };

    const handleBSToggle = () => {
        const newValue = !useBikramSambat;
        setUseBikramSambat(newValue);
        setStoreBS(newValue);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const languages = [
        { code: 'en' as const, name: 'English', nativeName: 'English', flag: '🇬🇧' },
        { code: 'ne' as const, name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
    ];

    const currentLang = languages.find(l => l.code === language) || languages[0];

    if (compact) {
        return (
            <button
                onClick={() => handleLanguageChange(language === 'en' ? 'ne' : 'en')}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors ${className}`}
                title={`Switch to ${language === 'en' ? 'Nepali' : 'English'}`}
            >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="text-sm font-medium text-neutral-700">{currentLang.code.toUpperCase()}</span>
            </button>
        );
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
                <Globe className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">{currentLang.nativeName}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                    {/* Language Options */}
                    <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        Language
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 transition-colors ${language === lang.code ? 'bg-primary-50' : ''
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-neutral-900">{lang.nativeName}</div>
                                <div className="text-xs text-neutral-500">{lang.name}</div>
                            </div>
                            {language === lang.code && (
                                <Check className="w-4 h-4 text-primary-600" />
                            )}
                        </button>
                    ))}

                    {showDateToggle && (
                        <>
                            <div className="my-2 border-t border-neutral-100" />
                            <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                                Date Format
                            </div>
                            <button
                                onClick={handleBSToggle}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 transition-colors"
                            >
                                <Calendar className="w-5 h-5 text-neutral-400" />
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-neutral-900">
                                        Bikram Sambat (B.S.)
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        {useBikramSambat ? 'Currently using Nepali calendar' : 'Currently using Gregorian calendar'}
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full transition-colors ${useBikramSambat ? 'bg-primary-600' : 'bg-neutral-200'
                                    }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${useBikramSambat ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                                        }`} />
                                </div>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Simple language toggle button for header/navbar
 */
export const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
    const { language, setLanguage } = useI18n();
    const { setLanguage: setStoreLang } = usePreferencesStore();

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ne' : 'en';
        setLanguage(newLang);
        setStoreLang(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors ${className}`}
            title={`Switch to ${language === 'en' ? 'Nepali' : 'English'}`}
        >
            <span>{language === 'en' ? '🇳🇵' : '🇬🇧'}</span>
            <span className="text-xs font-medium text-neutral-600">
                {language === 'en' ? 'नेपाली' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
