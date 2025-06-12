const Order = require('../models/Orders');
const User = require('../models/Users');
const { generateOrderNumber } = require('../utils/orderUtils');

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const {
      name,
      card_number,
      bank_name,
      expiry,
      cvv
    } = req.body;

    // Validate required fields
    if (!name || !card_number || !bank_name || !expiry || !cvv) {
      return res.status(400).json({
        success: false,
        message: 'All payment fields are required'
      });
    }

    // Validate card number (basic validation)
    if (!/^\d{16}$/.test(card_number.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number'
      });
    }

    // Validate expiry date
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry date'
      });
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CVV'
      });
    }

    // Create order number
    const orderNumber = generateOrderNumber();

    // Create new order
    const order = new Order({
      userId: req.user ? req.user._id : null,
      orderNumber,
      paymentInfo: {
        name,
        cardNumber: card_number.replace(/\s/g, '').slice(-4), // Store only last 4 digits
        bankName: bank_name,
        expiry
      },
      status: 'payment_processed'
    });

    await order.save();

    // If user is logged in, save payment info for future use
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'paymentInfo.name': name,
          'paymentInfo.cardNumber': card_number.replace(/\s/g, '').slice(-4),
          'paymentInfo.bankName': bank_name,
          'paymentInfo.expiry': expiry
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        orderId: order._id,
        orderNumber
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

// Get payment information
exports.getPaymentInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(req.user._id).select('paymentInfo');
    
    res.status(200).json({
      success: true,
      data: user.paymentInfo || {}
    });
  } catch (error) {
    console.error('Error fetching payment info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment information',
      error: error.message
    });
  }
};

// Update payment information
exports.updatePaymentInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      name,
      card_number,
      bank_name,
      expiry
    } = req.body;

    // Validate required fields
    if (!name || !card_number || !bank_name || !expiry) {
      return res.status(400).json({
        success: false,
        message: 'All payment fields are required'
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'paymentInfo.name': name,
        'paymentInfo.cardNumber': card_number.replace(/\s/g, '').slice(-4),
        'paymentInfo.bankName': bank_name,
        'paymentInfo.expiry': expiry
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment information updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment info:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment information',
      error: error.message
    });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const orders = await Order.find({ userId: req.user._id })
      .select('orderNumber paymentInfo status createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
}; 