import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, token, logout } = useAuthStore();
    const location = useLocation();

    // Check if user has a token and is authenticated
    const storedToken = localStorage.getItem('auth_token');
    const hasToken = token || storedToken;

    useEffect(() => {
        if (!storedToken && (isAuthenticated || token)) {
            logout();
        }
    }, [storedToken, isAuthenticated, token, logout]);

    if (!hasToken || !isAuthenticated) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
