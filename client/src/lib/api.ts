import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export { API_BASE_URL };

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Generic API response type
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

// API helper functions
export async function apiGet<T>(url: string): Promise<T> {
    const response = await api.get<ApiResponse<T>>(url);
    if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data as T;
}

export async function apiPost<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await api.post<ApiResponse<T>>(url, data);
    if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data as T;
}

export async function apiPut<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await api.put<ApiResponse<T>>(url, data);
    if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data as T;
}

export async function apiDelete<T>(url: string): Promise<T> {
    const response = await api.delete<ApiResponse<T>>(url);
    if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data as T;
}

export default api;
