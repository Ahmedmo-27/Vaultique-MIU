require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/Users');

async function fixUserStatus() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Find all users without a status
        const usersToFix = await User.find({ status: { $exists: false } });
        console.log(`Found ${usersToFix.length} users without status`);

        // Update users
        for (const user of usersToFix) {
            user.status = 'active';
            await user.save();
            console.log(`Fixed status for user: ${user.email}`);
        }

        console.log('Finished fixing user status');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing user status:', error);
        process.exit(1);
    }
}

fixUserStatus(); 