import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexora_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('nexora_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => {
    const form = new FormData();
    Object.keys(data).forEach(k => { if (data[k] !== undefined && data[k] !== null) form.append(k, data[k]); });
    return api.post('/auth/register', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password/' + token, { password }),
};

export const userAPI = {
  getUser: (id) => api.get('/users/' + id),
  updateUser: (id, data) => {
    const form = new FormData();
    Object.keys(data).forEach(k => { if (data[k] !== undefined && data[k] !== null) form.append(k, data[k]); });
    return api.put('/users/' + id, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  searchUsers: (q) => api.get('/users/search?q=' + encodeURIComponent(q)),
  followUser: (id) => api.post('/users/' + id + '/follow'),
  getFollowers: (id) => api.get('/users/' + id + '/followers'),
  getFollowing: (id) => api.get('/users/' + id + '/following'),
  getSuggestions: () => api.get('/users/suggestions'),
};

export const postAPI = {
  getFeed: (page = 1) => api.get('/posts/feed?page=' + page),
  getExplore: (page = 1) => api.get('/posts/explore?page=' + page),
  getSaved: (page = 1) => api.get('/posts/saved?page=' + page),
  searchPosts: (q) => api.get('/posts/search?q=' + encodeURIComponent(q)),
  getUserPosts: (userId, page = 1) => api.get('/posts/user/' + userId + '?page=' + page),
  getPost: (id) => api.get('/posts/' + id),
  createPost: (data) => {
    const form = new FormData();
    if (data.content) form.append('content', data.content);
    if (data.image) form.append('image', data.image);
    return api.post('/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  updatePost: (id, data) => {
    const form = new FormData();
    if (data.content !== undefined) form.append('content', data.content);
    if (data.image) form.append('image', data.image);
    return api.put('/posts/' + id, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deletePost: (id) => api.delete('/posts/' + id),
  likePost: (id) => api.post('/posts/' + id + '/like'),
  addComment: (id, content) => api.post('/posts/' + id + '/comment', { content }),
  deleteComment: (postId, commentId) => api.delete('/posts/' + postId + '/comment/' + commentId),
  savePost: (id) => api.post('/posts/' + id + '/save'),
  sharePost: (id) => api.post('/posts/' + id + '/share'),
};

export const notificationAPI = {
  getNotifications: (page = 1) => api.get('/notifications?page=' + page),
  markAllRead: () => api.put('/notifications/read'),
  markOneRead: (id) => api.put('/notifications/' + id + '/read'),
  deleteNotification: (id) => api.delete('/notifications/' + id),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId, page = 1) => api.get('/messages/' + userId + '?page=' + page),
  sendMessage: (receiverId, content) => api.post('/messages', { receiverId, content }),
  deleteMessage: (messageId) => api.delete('/messages/' + messageId),
};
