import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost, apiGet } from '../lib/api';

interface User {
    id: string;
    email: string;
    businessName: string;
    panNumber?: string;
    vatNumber?: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
    language: 'en' | 'ne';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    clearError: () => void;
}

interface RegisterData {
    email: string;
    password: string;
    businessName: string;
    panNumber?: string;
    vatNumber?: string;
}

interface AuthResponse {
    user: User;
    token: string;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiPost<AuthResponse>('/auth/login', { email, password });
                    localStorage.setItem('auth_token', response.token);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiPost<AuthResponse>('/auth/register', data);
                    localStorage.setItem('auth_token', response.token);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Registration failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            fetchProfile: async () => {
                const { token } = get();
                if (!token) return;

                set({ isLoading: true });
                try {
                    const user = await apiGet<User>('/auth/profile');
                    set({ user, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            updateProfile: async (data: Partial<User>) => {
                set({ isLoading: true, error: null });
                try {
                    const user = await apiPost<User>('/auth/profile', data);
                    set({ user, isLoading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Update failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
