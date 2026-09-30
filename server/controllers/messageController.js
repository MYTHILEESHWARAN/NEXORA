import Message from '../models/Message.js';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }], deleted: false } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    const conversations = await Promise.all(messages.map(async (conv) => {
      const msg = conv.lastMessage;
      const otherUserId = msg.sender.toString() === userId ? msg.receiver : msg.sender;
      const otherUser = await User.findById(otherUserId).select('_id name username profilePicture isOnline lastSeen');
      const unreadCount = await Message.countDocuments({ conversationId: conv._id, receiver: req.user._id, read: false });
      return { conversationId: conv._id, otherUser, lastMessage: { content: msg.content, sender: msg.sender, createdAt: msg.createdAt, read: msg.read }, unreadCount };
    }));
    res.status(200).json({ conversations });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = Message.getConversationId(req.user._id, userId);
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;
    const messages = await Message.find({ conversationId, deleted: false })
      .populate('sender', '_id name username profilePicture')
      .populate('receiver', '_id name username profilePicture')
      .sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Message.countDocuments({ conversationId, deleted: false });
    await Message.updateMany({ conversationId, receiver: req.user._id, read: false }, { read: true });
    res.status(200).json({ messages: messages.reverse(), currentPage: page, totalPages: Math.ceil(total / limit), hasMore: skip + messages.length < total });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content || !content.trim()) return res.status(400).json({ message: 'Receiver and message content are required' });
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });
    const conversationId = Message.getConversationId(req.user._id, receiverId);
    const message = await Message.create({ sender: req.user._id, receiver: receiverId, conversationId, content: content.trim() });
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', '_id name username profilePicture')
      .populate('receiver', '_id name username profilePicture');
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    if (io && onlineUsers) { const sid = onlineUsers.get(receiverId.toString()); if (sid) io.to(sid).emit('newMessage', populatedMessage); }
    res.status(201).json({ message: populatedMessage });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized to delete this message' });
    message.deleted = true;
    message.content = 'This message was deleted';
    await message.save();
    res.status(200).json({ message: 'Message deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};
