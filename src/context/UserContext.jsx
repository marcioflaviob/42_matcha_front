import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [potentialMatches, setPotentialMatches] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token, isAuthenticated, isLoading } = useContext(AuthContext);

    const updateUser = (newUserData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...newUserData
        }));
    };
    
    const props = useMemo(() => ({
        user, 
        setUser: updateUser,
        loading,
        potentialMatches, 
        setPotentialMatches
    }), [user, potentialMatches, loading]);

    useEffect(() => {
        if (isLoading) return;
        
        if (isAuthenticated && token) {
            axios
            .get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                if (response.data.user.id) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
                setLoading(false);
            })
            .catch(() => setUser(null));
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [isAuthenticated, token, isLoading]);


    return (
        <UserContext.Provider value={props}>
            {children}
        </UserContext.Provider>
    );
};