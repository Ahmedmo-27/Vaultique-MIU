const mongoose = require('mongoose');
const validator = require('validator');
const Order = require('../models/Orders');

const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId()
    },
    Name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    DOB: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value < new Date();
            },
            message: 'Date of Birth must be in the past'
        }
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
        select: false
    },
    language: {
        type: String,
        default: "English",
        required: true,
        enum: ["English", "Arabic"]
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
        required: true
    },
    Address: {
        city: {
            type: String,
            required: true,
            trim: true
        },
        street: {
            type: String,
            required: true,
            trim: true
        },
        addressType: {
            type: String,
            required: true,
            enum: ["Home", "Work", "Other"],
            default: "Home"
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        },
        postalCode: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function(v) {
                    return /^[a-zA-Z0-9\s-]{3,10}$/.test(v);
                },
                message: props => `${props.value} is not a valid postal code!`
            }
        }
    },
    Payment: {
        cardNumber: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function(v) {
                    // Simple regex for 13-19 digit card numbers
                    return /^\d{13,19}$/.test(v);
                },
                message: props => `${props.value} is not a valid card number!`
            },
            select: false
        },
        cardHolder: {
            type: String,
            required: true,
            trim: true
        },
        expiryDate: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function(v) {
                    // MM/YY format
                    return /^(0[1-9]|1[0-2])\/(\d{2})$/.test(v);
                },
                message: props => `${props.value} is not a valid expiry date! Use MM/YY.`
            }
        },
        cvv: {
            type: String,
            required: true,
            trim: true,
            select: false,
            validate: {
                validator: function(v) {
                    return /^\d{3,4}$/.test(v);
                },
                message: props => `${props.value} is not a valid CVV!`
            }
        },
        paymentType: {
            type: String,
            required: true,
            enum: ["Credit Card", "Debit Card", "PayPal"],
            default: "Credit Card"
        }
    },
    orders: [{
        orderId: {
            type: String,
            required: true
        },
        orderDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending'
        },
        total: {
            type: Number,
            required: true
        },
        items: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }]
    }],
    wishlist: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    refunds: [{
        refundId: {
            type: String,
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        reason: {
            type: String,
            required: true
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
        }
    }],
    reviews: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);