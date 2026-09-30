import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return ''; }
};
export const formatDate = (date) => {
  try { return format(new Date(date), 'MMM d, yyyy'); } catch { return ''; }
};
export const formatTime = (date) => {
  try { return format(new Date(date), 'h:mm a'); } catch { return ''; }
};
export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};
export const getAvatarUrl = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http')) return profilePicture;
  return 'http://localhost:5000' + profilePicture;
};
export const formatCount = (count) => {
  if (!count) return '0';
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
  return count.toString();
};
export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
};
