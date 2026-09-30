import express from 'express';
import { getConversations, getMessages, sendMessage, deleteMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessage);
router.delete('/:messageId', protect, deleteMessage);
export default router;
