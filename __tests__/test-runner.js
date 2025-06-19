// Simple test runner to avoid server startup conflicts
const request = require('supertest');
const express = require('express');

// Create a mock Express app for testing
const createMockApp = () => {
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
};

// Export the mock app
module.exports = createMockApp(); 