import { getInitials, getAvatarUrl } from '../../utils/helpers.js';

const sizeMap = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg', '2xl': 'w-20 h-20 text-xl', '3xl': 'w-24 h-24 text-2xl' };

const Avatar = ({ user, size = 'md', showOnline = false, isOnline = false, className = '' }) => {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const avatarUrl = getAvatarUrl(user?.profilePicture);
  return (
    <div className={'relative inline-flex flex-shrink-0 ' + className}>
      <div className={sizeClass + ' rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center ring-2 ring-white dark:ring-nexora-card'}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <span className={sizeClass + ' flex items-center justify-center text-white font-semibold ' + (avatarUrl ? 'hidden' : 'flex')}>
          {getInitials(user?.name)}
        </span>
      </div>
      {showOnline && isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-nexora-card" />
      )}
    </div>
  );
};

export default Avatar;
