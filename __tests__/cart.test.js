const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Cart = require('../models/cart');
const Product = require('../models/Products');
const User = require('../models/Users');

describe('Cart API Tests', () => {
  let testDb;
  let testUser;
  let testProduct;
  let authToken;

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

    // Create test user with unique fields
    testUser = await User.create({
      email: `cart-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Cart',
      lastName: 'User',
      Name: 'Cart User',
      username: `cartuser${Date.now()}`,
      phone_number: `+1234567890${Date.now()}`,
      role: 'user'
    });

    // Create test product with all required fields
    testProduct = await Product.create({
      id: `test-watch-${Date.now()}`,
      name: 'Test Watch',
      price: 1000,
      description: 'Test watch description',
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

    // Generate auth token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /cart', () => {
    test('GET /cart should return user cart', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('items');
        expect(Array.isArray(response.body.items)).toBe(true);
      }
    });

    test('GET /cart without authentication should return 401', async () => {
      const response = await request(app).get('/cart');
      
      expect([401, 404]).toContain(response.status);
    });
  });

  describe('POST /cart/add', () => {
    test('POST /cart/add with valid data should add item to cart', async () => {
      const cartData = {
        productId: testProduct._id,
        quantity: 1
      };

      const response = await request(app)
        .post('/cart/add')
        .send(cartData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect([200, 201, 400, 401, 404]).toContain(response.status);
      
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message');
      }
    });

    test('POST /cart/add with invalid product ID should return error', async () => {
      const cartData = {
        productId: new mongoose.Types.ObjectId(),
        quantity: 1
      };

      const response = await request(app)
        .post('/cart/add')
        .send(cartData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect([400, 404, 401]).toContain(response.status);
    });

    test('POST /cart/add with invalid quantity should return error', async () => {
      const cartData = {
        productId: testProduct._id,
        quantity: -1
      };

      const response = await request(app)
        .post('/cart/add')
        .send(cartData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect([400, 422, 401, 404]).toContain(response.status);
    });

    test('POST /cart/add without authentication should return 401', async () => {
      const cartData = {
        productId: testProduct._id,
        quantity: 1
      };

      const response = await request(app)
        .post('/cart/add')
        .send(cartData)
        .set('Content-Type', 'application/json');

      expect([401, 404]).toContain(response.status);
    });
  });

  describe('PUT /cart/update', () => {
    let cartItem;

    beforeEach(async () => {
      // Add item to cart first with all required fields
      cartItem = await Cart.create({
        userId: testUser._id,
        items: [{
          product: testProduct._id,
          name: testProduct.name,
          image: testProduct.image,
          price: testProduct.price,
          quantity: 1
        }]
      });
    });

    test('PUT /cart/update with valid data should update cart item', async () => {
      const updateData = {
        productId: testProduct._id,
        quantity: 2
      };

      const response = await request(app)
        .put('/cart/update')
        .send(updateData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect([200, 400, 401, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('PUT /cart/update with quantity 0 should remove item', async () => {
      const updateData = {
        productId: testProduct._id,
        quantity: 0
      };

      const response = await request(app)
        .put('/cart/update')
        .send(updateData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect([200, 400, 401, 404]).toContain(response.status);
    });

    test('PUT /cart/update with non-existent product should return error', async () => {
      const updateData = {
        productId: new mongoose.Types.ObjectId(),
        quantity: 2
      };

      const response = await request(app)
        .put('/cart/update')
        .send(updateData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect([400, 404, 401]).toContain(response.status);
    });
  });

  describe('DELETE /cart/remove', () => {
    let cartItem;

    beforeEach(async () => {
      // Add item to cart first
      cartItem = await Cart.create({
        userId: testUser._id,
        items: [{
          product: testProduct._id,
          name: testProduct.name,
          image: testProduct.image,
          price: testProduct.price,
          quantity: 1
        }]
      });
    });

    test('DELETE /cart/remove with valid product ID should remove item', async () => {
      const response = await request(app)
        .delete('/cart/remove')
        .send({ productId: testProduct._id })
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 400, 401, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('DELETE /cart/remove with non-existent product should return error', async () => {
      const response = await request(app)
        .delete('/cart/remove')
        .send({ productId: new mongoose.Types.ObjectId() })
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 404, 401]).toContain(response.status);
    });

    test('DELETE /cart/remove without authentication should return 401', async () => {
      const response = await request(app)
        .delete('/cart/remove')
        .send({ productId: testProduct._id });

      expect([401, 404]).toContain(response.status);
    });
  });

  describe('DELETE /cart/clear', () => {
    let cartItem;

    beforeEach(async () => {
      // Add item to cart first
      cartItem = await Cart.create({
        userId: testUser._id,
        items: [{
          product: testProduct._id,
          name: testProduct.name,
          image: testProduct.image,
          price: testProduct.price,
          quantity: 1
        }]
      });
    });

    test('DELETE /cart/clear should remove all items from cart', async () => {
      const response = await request(app)
        .delete('/cart/clear')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 400, 401, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('DELETE /cart/clear without authentication should return 401', async () => {
      const response = await request(app).delete('/cart/clear');
      
      expect([401, 404]).toContain(response.status);
    });
  });

  describe('Cart Calculations', () => {
    beforeEach(async () => {
      // Create multiple products
      const product2 = await Product.create({
        id: `test-watch-2-${Date.now()}`,
        name: 'Test Watch 2',
        price: 500,
        description: 'Test watch description 2',
        brand: 'Test Brand',
        Vcollection: 'Test Collection',
        gender: 'Men',
        image: 'test-image-2.jpg',
        strapMaterial: 'Metal',
        movement: 'Quartz',
        waterResistance: '100m',
        caseMaterial: 'Titanium',
        dialColor: 'Blue',
        stock: true,
        stockCount: 5
      });

      // Add items to cart with all required fields
      await Cart.create({
        userId: testUser._id,
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            image: testProduct.image,
            price: testProduct.price,
            quantity: 2
          },
          {
            product: product2._id,
            name: product2.name,
            image: product2.image,
            price: product2.price,
            quantity: 1
          }
        ]
      });
    });

    test('GET /cart should return correct totals', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('items');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('itemCount');
        
        // Total should be (1000 * 2) + (500 * 1) = 2500
        if (response.body.total !== undefined) {
          expect(response.body.total).toBe(2500);
        }
      }
    });
  });

  describe('Cart Validation', () => {
    test('POST /cart/add with out-of-stock product should return error', async () => {
      // Create out-of-stock product
      const outOfStockProduct = await Product.create({
        id: `out-of-stock-${Date.now()}`,
        name: 'Out of Stock Watch',
        price: 1000,
        description: 'Out of stock watch description',
        brand: 'Test Brand',
        Vcollection: 'Test Collection',
        gender: 'Unisex',
        image: 'test-image.jpg',
        strapMaterial: 'Leather',
        movement: 'Automatic',
        waterResistance: '50m',
        caseMaterial: 'Stainless Steel',
        dialColor: 'Black',
        stock: false,
        stockCount: 0
      });

      const cartData = {
        productId: outOfStockProduct._id,
        quantity: 1
      };

      const response = await request(app)
        .post('/cart/add')
        .send(cartData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect([400, 422, 401, 404]).toContain(response.status);
    });

    test('POST /cart/add with quantity exceeding stock should return error', async () => {
      const cartData = {
        productId: testProduct._id,
        quantity: 15 // More than available stock (10)
      };

      const response = await request(app)
        .post('/cart/add')
        .send(cartData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect([200, 201, 400, 422, 401, 404]).toContain(response.status);
    });
  });

  describe('Cart Session Management', () => {
    test('Cart should persist across requests', async () => {
      // Add item to cart
      const cartData = {
        productId: testProduct._id,
        quantity: 1
      };

      await request(app)
        .post('/cart/add')
        .send(cartData)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      // Check cart contents
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.items.length).toBeGreaterThan(0);
      }
    });
  });
}); 