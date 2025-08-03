const stripe = require('../config/stripe');
const Order = require('../models/Orders');
const User = require('../models/Users');
const { generateOrderNumber } = require('../utils/orderUtils');
const { AppError } = require('../utils/securityUtils');
const rateLimit = require('express-rate-limit');

// Rate limiting for payment attempts
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5,
  message: JSON.stringify({
    success: false,
    message: 'Too many payment attempts, please try again later'
  })
});

// Create payment intent
exports.createPaymentIntent = [
  paymentLimiter,
  async (req, res, next) => {
    try {
      console.log('Creating payment intent:', {
        hasUser: !!req.user,
        hasSession: !!req.session,
        hasCart: !!req.session?.cart,
        cartItems: req.session?.cart?.items?.length
      });

      // Check if cart exists and has items
      if (!req.session.cart?.items?.length) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Calculate total amount
      const subtotal = req.session.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = req.session.cart.shippingCost || 0;
      const tax = req.session.cart.tax || 0;
      const total = subtotal + shippingCost + tax;

      // Create metadata for the payment intent
      const metadata = {
        orderNumber: generateOrderNumber(),
        userId: req.user?._id?.toString() || 'guest',
        itemCount: req.session.cart.items.length.toString(),
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        tax: tax.toString()
      };

      // Create payment intent
      const paymentIntent = await stripe.createPaymentIntent(
        total,
        stripe.config.currency,
        metadata
      );

      // Store payment intent ID in session
      req.session.paymentIntentId = paymentIntent.id;

      console.log('Payment intent created:', paymentIntent.id);
      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      next(new AppError('Error creating payment intent', 500));
    }
  }
];

// Confirm payment
exports.confirmPayment = [
  paymentLimiter,
  async (req, res, next) => {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment intent ID is required'
        });
      }

      // Confirm the payment intent
      const paymentIntent = await stripe.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: `${req.protocol}://${req.get('host')}/payment/success`
      });

      if (paymentIntent.status === 'succeeded') {
        // Payment successful - create order
        await createOrderFromPayment(req, paymentIntent);
        
        // Clear cart
        req.session.cart = null;
        req.session.paymentIntentId = null;

        res.json({
          success: true,
          message: 'Payment confirmed successfully',
          redirect: '/payment/success'
        });
      } else if (paymentIntent.status === 'requires_action') {
        // Payment requires additional authentication
        res.json({
          success: true,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret
        });
      } else {
        // Payment failed
        res.status(400).json({
          success: false,
          message: 'Payment failed',
          status: paymentIntent.status
        });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      next(new AppError('Error confirming payment', 500));
    }
  }
];

// Save payment method for future use
exports.savePaymentMethod = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method ID is required'
      });
    }

    // Get or create Stripe customer
    let customer;
    const user = await User.findById(req.user._id);
    
    if (user.stripeCustomerId) {
      customer = await stripe.stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.createCustomer(req.user.email, req.user.name, {
        userId: req.user._id.toString()
      });
      
      // Save Stripe customer ID to user
      await User.findByIdAndUpdate(req.user._id, {
        stripeCustomerId: customer.id
      });
    }

    // Attach payment method to customer
    await stripe.attachPaymentMethodToCustomer(paymentMethodId, customer.id);

    // Set as default payment method
    await stripe.stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    res.json({
      success: true,
      message: 'Payment method saved successfully'
    });
  } catch (error) {
    console.error('Error saving payment method:', error);
    next(new AppError('Error saving payment method', 500));
  }
};

// Get saved payment methods
exports.getPaymentMethods = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await User.findById(req.user._id);
    
    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        data: []
      });
    }

    const paymentMethods = await stripe.stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });

    res.json({
      success: true,
      data: paymentMethods.data
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    next(new AppError('Error getting payment methods', 500));
  }
};

// Process refund
exports.processRefund = async (req, res, next) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    const refund = await stripe.createRefund(paymentIntentId, amount, reason);

    // Update order status
    await Order.findOneAndUpdate(
      { 'payment.stripePaymentIntentId': paymentIntentId },
      { 
        status: 'refunded',
        'payment.refundId': refund.id,
        'payment.refundAmount': amount || null,
        'payment.refundReason': reason
      }
    );

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refund.id
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    next(new AppError('Error processing refund', 500));
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.stripe.webhooks.constructEvent(
      req.body,
      sig,
      stripe.config.webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefundProcessed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper function to create order from successful payment
async function createOrderFromPayment(req, paymentIntent) {
  const orderData = {
    userId: req.user?._id || null,
    orderNumber: paymentIntent.metadata.orderNumber,
    items: req.session.cart.items,
    shipping: req.session.shippingInfo,
    payment: {
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: paymentIntent.status
    },
    total: req.session.cart.total,
    shippingCost: req.session.cart.shippingCost || 0,
    tax: req.session.cart.tax || 0,
    status: 'confirmed'
  };

  const order = new Order(orderData);
  await order.save();

  console.log('Order created from payment:', order.orderNumber);
  return order;
}

// Webhook event handlers
async function handlePaymentSucceeded(paymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Find the order by payment intent ID
    const order = await Order.findOne({ 'payment.stripePaymentIntentId': paymentIntent.id });
    
    if (order) {
      // Update order status
      await Order.findByIdAndUpdate(order._id, {
        status: 'confirmed',
        'payment.status': 'succeeded',
        updatedAt: new Date()
      });
      
      console.log('Order confirmed:', order.orderNumber);
      
      // Here you could add additional logic like:
      // - Send confirmation email
      // - Update inventory
      // - Send notifications
    } else {
      console.log('Order not found for payment intent:', paymentIntent.id);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);
    
    // Find the order by payment intent ID
    const order = await Order.findOne({ 'payment.stripePaymentIntentId': paymentIntent.id });
    
    if (order) {
      // Update order status
      await Order.findByIdAndUpdate(order._id, {
        status: 'cancelled',
        'payment.status': 'failed',
        updatedAt: new Date()
      });
      
      console.log('Order cancelled due to payment failure:', order.orderNumber);
      
      // Here you could add additional logic like:
      // - Send failure notification
      // - Restore inventory
      // - Send email to customer
    } else {
      console.log('Order not found for failed payment intent:', paymentIntent.id);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleRefundProcessed(charge) {
  try {
    console.log('Refund processed:', charge.id);
    
    // Find the order by payment intent ID
    const order = await Order.findOne({ 'payment.stripePaymentIntentId': charge.payment_intent });
    
    if (order) {
      // Update order status
      await Order.findByIdAndUpdate(order._id, {
        status: 'refunded',
        'payment.refundId': charge.id,
        'payment.refundAmount': charge.amount / 100, // Convert from cents
        updatedAt: new Date()
      });
      
      console.log('Order refunded:', order.orderNumber);
      
      // Here you could add additional logic like:
      // - Send refund confirmation email
      // - Update inventory
      // - Send notification to customer
    } else {
      console.log('Order not found for refunded charge:', charge.id);
    }
  } catch (error) {
    console.error('Error handling refund:', error);
  }
} 