import mongoose from 'mongoose';
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
export default Message;