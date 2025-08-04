const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/Payment');
const { optionalJWT } = require('../middleware/jwt');
const Order = require('../models/Orders');
const User = require('../models/Users');

// Render Stripe payment page
router.get('/', optionalJWT, paymentController.renderPaymentPage);

// Process payment (legacy - redirects to Stripe)
router.post('/process', optionalJWT, paymentController.processPayment);

// Get payment information
router.get('/info', optionalJWT, paymentController.getPaymentInfo);

// Update payment information
router.put('/update', optionalJWT, paymentController.updatePaymentInfo);

// Get payment history
router.get('/history', optionalJWT, paymentController.getPaymentHistory);

// Payment success route
router.get('/success', optionalJWT, async (req, res) => {
  try {
    console.log('Payment success route called with query params:', req.query);
    const { payment_intent, payment_intent_client_secret, redirect_status } = req.query;
    
    if (redirect_status !== 'succeeded') {
      console.log('Payment not succeeded, redirect status:', redirect_status);
      return res.redirect('/user/cart?error=payment_failed');
    }

    // Get the payment intent from session or query params
    const paymentIntentId = payment_intent || req.session?.paymentIntentId;
    
    console.log('Payment intent ID:', paymentIntentId);
    console.log('Session payment intent ID:', req.session?.paymentIntentId);
    console.log('User info:', {
      isAuthenticated: !!req.user,
      userId: req.user?._id,
      userName: req.user ? req.user.Name : 'Not logged in',
      userEmail: req.user?.email
    });
    
    if (!paymentIntentId) {
      console.error('No payment intent found');
      return res.redirect('/user/cart?error=no_payment_intent');
    }

    // Retrieve the payment intent from Stripe to confirm it was successful
    const stripe = require('../config/stripe');
    const paymentIntent = await stripe.stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      console.error('Payment intent status:', paymentIntent.status);
      return res.redirect('/user/cart?error=payment_not_succeeded');
    }

    // Check if order already exists (created by webhook)
    // Note: In development mode, webhooks cannot reach localhost, so orders are created directly here
    // In production, orders should be created via webhook and this serves as a fallback
    let existingOrder = await Order.findOne({ 'payment.stripePaymentIntentId': paymentIntentId });
    
    if (!existingOrder) {
      console.log('Order not found for payment intent, creating order:', paymentIntentId);
      console.log('Development mode - creating order directly in success route (webhooks cannot reach localhost)');
      
      // Create order directly in development mode (webhooks don't work on localhost)
      try {
        const { createOrderFromPayment } = require('../controllers/StripePayment');
        
        // Transform cart items to match Order model structure
        const transformedItems = (req.session?.cart?.items || []).map(item => ({
          productId: item.productId || item.product,
          productDetails: {
            name: item.name,
            image: item.image,
            brand: item.brand || 'Unknown',
            price: item.price,
            strapMaterial: item.strapMaterial || 'N/A',
            movement: item.movement || 'N/A',
            waterResistance: item.waterResistance || 'N/A',
            caseMaterial: item.caseMaterial || 'N/A',
            dialColor: item.dialColor || 'N/A',
            gender: item.gender || 'Unisex',
            Vcollection: item.Vcollection || 'N/A'
          },
          quantity: item.quantity,
          price: item.price
        }));

        // Get user information for shipping details
        let shippingInfo = req.session?.shippingInfo;
        
        // If no shipping info in session but user is logged in, use user's default address
        if (!shippingInfo && req.user) {
          const user = await User.findById(req.user._id);
          if (user && user.addresses && user.addresses.length > 0) {
            const defaultAddress = user.addresses[0]; // Use first address as default
            shippingInfo = {
              name: user.Name,
              email: user.email,
              address: defaultAddress.street || 'Address not provided',
              city: defaultAddress.city || 'City not provided',
              state: defaultAddress.state || 'State not provided',
              zipCode: defaultAddress.postalCode || 'ZIP not provided'
            };
          }
        }
        
        // Fallback to user's basic info if no address found
        if (!shippingInfo && req.user) {
          shippingInfo = {
            name: req.user.Name || 'Guest User',
            email: req.user.email || 'guest@example.com',
            address: 'Address not provided',
            city: 'City not provided',
            state: 'State not provided',
            zipCode: 'ZIP not provided'
          };
        }
        
        // Final fallback to guest info
        if (!shippingInfo) {
          shippingInfo = {
            name: 'Guest User',
            email: 'guest@example.com',
            address: 'Address not provided',
            city: 'City not provided',
            state: 'State not provided',
            zipCode: 'ZIP not provided'
          };
        }

        // Use the order number from payment intent metadata if available
        const orderNumber = paymentIntent.metadata?.orderNumber || `VAULT-${Date.now()}`;
        console.log('Creating order with number:', orderNumber);

        const orderData = {
          userId: req.user?._id || null,
          orderNumber: orderNumber,
          items: transformedItems,
          shipping: shippingInfo,
          payment: {
            stripePaymentIntentId: paymentIntentId,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status
          },
          total: req.session?.cart?.total || 0,
          shippingCost: req.session?.cart?.shippingCost || 0,
          tax: req.session?.cart?.tax || 0,
          status: 'confirmed'
        };

        existingOrder = new Order(orderData);
        await existingOrder.save();
        
        // Add order to user's orders array if user is logged in
        if (req.user && req.user._id) {
          try {
            const user = await User.findById(req.user._id);
            if (user) {
              // Add order to user's orders array
              user.orders.push({
                orderId: existingOrder.orderNumber,
                orderDate: new Date(),
                status: 'Completed',
                total: existingOrder.total,
                items: existingOrder.items.map(item => ({
                  product: item.productId,
                  quantity: item.quantity
                }))
              });
              await user.save();
              console.log('Order added to user\'s orders array:', existingOrder.orderNumber);
              console.log('User orders count after update:', user.orders.length);
            }
          } catch (userUpdateError) {
            console.error('Error adding order to user\'s orders array:', userUpdateError);
            // Don't fail the order creation if user update fails
          }
        }
        
        console.log('Order created successfully:', existingOrder.orderNumber);
        console.log('Order details:', {
          orderNumber: existingOrder.orderNumber,
          userId: existingOrder.userId,
          total: existingOrder.total,
          itemCount: existingOrder.items.length
        });
      } catch (orderError) {
        console.error('Error creating order:', orderError);
        return res.redirect('/user/cart?error=order_creation_failed');
      }
    }

    // Clear cart and payment intent from session
    req.session.cart = null;
    req.session.paymentIntentId = null;

    // Log order details before rendering
    console.log('Rendering success page with order:', {
      orderNumber: existingOrder.orderNumber,
      orderId: existingOrder._id,
      userId: existingOrder.userId,
      total: existingOrder.total,
      itemCount: existingOrder.items.length
    });

    // Render success page
    res.render('order-success', {
      title: 'Payment Successful',
      order: existingOrder,
      isAuthenticated: !!req.user,
      user: req.user || null
    });

  } catch (error) {
    console.error('Error handling payment success:', error);
    res.redirect('/user/cart?error=payment_verification_failed');
  }
});

module.exports = router; 