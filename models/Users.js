const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

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
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'inactive',
        required: true,
        select: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lastFailedLogin: {
        type: Date,
        select: false
    },
    accountLockedUntil: {
        type: Date,
        select: false,
        default: null
    },
    lastLogin: {
        type: Date,
        select: true
    },
    loginHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ip: String,
        userAgent: String
    }],
    emailVerificationToken: String,
    emailVerificationExpires: Date
}, {
    timestamps: true,
    versionKey: false
});

// Add index for email for faster queries
userSchema.index({ email: 1 });

// Add a pre-save hook to hash passwords
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        if (this.password && !this.password.startsWith('$2')) {
            const salt = await bcryptjs.genSalt(12);
            this.password = await bcryptjs.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Add methods
userSchema.methods.verifyPassword = async function (candidatePassword) {
    try {
        return await bcryptjs.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error verifying password');
    }
};

userSchema.methods.isAccountLocked = function () {
    return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

userSchema.methods.recordLoginAttempt = async function (success, ip, userAgent) {
    this.loginHistory.push({
        timestamp: new Date(),
        ip,
        userAgent,
        success
    });

    if (success) {
        this.failedLoginAttempts = 0;
        this.lastLogin = new Date();
    } else {
        this.failedLoginAttempts += 1;
        this.lastFailedLogin = new Date();
    }

    if (this.loginHistory.length > 10) {
        this.loginHistory = this.loginHistory.slice(-10);
    }

    await this.save();
};

userSchema.methods.activateAccount = async function () {
    this.status = 'active';
    await this.save();
};

userSchema.methods.deactivateAccount = async function () {
    this.status = 'inactive';
    await this.save();
};

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

userSchema.methods.resetFailedLoginAttempts = async function () {
    this.failedLoginAttempts = 0;
    this.lastFailedLogin = null;
    this.accountLockedUntil = null;
    await this.save();
};

userSchema.methods.incrementFailedLoginAttempts = async function () {
    this.failedLoginAttempts += 1;
    this.lastFailedLogin = Date.now();
    
    if (this.failedLoginAttempts >= 5) {
        this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await this.save();
};

userSchema.methods.updateLoginHistory = async function(ip, userAgent) {
    this.failedLoginAttempts = 0;
    this.lastFailedLogin = null;
    this.accountLockedUntil = null;
    await this.save();
};

module.exports = mongoose.model('User', userSchema);
