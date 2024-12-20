const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addFoodDonation, getFoodDonations } = require('../controllers/foodDonationController');

// Routes
router.post('/', protect, addFoodDonation);
router.get('/', getFoodDonations);

module.exports = router;
