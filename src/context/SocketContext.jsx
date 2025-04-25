import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { AuthContext } from './AuthContext';
import { UserContext } from './UserContext';
import axios from 'axios';

export const SocketContext = createContext(); 

export const SocketProvider = ({ children }) => {
  const [pusher, setPusher] = useState(null);
  const [channel, setChannel] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated, isLoading } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (isLoading || !user) return;

    if (isAuthenticated && token) {
      // Initialize Pusher
      const pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        authEndpoint: `${import.meta.env.VITE_API_URL}/auth/pusher`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      // Subscribe to a private channel
      const privateChannel = pusherInstance.subscribe(`private-user-${user?.id}`);

      privateChannel.bind('pusher:subscription_succeeded', () => {
        setConnected(true);
        axios.post(`${import.meta.env.VITE_API_URL}/status/online`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      });

      privateChannel.bind('pusher:subscription_error', (error) => {
        console.error('Pusher subscription error:', error);
        setConnected(false);
      });

      privateChannel.bind('status-request', (data) => {
        axios.post(`${import.meta.env.VITE_API_URL}/status/online`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      });

      setPusher(pusherInstance);
      setChannel(privateChannel);

      return () => {
        if (connected) {
          axios.post(`${import.meta.env.VITE_API_URL}/status/offline`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        privateChannel.unbind('status-request');
        // privateChannel.unsubscribe();
        pusherInstance.disconnect();
      };
    }

    return () => {};
  }, [token, isAuthenticated, isLoading, user?.id]);

  return (
    <SocketContext.Provider value={{ pusher, channel, connected }}>
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