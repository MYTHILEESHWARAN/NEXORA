import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { HiCamera, HiPencil, HiCalendar, HiLink } from 'react-icons/hi';
import Avatar from '../components/common/Avatar.jsx';
import FollowButton from '../components/common/FollowButton.jsx';
import PostCard from '../components/post/PostCard.jsx';
import Modal from '../components/common/Modal.jsx';
import { ProfileSkeleton, PostSkeleton, UserCardSkeleton } from '../components/common/Skeleton.jsx';
import { userAPI, postAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { formatDate, formatCount, getAvatarUrl } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  const { ref: bottomRef, inView } = useInView({ threshold: 0 });
  const isOwn = currentUser?.username === username;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getUser(username);
      setProfile(data.user);
      setFollowersCount(data.user.followers?.length || 0);
      setIsFollowing(data.user.followers?.some(f => f._id === currentUser?._id || f === currentUser?._id));
    } catch {
      toast.error('User not found');
      navigate('/home');
    } finally { setLoading(false); }
  }, [username, currentUser?._id, navigate]);

  const loadPosts = useCallback(async (pageNum = 1) => {
    if (!profile) return;
    if (pageNum === 1) setLoadingPosts(true);
    else setLoadingMore(true);
    try {
      const { data } = await postAPI.getUserPosts(profile._id, pageNum);
      setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch {}
    finally { setLoadingPosts(false); setLoadingMore(false); }
  }, [profile]);

  useEffect(() => { loadProfile(); }, [username]);
  useEffect(() => { if (profile) { setPosts([]); loadPosts(1); } }, [profile?._id]);
  useEffect(() => { if (inView && hasMore && !loadingMore && !loadingPosts) loadPosts(page + 1); }, [inView]);

  const handleFollowChange = (following) => {
    setIsFollowing(following);
    setFollowersCount(prev => following ? prev + 1 : prev - 1);
  };

  const openFollowers = async () => {
    setShowFollowers(true);
    setLoadingFollowers(true);
    try {
      const { data } = await userAPI.getFollowers(profile._id);
      setFollowersList(data.followers || []);
    } catch {} finally { setLoadingFollowers(false); }
  };

  const openFollowing = async () => {
    setShowFollowing(true);
    setLoadingFollowers(true);
    try {
      const { data } = await userAPI.getFollowing(profile._id);
      setFollowingList(data.following || []);
    } catch {} finally { setLoadingFollowers(false); }
  };

  const avatarUrl = getAvatarUrl(profile?.profilePicture);
  const online = isUserOnline(profile?._id);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-6"><ProfileSkeleton /></div>;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Cover */}
      <div className="card overflow-hidden mb-0 rounded-b-none border-b-0">
        <div className="h-36 md:h-48 bg-gradient-to-r from-primary-500 via-violet-500 to-pink-500 relative">
          {profile.coverPhoto && (
            <img src={getAvatarUrl(profile.coverPhoto)} alt="Cover" className="w-full h-full object-cover" />
          )}
          {isOwn && (
            <Link to="/settings" className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-xl p-2 transition-colors">
              <HiPencil className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="px-4 pb-4">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className="relative">
              <Avatar user={profile} size="3xl" showOnline isOnline={online} className="ring-4 ring-white dark:ring-nexora-card" />
            </div>
            <div className="flex items-center gap-2 pb-2">
              {isOwn ? (
                <Link to="/settings" className="btn-secondary gap-2">
                  <HiPencil className="w-4 h-4" /> Edit Profile
                </Link>
              ) : (
                <>
                  <FollowButton
                    targetUserId={profile._id}
                    initialFollowing={isFollowing}
                    onFollowChange={handleFollowChange}
                    size="md"
                  />
                  <Link to={'/messages/' + profile._id} className="btn-secondary">Message</Link>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black text-gray-900 dark:text-white">{profile.name}</h1>
              {online && <span className="inline-flex items-center gap-1 text-xs text-green-500 font-medium"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Online</span>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><HiCalendar className="w-3.5 h-3.5" /> Joined {formatDate(profile.createdAt)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white">{formatCount(posts.length)}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <button onClick={openFollowers} className="text-center hover:opacity-80 transition-opacity">
              <p className="font-bold text-gray-900 dark:text-white">{formatCount(followersCount)}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </button>
            <button onClick={openFollowing} className="text-center hover:opacity-80 transition-opacity">
              <p className="font-bold text-gray-900 dark:text-white">{formatCount(profile.following?.length || 0)}</p>
              <p className="text-xs text-gray-500">Following</p>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card rounded-t-none border-t-0 px-4 mb-4">
        <div className="flex border-b border-gray-100 dark:border-nexora-border">
          {['posts', 'media'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={'px-4 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ' + (tab === t ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loadingPosts ? (
        <div className="space-y-4">{[1,2].map(i => <PostSkeleton key={i} />)}</div>
      ) : posts.length > 0 ? (
        <>
          {tab === 'posts' && (
            <div className="space-y-4">
              {posts.map(post => <PostCard key={post._id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p._id !== id))} />)}
              {hasMore && <div ref={bottomRef} className="py-2">{loadingMore && <PostSkeleton />}</div>}
            </div>
          )}
          {tab === 'media' && (
            <div className="grid grid-cols-3 gap-1">
              {posts.filter(p => p.image).map(post => (
                <div key={post._id} className="aspect-square overflow-hidden rounded-lg">
                  <img src={'http://localhost:5000' + post.image} alt="Media" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-sm">{isOwn ? "You haven't posted anything yet." : profile.name + " hasn't posted yet."}</p>
          {isOwn && <Link to="/create" className="btn-primary mt-4 inline-flex">Create Post</Link>}
        </div>
      )}

      {/* Followers Modal */}
      <Modal isOpen={showFollowers} onClose={() => setShowFollowers(false)} title={'Followers · ' + formatCount(followersCount)}>
        {loadingFollowers ? (
          <div className="space-y-3">{[1,2,3].map(i => <UserCardSkeleton key={i} />)}</div>
        ) : followersList.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {followersList.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
                <Link to={'/profile/' + u.username} onClick={() => setShowFollowers(false)}>
                  <Avatar user={u} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={'/profile/' + u.username} onClick={() => setShowFollowers(false)}>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </Link>
                </div>
                <FollowButton targetUserId={u._id} size="xs" />
              </div>
            ))}
          </div>
        ) : <p className="text-center text-gray-400 py-6 text-sm">No followers yet</p>}
      </Modal>

      {/* Following Modal */}
      <Modal isOpen={showFollowing} onClose={() => setShowFollowing(false)} title={'Following · ' + formatCount(profile.following?.length || 0)}>
        {loadingFollowers ? (
          <div className="space-y-3">{[1,2,3].map(i => <UserCardSkeleton key={i} />)}</div>
        ) : followingList.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {followingList.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
                <Link to={'/profile/' + u.username} onClick={() => setShowFollowing(false)}>
                  <Avatar user={u} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={'/profile/' + u.username} onClick={() => setShowFollowing(false)}>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </Link>
                </div>
                <FollowButton targetUserId={u._id} size="xs" />
              </div>
            ))}
          </div>
        ) : <p className="text-center text-gray-400 py-6 text-sm">Not following anyone yet</p>}
      </Modal>
    </div>
  );
};

export default ProfilePage;
