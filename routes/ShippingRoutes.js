const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/Shipping');
const { optionalJWT } = require('../middleware/jwt');

// Create shipping information
router.post('/create', optionalJWT, shippingController.createShipping);

// Get shipping information by order ID
router.get('/order/:orderId', optionalJWT, shippingController.getShippingByOrderId);

// Update shipping status (admin only)
router.patch('/status/:shippingId', optionalJWT, shippingController.updateShippingStatus);

// Get all shipping information for a user
router.get('/user', optionalJWT, shippingController.getUserShipping);

module.exports = router; 