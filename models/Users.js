const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    DOB: {
        type: Date
    },
    phone_number: {
        type: String
    },
    language: {
        type: String,
        default: 'English'
    },
    Address: {
        addressType: String,
        street: String,
        city: String,
        state: String,
        country: String
    },
    Payment: {
        paymentType: String,
        cardNumber: String,
        expiryDate: String
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    refunds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Refund'
    }],
    wishlist: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);