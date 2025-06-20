import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: number;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: 0,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    // Determine the socket URL based on environment
    const getSocketUrl = () => {
      if (import.meta.env.PROD) {
        return window.location.origin; // Use same origin in production
      }
      
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '');
      }
      
      return 'http://localhost:5000'; // Default development URL
    };

    // Create socket connection
    const newSocket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for user count updates
    newSocket.on('userCount', (data: { count: number }) => {
      console.log('Received user count update:', data.count);
      setOnlineUsers(data.count);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Send periodic pings to keep session active
  useEffect(() => {
    if (socket && isConnected) {
      const pingInterval = setInterval(() => {
        socket.emit('ping');
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [socket, isConnected]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
