const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);