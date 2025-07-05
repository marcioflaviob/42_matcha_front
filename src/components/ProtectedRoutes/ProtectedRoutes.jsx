import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoutes = () => {
    const { user, loading } = useContext(UserContext);
    const { isAuthenticated, isLoading } = useContext(AuthContext);
    const location = useLocation();
    
    if (isLoading || loading) {
        return <div />;
    }

    const publicRoutes = ['/', '/login', '/register', '/auth/google/callback', '/reset-password'];
    const isPublicRoute = publicRoutes.includes(location.pathname) || 
                           location.pathname.startsWith('/auth/google/');
    
    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && !isPublicRoute) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // If user is authenticated but email not yet validated
    const allowedRoutes = ['/register', `/profile/${user?.id}`, '/edit-profile/'];
    if (user && user.status !== 'complete' && !allowedRoutes.includes(location.pathname)) {
        return <Navigate to="/register" replace />;
    }

    // If user is authenticated and has completed registration
    if (user && user.status === 'complete' && (location.pathname === '/register' || location.pathname === '/login')) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;