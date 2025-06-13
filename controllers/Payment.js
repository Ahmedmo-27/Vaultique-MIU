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
      console.log('Processing payment request:', {
        hasUser: !!req.user,
        hasSession: !!req.session,
        hasCart: !!req.session?.cart,
        cartItems: req.session?.cart?.items?.length
      });

      const {
        name,
        card_number,
        bank_name,
        expiry,
        cvv
      } = req.body;

      // Check if cart exists and has items
      if (!req.session.cart?.items?.length) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Store payment info in session
      req.session.paymentInfo = {
        name,
        cardNumber: card_number.replace(/\s/g, '').slice(-4), // Only store last 4 digits
        bankName: bank_name,
        expiry,
        paymentType: 'credit'
      };

      // If user is logged in, save payment info to their account
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $set: {
            'Payment.cardHolder': name,
            'Payment.cardNumber': card_number.replace(/\s/g, '').slice(-4),
            'Payment.bankName': bank_name,
            'Payment.expiryDate': expiry,
            'Payment.paymentType': 'credit',
            'Payment.lastUsed': new Date()
          }
        });
        console.log('Payment info saved for user:', req.user._id);
      }

      // Save session
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      console.log('Payment processed successfully');
      res.json({
        success: true,
        message: 'Payment processed successfully',
        redirect: '/user/shipping'
      });
    } catch (error) {
      console.error('Error processing payment:', error);
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