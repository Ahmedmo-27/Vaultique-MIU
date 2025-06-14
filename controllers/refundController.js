const Refund = require('../models/Refund');
const Order = require('../models/Orders');
const User = require('../models/Users');

// Request a refund
exports.requestRefund = async (req, res) => {
    try {
        const { orderId, reason, details } = req.body;
        const userId = req.user._id;

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if order belongs to user
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to refund this order' });
        }

        // Check if order is delivered
        if (order.status !== 'Delivered') {
            return res.status(400).json({ success: false, message: 'Only delivered orders can be refunded' });
        }

        // Check if refund already exists
        const existingRefund = await Refund.findOne({ orderId });
        if (existingRefund) {
            return res.status(400).json({ success: false, message: 'Refund request already exists for this order' });
        }

        // Create refund request
        const refund = new Refund({
            orderId,
            userId,
            reason,
            details,
            amount: order.total
        });

        await refund.save();

        // Update order status
        order.status = 'Refunded';
        await order.save();

        // Update user's orders array
        await User.findByIdAndUpdate(userId, {
            $pull: { orders: orderId },
            $push: { refunds: refund._id }
        });

        res.json({ success: true, message: 'Refund request submitted successfully' });
    } catch (error) {
        console.error('Refund request error:', error);
        res.status(500).json({ success: false, message: 'Error processing refund request' });
    }
};

// Get user's refunds
exports.getUserRefunds = async (req, res) => {
    try {
        const userId = req.user._id;
        const refunds = await Refund.find({ userId })
            .populate('orderId')
            .sort({ date: -1 });

        res.json({ success: true, refunds });
    } catch (error) {
        console.error('Get refunds error:', error);
        res.status(500).json({ success: false, message: 'Error fetching refunds' });
    }
};

// Cancel refund request
exports.cancelRefund = async (req, res) => {
    try {
        const { refundId } = req.params;
        const userId = req.user._id;

        const refund = await Refund.findOne({ _id: refundId, userId });
        if (!refund) {
            return res.status(404).json({ success: false, message: 'Refund request not found' });
        }

        if (refund.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Can only cancel pending refund requests' });
        }

        // Update order status back to Delivered
        await Order.findByIdAndUpdate(refund.orderId, { status: 'Delivered' });

        // Remove refund from user's refunds
        await User.findByIdAndUpdate(userId, {
            $pull: { refunds: refundId },
            $push: { orders: refund.orderId }
        });

        // Delete the refund request
        await refund.remove();

        res.json({ success: true, message: 'Refund request cancelled successfully' });
    } catch (error) {
        console.error('Cancel refund error:', error);
        res.status(500).json({ success: false, message: 'Error cancelling refund request' });
    }
};