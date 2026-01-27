import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export interface Company {
    id: string;
    name: string;
    nameNe?: string;
    panNumber?: string;
    vatNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    fiscalYearStart: number;
    currency: string;
    vatRate: number;
    isActive: boolean;
    role?: string;
    isDefault?: boolean;
    membershipId?: string;
    userRole?: string;
}

export interface CompanyMember {
    id: string;
    companyId: string;
    userId: string;
    role: 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'VIEWER';
    isDefault: boolean;
    isActive: boolean;
    userName?: string;
    userEmail?: string;
}

interface CompanyState {
    companies: Company[];
    activeCompany: Company | null;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    fetchCompanies: () => Promise<void>;
    fetchDefaultCompany: () => Promise<void>;
    setActiveCompany: (company: Company) => Promise<void>;
    createCompany: (data: Partial<Company>) => Promise<Company>;
    updateCompany: (id: string, data: Partial<Company>) => Promise<Company>;
    deleteCompany: (id: string) => Promise<void>;
    
    // Member management
    fetchMembers: (companyId: string) => Promise<CompanyMember[]>;
    inviteMember: (companyId: string, email: string, role: string) => Promise<CompanyMember>;
    updateMemberRole: (companyId: string, memberId: string, role: string) => Promise<void>;
    removeMember: (companyId: string, memberId: string) => Promise<void>;
    leaveCompany: (companyId: string) => Promise<void>;
    
    clearError: () => void;
}

export const useCompanyStore = create<CompanyState>()(
    persist(
        (set, get) => ({
            companies: [],
            activeCompany: null,
            isLoading: false,
            error: null,

            fetchCompanies: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.get('/companies');
                    const companies = response.data.data || [];
                    set({ companies, isLoading: false });
                    
                    // If no active company, set the first one
                    if (!get().activeCompany && companies.length > 0) {
                        const defaultCompany = companies.find((c: Company) => c.isDefault) || companies[0];
                        set({ activeCompany: defaultCompany });
                    }
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to fetch companies';
                    set({ error: message, isLoading: false });
                }
            },

            fetchDefaultCompany: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.get('/companies/default');
                    const company = response.data.data;
                    if (company) {
                        set({ activeCompany: company, isLoading: false });
                    } else {
                        set({ isLoading: false });
                    }
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to fetch default company';
                    set({ error: message, isLoading: false });
                }
            },

            setActiveCompany: async (company: Company) => {
                set({ isLoading: true, error: null });
                try {
                    await api.post(`/companies/${company.id}/set-default`);
                    set({ activeCompany: company, isLoading: false });
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to set active company';
                    set({ error: message, isLoading: false });
                }
            },

            createCompany: async (data: Partial<Company>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/companies', data);
                    const company = response.data.data;
                    set((state) => ({
                        companies: [...state.companies, company],
                        activeCompany: state.activeCompany || company,
                        isLoading: false,
                    }));
                    return company;
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to create company';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            updateCompany: async (id: string, data: Partial<Company>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.put(`/companies/${id}`, data);
                    const updated = response.data.data;
                    set((state) => ({
                        companies: state.companies.map((c) => (c.id === id ? updated : c)),
                        activeCompany: state.activeCompany?.id === id ? updated : state.activeCompany,
                        isLoading: false,
                    }));
                    return updated;
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to update company';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            deleteCompany: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    await api.delete(`/companies/${id}`);
                    set((state) => {
                        const companies = state.companies.filter((c) => c.id !== id);
                        const activeCompany = state.activeCompany?.id === id 
                            ? companies[0] || null 
                            : state.activeCompany;
                        return { companies, activeCompany, isLoading: false };
                    });
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to delete company';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            fetchMembers: async (companyId: string) => {
                try {
                    const response = await api.get(`/companies/${companyId}/members`);
                    return response.data.data || [];
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to fetch members';
                    set({ error: message });
                    throw error;
                }
            },

            inviteMember: async (companyId: string, email: string, role: string) => {
                try {
                    const response = await api.post(`/companies/${companyId}/members`, { email, role });
                    return response.data.data;
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to invite member';
                    set({ error: message });
                    throw error;
                }
            },

            updateMemberRole: async (companyId: string, memberId: string, role: string) => {
                try {
                    await api.put(`/companies/${companyId}/members/${memberId}`, { role });
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to update member role';
                    set({ error: message });
                    throw error;
                }
            },

            removeMember: async (companyId: string, memberId: string) => {
                try {
                    await api.delete(`/companies/${companyId}/members/${memberId}`);
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to remove member';
                    set({ error: message });
                    throw error;
                }
            },

            leaveCompany: async (companyId: string) => {
                try {
                    await api.post(`/companies/${companyId}/leave`);
                    set((state) => ({
                        companies: state.companies.filter((c) => c.id !== companyId),
                        activeCompany: state.activeCompany?.id === companyId 
                            ? state.companies.filter((c) => c.id !== companyId)[0] || null 
                            : state.activeCompany,
                    }));
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to leave company';
                    set({ error: message });
                    throw error;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'company-storage',
            partialize: (state) => ({ activeCompany: state.activeCompany }),
        }
    )
);
