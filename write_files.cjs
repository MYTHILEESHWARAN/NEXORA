const fs = require('fs');
const path = require('path');

const root = 'c:/TASK-2 Nexora';

const files = {};

// ======= SERVER FILES =======

files['server/models/Comment.js'] = `import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: [true, 'Comment content is required'], maxlength: [500, 'Comment cannot exceed 500 characters'], trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
commentSchema.index({ post: 1, createdAt: -1 });
const Comment = mongoose.model('Comment', commentSchema);
export default Comment;`;

files['server/models/Message.js'] = `import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: String, required: true },
  content: { type: String, required: [true, 'Message content is required'], maxlength: [1000], trim: true },
  read: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.statics.getConversationId = function(userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};
const Message = mongoose.model('Message', messageSchema);
export default Message;`;

files['server/models/Notification.js'] = `import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'follow', 'mention'], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });
notificationSchema.index({ recipient: 1, createdAt: -1 });
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;`;

files['server/models/SavedPost.js'] = `import mongoose from 'mongoose';
const savedPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
}, { timestamps: true });
savedPostSchema.index({ user: 1, post: 1 }, { unique: true });
const SavedPost = mongoose.model('SavedPost', savedPostSchema);
export default SavedPost;`;

// Write all files
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Written:', relPath);
}
