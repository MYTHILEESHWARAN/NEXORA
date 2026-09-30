import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('nexora_token');
      const newSocket = io('http://localhost:5000', {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
      newSocket.on('connect', () => console.log('Socket connected'));
      newSocket.on('disconnect', () => console.log('Socket disconnected'));
      newSocket.on('onlineUsers', (users) => setOnlineUsers(users));
      newSocket.on('userOnline', (userId) => setOnlineUsers(prev => [...new Set([...prev, userId])]));
      newSocket.on('userOffline', (userId) => setOnlineUsers(prev => prev.filter(id => id !== userId)));
      socketRef.current = newSocket;
      setSocket(newSocket);
      return () => { newSocket.disconnect(); socketRef.current = null; setSocket(null); };
    } else {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; setSocket(null); setOnlineUsers([]); }
    }
  }, [isAuthenticated, user]);

  const isUserOnline = (userId) => onlineUsers.includes(userId?.toString());

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};
