const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const crypto = require('crypto');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { generateTokens } = require('../middleware/jwt');
const { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail, sendOrderConfirmationEmail } = require('../utils/emailService');
const { sendWelcomeSMS } = require('../utils/smsService');
const { setSessionCookie, removeCookie } = require('../utils/cookieManager');
const passport = require('passport');
// Authentication security is handled by JWT middleware

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: JSON.stringify({
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for signup attempts
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: JSON.stringify({
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour'
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Password validation middleware
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength)
    errors.push(`Password must be at least ${minLength} characters long`);
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character');

  return errors;
};

// Login validation middleware
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Signup validation middleware
const signupValidation = [
  body('Name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('phone_number')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number'),
  body('DOB')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date of birth')
];

// Login route using Passport
router.post('/login', loginLimiter, loginValidation, (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message || 'Invalid email or password'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Your account is not active. Please verify your email or contact support.'
        });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in.'
        });
      }

      // Update login history and reset failed attempts
      await user.updateLoginHistory(req.ip, req.headers['user-agent']);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Set session data
      req.session.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
      req.session.isAuthenticated = true;

      // Set tokens in HTTP-only cookies
      setSessionCookie(res, 'token', accessToken);
      setSessionCookie(res, 'refreshToken', refreshToken);

      // Create safe user response object
      const userResponse = {
        _id: user._id,
        Name: user.Name,
        email: user.email,
        role: user.role
      };

      res.json({
        success: true,
        message: 'Login successful',
        user: userResponse
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

// Signup route
router.post('/signup', signupLimiter, signupValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { Name, username, email, password, DOB, phone_number, language, Address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user
    const user = new User({
      Name,
      username,
      email: email.toLowerCase(),
      password,
      DOB,
      phone_number,
      language,
      Address,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await user.save();

    // Send welcome email with verification link
    await sendVerificationEmail(user.email, verificationToken);

    // Send welcome SMS if phone number provided
    if (phone_number) {
      await sendWelcomeSMS(phone_number, Name);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email to activate your account.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Password reset request
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'If a user exists with this email, they will receive a password reset link',
        });
      }

      // Generate reset token with expiration
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

      await user.save();

      // Send password reset email
      try {
        await sendPasswordResetEmail(user, resetToken);
      } catch (emailErr) {
        console.error('Failed to send password reset email:', emailErr);
      }

      // Create reset link
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      res.json({
        success: true,
        message: 'If a user exists with this email, they will receive a password reset link',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request',
      });
    }
  }
);

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by reset token and check expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(12);
    user.password = await bcryptjs.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  try {
    // Clear session
    req.session.destroy();
    
    // Clear cookies
    removeCookie(res, 'token');
    removeCookie(res, 'refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test email route (for development only)
router.post('/test-email', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This route is only available in development mode'
    });
  }

  try {
    const testUser = {
      email: 'ahmedmostafa142004@gmail.com',
      name: 'Ahmed Mostafa'
    };

    const emailType = req.body.type || 'welcome';
    let emailResponse;

    switch (emailType) {
      case 'welcome':
        emailResponse = await sendWelcomeEmail(testUser);
        break;
      case 'password-reset':
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/test-token`;
        emailResponse = await sendPasswordResetEmail(testUser, resetLink);
        break;
      case 'verification':
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/test-token`;
        emailResponse = await sendVerificationEmail(testUser, verificationLink);
        break;
      case 'order':
        const orderDetails = {
          orderNumber: 'TEST-123456',
          date: new Date().toLocaleDateString(),
          total: '$1,999.99',
          items: [
            { name: 'Luxury Watch Model X', quantity: 1 },
            { name: 'Watch Care Kit', quantity: 1 }
          ]
        };
        emailResponse = await sendOrderConfirmationEmail(testUser, orderDetails);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid email type. Available types: welcome, password-reset, verification, order'
        });
    }

    res.json({
      success: true,
      message: `${emailType} email sent successfully`,
      data: emailResponse
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

// Email verification route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('email-verification-error', {
        message: 'The verification link is invalid or has expired.'
      });
    }

    user.isEmailVerified = true;
    user.status = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.render('email-verification-success');
  } catch (error) {
    console.error('Email verification error:', error);
    res.render('email-verification-error', {
      message: 'An error occurred during email verification. Please try again later or contact support.'
    });
  }
});

module.exports = router;
