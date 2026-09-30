import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { HiSearch, HiUsers, HiTrendingUp } from 'react-icons/hi';
import PostCard from '../components/post/PostCard.jsx';
import Avatar from '../components/common/Avatar.jsx';
import FollowButton from '../components/common/FollowButton.jsx';
import { PostSkeleton, UserCardSkeleton } from '../components/common/Skeleton.jsx';
import { postAPI, userAPI } from '../services/api.js';

const ExplorePage = () => {
  const [tab, setTab] = useState('trending');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchPosts, setSearchPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const { ref: bottomRef, inView } = useInView({ threshold: 0 });

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([]);
      setSearchPosts([]);
      return;
    }
    const search = async () => {
      setSearching(true);
      try {
        const [usersRes, postsRes] = await Promise.all([
          userAPI.searchUsers(debouncedQuery),
          postAPI.searchPosts(debouncedQuery),
        ]);
        setUsers(usersRes.data.users || []);
        setSearchPosts(postsRes.data.posts || []);
      } catch {}
      finally { setSearching(false); }
    };
    search();
  }, [debouncedQuery]);

  const loadExplorePosts = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await postAPI.getExplore(pageNum);
      setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { loadExplorePosts(1); }, []);
  useEffect(() => { if (inView && hasMore && !loadingMore && !loading && !debouncedQuery) loadExplorePosts(page + 1); }, [inView]);

  const showSearch = debouncedQuery.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Search */}
      <div className="relative mb-6">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search people or posts..."
          className="input-field pl-12 py-3 text-base rounded-2xl"
        />
      </div>

      {showSearch ? (
        /* Search Results */
        <div className="space-y-6">
          {searching ? (
            <div className="space-y-3">{[1,2,3].map(i => <UserCardSkeleton key={i} />)}</div>
          ) : (
            <>
              {/* Users */}
              {users.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><HiUsers className="w-4 h-4" />People</h3>
                  <div className="card divide-y divide-gray-50 dark:divide-nexora-border">
                    {users.map(u => (
                      <div key={u._id} className="flex items-center gap-3 p-3">
                        <Link to={'/profile/' + u.username}><Avatar user={u} size="md" /></Link>
                        <div className="flex-1 min-w-0">
                          <Link to={'/profile/' + u.username}>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-600">{u.name}</p>
                            <p className="text-xs text-gray-400">@{u.username}</p>
                          </Link>
                          {u.bio && <p className="text-xs text-gray-500 truncate mt-0.5">{u.bio}</p>}
                        </div>
                        <FollowButton targetUserId={u._id} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post results */}
              {searchPosts.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Posts</h3>
                  <div className="space-y-4">
                    {searchPosts.map(post => <PostCard key={post._id} post={post} />)}
                  </div>
                </div>
              )}

              {users.length === 0 && searchPosts.length === 0 && (
                <div className="card p-12 text-center">
                  <HiSearch className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No results for "{debouncedQuery}"</p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Trending */
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiTrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trending Posts</h2>
          </div>

          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <PostSkeleton key={i} />)}</div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => <PostCard key={post._id} post={post} />)}
              {hasMore && <div ref={bottomRef} className="py-2">{loadingMore && <PostSkeleton />}</div>}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-6 text-sm text-gray-400">You've seen it all!</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
