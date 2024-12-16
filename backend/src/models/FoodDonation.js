const mongoose = require('mongoose');

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
    enum: {
      values: ['Fruits & Vegetables', 'Cooked Meals', 'Baked Goods', 'Dairy Products', 'Canned Foods', 'Beverages', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['kg', 'g', 'pieces', 'servings', 'liters', 'ml'],
      message: '{VALUE} is not a valid unit'
    }
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
      required: true,
      validate: {
        validator: function(coordinates) {
          return coordinates.length === 2 &&
                 coordinates[0] >= -180 && coordinates[0] <= 180 && // longitude
                 coordinates[1] >= -90 && coordinates[1] <= 90;    // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
      }
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
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
      required: false
    },
    publicId: {
      type: String,
      required: false
    }
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'reserved', 'completed', 'expired'],
      message: '{VALUE} is not a valid status'
    },
    default: 'available'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reservedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
foodDonationSchema.index({ location: '2dsphere' });
foodDonationSchema.index({ status: 1, createdAt: -1 });
foodDonationSchema.index({ category: 1, status: 1 });

// Virtual for time until expiry
foodDonationSchema.virtual('timeUntilExpiry').get(function() {
  return this.expiryDate ? this.expiryDate - new Date() : null;
});

// Pre-save middleware to check expiry date
foodDonationSchema.pre('save', function(next) {
  if (this.expiryDate && this.expiryDate <= new Date()) {
    this.status = 'expired';
  }
  next();
});

const FoodDonation = mongoose.model('FoodDonation', foodDonationSchema);

module.exports = FoodDonation;
