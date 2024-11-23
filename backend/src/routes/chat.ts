import express from 'express';
import { authMiddleware } from '../middleware/auth';
import Message from '../models/Message';

const router = express.Router();

router.get('/history/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error });
  }
});

router.get('/offline-messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ 
      receiver: req.userId, 
      isDelivered: false 
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offline messages', error });
  }
});

export default router;

