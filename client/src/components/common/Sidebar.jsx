import { NavLink, useNavigate } from 'react-router-dom';
import { HiHome, HiSearch, HiPlusCircle, HiChat, HiBell, HiBookmark, HiUser, HiCog, HiLogout, HiMoon, HiSun } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Avatar from './Avatar.jsx';
import Logo from './Logo.jsx';
import { useState } from 'react';

const Sidebar = ({ unreadNotifications = 0 }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/home', icon: HiHome, label: 'Home' },
    { to: '/explore', icon: HiSearch, label: 'Explore' },
    { to: '/create', icon: HiPlusCircle, label: 'Create' },
    { to: '/messages', icon: HiChat, label: 'Messages' },
    { to: '/notifications', icon: HiBell, label: 'Notifications', badge: unreadNotifications },
    { to: '/saved', icon: HiBookmark, label: 'Saved' },
    { to: '/profile/' + user?.username, icon: HiUser, label: 'Profile' },
    { to: '/settings', icon: HiCog, label: 'Settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 border-r border-gray-100 dark:border-nexora-border bg-white dark:bg-nexora-card overflow-y-auto no-scrollbar">
      <div className="px-6 py-6"><Logo /></div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}>
            <div className="relative">
              <Icon className="w-5 h-5 flex-shrink-0" />
              {badge > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">{badge > 9 ? '9+' : badge}</span>}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6 space-y-1 border-t border-gray-100 dark:border-nexora-border pt-4">
        <button onClick={toggleTheme} className="nav-item w-full text-left">
          {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} disabled={loggingOut} className="nav-item w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
          <HiLogout className="w-5 h-5" />
          <span>{loggingOut ? 'Logging out...' : 'Log Out'}</span>
        </button>
        <NavLink to={'/profile/' + user?.username} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all mt-2">
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
