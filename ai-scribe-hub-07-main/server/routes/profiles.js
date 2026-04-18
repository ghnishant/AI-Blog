import express from 'express';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get profile by user_id
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.params.userId }).populate('user_id', 'email');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile (owns the profile)
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user.id },
      { ...req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
