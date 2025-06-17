// Remove unnecessary fields
const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    processedDate: {
        type: Date
    }
});

module.exports = mongoose.model('Refund', refundSchema);