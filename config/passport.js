const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/Users');

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Missing Google OAuth credentials in environment variables");
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `https://vaultique.up.railway.app/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            Name: profile.displayName,
            username: profile.emails[0].value.split('@')[0] + Math.random().toString(36).substring(2, 8),
            email: profile.emails[0].value.toLowerCase(),
            password: Math.random().toString(36).slice(-8), // Generate random password
            phone_number: "", // Default phone number
            isEmailVerified: true, // Google accounts are pre-verified
            status: 'active',
            role: 'user',
            Address: [],
            Payment: [],
            orders: [],
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;