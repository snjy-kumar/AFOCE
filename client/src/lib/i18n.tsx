/**
 * Internationalization (i18n) System for AFOCE
 * 
 * Supports English and Nepali languages with:
 * - Translation strings
 * - Number formatting
 * - Currency formatting
 * - Date formatting
 * - Pluralization
 */

import { toNepaliNumeral, formatBSDate, adToBS } from './nepaliDate';

export type Language = 'en' | 'ne';

// ============================================
// TRANSLATION STRINGS
// ============================================

export const translations = {
    en: {
        // Common
        common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            create: 'Create',
            update: 'Update',
            search: 'Search',
            filter: 'Filter',
            export: 'Export',
            import: 'Import',
            loading: 'Loading...',
            noResults: 'No results found',
            confirm: 'Confirm',
            back: 'Back',
            next: 'Next',
            previous: 'Previous',
            close: 'Close',
            yes: 'Yes',
            no: 'No',
            all: 'All',
            none: 'None',
            select: 'Select',
            required: 'Required',
            optional: 'Optional',
            actions: 'Actions',
            status: 'Status',
            date: 'Date',
            amount: 'Amount',
            total: 'Total',
            subtotal: 'Subtotal',
            description: 'Description',
            notes: 'Notes',
            details: 'Details',
            view: 'View',
            download: 'Download',
            upload: 'Upload',
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            notifications: 'Notifications',
        },

        // Navigation
        nav: {
            dashboard: 'Dashboard',
            invoices: 'Invoices',
            expenses: 'Expenses',
            customers: 'Customers',
            vendors: 'Vendors',
            accounts: 'Chart of Accounts',
            bank: 'Bank & Reconciliation',
            vat: 'VAT Reports',
            reports: 'Reports',
            settings: 'Settings',
            admin: 'Admin Panel',
            inventory: 'Inventory',
            projects: 'Projects',
            analytics: 'Analytics',
            logout: 'Logout',
            profile: 'Profile',
        },

        // Dashboard
        dashboard: {
            title: 'Dashboard',
            totalRevenue: 'Total Revenue',
            totalExpenses: 'Total Expenses',
            netProfit: 'Net Profit',
            outstandingInvoices: 'Outstanding Invoices',
            vatPayable: 'VAT Payable',
            pendingApprovals: 'Pending Approvals',
            overdueInvoices: 'Overdue Invoices',
            missingReceipts: 'Missing Receipts',
            recentInvoices: 'Recent Invoices',
            recentExpenses: 'Recent Expenses',
            thisMonth: 'This Month',
            thisYear: 'This Year',
            fiscalYear: 'Fiscal Year',
        },

        // Invoices
        invoices: {
            title: 'Invoices',
            newInvoice: 'New Invoice',
            editInvoice: 'Edit Invoice',
            invoiceNumber: 'Invoice Number',
            customer: 'Customer',
            issueDate: 'Issue Date',
            dueDate: 'Due Date',
            status: 'Status',
            items: 'Items',
            addItem: 'Add Item',
            removeItem: 'Remove Item',
            quantity: 'Quantity',
            rate: 'Rate',
            vatRate: 'VAT Rate',
            discount: 'Discount',
            terms: 'Terms & Conditions',
            info: 'जानकारी',
            notifications: 'सूचनाहरू',
            markAsPaid: 'Mark as Paid',
            downloadPdf: 'Download PDF',
            duplicateInvoice: 'Duplicate Invoice',
            statuses: {
                DRAFT: 'Draft',
                PENDING_APPROVAL: 'Pending Approval',
                APPROVED: 'Approved',
                REJECTED: 'Rejected',
                SENT: 'Sent',
                PAID: 'Paid',
                PARTIALLY_PAID: 'Partially Paid',
                OVERDUE: 'Overdue',
                CANCELLED: 'Cancelled',
            },
        },

        // Expenses
        expenses: {
            title: 'Expenses',
            newExpense: 'New Expense',
            editExpense: 'Edit Expense',
            expenseNumber: 'Expense Number',
            vendor: 'Vendor',
            category: 'Category',
            receipt: 'Receipt',
            uploadReceipt: 'Upload Receipt',
            noReceipt: 'No Receipt',
            markAsPaid: 'Mark as Paid',
            statuses: {
                PENDING: 'Pending',
                APPROVED: 'Approved',
                REJECTED: 'Rejected',
                PAID: 'Paid',
            },
        },

        // Customers
        customers: {
            title: 'Customers',
            newCustomer: 'New Customer',
            editCustomer: 'Edit Customer',
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            panNumber: 'PAN Number',
            address: 'Address',
            totalInvoices: 'Total Invoices',
            outstandingBalance: 'Outstanding Balance',
        },

        // Vendors
        vendors: {
            title: 'Vendors',
            newVendor: 'New Vendor',
            editVendor: 'Edit Vendor',
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            panNumber: 'PAN Number',
            address: 'Address',
            totalExpenses: 'Total Expenses',
        },

        // VAT
        vat: {
            title: 'VAT Reports',
            period: 'Period',
            salesVat: 'Sales VAT (Output)',
            purchaseVat: 'Purchase VAT (Input)',
            netVat: 'Net VAT Payable',
            filedDate: 'Filed Date',
            status: 'Status',
            fileReturn: 'File Return',
            statuses: {
                PENDING: 'Pending',
                FILED: 'Filed',
                PAID: 'Paid',
            },
        },

        // Workflow
        workflow: {
            submitForApproval: 'Submit for Approval',
            approve: 'Approve',
            reject: 'Reject',
            approvalRequired: 'Approval Required',
            approved: 'Approved',
            rejected: 'Rejected',
            pendingApproval: 'Pending Approval',
            approvedBy: 'Approved by',
            rejectedBy: 'Rejected by',
            rejectionReason: 'Rejection Reason',
            approvalHistory: 'Approval History',
            noApprovalNeeded: 'No approval needed',
        },

        // Admin
        admin: {
            title: 'Admin Panel',
            workflowRules: 'Workflow Rules',
            createRule: 'Create Rule',
            editRule: 'Edit Rule',
            deleteRule: 'Delete Rule',
            ruleName: 'Rule Name',
            ruleDescription: 'Description',
            condition: 'Condition',
            action: 'Action',
            priority: 'Priority',
            isActive: 'Active',
            inventory: 'भण्डार',
            projects: 'परियोजनाहरू',
            analytics: 'विश्लेषण',
            actions: {
                REQUIRE_APPROVAL: 'Require Approval',
                BLOCK: 'Block',
                WARN: 'Show Warning',
                NOTIFY: 'Send Notification',
            },
        },

        // Settings
        settings: {
            title: 'Settings',
            businessProfile: 'Business Profile',
            businessName: 'Business Name',
            changePassword: 'Change Password',
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            confirmPassword: 'Confirm Password',
            preferences: 'Preferences',
            emailNotifications: 'Email Notifications',
            bikramSambatDates: 'Nepali Date Display',
            invoiceBranding: 'Invoice Branding',
            language: 'Language',
            dangerZone: 'Danger Zone',
            deleteAccount: 'Delete Account',
        },

        // Auth
        auth: {
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            email: 'Email',
            password: 'Password',
            forgotPassword: 'Forgot Password?',
            rememberMe: 'Remember Me',
            noAccount: "Don't have an account?",
            hasAccount: 'Already have an account?',
            signUp: 'Sign Up',
            signIn: 'Sign In',
        },

        // Errors
        errors: {
            required: 'This field is required',
            invalidEmail: 'Invalid email address',
            minLength: 'Must be at least {min} characters',
            maxLength: 'Must be at most {max} characters',
            invalidDate: 'Invalid date',
            invalidNumber: 'Invalid number',
            serverError: 'Server error. Please try again.',
            networkError: 'Network error. Check your connection.',
            unauthorized: 'Unauthorized. Please login again.',
            notFound: 'Not found',
            validationError: 'Validation error',
        },

        // Success messages
        success: {
            created: '{item} created successfully',
            updated: '{item} updated successfully',
            deleted: '{item} deleted successfully',
            saved: 'Changes saved successfully',
            submitted: 'Submitted for approval',
            approved: 'Approved successfully',
            rejected: 'Rejected',
        },
    },

    ne: {
        // Common
        common: {
            save: 'सुरक्षित गर्नुहोस्',
            cancel: 'रद्द गर्नुहोस्',
            delete: 'मेट्नुहोस्',
            edit: 'सम्पादन',
            create: 'बनाउनुहोस्',
            update: 'अद्यावधिक',
            search: 'खोज्नुहोस्',
            filter: 'फिल्टर',
            export: 'निर्यात',
            import: 'आयात',
            loading: 'लोड हुँदैछ...',
            noResults: 'कुनै परिणाम भेटिएन',
            confirm: 'पुष्टि गर्नुहोस्',
            back: 'पछाडि',
            next: 'अर्को',
            previous: 'अघिल्लो',
            close: 'बन्द गर्नुहोस्',
            yes: 'हो',
            no: 'होइन',
            all: 'सबै',
            none: 'कुनै पनि होइन',
            select: 'छान्नुहोस्',
            required: 'आवश्यक',
            optional: 'वैकल्पिक',
            actions: 'कार्यहरू',
            status: 'स्थिति',
            date: 'मिति',
            amount: 'रकम',
            total: 'कुल',
            subtotal: 'उप-कुल',
            description: 'विवरण',
            notes: 'टिप्पणी',
            details: 'विवरण',
            view: 'हेर्नुहोस्',
            download: 'डाउनलोड',
            upload: 'अपलोड',
            success: 'सफलता',
            error: 'त्रुटि',
            warning: 'चेतावनी',
            info: 'जानकारी',
        },

        // Navigation
        nav: {
            dashboard: 'ड्यासबोर्ड',
            invoices: 'बिलहरू',
            expenses: 'खर्चहरू',
            customers: 'ग्राहकहरू',
            vendors: 'आपूर्तिकर्ताहरू',
            accounts: 'लेखा विवरण',
            bank: 'बैंक तथा समायोजन',
            vat: 'भ्याट प्रतिवेदन',
            reports: 'प्रतिवेदनहरू',
            settings: 'सेटिङहरू',
            admin: 'प्रशासन',
            logout: 'लगआउट',
            profile: 'प्रोफाइल',
        },

        // Dashboard
        dashboard: {
            title: 'ड्यासबोर्ड',
            totalRevenue: 'कुल आम्दानी',
            totalExpenses: 'कुल खर्च',
            netProfit: 'खुद नाफा',
            outstandingInvoices: 'बाँकी बिलहरू',
            vatPayable: 'भ्याट तिर्नुपर्ने',
            pendingApprovals: 'पेन्डिङ स्वीकृतिहरू',
            overdueInvoices: 'म्याद सकिएका बिलहरू',
            missingReceipts: 'हराएका रसिदहरू',
            recentInvoices: 'हालका बिलहरू',
            recentExpenses: 'हालका खर्चहरू',
            thisMonth: 'यो महिना',
            thisYear: 'यो वर्ष',
            fiscalYear: 'आर्थिक वर्ष',
        },

        // Invoices
        invoices: {
            title: 'बिलहरू',
            newInvoice: 'नयाँ बिल',
            editInvoice: 'बिल सम्पादन',
            invoiceNumber: 'बिल नम्बर',
            customer: 'ग्राहक',
            issueDate: 'जारी मिति',
            dueDate: 'भुक्तानी मिति',
            status: 'स्थिति',
            items: 'वस्तुहरू',
            addItem: 'वस्तु थप्नुहोस्',
            removeItem: 'वस्तु हटाउनुहोस्',
            quantity: 'परिमाण',
            rate: 'दर',
            vatRate: 'भ्याट दर',
            discount: 'छुट',
            terms: 'सर्तहरू',
            sendToCustomer: 'ग्राहकलाई पठाउनुहोस्',
            markAsPaid: 'भुक्तान भएको चिन्ह लगाउनुहोस्',
            downloadPdf: 'PDF डाउनलोड',
            duplicateInvoice: 'बिल नक्कल',
            statuses: {
                DRAFT: 'ड्राफ्ट',
                PENDING_APPROVAL: 'स्वीकृतिको प्रतीक्षामा',
                APPROVED: 'स्वीकृत',
                REJECTED: 'अस्वीकृत',
                SENT: 'पठाइएको',
                PAID: 'भुक्तान भएको',
                PARTIALLY_PAID: 'आंशिक भुक्तान',
                OVERDUE: 'म्याद सकिएको',
                CANCELLED: 'रद्द गरिएको',
            },
        },

        // Expenses
        expenses: {
            title: 'खर्चहरू',
            newExpense: 'नयाँ खर्च',
            editExpense: 'खर्च सम्पादन',
            expenseNumber: 'खर्च नम्बर',
            vendor: 'आपूर्तिकर्ता',
            category: 'श्रेणी',
            receipt: 'रसिद',
            uploadReceipt: 'रसिद अपलोड',
            noReceipt: 'रसिद छैन',
            markAsPaid: 'भुक्तान भएको चिन्ह लगाउनुहोस्',
            statuses: {
                PENDING: 'पेन्डिङ',
                APPROVED: 'स्वीकृत',
                REJECTED: 'अस्वीकृत',
                PAID: 'भुक्तान भएको',
            },
        },

        // Customers
        customers: {
            title: 'ग्राहकहरू',
            newCustomer: 'नयाँ ग्राहक',
            editCustomer: 'ग्राहक सम्पादन',
            name: 'नाम',
            email: 'इमेल',
            phone: 'फोन',
            panNumber: 'प्यान नम्बर',
            address: 'ठेगाना',
            totalInvoices: 'कुल बिलहरू',
            outstandingBalance: 'बाँकी रकम',
        },

        // Vendors
        vendors: {
            title: 'आपूर्तिकर्ताहरू',
            newVendor: 'नयाँ आपूर्तिकर्ता',
            editVendor: 'आपूर्तिकर्ता सम्पादन',
            name: 'नाम',
            email: 'इमेल',
            phone: 'फोन',
            panNumber: 'प्यान नम्बर',
            address: 'ठेगाना',
            totalExpenses: 'कुल खर्चहरू',
        },

        // VAT
        vat: {
            title: 'भ्याट प्रतिवेदन',
            period: 'अवधि',
            salesVat: 'बिक्री भ्याट (आउटपुट)',
            purchaseVat: 'खरिद भ्याट (इनपुट)',
            netVat: 'कुल भ्याट तिर्नुपर्ने',
            filedDate: 'दाखिला मिति',
            status: 'स्थिति',
            fileReturn: 'रिटर्न दाखिला',
            statuses: {
                PENDING: 'पेन्डिङ',
                FILED: 'दाखिला भएको',
                PAID: 'भुक्तान भएको',
            },
        },

        // Workflow
        workflow: {
            submitForApproval: 'स्वीकृतिको लागि पेश गर्नुहोस्',
            approve: 'स्वीकृत गर्नुहोस्',
            reject: 'अस्वीकृत गर्नुहोस्',
            approvalRequired: 'स्वीकृति आवश्यक',
            approved: 'स्वीकृत',
            rejected: 'अस्वीकृत',
            pendingApproval: 'स्वीकृतिको प्रतीक्षामा',
            approvedBy: 'द्वारा स्वीकृत',
            rejectedBy: 'द्वारा अस्वीकृत',
            rejectionReason: 'अस्वीकृतिको कारण',
            approvalHistory: 'स्वीकृति इतिहास',
            noApprovalNeeded: 'स्वीकृति आवश्यक छैन',
        },

        // Admin
        admin: {
            title: 'प्रशासन प्यानल',
            workflowRules: 'कार्यप्रवाह नियमहरू',
            createRule: 'नियम बनाउनुहोस्',
            editRule: 'नियम सम्पादन',
            deleteRule: 'नियम मेट्नुहोस्',
            ruleName: 'नियम नाम',
            ruleDescription: 'विवरण',
            condition: 'सर्त',
            action: 'कार्य',
            priority: 'प्राथमिकता',
            isActive: 'सक्रिय',
            actions: {
                REQUIRE_APPROVAL: 'स्वीकृति आवश्यक',
                BLOCK: 'रोक्नुहोस्',
                WARN: 'चेतावनी देखाउनुहोस्',
                NOTIFY: 'सूचना पठाउनुहोस्',
            },
        },

        // Settings
        settings: {
            title: 'सेटिङहरू',
            businessProfile: 'व्यापार प्रोफाइल',
            businessName: 'व्यापारको नाम',
            changePassword: 'पासवर्ड परिवर्तन',
            currentPassword: 'हालको पासवर्ड',
            newPassword: 'नयाँ पासवर्ड',
            confirmPassword: 'पासवर्ड पुष्टि',
            preferences: 'प्राथमिकताहरू',
            emailNotifications: 'इमेल सूचनाहरू',
            bikramSambatDates: 'नेपाली मिति प्रदर्शन',
            invoiceBranding: 'बिल ब्रान्डिङ',
            language: 'भाषा',
            dangerZone: 'खतरा क्षेत्र',
            deleteAccount: 'खाता मेट्नुहोस्',
        },

        // Auth
        auth: {
            login: 'लगइन',
            register: 'दर्ता',
            logout: 'लगआउट',
            email: 'इमेल',
            password: 'पासवर्ड',
            forgotPassword: 'पासवर्ड बिर्सनुभयो?',
            rememberMe: 'मलाई सम्झनुहोस्',
            noAccount: 'खाता छैन?',
            hasAccount: 'पहिले नै खाता छ?',
            signUp: 'साइन अप',
            signIn: 'साइन इन',
        },

        // Errors
        errors: {
            required: 'यो फिल्ड आवश्यक छ',
            invalidEmail: 'अमान्य इमेल ठेगाना',
            minLength: 'कम्तीमा {min} वर्ण हुनुपर्छ',
            maxLength: 'बढीमा {max} वर्ण हुनुपर्छ',
            invalidDate: 'अमान्य मिति',
            invalidNumber: 'अमान्य संख्या',
            serverError: 'सर्भर त्रुटि। कृपया पुन: प्रयास गर्नुहोस्।',
            networkError: 'नेटवर्क त्रुटि। तपाईंको जडान जाँच गर्नुहोस्।',
            unauthorized: 'अनधिकृत। कृपया फेरि लगइन गर्नुहोस्।',
            notFound: 'भेटिएन',
            validationError: 'प्रमाणीकरण त्रुटि',
        },

        // Success messages
        success: {
            created: '{item} सफलतापूर्वक बनाइयो',
            updated: '{item} सफलतापूर्वक अद्यावधिक भयो',
            deleted: '{item} सफलतापूर्वक मेटियो',
            saved: 'परिवर्तनहरू सुरक्षित भए',
            submitted: 'स्वीकृतिको लागि पेश गरियो',
            approved: 'सफलतापूर्वक स्वीकृत भयो',
            rejected: 'अस्वीकृत भयो',
        },
    },
} as const;

export type TranslationKeys = typeof translations.en;

// ============================================
// I18N CONTEXT AND HOOKS
// ============================================

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
    formatCurrency: (amount: number) => string;
    formatDate: (date: Date | string, format?: 'short' | 'long') => string;
    formatBSDate: (date: Date | string) => string;
    useBikramSambat: boolean;
    setUseBikramSambat: (use: boolean) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
    children: ReactNode;
    defaultLanguage?: Language;
    defaultUseBikramSambat?: boolean;
}

export function I18nProvider({
    children,
    defaultLanguage = 'en',
    defaultUseBikramSambat = false
}: I18nProviderProps) {
    const [language, setLanguageState] = useState<Language>(() => {
        // Try to get from localStorage
        const stored = localStorage.getItem('language');
        return (stored === 'en' || stored === 'ne') ? stored : defaultLanguage;
    });

    const [useBikramSambat, setUseBikramSambatState] = useState<boolean>(() => {
        const stored = localStorage.getItem('useBikramSambat');
        return stored ? stored === 'true' : defaultUseBikramSambat;
    });

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    }, []);

    const setUseBikramSambat = useCallback((use: boolean) => {
        setUseBikramSambatState(use);
        localStorage.setItem('useBikramSambat', String(use));
    }, []);

    // Get nested translation by dot-notation key
    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English
                value = translations.en;
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        return key; // Key not found
                    }
                }
                break;
            }
        }

        if (typeof value !== 'string') {
            return key;
        }

        // Replace parameters
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
            });
        }

        return value;
    }, [language]);

    const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions): string => {
        if (language === 'ne') {
            // Format with English numerals first, then convert to Nepali
            const formatted = new Intl.NumberFormat('en-IN', options).format(num);
            return toNepaliNumeral(formatted);
        }
        return new Intl.NumberFormat('en-IN', options).format(num);
    }, [language]);

    const formatCurrency = useCallback((amount: number): string => {
        const formatted = formatNumber(amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (language === 'ne') {
            return `रु ${formatted}`;
        }
        return `NPR ${formatted}`;
    }, [formatNumber, language]);

    const formatDateFn = useCallback((date: Date | string, format: 'short' | 'long' = 'short'): string => {
        const d = typeof date === 'string' ? new Date(date) : date;

        if (useBikramSambat) {
            const bs = adToBS(d);
            return formatBSDate(bs, format, language);
        }

        const options: Intl.DateTimeFormatOptions = format === 'long'
            ? { year: 'numeric', month: 'long', day: 'numeric' }
            : { year: 'numeric', month: '2-digit', day: '2-digit' };

        return new Intl.DateTimeFormat(language === 'ne' ? 'ne-NP' : 'en-GB', options).format(d);
    }, [language, useBikramSambat]);

    const formatBSDateFn = useCallback((date: Date | string): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const bs = adToBS(d);
        return formatBSDate(bs, 'long', language);
    }, [language]);

    return (
        <I18nContext.Provider
            value={{
                language,
                setLanguage,
                t,
                formatNumber,
                formatCurrency,
                formatDate: formatDateFn,
                formatBSDate: formatBSDateFn,
                useBikramSambat,
                setUseBikramSambat,
            }}
        >
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

// Shorthand hook for translations only
export function useTranslation() {
    const { t, language } = useI18n();
    return { t, language };
}

// Hook for date formatting
export function useDateFormat() {
    const { formatDate, formatBSDate, useBikramSambat, language } = useI18n();
    return { formatDate, formatBSDate, useBikramSambat, language };
}

// Hook for number/currency formatting
export function useNumberFormat() {
    const { formatNumber, formatCurrency, language } = useI18n();
    return { formatNumber, formatCurrency, language };
}

export default { I18nProvider, useI18n, useTranslation, useDateFormat, useNumberFormat };
