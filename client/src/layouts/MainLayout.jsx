import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import BottomNav from '../components/common/BottomNav.jsx';
import { notificationAPI } from '../services/api.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const MainLayout = () => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      notificationAPI.getNotifications(1).then(({ data }) => setUnreadNotifications(data.unreadCount || 0)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      setUnreadNotifications(prev => prev + 1);
      toast.success(notification.message || 'New notification');
    };
    socket.on('newNotification', handler);
    return () => socket.off('newNotification', handler);
  }, [socket]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-nexora-dark">
      <Sidebar unreadNotifications={unreadNotifications} />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <Outlet context={{ setUnreadNotifications }} />
      </main>
      <BottomNav unreadNotifications={unreadNotifications} />
    </div>
  );
};

export default MainLayout;
