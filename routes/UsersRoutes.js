const express = require('express');
const User = require('../models/Users');
const bcrypt = require('bcryptjs'); // Using bcryptjs for consistency
const validator = require('validator');
const { authenticateJWT } = require('../middleware/jwt');
const Product = require('../models/Products');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Orders');
const userController = require('../controllers/User');

// Store temporary wishlists for non-logged-in users
const temporaryWishlists = new Map();

// Middleware to handle temporary wishlist
const handleTemporaryWishlist = (req, res, next) => {
  if (!req.user) {
    // Generate or get temporary user ID
    const tempUserId = req.cookies.tempUserId || new mongoose.Types.ObjectId().toString();
    if (!req.cookies.tempUserId) {
      res.cookie('tempUserId', tempUserId, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
    }
    req.tempUserId = tempUserId;
    
    // Initialize temporary wishlist if it doesn't exist
    if (!temporaryWishlists.has(tempUserId)) {
      temporaryWishlists.set(tempUserId, []);
    }
  }
  next();
};

// Apply temporary wishlist middleware to all routes
router.use(handleTemporaryWishlist);

// Public routes (no authentication required)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password -phone_number -Payment.cardNumber -Payment.cvv').lean();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    const user = await User.findById(req.params.id, '-password -phone_number -Payment.cardNumber -Payment.cvv').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
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
    });
  }
});

// Protected routes (authentication required)
router.get('/account/details', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, '-password -Payment.cardNumber -Payment.cvv').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching account details',
    });
  }
});

// Wishlist routes
router.post('/wishlist/toggle', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (req.user) {
      // Handle wishlist for logged-in user
      const user = await User.findById(req.user.id);
      const wishlistItem = user.wishlist.find(item => item.product.toString() === productId);
      
      if (wishlistItem) {
        user.wishlist = user.wishlist.filter(item => item.product.toString() !== productId);
        await user.save();
        return res.json({
          success: true,
          message: 'Product removed from wishlist',
          inWishlist: false
        });
      } else {
        user.wishlist.push({ product: productId });
        await user.save();
        return res.json({
          success: true,
          message: 'Product added to wishlist',
          inWishlist: true
        });
      }
    } else {
      // Handle wishlist for non-logged-in user
      const tempWishlist = temporaryWishlists.get(req.tempUserId);
      const existingItem = tempWishlist.find(item => item.product.toString() === productId);
      
      if (existingItem) {
        temporaryWishlists.set(
          req.tempUserId,
          tempWishlist.filter(item => item.product.toString() !== productId)
        );
        return res.json({
          success: true,
          message: 'Product removed from wishlist',
          inWishlist: false
        });
      } else {
        tempWishlist.push({ product: productId, addedAt: new Date() });
        temporaryWishlists.set(req.tempUserId, tempWishlist);
        return res.json({
          success: true,
          message: 'Product added to wishlist',
          inWishlist: true
        });
      }
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating wishlist',
    });
  }
});

router.get('/wishlist', async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id).populate('wishlist.product');
      return res.json({
        success: true,
        data: user.wishlist
      });
    } else {
      const tempWishlist = temporaryWishlists.get(req.tempUserId) || [];
      const populatedWishlist = await Promise.all(
        tempWishlist.map(async (item) => {
          const product = await Product.findById(item.product);
          return {
            product,
            addedAt: item.addedAt
          };
        })
      );
      return res.json({
        success: true,
        data: populatedWishlist
      });
    }
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
    });
  }
});

// Sign-up route with wishlist transfer
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
      role,
    } = req.body;

    // Basic validation
    if (!Name || !username || !email || !password || !DOB || !phone_number || !language || !Address || !Payment) {
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

    // Create new user
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

    // Transfer temporary wishlist if exists
    const tempUserId = req.cookies.tempUserId;
    if (tempUserId && temporaryWishlists.has(tempUserId)) {
      const tempWishlist = temporaryWishlists.get(tempUserId);
      newUser.wishlist = tempWishlist;
      temporaryWishlists.delete(tempUserId);
      res.clearCookie('tempUserId');
    }

    // Save user to database
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

    // Transfer temporary wishlist if exists
    const tempUserId = req.cookies.tempUserId;
    if (tempUserId && temporaryWishlists.has(tempUserId)) {
      const tempWishlist = temporaryWishlists.get(tempUserId);
      user.wishlist = [...user.wishlist, ...tempWishlist];
      await user.save();
      temporaryWishlists.delete(tempUserId);
      res.clearCookie('tempUserId');
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

// Update phone number route
router.post('/api/update-phone', authenticateJWT, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user._id; // Get user ID from authenticated session

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone number format
    if (!validator.isMobilePhone(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Check if phone number is already taken by another user
    const existingUser = await User.findOne({ 
      phone_number: phoneNumber,
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already registered to another user'
      });
    }

    // Update user's phone number
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { phone_number: phoneNumber },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Phone number updated successfully'
    });

  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating phone number',
      error: error.message
    });
  }
});

// Get order details
router.get('/orders/:orderId', authenticateJWT, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Find the order directly from the Order model
        const order = await Order.findById(orderId)
            .populate({
                path: 'items.productId',
                model: 'Product'
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify the order belongs to the user
        if (order.userId && order.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
});


module.exports = router;
