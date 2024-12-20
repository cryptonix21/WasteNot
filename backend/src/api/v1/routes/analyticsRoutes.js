const express = require('express');
const router = express.Router();
const { getImpactStats } = require('../controllers/analyticsController');

// Routes
router.get('/impact', getImpactStats);

module.exports = router;
