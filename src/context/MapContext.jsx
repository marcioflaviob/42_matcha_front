import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
    const [mapStatus, setMapStatus] = useState('closed');
    const [focusedDate, setFocusedDate] = useState(null);
    const [focusedUser, setFocusedUser] = useState(null);

    const props = useMemo(() => ({
        mapStatus,
        setMapStatus,
        focusedDate,
        setFocusedDate,
        focusedUser,
        setFocusedUser
    }), [mapStatus, setFocusedDate, focusedDate, focusedUser, setFocusedUser]);

    return (
        <MapContext.Provider value={props}>
            {children}
        </MapContext.Provider>
    );
};