const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const { signupValidation, signinValidation, validate } = require('../middleware/validation.middleware');
const { protect } = require('../middleware/authMiddleware');
const crypto = require('crypto');

const router = express.Router();

// Helper function to generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Sign Up Route
router.post('/signup', signupValidation, validate, async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name: fullName, // Map fullName to name in the database
    });

    await user.save();

    // Create JWT token for immediate signin
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return the response with token and user data
    return res.status(201).json({
      message: 'User Created Successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Sign In Route
router.post('/signin', signinValidation, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'User Logged In Successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error signing in' });
  }
});

// Get Profile Route
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('donations', 'foodName status createdAt')
      .populate('reservations', 'foodName status createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      donations: user.donations || [],
      reservations: user.reservations || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Forgot Password Route
router.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token and expiry
    const resetToken = generateResetToken();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save reset token and expiry to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Return success response with token
    res.status(200).json({
      success: true,
      message: 'Reset token generated successfully',
      token: resetToken
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error processing forgot password request' 
    });
  }
});

// Reset Password Route
router.post('/resetpassword', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // Find user by email and valid reset token
    const user = await User.findOne({
      email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

module.exports = router;
