const { verifyToken } = require('./jwt');
const User = require('../models/Users');

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token || 
                     req.headers.authorization?.split(' ')[1] || 
                     req.headers['x-access-token'];

        if (!token) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required' 
                });
            }
            return res.redirect('/login');
        }

        const { valid, decoded, error } = verifyToken(token);
        
        if (!valid) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: error
                });
            }
            return res.redirect('/login');
        }

        // Verify token type
        if (decoded.type !== 'ACCESS') {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token type'
                });
            }
            return res.redirect('/login');
        }

        // Fetch fresh user data
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            return res.redirect('/login');
        }

        if (user.status !== 'active') {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is not active'
                });
            }
            return res.redirect('/login');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error during authentication'
            });
        }
        return res.redirect('/login');
    }
};

module.exports = {
    isAuthenticated
}; 