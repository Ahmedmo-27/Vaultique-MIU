const mongoose = require('mongoose');
const validator = require('validator');
const Order = require('../models/Orders');
const bcryptjs = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  Name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    select: false,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  DOB: {
    type: Date,
  },
  phone_number: {
    type: String,
    unique: false,
    select: false,
  },
  language: {
    type: String,
    default: 'English',
    enum: ['English', 'Arabic'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true,
  },
  Address: {
    city: {
      type: String,
      trim: true,
      required: [true, 'City is required'],
      minlength: [2, 'City must be at least 2 characters long']
    },
    street: {
      type: String,
      trim: true,
      required: [true, 'Street address is required'],
      minlength: [5, 'Street address must be at least 5 characters long']
    },
    addressType: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home',
      required: [true, 'Address type is required']
    },
    state: {
      type: String,
      trim: true,
      required: [true, 'State is required'],
      minlength: [2, 'State must be at least 2 characters long']
    },
    country: {
      type: String,
      trim: true,
      minlength: [2, 'Country must be at least 2 characters long']
    },
    postalCode: {
      type: String,
      trim: true,
      required: [true, 'Postal code is required'],
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
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^\d{13,19}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid card number!`,
      },
      select: false,
    },
    cardHolder: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^(0[1-9]|1[0-2])\/(\d{2})$/.test(v);
        },
        message: (props) => `${props.value} is not a valid expiry date! Use MM/YY.`,
      },
    },
    cvv: {
      type: String,
      trim: true,
      select: false,
      validate: {
        validator: function (v) {
          return !v || /^\d{3,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid CVV!`,
      },
    },
    paymentType: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'PayPal', 'credit', 'debit'],
      default: 'Credit Card',
    },
  },
  orders: [
    {
      orderId: {
        type: String,
        required: true,
      },
      orderDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Processing', 'Completed'],
        default: 'Pending',
      },
      total: {
        type: Number,
        required: true,
      },
      items: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      ],
    },
  ],
  wishlist: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  refunds: [
    {
      refundId: {
        type: String,
        required: true,
      },
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending',
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  reviews: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'inactive',
    required: true,
    select: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    required: true,
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
    select: true,
  },
  loginHistory: [
    {
      timestamp: {
        type: Date,
        default: Date.now
      },
      ip: String,
      userAgent: String
    },
  ],
  emailVerificationToken: String,
  emailVerificationExpires: Date,
}, {
  timestamps: true,
  versionKey: false // Disable versioning to prevent version conflicts
});

// Define indexes explicitly
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { unique: true });

// Add a pre-save hook to hash passwords
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Check if password looks like a hash
    if (this.password && !this.password.startsWith('$2')) {
      // Generate a salt
      const salt = await bcryptjs.genSalt(12);
      // Hash the password
      this.password = await bcryptjs.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add method to verify password
UserSchema.methods.verifyPassword = async function (candidatePassword) {
  try {
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error verifying password');
  }
};

// Add method to check if account is locked
UserSchema.methods.isAccountLocked = function () {
  if (this.accountLockedUntil && this.accountLockedUntil > Date.now()) {
    return true;
  }
  return false;
};

// Add method to record login attempt
UserSchema.methods.recordLoginAttempt = async function (success, ip, userAgent) {
  this.loginHistory.push({
    timestamp: new Date(),
    ip,
    userAgent,
    success,
  });

  if (success) {
    this.failedLoginAttempts = 0;
    this.lastLogin = new Date();
  } else {
    this.failedLoginAttempts += 1;
    this.lastFailedLogin = new Date();
  }

  // Keep only last 10 login attempts
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }

  await this.save();
};

// Add a pre-save hook to ensure status is set
UserSchema.pre('save', function (next) {
  if (!this.status) {
    this.status = 'active';
  }
  next();
});

// Add method to activate account
UserSchema.methods.activateAccount = async function () {
  this.status = 'active';
  await this.save();
};

// Add method to deactivate account
UserSchema.methods.deactivateAccount = async function () {
  this.status = 'inactive';
  await this.save();
};

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to reset failed login attempts
UserSchema.methods.resetFailedLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lastFailedLogin = null;
  this.accountLockedUntil = null;
  await this.save();
};

// Method to increment failed login attempts
UserSchema.methods.incrementFailedLoginAttempts = async function () {
  this.failedLoginAttempts += 1;
  this.lastFailedLogin = Date.now();
  
  // Lock account after 5 failed attempts
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
  }
  
  await this.save();
};

// Method to add login history
UserSchema.methods.addLoginHistory = async function (ip, userAgent) {
  this.loginHistory.push({
    timestamp: new Date(),
    ip,
    userAgent,
  });
  // Keep only last 10 login attempts
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  await this.save();
};

// Method to update login history
UserSchema.methods.updateLoginHistory = async function(ip, userAgent) {
  this.failedLoginAttempts = 0;
  this.lastFailedLogin = null;
  this.accountLockedUntil = null;
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);
