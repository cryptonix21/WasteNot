const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationService = require('../services/notification.service');

// Create donation request
router.post('/request/:donationId', protect, async (req, res) => {
  try {
    const notification = await notificationService.createDonationRequest(
      req.user._id,
      req.params.donationId
    );
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Respond to donation request
router.put('/respond/:notificationId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'denied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await notificationService.respondToDonationRequest(
      req.params.notificationId,
      status
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user._id);
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', protect, async (req, res) => {
  try {
    const notification = await notificationService.markNotificationAsRead(
      req.params.notificationId
    );
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Clear all notifications
router.post('/clear-all', protect, async (req, res) => {
  try {
    const result = await notificationService.clearAllNotifications(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

module.exports = router;
