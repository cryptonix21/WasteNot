const FoodDonation = require('../models/FoodDonation');
const cloudinary = require('../config/cloudinary');
const { validateFoodDonation } = require('../utils/validation');
const path = require('path');
const fs = require('fs').promises;

// Create a new food donation
exports.addFoodDonation = async (req, res) => {
  try {
    // Parse the JSON data from the form data
    const foodData = JSON.parse(req.body.data);

    // Validate the request data
    const { error, value } = validateFoodDonation(foodData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Upload image to Cloudinary if provided
    let imageData = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'food-donations',
        });
        imageData = {
          url: result.secure_url,
          publicId: result.public_id,
        };
        // Clean up the temporary file
        await fs.unlink(req.file.path);
      } catch (uploadError) {
        return res.status(500).json({ error: 'Error uploading image' });
      }
    }

    // Create new food donation with validated data
    const foodDonation = new FoodDonation({
      ...value,
      image: imageData,
      userId: req.user._id,
      status: 'available',
      createdAt: new Date()
    });

    // Save to database
    await foodDonation.save();

    res.status(201).json({
      success: true,
      message: 'Food donation created successfully',
      data: foodDonation
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding food donation' });
  }
};

// Get all food donations with filtering and pagination
exports.getFoodDonations = async (req, res) => {
  try {
    const {
      category,
      radius = 10, // Default 10km radius
      latitude,
      longitude,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { status: 'available' };

    // Apply category filter if provided
    if (category) {
      query.category = category;
    }

    // Apply location filter if coordinates provided
    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const donations = await FoodDonation.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .lean();

    // Get total count for pagination
    const total = await FoodDonation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving food donations' });
  }
};

// Get food donation by ID
exports.getFoodDonationById = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('reservedBy', 'name email');
    if (!donation) {
      return res.status(404).json({ error: 'Food donation not found' });
    }
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update food donation
exports.updateFoodDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Food donation not found' });
    }

    if (donation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this donation' });
    }

    const validationError = validateFoodDonation(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const updatedDonation = await FoodDonation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedDonation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete food donation
exports.deleteFoodDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Food donation not found' });
    }

    if (donation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this donation' });
    }

    await donation.remove();
    res.json({ message: 'Food donation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload food images
exports.uploadFoodImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Food donation not found' });
    }

    if (donation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to upload images for this donation' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    donation.images = [...donation.images, ...imageUrls];
    await donation.save();

    res.json({ images: donation.images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reserve food donation
exports.reserveFoodDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Food donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ error: 'This donation is not available for reservation' });
    }

    if (donation.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot reserve your own donation' });
    }

    donation.status = 'reserved';
    donation.reservedBy = req.user._id;
    donation.reservationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    await donation.save();

    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Food donation not found' });
    }

    if (donation.status !== 'reserved') {
      return res.status(400).json({ error: 'This donation is not currently reserved' });
    }

    if (donation.reservedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to cancel this reservation' });
    }

    donation.status = 'available';
    donation.reservedBy = null;
    donation.reservationExpiry = null;
    await donation.save();

    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete donation
exports.completeDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Food donation not found' });
    }

    if (donation.status !== 'reserved') {
      return res.status(400).json({ error: 'This donation must be reserved before completion' });
    }

    if (![donation.userId.toString(), donation.reservedBy.toString()].includes(req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to complete this donation' });
    }

    donation.status = 'completed';
    await donation.save();

    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get nearby donations
exports.getNearbyDonations = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const donations = await FoodDonation.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      status: 'available',
    }).populate('userId', 'name email');

    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's donations
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ userId: req.user._id })
      .populate('reservedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's reservations
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await FoodDonation.find({ reservedBy: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
