const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addFoodDonation,
  getFoodDonations,
  getFoodDonationById,
  updateFoodDonation,
  deleteFoodDonation,
  uploadFoodImages,
  reserveFoodDonation,
  cancelReservation,
  completeDonation,
  getNearbyDonations,
  getMyDonations,
  getMyReservations,
} = require('../controllers/foodDonationController');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getFoodDonations);
router.get('/nearby', getNearbyDonations);
router.get('/:id', getFoodDonationById);

// Protected routes
router.use(protect);

// Food donation routes
router.post('/', upload.single('image'), addFoodDonation);
router.put('/:id', upload.single('image'), updateFoodDonation);
router.delete('/:id', deleteFoodDonation);

// Reservation routes
router.post('/:id/reserve', reserveFoodDonation);
router.post('/:id/cancel-reservation', cancelReservation);
router.post('/:id/complete', completeDonation);

// User-specific routes
router.get('/user/donations', getMyDonations);
router.get('/user/reservations', getMyReservations);

module.exports = router;
