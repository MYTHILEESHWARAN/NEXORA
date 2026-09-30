import { useState, useRef } from 'react';
import { HiPhotograph, HiX, HiPaperAirplane } from 'react-icons/hi';
import Avatar from '../common/Avatar.jsx';
import { postAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) { toast.error('Post cannot be empty'); return; }
    if (content.length > 2200) { toast.error('Post exceeds 2200 characters'); return; }
    setLoading(true);
    try {
      const { data } = await postAPI.createPost({ content: content.trim(), image });
      setContent('');
      removeImage();
      setFocused(false);
      onPostCreated?.(data.post);
      toast.success('Post created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally { setLoading(false); }
  };

  const charCount = content.length;
  const isOverLimit = charCount > 2200;

  return (
    <div className="card p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar user={user} size="md" />
          <div className="flex-1 min-w-0">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="What's on your mind?"
              rows={focused ? 3 : 2}
              maxLength={2500}
              className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none leading-relaxed transition-all"
            />

            {previewUrl && (
              <div className="relative mt-2">
                <img src={previewUrl} alt="Preview" className="w-full rounded-xl max-h-64 object-cover" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            )}

            {(focused || content || previewUrl) && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-nexora-border">
                <div className="flex items-center gap-2">
                  <label className="btn-ghost cursor-pointer text-primary-500 hover:text-primary-600 p-2">
                    <HiPhotograph className="w-5 h-5" />
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {charCount > 1800 && (
                    <span className={'text-xs font-medium ' + (isOverLimit ? 'text-red-500' : 'text-yellow-500')}>
                      {charCount}/2200
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || isOverLimit || (!content.trim() && !image)}
                  className="btn-primary gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiPaperAirplane className="w-4 h-4 rotate-90" />
                  )}
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
