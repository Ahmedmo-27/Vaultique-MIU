const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/Payment');
const { optionalJWT } = require('../middleware/jwt');

// Process payment
router.post('/process', optionalJWT, paymentController.processPayment);

// Get payment information
router.get('/info', optionalJWT, paymentController.getPaymentInfo);

// Update payment information
router.put('/update', optionalJWT, paymentController.updatePaymentInfo);

// Get payment history
router.get('/history', optionalJWT, paymentController.getPaymentHistory);

module.exports = router; 