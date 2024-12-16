const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../services/analytics.service');

// Get analytics data
router.get('/', async (req, res) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
