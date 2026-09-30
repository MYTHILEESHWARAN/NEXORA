import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const onlineUsers = new Map();

export const initSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication token missing'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log('Socket connected: ' + socket.user.username);
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('userOnline', userId);
    socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
    socket.join('user:' + userId);

    socket.on('typing', ({ receiverId }) => {
      const sid = onlineUsers.get(receiverId);
      if (sid) io.to(sid).emit('userTyping', { senderId: userId });
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const sid = onlineUsers.get(receiverId);
      if (sid) io.to(sid).emit('userStopTyping', { senderId: userId });
    });

    socket.on('messageRead', ({ senderId, conversationId }) => {
      const sid = onlineUsers.get(senderId);
      if (sid) io.to(sid).emit('messagesSeen', { conversationId });
    });

    socket.on('disconnect', async () => {
      console.log('Socket disconnected: ' + socket.user.username);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('userOffline', userId);
    });
  });

  app.set('io', io);
  app.set('onlineUsers', onlineUsers);
  return io;
};
