require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../models/Users');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Function to fix passwords
async function fixPasswords() {
    try {
        // Get all users with passwords
        const users = await User.find().select('+password');
        
        console.log(`Found ${users.length} users in the database`);

        // Test user for admin login
        await createOrUpdateTestUser();

        let fixedCount = 0;
        
        // Check each user's password hash format
        for (const user of users) {
            // Skip users with no password
            if (!user.password) {
                console.log(`User ${user.email} has no password set`);
                continue;
            }
            
            // Check if the password is already in bcryptjs format
            const isBcryptjs = user.password.startsWith('$2a$') || 
                              user.password.startsWith('$2b$') || 
                              user.password.startsWith('$2y$');
                            
            if (!isBcryptjs) {
                console.log(`Fixing password format for user: ${user.email}`);
                
                // Since we can't recover the original password, we'll set a temporary one
                const tempPassword = '123456789';
                const salt = await bcryptjs.genSalt(12);
                user.password = await bcryptjs.hash(tempPassword, salt);
                await user.save();
                
                console.log(`Set temporary password for user: ${user.email}`);
                fixedCount++;
            }
        }
        
        console.log(`Fixed ${fixedCount} user passwords`);
        console.log('Password fix operation completed');
    } catch (error) {
        console.error('Error fixing passwords:', error);
    } finally {
        mongoose.disconnect();
    }
}

// Create or update a test admin user
async function createOrUpdateTestUser() {
    const adminEmail = 'admin@test.com';
    const adminPassword = 'Admin123!';
    
    try {
        // Check if user exists
        let adminUser = await User.findOne({ email: adminEmail });
        
        if (!adminUser) {
            console.log('Creating test admin user');
            
            // Create new admin user
            adminUser = new User({
                Name: 'Test Admin',
                username: 'testadmin',
                email: adminEmail,
                role: 'admin',
                status: 'active'
            });
        } else {
            console.log('Updating test admin user');
        }
        
        // Set password using bcryptjs
        const salt = await bcryptjs.genSalt(12);
        adminUser.password = await bcryptjs.hash(adminPassword, salt);
        await adminUser.save();
        
        console.log('Test admin user ready:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
    } catch (error) {
        console.error('Error creating test user:', error);
    }
}

// Run the function
fixPasswords().catch(console.error); 