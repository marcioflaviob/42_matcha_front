import React, { createContext, useState, useRef, useContext, useCallback } from 'react';

const EditProfileContext = createContext();

export const EditProfileProvider = ({ children }) => {
  // Main state with all profile fields
  const [state, _setState] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    interests: []
  });

  // Mutable reference to state (always current)
  const stateRef = useRef(state);
  
  // Enhanced setState that updates both React state and ref
  const setState = useCallback((updater) => {
    _setState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      stateRef.current = newState; // Update ref synchronously
      return newState;
    });
  }, []);

  // Optimized field updater
  const updateField = useCallback((field, value) => {
    setState(prev => ({
      ...prev,
      [field]: Array.isArray(value) ? [...value] : value // Ensure array copies
    }));
  }, [setState]);

  // Guaranteed fresh state getter
  const getLatestState = useCallback(() => stateRef.current, []);

  // Debug helper (optional)
  const debugState = useCallback(() => {
    console.log('Current state:', {
      reactState: state,
      refState: stateRef.current
    });
  }, [state]);

  return (
    <EditProfileContext.Provider value={{
      state,
      updateField,
      getLatestState,
      setState, // Full state setter
      debugState // Optional debug tool
    }}>
      {children}
    </EditProfileContext.Provider>
  );
};

export const useEditProfileContext = () => {
  const context = useContext(EditProfileContext);
  if (!context) {
    throw new Error('useEditProfileContext must be used within EditProfileProvider');
  }
  return context;
};