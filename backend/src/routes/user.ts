import express from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error });
  }
});

router.put('/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error });
  }
});

router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends', '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends list', error });
  }
});

router.post('/friends', authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found' });
    }
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Already friends' });
    }
    user.friends.push(friendId);
    friend.friends.push(req.userId);
    await user.save();
    await friend.save();
    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding friend', error });
  }
});

router.post('/register-device', authMiddleware, async (req, res) => {
  try {
    const { deviceId, deviceName } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const existingDeviceIndex = user.devices.findIndex(device => device.deviceId === deviceId);
    if (existingDeviceIndex !== -1) {
      // 更新现有设备
      user.devices[existingDeviceIndex].name = deviceName;
      user.devices[existingDeviceIndex].lastActive = new Date();
    } else {
      // 添加新设备
      user.devices.push({ deviceId, name: deviceName, lastActive: new Date() });
    }
    
    await user.save();
    res.json({ message: 'Device registered successfully', devices: user.devices });
  } catch (error) {
    res.status(500).json({ message: 'Error registering device', error });
  }
});

router.get('/devices', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.devices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching devices', error });
  }
});

router.delete('/device/:deviceId', authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.devices = user.devices.filter(device => device.deviceId !== deviceId);
    await user.save();
    res.json({ message: 'Device removed successfully', devices: user.devices });
  } catch (error) {
    res.status(500).json({ message: 'Error removing device', error });
  }
});

export default router;

