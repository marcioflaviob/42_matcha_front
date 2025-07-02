import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { MapContext } from './MapContext';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [potentialMatches, setPotentialMatches] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token, isAuthenticated, isLoading, logout } = useContext(AuthContext);
    const { setFocusedDate, setFocusedUser, setMapStatus } = useContext(MapContext);
    const [dates, setDates] = useState([]);
    const [matches, setMatches] = useState(null);
    
    const logoutUser = () => {
        logout();
        setUser(null);
        setPotentialMatches(null);
        setDates([]);
        setLoading(true);
        setFocusedDate(null);
        setFocusedUser(null);
        setMapStatus('closed');
        setMatches(null);
    };

    const props = useMemo(() => ({
        user, 
        setUser,
        loading,
        potentialMatches, 
        setPotentialMatches,
        dates,
        setDates,
        logoutUser,
        matches,
        setMatches
    }), [user, potentialMatches, dates, loading, matches]);

    const fetchDates = async () => {
        try {
            const response = await axios.get(import.meta.env.VITE_API_URL + '/dates', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDates(response.data);
        } catch (error) {
            displayAlert('error', error.response?.data?.message || 'Error fetching dates');
        }
    }

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
                        fetchDates();
                    } else {
                        setUser(null);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setUser(null);
                    localStorage.removeItem('token');
                });
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