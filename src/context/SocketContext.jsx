import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated, isLoading } = useContext(AuthContext);

  useEffect(() => {
	if (isLoading) return;

    if (isAuthenticated && token) {
      const socketInstance = io(import.meta.env.VITE_API_URL, {
        auth: { token },
        withCredentials: true,
      });

      socketInstance.on('connect', () => {
        setConnected(true);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
        setConnected(false);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
    
    return () => {};
  }, [token, isAuthenticated, isLoading]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};