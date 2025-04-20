import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoutes = () => {
    const { user } = useContext(UserContext);
    const { isLoading } = useContext(AuthContext);

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    // // Redirect to home page if not authenticated
    // if (!user) {
    //     console.log('User not authenticated');
    //     return <Navigate to="/" replace />;
    // }

    // if (user && user.status !== 'step_two') {
    //     // Redirect to register page if user is not complete
    //     return <Navigate to="/register" replace />;
    // }

    // Allow access to protected routes
    return <Outlet />;
};

export default ProtectedRoutes;