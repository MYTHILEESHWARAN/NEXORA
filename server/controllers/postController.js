import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import SavedPost from '../models/SavedPost.js';
import Notification from '../models/Notification.js';

const POSTS_PER_PAGE = 10;
const emitNotif = (req, recipientId, payload) => {
  const io = req.app.get('io');
  const onlineUsers = req.app.get('onlineUsers');
  if (io && onlineUsers) { const sid = onlineUsers.get(recipientId.toString()); if (sid) io.to(sid).emit('newNotification', payload); }
};

export const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * POSTS_PER_PAGE;
    const currentUser = await User.findById(req.user._id);
    const feedUsers = [...currentUser.following, req.user._id];
    const posts = await Post.find({ author: { $in: feedUsers } })
      .populate('author', '_id name username profilePicture isOnline')
      .populate({ path: 'comments', populate: { path: 'author', select: '_id name username profilePicture' }, options: { sort: { createdAt: -1 }, limit: 3 } })
      .sort({ createdAt: -1 }).skip(skip).limit(POSTS_PER_PAGE);
    const total = await Post.countDocuments({ author: { $in: feedUsers } });
    res.status(200).json({ posts, currentPage: page, totalPages: Math.ceil(total / POSTS_PER_PAGE), hasMore: skip + posts.length < total });
  } catch (error) { res.status(500).json({ message: 'Server error fetching feed' }); }
};

export const getExplorePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * POSTS_PER_PAGE;
    const posts = await Post.find({}).populate('author', '_id name username profilePicture isOnline')
      .populate({ path: 'comments', populate: { path: 'author', select: '_id name username profilePicture' }, options: { limit: 2 } })
      .sort({ likes: -1, createdAt: -1 }).skip(skip).limit(POSTS_PER_PAGE);
    const total = await Post.countDocuments();
    res.status(200).json({ posts, currentPage: page, totalPages: Math.ceil(total / POSTS_PER_PAGE), hasMore: skip + posts.length < total });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', '_id name username profilePicture isOnline')
      .populate({ path: 'comments', populate: { path: 'author', select: '_id name username profilePicture' }, options: { sort: { createdAt: -1 } } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ post });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * POSTS_PER_PAGE;
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', '_id name username profilePicture')
      .populate({ path: 'comments', populate: { path: 'author', select: '_id name username profilePicture' }, options: { limit: 2 } })
      .sort({ createdAt: -1 }).skip(skip).limit(POSTS_PER_PAGE);
    const total = await Post.countDocuments({ author: req.params.userId });
    res.status(200).json({ posts, currentPage: page, totalPages: Math.ceil(total / POSTS_PER_PAGE), hasMore: skip + posts.length < total });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content && !req.file) return res.status(400).json({ message: 'Post must have text or an image' });
    if (content && content.length > 2200) return res.status(400).json({ message: 'Post content exceeds 2200 characters' });
    const postData = { author: req.user._id, content: content || '' };
    if (req.file) postData.image = '/uploads/' + req.file.filename;
    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id).populate('author', '_id name username profilePicture isOnline');
    res.status(201).json({ message: 'Post created', post: populatedPost });
  } catch (error) { res.status(500).json({ message: 'Server error creating post' }); }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized to edit this post' });
    const { content } = req.body;
    if (content !== undefined) post.content = content;
    if (req.file) post.image = '/uploads/' + req.file.filename;
    await post.save();
    const updatedPost = await Post.findById(post._id).populate('author', '_id name username profilePicture isOnline').populate({ path: 'comments', populate: { path: 'author', select: '_id name username profilePicture' } });
    res.status(200).json({ message: 'Post updated', post: updatedPost });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized to delete this post' });
    await Comment.deleteMany({ post: post._id });
    await SavedPost.deleteMany({ post: post._id });
    await Notification.deleteMany({ post: post._id });
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      await Notification.deleteOne({ recipient: post.author, sender: userId, type: 'like', post: post._id });
    } else {
      post.likes.push(userId);
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({ recipient: post.author, sender: userId, type: 'like', post: post._id, message: req.user.name + ' liked your post' });
        emitNotif(req, post.author, { type: 'like', sender: { _id: req.user._id, name: req.user.name, username: req.user.username, profilePicture: req.user.profilePicture }, post: post._id, message: req.user.name + ' liked your post' });
      }
    }
    await post.save();
    res.status(200).json({ liked: !isLiked, likesCount: post.likes.length, likes: post.likes });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = await Comment.create({ post: post._id, author: req.user._id, content: content.trim() });
    post.comments.push(comment._id);
    await post.save();
    const populatedComment = await Comment.findById(comment._id).populate('author', '_id name username profilePicture');
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({ recipient: post.author, sender: req.user._id, type: 'comment', post: post._id, message: req.user.name + ' commented on your post' });
      emitNotif(req, post.author, { type: 'comment', sender: { _id: req.user._id, name: req.user.name, username: req.user.username, profilePicture: req.user.profilePicture }, post: post._id, message: req.user.name + ' commented on your post' });
    }
    res.status(201).json({ message: 'Comment added', comment: populatedComment });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const post = await Post.findById(req.params.id);
    if (comment.author.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized to delete this comment' });
    await comment.deleteOne();
    await Post.findByIdAndUpdate(req.params.id, { $pull: { comments: req.params.commentId } });
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const existing = await SavedPost.findOne({ user: req.user._id, post: post._id });
    if (existing) { await existing.deleteOne(); return res.status(200).json({ saved: false, message: 'Post unsaved' }); }
    await SavedPost.create({ user: req.user._id, post: post._id });
    return res.status(200).json({ saved: true, message: 'Post saved' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * POSTS_PER_PAGE;
    const savedPosts = await SavedPost.find({ user: req.user._id })
      .populate({ path: 'post', populate: { path: 'author', select: '_id name username profilePicture' } })
      .sort({ createdAt: -1 }).skip(skip).limit(POSTS_PER_PAGE);
    const total = await SavedPost.countDocuments({ user: req.user._id });
    const posts = savedPosts.map(sp => sp.post).filter(Boolean);
    res.status(200).json({ posts, currentPage: page, totalPages: Math.ceil(total / POSTS_PER_PAGE), hasMore: skip + posts.length < total });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.status(400).json({ message: 'Search query is required' });
    const posts = await Post.find({ content: { $regex: q.trim(), $options: 'i' } }).populate('author', '_id name username profilePicture').sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ posts });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const sharePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ shares: post.shares });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};