const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const crypto = require('crypto');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const csrf = require('csurf');
const helmet = require('helmet');

// Add security headers
router.use(helmet());

// Add CSRF protection
const csrfProtection = csrf({ cookie: true });
router.use(csrfProtection);

// Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes'
});

// Rate limiting for signup attempts
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 accounts per hour
    message: 'Too many accounts created from this IP, please try again after an hour'
});

// Password validation middleware
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');

    return errors;
};

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Login validation middleware
const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
];

// Signup validation middleware
const signupValidation = [
    body('Name').trim().notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('username').trim().notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password').custom((value, { req }) => {
        const errors = validatePassword(value);
        if (errors.length > 0) {
            throw new Error(errors.join('. '));
        }
        return true;
    }),
    body('phone_number').optional().matches(/^\+?[\d\s-]+$/).withMessage('Please enter a valid phone number'),
    body('DOB').optional().isISO8601().toDate().withMessage('Please enter a valid date')
];

// Login route
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
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

        const { email, password } = req.body;

        // Find user by email with all necessary fields
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password +failedLoginAttempts +lastFailedLogin')
            .select('Name username email role language Address Payment createdAt lastLogin status');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Account is temporarily locked due to too many failed attempts. Please try again later.'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Record failed login attempt
            await user.recordLoginAttempt(false, req.ip, req.get('user-agent'));

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Record successful login
        await user.recordLoginAttempt(true, req.ip, req.get('user-agent'));

        // Generate token
        const token = generateToken(user._id);

        // Set session cookie with secure options
        const sessionConfig = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        };

        res.cookie('token', token, sessionConfig);

        // Remove sensitive information
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.failedLoginAttempts;
        delete userResponse.lastFailedLogin;

        if (userResponse.Payment) {
            delete userResponse.Payment.cvv;
            if (userResponse.Payment.cardNumber) {
                userResponse.Payment.cardNumber = `**** **** **** ${userResponse.Payment.cardNumber.slice(-4)}`;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                isAdmin: user.role === 'admin',
                redirectUrl: user.role === 'admin' ? '/admin/dashboard' : '/user/home',
                csrfToken: req.csrfToken()
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
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

        const {
            Name,
            username,
            email,
            password,
            DOB,
            phone_number,
            language,
            Address,
            Payment
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email.toLowerCase() ? 
                    'Email already registered' : 
                    'Username already taken'
            });
        }

        // Hash password with stronger salt rounds
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            Name,
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            DOB: DOB || undefined,
            phone_number: phone_number || undefined,
            language: language || 'English',
            role: 'user',
            Address: Address || undefined,
            Payment: Payment || undefined,
            status: 'active',
            createdAt: new Date()
        });

        // Remove sensitive information
        const userResponse = newUser.toObject();
        delete userResponse.password;
        if (userResponse.Payment) {
            delete userResponse.Payment.cvv;
            if (userResponse.Payment.cardNumber) {
                userResponse.Payment.cardNumber = `**** **** **** ${userResponse.Payment.cardNumber.slice(-4)}`;
            }
        }

        // Generate token
        const token = generateToken(newUser._id);

        // Set session cookie
        const sessionConfig = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        };

        res.cookie('token', token, sessionConfig);

        res.status(201).json({
            success: true,
            message: 'Signup successful',
            data: {
                user: userResponse,
                csrfToken: req.csrfToken()
            }
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Password reset request
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'If a user exists with this email, they will receive a password reset link'
            });
        }

        // Generate reset token with expiration
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

        await user.save();

        // TODO: Implement email sending with reset link
        // For development only - remove in production
        if (process.env.NODE_ENV === 'development') {
            return res.json({
                success: true,
                message: 'Password reset link sent to your email',
                resetToken // Remove in production
            });
        }

        res.json({
            success: true,
            message: 'If a user exists with this email, they will receive a password reset link'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
});

// Reset password
router.post('/reset-password/:token', [
    body('password').custom((value, { req }) => {
        const errors = validatePassword(value);
        if (errors.length > 0) {
            throw new Error(errors.join('. '));
        }
        return true;
    })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { token } = req.params;
        const { password } = req.body;

        // Hash token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Password reset token is invalid or has expired'
            });
        }

        // Hash new password with stronger salt rounds
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.failedLoginAttempts = 0; // Reset failed attempts
        user.lastFailedLogin = undefined;

        await user.save();

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting your password'
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    // Clear all session cookies
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0),
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined
    });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router; 