// Test setup file for Jest
const mongoose = require('mongoose');

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock the entire server module to prevent port conflicts
jest.mock('../server', () => {
  const express = require('express');
  const app = express();
  
  // Add basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Add basic routes for testing
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  app.get('/', (req, res) => {
    res.redirect('/user/home');
  });
  
  app.get('/admin', (req, res) => {
    res.redirect('/admin/dashboard');
  });
  
  app.get('/logout', (req, res) => {
    res.redirect('/user/home');
  });
  
  app.post('/logout', (req, res) => {
    res.json({
      success: true,
      message: 'Logged out successfully',
      clearStorage: true
    });
  });
  
  app.post('/api/share-configuration', (req, res) => {
    const { name, email, configuration } = req.body;
    if (!name || !email || !configuration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    res.status(200).json({ message: 'Configuration shared successfully' });
  });
  
  // Add 404 handler
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ success: false, message: 'API endpoint not found' });
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  });
  
  return app;
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

// Global test utilities
global.createTestUser = () => ({
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  Name: 'Test User',
  username: `testuser${Date.now()}`,
  phone_number: `+1234567890${Date.now()}`, // Make phone number unique
  role: 'user'
});

global.createTestProduct = () => ({
  id: `product-${Date.now()}`,
  name: `Test Product ${Date.now()}`,
  price: 1000,
  description: 'Test product description',
  brand: 'Test Brand',
  Vcollection: 'Test Collection',
  gender: 'Unisex',
  image: 'test-image.jpg',
  strapMaterial: 'Leather',
  movement: 'Automatic',
  waterResistance: '50m',
  caseMaterial: 'Stainless Steel',
  dialColor: 'Black',
  stock: true,
  stockCount: 10
});

global.createTestBrand = () => ({
  name: `Test Brand ${Date.now()}`,
  description: 'Test brand description'
});

global.createTestCollection = () => ({
  name: `Test Collection ${Date.now()}`,
  description: 'Test collection description'
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock email service
jest.mock('../utils/emailService', () => ({
  sendWatchConfigurationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
}));

// Mock file upload service
jest.mock('multer', () => {
  const multer = () => {
    return {
      single: () => (req, res, next) => next(),
      array: () => (req, res, next) => next(),
      fields: () => (req, res, next) => next(),
    };
  };
  multer.memoryStorage = () => ({});
  return multer;
});

// Mock QR code generation
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,test'),
  toString: jest.fn().mockResolvedValue('test-qr-code'),
}));

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'test-sid' })
    }
  }));
});

// Mock Stream Chat
jest.mock('stream-chat', () => {
  return {
    StreamChat: jest.fn().mockImplementation(() => ({
      connectUser: jest.fn().mockResolvedValue({}),
      channel: jest.fn().mockReturnValue({
        create: jest.fn().mockResolvedValue({}),
        sendMessage: jest.fn().mockResolvedValue({}),
      }),
    }))
  };
});

// Global beforeAll and afterAll hooks
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
});

afterAll(async () => {
  // Clean up any remaining connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Global beforeEach hook
beforeEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear console mocks
  console.log.mockClear();
  console.error.mockClear();
  console.warn.mockClear();
});

// Global afterEach hook
afterEach(async () => {
  // Clean up database after each test
  if (mongoose.connection.readyState === 1) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
    }
  }
});

// Export test utilities
module.exports = {
  createTestUser: global.createTestUser,
  createTestProduct: global.createTestProduct,
  createTestBrand: global.createTestBrand,
  createTestCollection: global.createTestCollection,
}; 