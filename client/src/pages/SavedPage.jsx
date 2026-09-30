import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import PostCard from '../components/post/PostCard.jsx';
import { PostSkeleton } from '../components/common/Skeleton.jsx';
import { postAPI } from '../services/api.js';
import { HiBookmark } from 'react-icons/hi';

const SavedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { ref, inView } = useInView({ threshold: 0 });

  const fetchSaved = async (pageNum, replace) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await postAPI.getSaved(pageNum);
      setPosts(prev => replace ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { fetchSaved(1, true); }, []);
  useEffect(() => { if (inView && hasMore && !loadingMore && !loading) fetchSaved(page + 1, false); }, [inView, hasMore, loadingMore, loading, page]);

  return (
    <div className='max-w-2xl mx-auto px-4 py-6'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-10 h-10 bg-primary-100 dark:bg-primary-950 rounded-xl flex items-center justify-center'>
          <HiBookmark className='w-5 h-5 text-primary-600 dark:text-primary-400' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Saved Posts</h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Only you can see your saved posts</p>
        </div>
      </div>
      {loading ? (
        <div className='space-y-4'>{Array(3).fill(0).map((_, i) => <PostSkeleton key={i} />)}</div>
      ) : posts.length === 0 ? (
        <div className='card p-16 text-center'>
          <div className='text-5xl mb-4'>🔖</div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Nothing saved yet</h3>
          <p className='text-sm text-gray-400'>Save posts by clicking the bookmark icon.</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {posts.map(post => (
            <PostCard key={post._id} post={post} onDelete={id => setPosts(prev => prev.filter(p => p._id !== id))} />
          ))}
          <div ref={ref} className='py-4 flex justify-center'>
            {loadingMore && <div className='flex gap-1'>{[0,1,2].map(i => <div key={i} className='w-2 h-2 bg-primary-400 rounded-full animate-bounce' style={{ animationDelay: i*0.15+'s' }} />)}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPage;