import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [potentialMatches, setPotentialMatches] = useState(null);
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
        potentialMatches, 
        setPotentialMatches
    }), [user, potentialMatches]);

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
                })
                .catch(() => setUser(null));
        } else {
            setUser(null);
        }
    }, [isAuthenticated, token, isLoading]);


    return (
        <UserContext.Provider value={props}>
            {children}
        </UserContext.Provider>
    );
};