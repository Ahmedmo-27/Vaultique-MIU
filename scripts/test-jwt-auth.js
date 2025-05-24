/**
 * JWT Authentication Test Script
 *
 * This script tests the JWT authentication flow:
 * 1. Login to get a JWT token
 * 2. Make an authenticated request with the token
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword1!',
};

// Test the JWT authentication flow
async function testJwtAuthentication() {
  console.log('Testing JWT Authentication Flow...');

  try {
    // Step 1: Attempt login
    console.log('Step 1: Logging in to get JWT token...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      throw new Error(`Login failed: ${errorData.message || loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✓ Login successful');

    if (!loginData.data || !loginData.data.token) {
      throw new Error('No JWT token returned in login response');
    }

    const token = loginData.data.token;
    console.log('✓ JWT token received');

    // Step 2: Make authenticated request
    console.log('\nStep 2: Making authenticated request...');
    const protectedResponse = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!protectedResponse.ok) {
      const errorData = await protectedResponse.json();
      throw new Error(
        `Protected request failed: ${errorData.message || protectedResponse.statusText}`
      );
    }

    const protectedData = await protectedResponse.json();
    console.log('✓ Authenticated request successful');

    // Success!
    console.log('\n✅ JWT Authentication test passed successfully!');
  } catch (error) {
    console.error('\n❌ JWT Authentication test failed:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testJwtAuthentication();
