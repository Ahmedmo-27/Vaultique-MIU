const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const { isAuthenticated } = require('../middleware/auth');

// Request a refund
router.post('/request', isAuthenticated, refundController.requestRefund);

// Get user's refunds
router.get('/user', isAuthenticated, refundController.getUserRefunds);

// Cancel refund request
router.delete('/:refundId', isAuthenticated, refundController.cancelRefund);

module.exports = router;