import { useState } from 'react';
import { userAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const FollowButton = ({ targetUserId, initialFollowing = false, onFollowChange, size = 'sm' }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  if (user?._id === targetUserId) return null;

  const handleFollow = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.followUser(targetUserId);
      setIsFollowing(data.following);
      onFollowChange?.(data.following);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setLoading(false); }
  };

  const sizeClass = size === 'xs' ? 'text-xs px-2.5 py-1' : size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2';
  return (
    <button onClick={handleFollow} disabled={loading}
      className={sizeClass + ' rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 active:scale-95 ' + (isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950' : 'bg-primary-600 text-white hover:bg-primary-700')}>
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
