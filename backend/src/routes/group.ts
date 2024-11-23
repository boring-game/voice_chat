import express from 'express';
import { authMiddleware } from '../middleware/auth';
import Group from '../models/Group';
import User from '../models/User';
import crypto from 'crypto';

const router = express.Router();

// ... (保留之前的路由)

// 生成群组邀请链接
router.post('/:groupId/invite', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (!group.admins.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized to generate invite' });
    }
    const inviteCode = crypto.randomBytes(6).toString('hex');
    group.inviteCodes.push({ code: inviteCode, createdBy: req.userId, createdAt: new Date() });
    await group.save();
    res.json({ inviteCode });
  } catch (error) {
    res.status(500).json({ message: 'Error generating invite', error });
  }
});

// 通过邀请链接加入群组
router.post('/join-by-invite', authMiddleware, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findOne({ 'inviteCodes.code': inviteCode });
    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }
    if (!group.members.includes(req.userId)) {
      group.members.push(req.userId);
      await group.save();
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error joining group', error });
  }
});

export default router;

