import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiChat, HiShare, HiBookmark, HiOutlineBookmark, HiDotsHorizontal, HiPencil, HiTrash, HiExternalLink } from 'react-icons/hi';
import Avatar from '../common/Avatar.jsx';
import CommentSection from './CommentSection.jsx';
import EditPostModal from './EditPostModal.jsx';
import { postAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { timeAgo, formatCount, getAvatarUrl } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

const PostCard = ({ post: initialPost, onDelete }) => {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [liked, setLiked] = useState(initialPost.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(initialPost.likes?.length || 0);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(initialPost.comments?.length || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const menuRef = useRef(null);
  const isOwner = user?._id === post.author?._id;

  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      const { data } = await postAPI.likePost(post._id);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      toast.error('Failed to like post');
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await postAPI.savePost(post._id);
      setSaved(data.saved);
      toast.success(data.message);
    } catch { toast.error('Failed to save post'); }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      await postAPI.sharePost(post._id);
      if (navigator.share) {
        await navigator.share({ title: post.author?.name + "'s post", text: post.content, url: window.location.origin + '/post/' + post._id });
      } else {
        await navigator.clipboard.writeText(window.location.origin + '/post/' + post._id);
        toast.success('Post link copied!');
      }
      setPost(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }));
    } catch { toast.error('Failed to share post'); }
    finally { setSharing(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await postAPI.deletePost(post._id);
      toast.success('Post deleted');
      onDelete?.(post._id);
    } catch { toast.error('Failed to delete post'); }
    setShowMenu(false);
  };

  const imageUrl = post.image ? (post.image.startsWith('http') ? post.image : 'http://localhost:5000' + post.image) : null;

  return (
    <article className="card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <Link to={'/profile/' + post.author?.username} className="flex items-center gap-3 min-w-0">
          <Avatar user={post.author} size="md" showOnline isOnline={post.author?.isOnline} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 transition-colors">{post.author?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">@{post.author?.username} · {timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {isOwner && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="btn-ghost p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <HiDotsHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-40 bg-white dark:bg-nexora-card rounded-xl shadow-xl border border-gray-100 dark:border-nexora-border py-1 z-10 animate-scale-in">
                <button onClick={() => { setShowEditModal(true); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <HiPencil className="w-4 h-4" /> Edit post
                </button>
                <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                  <HiTrash className="w-4 h-4" /> Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {imageUrl && (
        <div className="px-4 pb-3">
          <img src={imageUrl} alt="Post" className="w-full rounded-xl object-cover max-h-96 cursor-pointer hover:opacity-95 transition-opacity" loading="lazy" />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-nexora-border/50">
          <div className="flex items-center gap-1">
            <button onClick={handleLike} className={'post-action ' + (liked ? 'text-red-500 hover:text-red-600' : '')}>
              {liked ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5" />}
              <span>{formatCount(likesCount)}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className={'post-action ' + (showComments ? 'text-primary-600 dark:text-primary-400' : '')}>
              <HiChat className="w-5 h-5" />
              <span>{formatCount(commentCount)}</span>
            </button>
            <button onClick={handleShare} disabled={sharing} className="post-action">
              <HiShare className="w-5 h-5" />
              <span>{formatCount(post.shares || 0)}</span>
            </button>
          </div>
          <button onClick={handleSave} className={'post-action ' + (saved ? 'text-primary-600 dark:text-primary-400' : '')}>
            {saved ? <HiBookmark className="w-5 h-5 text-primary-600" /> : <HiOutlineBookmark className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={post._id}
          initialComments={post.comments || []}
          onCommentAdded={(count) => setCommentCount(count)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updatedPost) => setPost(updatedPost)}
        />
      )}
    </article>
  );
};

export default PostCard;
