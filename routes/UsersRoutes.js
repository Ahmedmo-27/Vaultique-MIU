const express = require('express');
const User = require('../models/Users');
const bcrypt = require('bcryptjs'); // Using bcryptjs for consistency
const validator = require('validator');
const { authenticateJWT } = require('../middleware/jwt');
const Product = require('../models/Products');
const mongoose = require('mongoose');
const router = express.Router();

// Remove authentication requirement for all routes
// router.use(authenticateJWT);

// Sign-up route
router.post('/signup', async (req, res) => {
  try {
    const {
      Name,
      username,
      email,
      password,
      DOB,
      phone_number,
      language,
      Address,
      Payment,
      role, // Optional, but only allow 'user' for security
    } = req.body;

    // Basic validation for top-level fields
    if (
      !Name ||
      !username ||
      !email ||
      !password ||
      !DOB ||
      !phone_number ||
      !language ||
      !Address ||
      !Payment
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate Address fields
    const addressFields = ['city', 'street', 'addressType', 'state', 'country', 'postalCode'];
    for (const field of addressFields) {
      if (!Address[field]) {
        return res.status(400).json({ message: `Address field '${field}' is required` });
      }
    }

    // Validate Payment fields
    const paymentFields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv', 'paymentType'];
    for (const field of paymentFields) {
      if (!Payment[field]) {
        return res.status(400).json({ message: `Payment field '${field}' is required` });
      }
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (!validator.isMobilePhone(phone_number)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }, { phone_number }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email, username or phone number already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Only allow 'user' role to be set via signup
    const userRole = role && role.toLowerCase() === 'admin' ? 'user' : role || 'user';

    // Create new user with all fields
    const newUser = new User({
      Name,
      username,
      email,
      password: hashedPassword,
      DOB: new Date(DOB),
      phone_number,
      language,
      role: userRole,
      Address: {
        city: Address.city,
        street: Address.street,
        addressType: Address.addressType,
        state: Address.state,
        country: Address.country,
        postalCode: Address.postalCode,
      },
      Payment: {
        cardNumber: Payment.cardNumber,
        cardHolder: Payment.cardHolder,
        expiryDate: Payment.expiryDate,
        cvv: Payment.cvv,
        paymentType: Payment.paymentType,
      },
    });

    // Save user to database (will trigger schema validation)
    const savedUser = await newUser.save();

    // Return response (without sensitive data)
    const userToReturn = savedUser.toObject();
    delete userToReturn.password;
    delete userToReturn.phone_number;
    if (userToReturn.Payment) {
      delete userToReturn.Payment.cardNumber;
      delete userToReturn.Payment.cvv;
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: userToReturn,
    });
  } catch (error) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user data (without sensitive information)
    const userToReturn = user.toObject();
    delete userToReturn.password;
    delete userToReturn.phone_number;
    if (userToReturn.Payment) {
      delete userToReturn.Payment.cardNumber;
      delete userToReturn.Payment.cvv;
    }

    res.json({
      message: 'Login successful',
      user: userToReturn,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get all users (excluding sensitive fields) - public endpoint
router.get('/', async (req, res) => {
  try {
    // Exclude password and phone_number at the query level
    const users = await User.find({}, '-password -phone_number').lean();

    // Remove sensitive payment info from each user
    users.forEach((user) => {
      if (user.Payment) {
        delete user.Payment.cardNumber;
        delete user.Payment.cvv;
      }
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get user by ID - public endpoint
router.get('/:id', async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    const user = await User.findById(req.params.id, '-password -phone_number').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove sensitive payment info
    if (user.Payment) {
      delete user.Payment.cardNumber;
      delete user.Payment.cvv;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Wishlist routes
router.post('/api/wishlist/toggle', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to manage your wishlist'
      });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product exists in wishlist
    const wishlistItemIndex = user.wishlist.findIndex(
      item => item.product && item.product.toString() === productId
    );

    if (wishlistItemIndex === -1) {
      // Add to wishlist
      user.wishlist.push({
        product: productId,
        addedAt: new Date()
      });
    } else {
      // Remove from wishlist
      user.wishlist.splice(wishlistItemIndex, 1);
    }

    await user.save();

    res.json({
      success: true,
      message: wishlistItemIndex === -1 ? 'Product added to wishlist' : 'Product removed from wishlist',
      inWishlist: wishlistItemIndex === -1
    });
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating wishlist'
    });
  }
});

router.get('/wishlist', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'wishlist.product',
                populate: [
                    { path: 'brand' },
                    { path: 'Vcollection' }
                ]
            });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Format wishlist items with proper brand and collection names
        const wishlistItems = user.wishlist
            .filter(item => item.product) // Filter out any null products
            .map(item => ({
                ...item.product.toObject(),
                brand: item.product.brand ? item.product.brand.name : 'Unknown Brand',
                Vcollection: item.product.Vcollection ? item.product.Vcollection.name : 'Unknown Collection'
            }));

        console.log('Wishlist items:', wishlistItems); // Debug log

        res.render('wishlist', {
            title: 'My Wishlist',
            wishlistItems,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load wishlist. Please try again later.'
        });
    }
});

module.exports = router;
