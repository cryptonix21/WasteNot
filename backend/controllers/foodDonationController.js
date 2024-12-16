const FoodDonation = require('../models/FoodDonation');
const cloudinary = require('../config/cloudinary');
const { validateFoodDonation } = require('../utils/validation');

// @desc    Add a new food donation
// @route   POST /api/donations
// @access  Private
exports.addFoodDonation = async (req, res) => {
  try {
    const { error } = validateFoodDonation(req.body.data);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Parse the stringified data
    const donationData = JSON.parse(req.body.data);

    // Upload image to Cloudinary if provided
    let imageData = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'food-donations',
      });
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // Create new food donation
    const foodDonation = new FoodDonation({
      ...donationData,
      image: imageData,
      userId: req.user._id,
    });

    // Save to database
    await foodDonation.save();

    res.status(201).json(foodDonation);
  } catch (error) {
    console.error('Error in addFoodDonation:', error);
    res.status(500).json({ error: 'Error adding food donation' });
  }
};

// @desc    Get all food donations
// @route   GET /api/donations
// @access  Public
exports.getFoodDonations = async (req, res) => {
  try {
    const { category, radius, latitude, longitude, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by location if coordinates and radius provided
    if (latitude && longitude && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        },
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get donations
    const donations = await FoodDonation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    // Get total count
    const total = await FoodDonation.countDocuments(query);

    res.json({
      data: donations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Error in getFoodDonations:', error);
    res.status(500).json({ error: 'Error getting food donations' });
  }
};
