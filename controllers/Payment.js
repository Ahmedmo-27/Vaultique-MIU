const Order = require('../models/Orders');
const User = require('../models/Users');
const { generateOrderNumber } = require('../utils/orderUtils');
const { encryptData, decryptData } = require('../utils/securityUtils');
const { validatePaymentInput, validatePaymentMiddleware } = require('../middleware/paymentValidation');
const { AppError } = require('../utils/securityUtils');
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Rate limiting for payment attempts
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // More lenient in development
  message: JSON.stringify({
    success: false,
    message: 'Too many payment attempts, please try again later'
  })
});

// Render Stripe payment page
exports.renderPaymentPage = async (req, res, next) => {
  try {
    // Check if cart exists and has items
    if (!req.session.cart?.items?.length) {
      return res.redirect('/cart');
    }

    // Calculate totals if not already calculated
    if (!req.session.cart.subtotal) {
      req.session.cart.subtotal = req.session.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    if (!req.session.cart.total) {
      req.session.cart.total = req.session.cart.subtotal + (req.session.cart.shippingCost || 0) + (req.session.cart.tax || 0);
    }

    // Get user's saved payment info if logged in
    let paymentInfo = null;
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user.Payment && user.Payment.length > 0) {
        paymentInfo = user.Payment[user.Payment.length - 1]; // Get most recent payment method
      }
    }

    res.render('Payment', {
      user: req.user,
      isAuthenticated: !!req.user,
      cart: req.session.cart,
      paymentInfo: paymentInfo,
      stripePublishableKey: config.stripe.publishableKey
    });
  } catch (error) {
    console.error('Error rendering payment page:', error);
    next(new AppError('Error loading payment page', 500));
  }
};

// Legacy payment processing (redirects to Stripe)
exports.processPayment = [
  paymentLimiter,
  async (req, res, next) => {
    try {
      console.log('Legacy payment endpoint called - redirecting to Stripe');
      
      // Redirect to Stripe payment page
      res.json({
        success: true,
        message: 'Redirecting to secure payment',
        redirect: '/payment'
      });
    } catch (error) {
      console.error('Error in legacy payment processing:', error);
      next(new AppError('Payment processing error', 500));
    }
  }
];

// Get payment information
exports.getPaymentInfo = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await User.findById(req.user._id).select('Payment');
    
    if (!user.Payment || user.Payment.length === 0) {
      return res.status(200).json({
        success: true,
        data: {}
      });
    }

    // Return the most recent payment method
    const latestPayment = user.Payment[user.Payment.length - 1];
    
    res.status(200).json({
      success: true,
      data: {
        cardHolder: latestPayment.cardHolder,
        cardNumber: latestPayment.cardNumber,
        bankName: latestPayment.bankName,
        expiryDate: latestPayment.expiryDate,
        paymentType: latestPayment.paymentType
      }
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

      // For Stripe integration, we don't store card details
      // This is now handled by Stripe's secure system
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          Payment: {
            cardHolder: name,
            cardNumber: card_number.replace(/\s/g, '').slice(-4), // Only store last 4 digits
            bankName: bank_name,
            expiryDate: expiry,
            paymentType: 'credit',
            lastUsed: new Date()
          }
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
      .select('orderNumber payment status createdAt total')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
}; 