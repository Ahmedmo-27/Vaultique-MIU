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

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create shipping record
    const shipping = new Shipping({
      userId: req.user ? req.user._id : null,
      orderId,
      fullName,
      email,
      address,
      city,
      state,
      zipCode,
      trackingNumber: generateTrackingNumber()
    });

    await shipping.save();

    // Update order with shipping information
    order.shippingId = shipping._id;
    order.status = 'processing';
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Shipping information saved successfully',
      data: shipping
    });
  } catch (error) {
    console.error('Error creating shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shipping information',
      error: error.message
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
    const { status, trackingNumber } = req.body;

    const shipping = await Shipping.findById(shippingId);
    if (!shipping) {
      return res.status(404).json({
        success: false,
        message: 'Shipping information not found'
      });
    }

    if (status) {
      shipping.status = status;
    }
    if (trackingNumber) {
      shipping.trackingNumber = trackingNumber;
    }

    await shipping.save();

    res.status(200).json({
      success: true,
      message: 'Shipping status updated successfully',
      data: shipping
    });
  } catch (error) {
    console.error('Error updating shipping status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shipping status',
      error: error.message
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