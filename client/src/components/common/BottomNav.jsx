import { NavLink } from 'react-router-dom';
import { HiHome, HiSearch, HiPlusCircle, HiChat, HiUser } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext.jsx';

const BottomNav = ({ unreadNotifications = 0 }) => {
  const { user } = useAuth();
  const navItems = [
    { to: '/home', icon: HiHome, label: 'Home' },
    { to: '/explore', icon: HiSearch, label: 'Explore' },
    { to: '/create', icon: HiPlusCircle, label: 'Create' },
    { to: '/messages', icon: HiChat, label: 'Chat', badge: unreadNotifications },
    { to: '/profile/' + user?.username, icon: HiUser, label: 'Profile' },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-nexora-card border-t border-gray-100 dark:border-nexora-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ' + (isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400')}>
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={'w-6 h-6 ' + (isActive ? 'scale-110' : '') + ' transition-transform'} />
                  {badge > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">{badge > 9 ? '9+' : badge}</span>}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
