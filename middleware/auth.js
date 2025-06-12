const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // For API routes, return JSON response
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
    // For regular routes, redirect to login
    res.redirect('/login');
};

module.exports = {
    isAuthenticated
}; 