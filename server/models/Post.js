import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({ author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, content: { type: String, maxlength: [2200, 'Post content cannot exceed 2200 characters'], default: " }, image: { type: String, default: " }, likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], shares: { type: Number, default: 0 } }, { timestamps: true });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
const Post = mongoose.model('Post', postSchema);
export default Post;