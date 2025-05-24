/**
 * Test Authentication Script
 * 
 * This script helps test the authentication flow by simulating a login request
 * with debugging output to identify any issues.
 */

require('dotenv').config();
const fetch = require('node-fetch');
const User = require('../models/Users');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword1!';

async function setup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if test user exists
    let testUser = await User.findOne({ email: TEST_EMAIL });
    
    if (!testUser) {
      console.log('Creating test user...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);
      
      testUser = await User.create({
        Name: 'Test User',
        username: 'testuser',
        email: TEST_EMAIL,
        password: hashedPassword,
        role: 'user',
        status: 'active'
      });
      
      console.log('Test user created:', testUser._id);
    } else {
      console.log('Test user already exists:', testUser._id);
      
      // Reset user's password to known value for testing
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);
      testUser.password = hashedPassword;
      await testUser.save();
      console.log('Reset password for test user');
    }
    
    // Get the actual stored hash to verify
    const dbUser = await User.findOne({ email: TEST_EMAIL }).select('+password');
    console.log('Stored password hash in DB:', dbUser.password.substring(0, 20) + '...');
    
    return testUser;
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
}

async function testDirectLogin() {
  console.log('\n1. Testing direct login with API request');
  
  try {
    // Make the same login request that's made from the frontend
    console.log(`Attempting login with: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    const data = await response.json();
    
    console.log('Login response status:', response.status);
    console.log('Login response:', data);
    
    if (data.success) {
      console.log('✅ Login successful');
      console.log('JWT token received'); 
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

async function testPasswordVerification() {
  console.log('\n2. Testing password verification directly');
  
  try {
    const user = await User.findOne({ email: TEST_EMAIL }).select('+password');
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    // Test regular password
    const isMatch = await bcrypt.compare(TEST_PASSWORD, user.password);
    console.log('Password verification result:', isMatch ? '✅ Success' : '❌ Failed');
    
    // Test with hashed password (simulating wrong password sent from frontend)
    const wrongMatch = await bcrypt.compare('$2a$12$someHashedPassword', user.password);
    console.log('Hashed password verification result:', wrongMatch ? '✅ Success' : '❌ Failed (expected)');
    
  } catch (error) {
    console.error('Verification error:', error);
  }
}

async function main() {
  try {
    await setup();
    await testDirectLogin();
    await testPasswordVerification();
    
    console.log('\nTests completed');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Test execution error:', error);
    try {
      await mongoose.connection.close();
    } catch (err) {
      // Ignore
    }
  }
}

main(); 