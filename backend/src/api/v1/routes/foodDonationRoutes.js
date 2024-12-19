const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('../middleware/upload');
const { addFoodDonation, getFoodDonations } = require('../controllers/foodDonationController');

// Routes
router.post('/', protect, multer.single('image'), addFoodDonation);
router.get('/', getFoodDonations);

module.exports = router;
