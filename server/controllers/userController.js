import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id).populate('followers', '_id name username profilePicture isOnline').populate('following', '_id name username profilePicture isOnline');
    } else {
      user = await User.findOne({ username: id.toLowerCase() }).populate('followers', '_id name username profilePicture isOnline').populate('following', '_id name username profilePicture isOnline');
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    const postCount = await Post.countDocuments({ author: user._id });
    res.status(200).json({ user: { ...user.toJSON(), postCount } });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user._id.toString() !== id) return res.status(403).json({ message: 'Not authorized to update this profile' });
    const { name, username, bio, currentPassword, newPassword } = req.body;
    const user = await User.findById(id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (username && username.toLowerCase() !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
      user.username = username.toLowerCase();
    }
    if (req.file) user.profilePicture = '/uploads/' + req.file.filename;
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required' });
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
      user.password = newPassword;
    }
    await user.save();
    const updatedUser = await User.findById(id).populate('followers', '_id name username profilePicture').populate('following', '_id name username profilePicture');
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Username already taken' });
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.status(400).json({ message: 'Search query is required' });
    const users = await User.find({ '': [{ name: { '': q.trim(), '': 'i' } }, { username: { '': q.trim(), '': 'i' } }], _id: { '': req.user._id } }).select('_id name username profilePicture bio followers isOnline').limit(20);
    res.status(200).json({ users });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;
    if (targetId === currentUserId.toString()) return res.status(400).json({ message: 'You cannot follow yourself' });
    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.includes(targetId);
    if (isFollowing) {
      await User.findByIdAndUpdate(currentUserId, { '': { following: targetId } });
      await User.findByIdAndUpdate(targetId, { '': { followers: currentUserId } });
      await Notification.deleteOne({ recipient: targetId, sender: currentUserId, type: 'follow' });
      res.status(200).json({ message: 'Unfollowed successfully', following: false });
    } else {
      await User.findByIdAndUpdate(currentUserId, { '': { following: targetId } });
      await User.findByIdAndUpdate(targetId, { '': { followers: currentUserId } });
      await Notification.create({ recipient: targetId, sender: currentUserId, type: 'follow', message: currentUser.name + ' started following you' });
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      if (io && onlineUsers) { const sid = onlineUsers.get(targetId); if (sid) io.to(sid).emit('newNotification', { type: 'follow', sender: { _id: currentUser._id, name: currentUser.name, username: currentUser.username, profilePicture: currentUser.profilePicture }, message: currentUser.name + ' started following you' }); }
      res.status(200).json({ message: 'Followed successfully', following: true });
    }
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', '_id name username profilePicture bio isOnline');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ followers: user.followers });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', '_id name username profilePicture bio isOnline');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ following: user.following });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const following = currentUser.following;
    const users = await User.find({ _id: { '': [...following, req.user._id] } }).select('_id name username profilePicture bio followers').limit(10).sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};