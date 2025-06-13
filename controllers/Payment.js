const Order = require('../models/Orders');
const User = require('../models/Users');
const { generateOrderNumber } = require('../utils/orderUtils');
const { encryptData, decryptData } = require('../utils/securityUtils');
const { validatePaymentInput, validatePaymentMiddleware } = require('../middleware/paymentValidation');
const { AppError } = require('../utils/securityUtils');
const rateLimit = require('express-rate-limit');

// Rate limiting for payment attempts
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: JSON.stringify({
    success: false,
    message: 'Too many payment attempts, please try again later'
  })
});

// Process payment
exports.processPayment = [
  paymentLimiter,
  validatePaymentInput,
  validatePaymentMiddleware,
  async (req, res, next) => {
    try {
      const {
        name,
        card_number,
        bank_name,
        expiry,
        cvv
      } = req.body;

      // Create order number
      const orderNumber = generateOrderNumber();

      // Encrypt sensitive data
      const encryptedCardNumber = encryptData(card_number.replace(/\s/g, '').slice(-4));
      const encryptedExpiry = encryptData(expiry);

      // Create new order
      const order = new Order({
        userId: req.user ? req.user._id : null,
        orderNumber,
        paymentInfo: {
          name,
          cardNumber: encryptedCardNumber,
          bankName: bank_name,
          expiry: encryptedExpiry
        },
        status: 'payment_processed'
      });

      await order.save();

      // If user is logged in, save encrypted payment info for future use
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $set: {
            'paymentInfo.name': name,
            'paymentInfo.cardNumber': encryptedCardNumber,
            'paymentInfo.bankName': bank_name,
            'paymentInfo.expiry': encryptedExpiry
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
      next(new AppError('Error processing payment', 500));
    }
  }
];

// Get payment information
exports.getPaymentInfo = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await User.findById(req.user._id).select('paymentInfo');
    
    if (!user.paymentInfo) {
      return res.status(200).json({
        success: true,
        data: {}
      });
    }

    // Decrypt sensitive data
    const decryptedPaymentInfo = {
      ...user.paymentInfo.toObject(),
      cardNumber: decryptData(user.paymentInfo.cardNumber),
      expiry: decryptData(user.paymentInfo.expiry)
    };
    
    res.status(200).json({
      success: true,
      data: decryptedPaymentInfo
    });
  } catch (error) {
    next(error);
  }
};

// Update payment information
exports.updatePaymentInfo = [
  validatePaymentInput,
  validatePaymentMiddleware,
  async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const {
        name,
        card_number,
        bank_name,
        expiry
      } = req.body;

      // Encrypt sensitive data
      const encryptedCardNumber = encryptData(card_number.replace(/\s/g, '').slice(-4));
      const encryptedExpiry = encryptData(expiry);

      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'paymentInfo.name': name,
          'paymentInfo.cardNumber': encryptedCardNumber,
          'paymentInfo.bankName': bank_name,
          'paymentInfo.expiry': encryptedExpiry
        }
      });

      res.status(200).json({
        success: true,
        message: 'Payment information updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// Get payment history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const orders = await Order.find({ userId: req.user._id })
      .select('orderNumber paymentInfo status createdAt')
      .sort({ createdAt: -1 });

    // Decrypt sensitive data in payment history
    const decryptedOrders = orders.map(order => ({
      ...order.toObject(),
      paymentInfo: {
        ...order.paymentInfo,
        cardNumber: decryptData(order.paymentInfo.cardNumber),
        expiry: decryptData(order.paymentInfo.expiry)
      }
    }));

    res.status(200).json({
      success: true,
      data: decryptedOrders
    });
  } catch (error) {
    next(error);
  }
}; 