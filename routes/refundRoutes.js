// refundRoutes.js
const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const { isAuthenticated } = require('../middleware/auth');





// Request a refund
router.post('/request', isAuthenticated, refundController.requestRefund);

// Get user's refunds
router.get('/user', isAuthenticated, refundController.getUserRefunds);

// Cancel refund request
router.post('/:refundId/cancel', isAuthenticated, refundController.cancelRefund);

// In your account route handler
router.get('/account', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'orders',
        model: 'Order'
      })
      .populate({
        path: 'refunds',
        model: 'Refund'
      });

    res.render('account-details', { user });
  } catch (error) {
    // Handle error
  }

  // POST: /api/user/refunds/request
    router.post('/request', (req, res) => { // REMOVE THIS
        const { orderId, reason, details } = req.body;
        // Process refund request
        res.json({ success: true, message: 'Refund requested' });
    });

// POST: /api/user/refunds/:refundId/cancel
    router.post('/:refundId/cancel', (req, res) => { // REMOVE THIS
        const refundId = req.params.refundId;
        // Process cancellation
        res.json({ success: true, message: 'Refund cancelled' });
    });
});
module.exports = router;