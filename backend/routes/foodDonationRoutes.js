const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('../config/multer');
const { addFoodDonation, getFoodDonations } = require('../controllers/foodDonationController');

// Routes
router.post('/', protect, multer.single('image'), addFoodDonation);
router.get('/', getFoodDonations);

module.exports = router;
