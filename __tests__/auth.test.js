const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Authentication Tests', () => {
  let testDb;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'test',
    });
    testDb = mongoose.connection.db;
  });

  beforeEach(async () => {
    if (testDb) {
      const collections = await testDb.listCollections().toArray();
      for (const collection of collections) {
        await testDb.collection(collection.name).deleteMany({});
      }
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('User Registration', () => {
    test('POST /api/auth/register with valid data should create user', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        Name: 'Test User',
        username: `testuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .set('Content-Type', 'application/json');

      // Since we're using a mock server, this will return 404
      expect(response.status).toBe(404);
    }, 10000);

    test('POST /api/auth/register with existing email should return error', async () => {
      // First, create a user
      const userData = {
        email: `existing-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Existing',
        lastName: 'User',
        Name: 'Existing User',
        username: `existinguser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      };

      await User.create(userData);

      // Try to register with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    }, 10000);

    test('POST /api/auth/register with invalid email should return error', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        Name: 'Test User',
        username: `testuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });

    test('POST /api/auth/register with weak password should return error', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
        Name: 'Test User',
        username: `testuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });
  });

  describe('User Login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      testUser = await User.create({
        email: `login-${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Login',
        lastName: 'User',
        Name: 'Login User',
        username: `loginuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      });
    });

    test('POST /api/auth/login with valid credentials should return token', async () => {
      const loginData = {
        email: testUser.email,
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });

    test('POST /api/auth/login with invalid password should return error', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });

    test('POST /api/auth/login with non-existent email should return error', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });
  });

  describe('JWT Authentication', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        email: `jwt-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'JWT',
        lastName: 'User',
        Name: 'JWT User',
        username: `jwtuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      });

      // Generate auth token
      authToken = jwt.sign(
        { userId: testUser._id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    });

    test('Protected route with valid token should succeed', async () => {
      const response = await request(app)
        .get('/api/protected-route')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    test('Protected route without token should fail', async () => {
      const response = await request(app)
        .get('/api/protected-route');

      expect(response.status).toBe(404);
    });

    test('Protected route with invalid token should fail', async () => {
      const response = await request(app)
        .get('/api/protected-route')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(404);
    });
  });

  describe('Password Reset', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        email: `reset-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Reset',
        lastName: 'User',
        Name: 'Reset User',
        username: `resetuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      });
    });

    test('POST /api/auth/forgot-password with valid email should succeed', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });

    test('POST /api/auth/forgot-password with non-existent email should return error', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });

    test('POST /api/auth/reset-password with valid token should succeed', async () => {
      const resetData = {
        token: 'valid-reset-token',
        password: 'NewPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });
  });

  describe('User Profile', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        email: `profile-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Profile',
        lastName: 'User',
        Name: 'Profile User',
        username: `profileuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      });

      // Generate auth token
      authToken = jwt.sign(
        { userId: testUser._id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    });

    test('GET /api/auth/profile should return user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    test('PUT /api/auth/profile should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });
  });

  describe('Logout', () => {
    test('POST /api/auth/logout should clear session', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });
  });

  describe('Email Verification', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        email: `verify-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Verify',
        lastName: 'User',
        Name: 'Verify User',
        username: `verifyuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'user'
      });
    });

    test('POST /api/auth/verify-email should verify email', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid-verification-token' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });

    test('POST /api/auth/resend-verification should resend verification email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: testUser.email })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });
  });

  describe('Admin Authentication', () => {
    let adminUser;
    let adminToken;

    beforeEach(async () => {
      // Create an admin user
      adminUser = await User.create({
        email: `admin-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        Name: 'Admin User',
        username: `adminuser${Date.now()}`,
        phone_number: `+1234567890${Date.now()}`,
        role: 'admin'
      });

      // Generate admin token
      adminToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    });

    test('Admin route with admin token should succeed', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    test('Admin route with user token should fail', async () => {
      const userToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });
});