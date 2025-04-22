import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useRefresh } from "./RefreshContext";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const { token, isAuthenticated, isLoading } = useContext(AuthContext);
    const { refreshSignal } = useRefresh();

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
    }, [isAuthenticated, token, isLoading, refreshSignal]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};