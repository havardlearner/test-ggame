const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  const { username, avatar } = req.body;
  
  // Build user object
  const userFields = {};
  if (username) userFields.username = username;
  if (avatar) userFields.avatar = avatar;
  
  try {
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Subscribe to a user
router.post('/subscribe/:id', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    
    if (!targetUser || !currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if already subscribed
    if (currentUser.subscriptions.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Already subscribed to this user' });
    }
    
    // Add to subscriptions
    currentUser.subscriptions.push(req.params.id);
    await currentUser.save();
    
    // Add to target user's subscribers
    targetUser.subscribers.push(req.user.id);
    await targetUser.save();
    
    res.json({ msg: 'Subscription successful' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// Unsubscribe from a user
router.post('/unsubscribe/:id', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    
    if (!targetUser || !currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if not subscribed
    if (!currentUser.subscriptions.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Not subscribed to this user' });
    }
    
    // Remove from subscriptions
    currentUser.subscriptions = currentUser.subscriptions.filter(
      sub => sub.toString() !== req.params.id
    );
    await currentUser.save();
    
    // Remove from target user's subscribers
    targetUser.subscribers = targetUser.subscribers.filter(
      sub => sub.toString() !== req.user.id
    );
    await targetUser.save();
    
    res.json({ msg: 'Unsubscription successful' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// Get mutual subscribers
router.get('/mutual-subscribers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find users who are both in subscriptions and subscribers
    const mutualIds = user.subscriptions.filter(subId => 
      user.subscribers.includes(subId)
    );
    
    // Get user details for mutual subscribers
    const mutualSubscribers = await User.find({
      _id: { $in: mutualIds }
    }).select('-password');
    
    res.json(mutualSubscribers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 