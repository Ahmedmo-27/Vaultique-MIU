const Shipping = require('../models/Shipping');
const Order = require('../models/Orders');
const { generateTrackingNumber } = require('../utils/shippingUtils');

// Create new shipping information
exports.createShipping = async (req, res) => {
  try {
    const {
      fullName,
      email,
      address,
      city,
      state,
      zipCode,
      orderId
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !address || !city || !state || !zipCode || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if order exists and is in a valid state
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot create shipping for order in ${order.status} status`
      });
    }

    // Check if user is authenticated and if it's a Google user
    const isGoogleUser = req.user && req.user.googleId;
    const userId = req.user ? req.user._id : null;

    // Create shipping record
    const shipping = new Shipping({
      userId,
      orderId,
      fullName,
      email,
      address,
      city,
      state,
      zipCode,
      trackingNumber: generateTrackingNumber(),
      status: 'pending',
      isGoogleUser // Add flag for Google users
    });

    await shipping.save();

    // Update order with shipping information and status
    order.shippingId = shipping._id;
    order.status = 'processing';
    order.updatedAt = Date.now();
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Shipping information saved successfully',
      data: {
        shipping,
        orderStatus: order.status,
        isGoogleUser
      }
    });
  } catch (error) {
    console.error('Error creating shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shipping information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get shipping information by order ID
exports.getShippingByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const shipping = await Shipping.findOne({ orderId });

    if (!shipping) {
      return res.status(404).json({
        success: false,
        message: 'Shipping information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: shipping
    });
  } catch (error) {
    console.error('Error fetching shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping information',
      error: error.message
    });
  }
};

// Update shipping status
exports.updateShippingStatus = async (req, res) => {
  try {
    const { shippingId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping status'
      });
    }

    const shipping = await Shipping.findById(shippingId);
    if (!shipping) {
      return res.status(404).json({
        success: false,
        message: 'Shipping record not found'
      });
    }

    // Update shipping status
    shipping.status = status;
    shipping.updatedAt = Date.now();
    await shipping.save();

    // Update order status based on shipping status
    const order = await Order.findById(shipping.orderId);
    if (order) {
      switch (status) {
        case 'shipped':
          order.status = 'shipped';
          break;
        case 'delivered':
          order.status = 'delivered';
          break;
        default:
          order.status = 'processing';
      }
      order.updatedAt = Date.now();
      await order.save();
    }

    res.json({
      success: true,
      message: 'Shipping status updated successfully',
      data: {
        shipping,
        orderStatus: order?.status
      }
    });
  } catch (error) {
    console.error('Error updating shipping status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shipping status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all shipping information for a user
exports.getUserShipping = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const shipping = await Shipping.find({ userId: req.user._id })
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: shipping
    });
  } catch (error) {
    console.error('Error fetching user shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user shipping information',
      error: error.message
    });
  }
}; 