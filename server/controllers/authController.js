import User from '../models/User.js';
import { generateToken, generateResetToken } from '../utils/generateToken.js';
import crypto from 'crypto';

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ message: 'Please fill in all required fields' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'Email already registered' });
    if (await User.findOne({ username: username.toLowerCase() })) return res.status(400).json({ message: 'Username already taken' });
    let profilePicture = '';
    if (req.file) profilePicture = '/uploads/' + req.file.filename;
    const user = await User.create({ name, username: username.toLowerCase(), email: email.toLowerCase(), password, profilePicture });
    const token = generateToken(user._id);
    res.status(201).json({ message: 'Registration successful', token, user: { _id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture, bio: user.bio, followers: user.followers, following: user.following, createdAt: user.createdAt } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.status(200).json({ message: 'Login successful', token, user: { _id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture, bio: user.bio, followers: user.followers, following: user.following, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', '_id name username profilePicture')
      .populate('following', '_id name username profilePicture');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
    const resetToken = generateResetToken();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = (process.env.CLIENT_URL || 'http://localhost:5173') + '/reset-password/' + resetToken;
    res.status(200).json({ message: 'Password reset link sent to email', resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { '': Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const newToken = generateToken(user._id);
    res.status(200).json({ message: 'Password reset successful', token: newToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error during password reset' });
  }
};