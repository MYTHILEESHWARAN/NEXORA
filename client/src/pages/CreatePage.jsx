import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPhotograph, HiX, HiArrowLeft } from 'react-icons/hi';
import Avatar from '../components/common/Avatar.jsx';
import { postAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const CreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) { toast.error('Please write something or add an image'); return; }
    setLoading(true);
    try {
      await postAPI.createPost({ content: content.trim(), image });
      toast.success('Post published!');
      navigate('/home');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post'); }
    finally { setLoading(false); }
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-6'>
      <div className='flex items-center gap-3 mb-6'>
        <button onClick={() => navigate(-1)} className='btn-ghost p-2'><HiArrowLeft className='w-5 h-5' /></button>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Create Post</h1>
      </div>
      <div className='card p-6 space-y-4'>
        <div className='flex items-center gap-3'>
          <Avatar user={user} size='md' />
          <div>
            <p className='font-semibold text-gray-900 dark:text-white'>{user?.name}</p>
            <p className='text-xs text-gray-400'>@{user?.username}</p>
          </div>
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder='What is happening? Share your thoughts...'
          rows={5} maxLength={2300} autoFocus
          className='w-full bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 text-base resize-none focus:outline-none leading-relaxed border-b border-gray-100 dark:border-nexora-border pb-4' />
        <div className={'text-right text-xs ' + (content.length > 2200 ? 'text-red-500' : 'text-gray-400')}>{content.length}/2200</div>
        {previewUrl && (
          <div className='relative rounded-xl overflow-hidden'>
            <img src={previewUrl} alt='Preview' className='w-full max-h-80 object-cover' />
            <button onClick={() => { setImage(null); setPreviewUrl(null); }} className='absolute top-3 right-3 bg-black/60 text-white rounded-full p-2'>
              <HiX className='w-4 h-4' />
            </button>
          </div>
        )}
        <div className='flex items-center justify-between pt-2'>
          <button onClick={() => fileRef.current?.click()} className='flex items-center gap-2 px-3 py-2 rounded-xl text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 font-medium text-sm'>
            <HiPhotograph className='w-5 h-5' /> Add Photo
          </button>
          <input ref={fileRef} type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
          <div className='flex gap-2'>
            <button onClick={() => navigate(-1)} className='btn-secondary'>Cancel</button>
            <button onClick={handleSubmit} disabled={loading || (!content.trim() && !image)} className='btn-primary px-6'>
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;