/**
 * User Preferences Store
 * 
 * Persists user preferences like language, date format, theme, etc.
 * Syncs with backend when user is authenticated.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ne';
export type DateFormat = 'ad' | 'bs';
export type Theme = 'light' | 'dark' | 'system';

interface Preferences {
  // Language & Localization
  language: Language;
  useBikramSambat: boolean;
  
  // Notifications
  emailNotifications: boolean;
  browserNotifications: boolean;
  notificationSound: boolean;
  
  // Display
  theme: Theme;
  compactMode: boolean;
  showSidebar: boolean;
  
  // Invoice Settings
  invoiceBranding: boolean;
  defaultVatRate: number;
  defaultPaymentTerms: number; // days
  
  // Data Display
  itemsPerPage: number;
  showCurrencySymbol: boolean;
  currencyPosition: 'before' | 'after';
}

interface PreferencesState extends Preferences {
  // Actions
  setLanguage: (lang: Language) => void;
  setUseBikramSambat: (use: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setBrowserNotifications: (enabled: boolean) => void;
  setTheme: (theme: Theme) => void;
  setCompactMode: (compact: boolean) => void;
  setInvoiceBranding: (enabled: boolean) => void;
  setDefaultVatRate: (rate: number) => void;
  setDefaultPaymentTerms: (days: number) => void;
  setItemsPerPage: (count: number) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_PREFERENCES: Preferences = {
  language: 'en',
  useBikramSambat: false,
  emailNotifications: true,
  browserNotifications: true,
  notificationSound: true,
  theme: 'light',
  compactMode: false,
  showSidebar: true,
  invoiceBranding: true,
  defaultVatRate: 13,
  defaultPaymentTerms: 30,
  itemsPerPage: 20,
  showCurrencySymbol: true,
  currencyPosition: 'before',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      
      setLanguage: (language) => {
        set({ language });
        document.documentElement.lang = language;
        // Update localStorage for i18n provider to pick up
        localStorage.setItem('language', language);
      },
      
      setUseBikramSambat: (useBikramSambat) => {
        set({ useBikramSambat });
        localStorage.setItem('useBikramSambat', String(useBikramSambat));
      },
      
      setEmailNotifications: (emailNotifications) => set({ emailNotifications }),
      
      setBrowserNotifications: (browserNotifications) => {
        set({ browserNotifications });
        // Request browser notification permission if enabling
        if (browserNotifications && 'Notification' in window) {
          Notification.requestPermission();
        }
      },
      
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
      },
      
      setCompactMode: (compactMode) => set({ compactMode }),
      
      setInvoiceBranding: (invoiceBranding) => set({ invoiceBranding }),
      
      setDefaultVatRate: (defaultVatRate) => set({ defaultVatRate }),
      
      setDefaultPaymentTerms: (defaultPaymentTerms) => set({ defaultPaymentTerms }),
      
      setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),
      
      updatePreferences: (prefs) => set((state) => ({ ...state, ...prefs })),
      
      resetToDefaults: () => set(DEFAULT_PREFERENCES),
    }),
    {
      name: 'afoce-preferences',
      version: 1,
    }
  )
);

// Selector hooks for common preference groups
export const useLanguagePrefs = () => {
  const { language, useBikramSambat, setLanguage, setUseBikramSambat } = usePreferencesStore();
  return { language, useBikramSambat, setLanguage, setUseBikramSambat };
};

export const useNotificationPrefs = () => {
  const { emailNotifications, browserNotifications, notificationSound, setEmailNotifications, setBrowserNotifications } = usePreferencesStore();
  return { emailNotifications, browserNotifications, notificationSound, setEmailNotifications, setBrowserNotifications };
};

export const useDisplayPrefs = () => {
  const { theme, compactMode, showSidebar, setTheme, setCompactMode } = usePreferencesStore();
  return { theme, compactMode, showSidebar, setTheme, setCompactMode };
};

export const useInvoicePrefs = () => {
  const { invoiceBranding, defaultVatRate, defaultPaymentTerms, setInvoiceBranding, setDefaultVatRate, setDefaultPaymentTerms } = usePreferencesStore();
  return { invoiceBranding, defaultVatRate, defaultPaymentTerms, setInvoiceBranding, setDefaultVatRate, setDefaultPaymentTerms };
};

export default usePreferencesStore;
