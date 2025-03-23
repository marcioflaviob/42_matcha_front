import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const ProtectedRoutes = () => {
    const { user } = useContext(UserContext);

    // Redirect to login if the user is not authenticated
    return /*!user || user.status === 'complete'*/ true ? <Outlet /> : <Navigate to="/register" replace />;
};

export default ProtectedRoutes;