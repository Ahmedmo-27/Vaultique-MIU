require('dotenv').config();

// Required environment variables
const requiredEnvVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'MONGODB_URI'
];

// Check for required environment variables
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Error: Environment variable ${varName} is not set`);
        process.exit(1);
    }
});

module.exports = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    cookieDomain: process.env.COOKIE_DOMAIN,
    isProduction: process.env.NODE_ENV === 'production'
}; 