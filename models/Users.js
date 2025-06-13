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

// Add index for email and username for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

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
