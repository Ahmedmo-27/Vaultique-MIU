const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const dotenv = require('dotenv');

dotenv.config();

// Mock environment variables for testing
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vaultique-test';
process.env.PORT = process.env.PORT || 3001;

describe('Server Tests', () => {
  // Before all tests, connect to the test database
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('Error connecting to test database:', error);
    }
  });

  // After all tests, close the database connection
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test server initialization
  test('Server should be defined', () => {
    expect(app).toBeDefined();
  });

  // Test basic routes
  test('GET / should redirect to /user/products', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302); // Redirect status code
    expect(response.header.location).toBe('/user/products');
  });

  // Test API routes
  test('GET /api/nonexistent should return 404', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  // Test error handling
  test('Should handle 404 errors for frontend routes', async () => {
    const response = await request(app).get('/nonexistent-route');
    expect(response.status).toBe(404);
  });
});
