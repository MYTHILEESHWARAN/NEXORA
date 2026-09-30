import { useState } from 'react';
import { HiX, HiPhotograph } from 'react-icons/hi';
import { postAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const EditPostModal = ({ post, onClose, onUpdated }) => {
  const [content, setContent] = useState(post.content || '');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(post.image ? 'http://localhost:5000' + post.image : null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !previewUrl) { toast.error('Post cannot be empty'); return; }
    setLoading(true);
    try {
      const formData = { content: content.trim() };
      if (image) formData.image = image;
      const { data } = await postAPI.updatePost(post._id, formData);
      toast.success('Post updated');
      onUpdated(data.post);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update post'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-nexora-border">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Post</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-full"><HiX className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <textarea value={content} onChange={e => setContent(e.target.value)} maxLength={2200} rows={4} placeholder="What's on your mind?" className="input-field resize-none" />
          <div className="text-right text-xs text-gray-400">{content.length}/2200</div>
          {previewUrl && (
            <div className="relative">
              <img src={previewUrl} alt="Preview" className="w-full rounded-xl max-h-64 object-cover" />
              <button onClick={() => { setImage(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"><HiX className="w-4 h-4" /></button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <label className="btn-ghost cursor-pointer gap-2">
              <HiPhotograph className="w-5 h-5 text-primary-500" />
              <span className="text-sm">Change Photo</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
