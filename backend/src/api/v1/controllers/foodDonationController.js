const FoodDonation = require('../../../models/FoodDonation');
const cloudinary = require('../../../config/cloudinary');
const { validateFoodDonation } = require('../../../utils/validation');

// @desc    Add a new food donation
// @route   POST /api/donations
// @access  Private
exports.addFoodDonation = async (req, res) => {
  try {
    // Handle both stringified and direct JSON data
    let donationData;
    try {
      donationData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Validate the parsed data
    const { error } = validateFoodDonation(donationData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

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
    } else {
      // Set default image if no image is provided
      imageData = {
        url: process.env.DEFAULT_FOOD_IMAGE || 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/food-donations/default-food',
        publicId: 'default-food'
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

    // Get donations with all fields including image
    const donations = await FoodDonation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .lean(); // Use lean() for better performance

    // Get total count
    const total = await FoodDonation.countDocuments(query);

    // Ensure each donation has an image URL
    const processedDonations = donations.map(donation => ({
      ...donation,
      image: donation.image || {
        url: process.env.DEFAULT_FOOD_IMAGE || 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/food-donations/default-food',
        publicId: 'default-food'
      }
    }));

    res.json({
      data: processedDonations,
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
