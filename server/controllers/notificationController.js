import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', '_id name username profilePicture')
      .populate('post', '_id content image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
    const total = await Notification.countDocuments({ recipient: req.user._id });
    res.status(200).json({ notifications, unreadCount, currentPage: page, totalPages: Math.ceil(total / limit), hasMore: skip + notifications.length < total });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const markOneRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ notification });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};
