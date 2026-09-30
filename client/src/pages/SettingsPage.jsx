import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiLockClosed, HiMoon, HiBell, HiShieldCheck, HiLogout, HiCamera, HiEye, HiEyeOff } from 'react-icons/hi';
import Avatar from '../components/common/Avatar.jsx';
import { userAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../utils/helpers.js';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [section, setSection] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', username: user?.username || '', bio: user?.bio || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = { ...profileForm };
      if (avatarFile) payload.profilePicture = avatarFile;
      const { data } = await userAPI.updateUser(user._id, payload);
      updateUser(data.user);
      toast.success('Profile updated!');
      setAvatarFile(null); setAvatarPreview(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Please fill all password fields'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await userAPI.updateUser(user._id, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };
  const avatarUrl = avatarPreview || getAvatarUrl(user?.profilePicture);

  const navItems = [
    { id: 'profile', label: 'Edit Profile', icon: HiUser },
    { id: 'password', label: 'Password', icon: HiLockClosed },
    { id: 'appearance', label: 'Appearance', icon: HiMoon },
    { id: 'notifications', label: 'Notifications', icon: HiBell },
    { id: 'privacy', label: 'Privacy', icon: HiShieldCheck },
  ];

  return (
    <div className='max-w-4xl mx-auto px-4 py-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>Settings</h1>
      <div className='flex flex-col md:flex-row gap-6'>
        <aside className='w-full md:w-56 flex-shrink-0'>
          <div className='card p-2 space-y-1'>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setSection(id)} className={'nav-item w-full text-left ' + (section === id ? 'active' : '')}>
                <Icon className='w-5 h-5' /> {label}
              </button>
            ))}
            <div className='border-t border-gray-100 dark:border-nexora-border my-1' />
            <button onClick={handleLogout} className='nav-item w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'>
              <HiLogout className='w-5 h-5' /> Log Out
            </button>
          </div>
        </aside>
        <div className='flex-1 min-w-0'>
          {section === 'profile' && (
            <div className='card p-6 space-y-6'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Edit Profile</h2>
              <div className='flex items-center gap-4'>
                <div className='relative cursor-pointer group' onClick={() => fileRef.current?.click()}>
                  <div className='w-20 h-20 rounded-full overflow-hidden ring-4 ring-white dark:ring-nexora-card'>
                    {avatarUrl ? <img src={avatarUrl} alt='Avatar' className='w-full h-full object-cover' />
                      : <div className='w-full h-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold'>{user?.name?.[0]}</div>}
                  </div>
                  <div className='absolute bottom-0 right-0 bg-primary-600 rounded-full p-1.5 shadow-lg'><HiCamera className='w-3 h-3 text-white' /></div>
                  <input ref={fileRef} type='file' accept='image/*' onChange={handleAvatarChange} className='hidden' />
                </div>
                <div>
                  <p className='font-semibold text-gray-900 dark:text-white'>{user?.name}</p>
                  <p className='text-sm text-gray-500'>@{user?.username}</p>
                </div>
              </div>
              <div className='grid gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>Full Name</label>
                  <input type='text' value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className='input-field' placeholder='Your full name' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>Username</label>
                  <input type='text' value={profileForm.username} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} className='input-field' placeholder='username' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>Bio</label>
                  <textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} maxLength={160} placeholder='Tell people about yourself...' className='input-field resize-none' />
                  <p className='text-right text-xs text-gray-400 mt-1'>{profileForm.bio.length}/160</p>
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className='btn-primary'>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          )}
          {section === 'password' && (
            <div className='card p-6 space-y-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Change Password</h2>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>Current Password</label>
                <div className='relative'>
                  <input type={showCurrentPw ? 'text' : 'password'} value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} className='input-field pr-10' placeholder='Enter current password' />
                  <button onClick={() => setShowCurrentPw(!showCurrentPw)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>{showCurrentPw ? <HiEyeOff className='w-5 h-5' /> : <HiEye className='w-5 h-5' />}</button>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>New Password</label>
                <div className='relative'>
                  <input type={showNewPw ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} className='input-field pr-10' placeholder='Min. 6 characters' />
                  <button onClick={() => setShowNewPw(!showNewPw)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>{showNewPw ? <HiEyeOff className='w-5 h-5' /> : <HiEye className='w-5 h-5' />}</button>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>Confirm New Password</label>
                <input type='password' value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className='input-field' placeholder='Repeat new password' />
              </div>
              <button onClick={handleChangePassword} disabled={saving} className='btn-primary'>{saving ? 'Updating...' : 'Update Password'}</button>
            </div>
          )}
          {section === 'appearance' && (
            <div className='card p-6 space-y-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Appearance</h2>
              <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl'>
                <div><p className='font-medium text-gray-900 dark:text-white'>Dark Mode</p><p className='text-sm text-gray-500'>Switch between light and dark themes</p></div>
                <button onClick={toggleTheme} className={'relative w-12 h-6 rounded-full transition-colors ' + (isDark ? 'bg-primary-600' : 'bg-gray-300')}>
                  <span className={'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (isDark ? 'translate-x-6' : 'translate-x-0')} />
                </button>
              </div>
            </div>
          )}
          {section === 'notifications' && (
            <div className='card p-6 space-y-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Notifications</h2>
              {[{l:'Likes on your posts',d:'When someone likes your post'},{l:'Comments',d:'When someone comments on your post'},{l:'New followers',d:'When someone follows you'},{l:'Mentions',d:'When someone mentions you'}].map((item, i) => (
                <div key={i} className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl'>
                  <div><p className='font-medium text-gray-900 dark:text-white text-sm'>{item.l}</p><p className='text-xs text-gray-500'>{item.d}</p></div>
                  <button className='relative w-10 h-5 bg-primary-600 rounded-full'><span className='absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow' /></button>
                </div>
              ))}
            </div>
          )}
          {section === 'privacy' && (
            <div className='card p-6 space-y-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Privacy</h2>
              {[{l:'Public Profile',d:'Anyone can view your profile'},{l:'Show Activity Status',d:'Let others see when you were last active'}].map((item, i) => (
                <div key={i} className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl'>
                  <div><p className='font-medium text-gray-900 dark:text-white text-sm'>{item.l}</p><p className='text-xs text-gray-500'>{item.d}</p></div>
                  <button className='relative w-10 h-5 bg-primary-600 rounded-full'><span className='absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow' /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;