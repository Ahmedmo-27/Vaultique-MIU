const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const crypto = require('crypto');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { generateToken } = require('../middleware/jwt');
// Authentication security is handled by JWT middleware

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
});

// Rate limiting for signup attempts
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Increased from 3 to 10 attempts per hour
  message: JSON.stringify({
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour',
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
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
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
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('phone_number').optional(),
  body('DOB').optional(),
];

// Login route
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    console.log('Login attempt received:', {
      email: req.body.email,
      hasPassword: !!req.body.password,
      body: req.body,
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Debug log for request body
    console.log('Request body:', {
      hasEmail: !!email,
      hasPassword: !!password,
      emailLength: email?.length,
      passwordLength: password?.length,
      passwordIsHash: password?.startsWith('$2a$'),
    });

    try {
      // Find user by email with all necessary fields
      const user = await User.findOne({ email: email?.toLowerCase() })
        .select('+password +failedLoginAttempts +lastFailedLogin +status +role')
        .exec();

      console.log('Database query result:', {
        userFound: !!user,
        hasPassword: user ? !!user.password : false,
        passwordFirstChars: user?.password?.substring(0, 10),
        status: user?.status,
        role: user?.role,
      });

      if (!user) {
        console.log('User not found:', { email });
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Ensure password is available
      if (!user.password) {
        console.error('Password not found for user:', user.email);
        return res.status(500).json({
          success: false,
          message: 'Authentication error',
        });
      }

      // Check password
      try {
        const isMatch = await user.verifyPassword(password);
        console.log('Password check:', {
          isMatch,
          passwordProvided: !!password,
          hashedPasswordExists: !!user.password,
        });

        if (!isMatch) {
          // Update failed login attempts
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          user.lastFailedLogin = new Date();
          await user.save();

          return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
          });
        }
      } catch (bcryptError) {
        console.error('Password verification error:', bcryptError);
        return res.status(500).json({
          success: false,
          message: 'Error verifying password',
        });
      }

      // Check if account is locked
      const isLocked =
        user.failedLoginAttempts >= 5 &&
        user.lastFailedLogin &&
        new Date() - new Date(user.lastFailedLogin) < 30 * 60 * 1000;

      if (isLocked) {
        console.log('Account locked:', {
          email: user.email,
          failedAttempts: user.failedLoginAttempts,
          lastFailedLogin: user.lastFailedLogin,
        });
        return res.status(423).json({
          success: false,
          message:
            'Account is temporarily locked due to too many failed attempts. Please try again later.',
        });
      }

      // Ensure status is set
      if (!user.status) {
        console.log('Setting default status for user:', user.email);
        user.status = 'active';
        await user.save();
      }

      // Check if user is active
      if (user.status !== 'active') {
        console.log('Inactive account attempt:', {
          email: user.email,
          status: user.status,
        });
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      // Reset failed login attempts and update last login
      user.failedLoginAttempts = 0;
      user.lastLogin = new Date();
      user.loginHistory.push({
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
      });

      // Keep only last 10 login attempts
      if (user.loginHistory.length > 10) {
        user.loginHistory = user.loginHistory.slice(-10);
      }

      await user.save();

      // Generate token
      const token = generateToken(user);

      // Set the JWT token in an HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
      });

      // Create safe user object for response
      const userResponse = {
        _id: user._id,
        email: user.email,
        username: user.username,
        Name: user.Name,
        role: user.role,
        status: user.status,
        language: user.language,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };

      console.log('Login successful:', {
        email: user.email,
        role: user.role,
        status: user.status,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          isAdmin: user.role === 'admin',
          redirectUrl: user.role === 'admin' ? '/admin/dashboard' : '/user/home',
          token: token, // Send token in response for clients that prefer localStorage
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Login error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// Signup route
router.post('/signup', signupLimiter, signupValidation, async (req, res) => {
  try {
    console.log('Signup attempt received:', {
      email: req.body.email,
      username: req.body.username,
      hasPassword: !!req.body.password,
      body: req.body,
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { Name, username, email, password, DOB, phone_number, language, Address, Payment } =
      req.body;

    try {
      // Check if user already exists
      console.log('Checking if user exists...');
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username }],
      });

      if (existingUser) {
        console.log(
          'User already exists:',
          existingUser.email === email.toLowerCase()
            ? 'Email already registered'
            : 'Username already taken'
        );
        return res.status(400).json({
          success: false,
          message:
            existingUser.email === email.toLowerCase()
              ? 'Email already registered'
              : 'Username already taken',
        });
      }

      // Hash password with stronger salt rounds - use bcryptjs for consistency
      console.log('Hashing password...');
      const salt = await bcryptjs.genSalt(12);
      const hashedPassword = await bcryptjs.hash(password, salt);

      // Create user object
      console.log('Creating user object...');
      const userData = {
        Name,
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        status: 'active',
        createdAt: new Date(),
      };

      // Add optional fields if provided
      if (DOB) userData.DOB = DOB;
      if (phone_number) userData.phone_number = phone_number;
      if (language) {
        // Map language codes to full names if needed
        const languageMap = {
          en: 'English',
          ar: 'Arabic',
          fr: 'English', // Default to English for unsupported languages
        };
        userData.language = languageMap[language] || language;
        console.log('Language value:', language, '→', userData.language);
      }

      console.log('Creating new user in database...');
      // Create new user
      const newUser = await User.create(userData);
      console.log('User created successfully:', newUser._id);

      // Remove sensitive information
      const userResponse = newUser.toObject();
      delete userResponse.password;

      // Generate token
      const token = generateToken(newUser);

      // Set session cookie
      const sessionConfig = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined,
      };

      res.cookie('token', token, sessionConfig);

      res.status(201).json({
        success: true,
        message: 'Signup successful',
        data: {
          user: userResponse,
          token: token, // Add token to response
        },
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating user:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    // Send more specific error messages based on the error type
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
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

      // TODO: Implement email sending with reset link
      // For development only - remove in production
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          success: true,
          message: 'Password reset link sent to your email',
          resetToken, // Remove in production
        });
      }

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
router.post(
  '/reset-password/:token',
  [
    body('password').custom((value, { req }) => {
      const errors = validatePassword(value);
      if (errors.length > 0) {
        throw new Error(errors.join('. '));
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { token } = req.params;
      const { password } = req.body;

      // Hash token
      const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid token
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is invalid or has expired',
        });
      }

      // Hash new password with stronger salt rounds
      const salt = await bcryptjs.genSalt(12);
      user.password = await bcryptjs.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user.failedLoginAttempts = 0; // Reset failed attempts
      user.lastFailedLogin = undefined;

      await user.save();

      res.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while resetting your password',
      });
    }
  }
);

// Logout route
router.post('/logout', (req, res) => {
  // Clear all session cookies
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = router;
