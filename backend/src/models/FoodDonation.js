const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const foodDonationSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    minlength: [2, 'Food name must be at least 2 characters long']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fruits & Vegetables', 'Cooked Meals', 'Baked Goods', 'Dairy Products', 'Canned Foods', 'Beverages', 'Other']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'g', 'pieces', 'servings', 'liters', 'ml']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    shareExactLocation: {
      type: Boolean,
      default: true
    }
  },
  image: {
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'completed', 'expired'],
    default: 'available'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
foodDonationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
