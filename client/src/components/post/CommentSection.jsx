import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiTrash, HiPaperAirplane } from 'react-icons/hi';
import Avatar from '../common/Avatar.jsx';
import { postAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { timeAgo } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

const CommentSection = ({ postId, initialComments = [], onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments.filter(c => c && c._id));
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialComments.some(c => !c || !c.author)) {
      setLoading(true);
      postAPI.getPost(postId).then(({ data }) => { setComments(data.post.comments || []); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await postAPI.addComment(postId, content.trim());
      setComments(prev => [data.comment, ...prev]);
      setContent('');
      onCommentAdded?.(comments.length + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId) => {
    try {
      await postAPI.deleteComment(postId, commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      onCommentAdded?.(comments.length - 1);
    } catch { toast.error('Failed to delete comment'); }
  };

  return (
    <div className="px-4 pb-4 border-t border-gray-100 dark:border-nexora-border pt-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-4">
        <Avatar user={user} size="sm" />
        <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500 transition">
          <input type="text" value={content} onChange={e => setContent(e.target.value)} placeholder="Add a comment..." maxLength={500}
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none" />
          <button type="submit" disabled={!content.trim() || submitting} className="text-primary-600 dark:text-primary-400 disabled:opacity-30">
            <HiPaperAirplane className="w-4 h-4 rotate-90" />
          </button>
        </div>
      </form>
      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="flex gap-3 animate-pulse"><div className="w-8 h-8 rounded-full skeleton" /><div className="flex-1 h-12 skeleton rounded-xl" /></div>)}</div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map(comment => {
            if (!comment || !comment._id) return null;
            const isOwner = user?._id === comment.author?._id;
            return (
              <div key={comment._id} className="flex gap-3 group">
                <Link to={'/profile/' + comment.author?.username}><Avatar user={comment.author} size="sm" /></Link>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={'/profile/' + comment.author?.username} className="text-xs font-semibold text-gray-900 dark:text-white hover:text-primary-600">{comment.author?.name}</Link>
                      <span className="text-xs text-gray-400 ml-1">· {timeAgo(comment.createdAt)}</span>
                    </div>
                    {isOwner && <button onClick={() => handleDelete(comment._id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"><HiTrash className="w-3.5 h-3.5" /></button>}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-3">No comments yet. Be the first!</p>
      )}
    </div>
  );
};

export default CommentSection;
