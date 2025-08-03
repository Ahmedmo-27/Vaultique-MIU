const express = require('express');
const router = express.Router();
const stripePaymentController = require('../controllers/StripePayment');
const { optionalJWT } = require('../middleware/jwt');

// Create payment intent
router.post('/create-payment-intent', optionalJWT, stripePaymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm-payment', optionalJWT, stripePaymentController.confirmPayment);

// Save payment method for future use
router.post('/save-payment-method', optionalJWT, stripePaymentController.savePaymentMethod);

// Get saved payment methods
router.get('/payment-methods', optionalJWT, stripePaymentController.getPaymentMethods);

// Process refund
router.post('/refund', optionalJWT, stripePaymentController.processRefund);

// Webhook endpoint (no authentication required)
router.post('/webhook', express.raw({ type: 'application/json' }), stripePaymentController.handleWebhook);

module.exports = router; 