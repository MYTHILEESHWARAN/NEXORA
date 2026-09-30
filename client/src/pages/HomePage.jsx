import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { HiSparkles } from 'react-icons/hi';
import CreatePost from '../components/post/CreatePost.jsx';
import PostCard from '../components/post/PostCard.jsx';
import { PostSkeleton, UserCardSkeleton } from '../components/common/Skeleton.jsx';
import Avatar from '../components/common/Avatar.jsx';
import FollowButton from '../components/common/FollowButton.jsx';
import { postAPI, userAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const { ref: bottomRef, inView } = useInView({ threshold: 0 });

  const loadPosts = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await postAPI.getFeed(pageNum);
      setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadPosts(1); }, [loadPosts]);

  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading) {
      loadPosts(page + 1);
    }
  }, [inView]);

  useEffect(() => {
    userAPI.getSuggestions().then(({ data }) => setSuggestions(data.users || [])).catch(() => {}).finally(() => setLoadingSuggestions(false));
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div className="flex gap-0 xl:gap-6 max-w-5xl mx-auto px-0 xl:px-6 py-6">
      {/* Feed */}
      <div className="flex-1 min-w-0 space-y-4 px-4 xl:px-0">
        <CreatePost onPostCreated={handlePostCreated} />

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <PostSkeleton key={i} />)}</div>
        ) : posts.length > 0 ? (
          <>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
            ))}
            {hasMore && (
              <div ref={bottomRef} className="py-4">
                {loadingMore && <div className="space-y-4"><PostSkeleton /><PostSkeleton /></div>}
              </div>
            )}
            {!hasMore && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                You've caught up! 🎉
              </div>
            )}
          </>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiSparkles className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your feed is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Follow people to see their posts here, or explore trending content.</p>
            <Link to="/explore" className="btn-primary">Explore Posts</Link>
          </div>
        )}
      </div>

      {/* Right Sidebar: Suggestions */}
      <aside className="hidden xl:block w-72 flex-shrink-0 space-y-4">
        {/* Current User */}
        <div className="card p-4">
          <Link to={'/profile/' + user?.username} className="flex items-center gap-3">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
            </div>
          </Link>
        </div>

        {/* Suggestions */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Suggested for you</h3>
            <Link to="/explore" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">See all</Link>
          </div>
          {loadingSuggestions ? (
            <div className="space-y-3">{[1,2,3].map(i => <UserCardSkeleton key={i} />)}</div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-1">
              {suggestions.slice(0, 5).map(u => (
                <div key={u._id} className="flex items-center gap-3 py-2">
                  <Link to={'/profile/' + u.username}>
                    <Avatar user={u} size="sm" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={'/profile/' + u.username}>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                    </Link>
                  </div>
                  <FollowButton targetUserId={u._id} size="xs" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">No suggestions</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
