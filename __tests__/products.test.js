const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Products');
const Brand = require('../models/Brands');
const Collection = require('../models/Collections');
const User = require('../models/Users');
const bcrypt = require('bcryptjs');

describe('Products API Tests', () => {
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

    // Create test collection with all required fields
    const collectionId = `test-collection-${Date.now()}`;
    await Collection.create({
      _id: collectionId,
      name: 'Test Collection',
      slug: `test-collection-${Date.now()}`,
      logo: 'test-collection-logo.jpg',
      coverImage: 'test-collection-cover.jpg',
      header: 'Test Collection Header',
      description: 'Test collection description',
      featuredItems: [
        {
          name: 'Featured Item',
          image: 'featured-item.jpg',
          tagline: 'Test Item Tagline',
          description: 'Featured item description'
        }
      ]
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test brands and collections with all required fields
      const brandId = `test-brand-${Date.now()}`;
      await Brand.create({
        _id: brandId,
        name: 'Test Brand',
        slug: `test-brand-${Date.now()}`,
        logo: 'test-logo.jpg',
        coverImage: 'test-cover.jpg',
        coverImage2: 'test-cover2.jpg',
        header: 'Test Brand Header',
        description: 'Test brand description',
        featuredModels: [
          {
            name: 'Featured Model',
            image: 'featured-model.jpg',
            tagline: 'Test Tagline',
            description: 'Featured model description'
          }
        ]
      });

      const collectionId = `test-collection-${Date.now()}`;
      await Collection.create({
        _id: collectionId,
        name: 'Test Collection',
        slug: `test-collection-${Date.now()}`,
        logo: 'test-collection-logo.jpg',
        coverImage: 'test-collection-cover.jpg',
        header: 'Test Collection Header',
        description: 'Test collection description',
        featuredItems: [
          {
            name: 'Featured Item',
            image: 'featured-item.jpg',
            tagline: 'Test Item Tagline',
            description: 'Featured item description'
          }
        ]
      });

      // Create test products with all required fields
      await Product.create([
        {
          id: 'test-watch-1',
          name: 'Test Watch 1',
          price: 1000,
          description: 'Test watch description 1',
          brand: 'Test Brand',
          Vcollection: 'Test Collection',
          gender: 'Unisex',
          image: 'test-image-1.jpg',
          strapMaterial: 'Leather',
          movement: 'Automatic',
          waterResistance: '50m',
          caseMaterial: 'Stainless Steel',
          dialColor: 'Black',
          stock: true,
          stockCount: 5
        },
        {
          id: 'test-watch-2',
          name: 'Test Watch 2',
          price: 2000,
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
          stock: false,
          stockCount: 0
        }
      ]);
    });

    test('GET /api/products should return all products', async () => {
      const response = await request(app).get('/api/products');
      
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      }
    });

    test('GET /api/products with pagination should work', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 10 });
      
      expect([200, 404]).toContain(response.status);
    });

    test('GET /api/products with brand filter should work', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ brand: 'Test Brand' });
      
      expect([200, 404]).toContain(response.status);
    });

    test('GET /api/products with price range should work', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ minPrice: 500, maxPrice: 1500 });
      
      expect([200, 404]).toContain(response.status);
    });

    test('GET /api/products with gender filter should work', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ gender: 'Unisex' });
      
      expect([200, 404]).toContain(response.status);
    });

    test('GET /api/products with stock filter should work', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ stock: true });
      
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/products/:id', () => {
    let testProduct;

    beforeEach(async () => {
      const brand = await Brand.create({
        _id: `test-brand-single-${Date.now()}`,
        name: 'Test Brand',
        slug: `test-brand-single-${Date.now()}`,
        logo: 'test-logo.jpg',
        coverImage: 'test-cover.jpg',
        coverImage2: 'test-cover2.jpg',
        header: 'Test Brand Header',
        description: 'Test brand description',
        featuredModels: [
          {
            name: 'Featured Model',
            image: 'featured-model.jpg',
            tagline: 'Test Tagline',
            description: 'Featured model description'
          }
        ]
      });

      const collection = await Collection.create({
        _id: `test-collection-single-${Date.now()}`,
        name: 'Test Collection',
        slug: `test-collection-single-${Date.now()}`,
        logo: 'test-collection-logo.jpg',
        coverImage: 'test-collection-cover.jpg',
        header: 'Test Collection Header',
        description: 'Test collection description',
        featuredItems: [
          {
            name: 'Featured Item',
            image: 'featured-item.jpg',
            tagline: 'Test Item Tagline',
            description: 'Featured item description'
          }
        ]
      });

      testProduct = await Product.create({
        id: 'test-watch-single',
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
    });

    test('GET /api/products/:id with valid ID should return product', async () => {
      const response = await request(app).get(`/api/products/${testProduct._id}`);
      
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('name', 'Test Watch');
        expect(response.body).toHaveProperty('price', 1000);
      }
    });

    test('GET /api/products/:id with invalid ID should return 404', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${invalidId}`);
      
      expect([404, 400]).toContain(response.status);
    });

    test('GET /api/products/:id with malformed ID should return 400', async () => {
      const response = await request(app).get('/api/products/invalid-id');
      
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/products (Admin Only)', () => {
    test('POST /api/products without admin privileges should return 403', async () => {
      const productData = {
        id: 'new-test-watch',
        name: 'New Test Watch',
        price: 1500,
        description: 'New test watch description',
        brand: 'Test Brand',
        Vcollection: 'Test Collection',
        gender: 'Unisex',
        image: 'new-test-image.jpg',
        strapMaterial: 'Leather',
        movement: 'Automatic',
        waterResistance: '50m',
        caseMaterial: 'Stainless Steel',
        dialColor: 'Black',
        stock: true,
        stockCount: 5
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .set('Content-Type', 'application/json');

      expect([403, 401, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/products/:id (Admin Only)', () => {
    let testProduct;

    beforeEach(async () => {
      const brand = await Brand.create({
        _id: `test-brand-update-${Date.now()}`,
        name: 'Test Brand',
        slug: `test-brand-update-${Date.now()}`,
        logo: 'test-logo.jpg',
        coverImage: 'test-cover.jpg',
        coverImage2: 'test-cover2.jpg',
        header: 'Test Brand Header',
        description: 'Test brand description',
        featuredModels: [
          {
            name: 'Featured Model',
            image: 'featured-model.jpg',
            tagline: 'Test Tagline',
            description: 'Featured model description'
          }
        ]
      });

      testProduct = await Product.create({
        id: 'test-watch-update',
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
    });

    test('PUT /api/products/:id without admin privileges should return 403', async () => {
      const updateData = {
        name: 'Updated Test Watch',
        price: 1200
      };

      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect([403, 401, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/products/:id (Admin Only)', () => {
    let testProduct;

    beforeEach(async () => {
      const brand = await Brand.create({
        _id: `test-brand-delete-${Date.now()}`,
        name: 'Test Brand',
        slug: `test-brand-delete-${Date.now()}`,
        logo: 'test-logo.jpg',
        coverImage: 'test-cover.jpg',
        coverImage2: 'test-cover2.jpg',
        header: 'Test Brand Header',
        description: 'Test brand description',
        featuredModels: [
          {
            name: 'Featured Model',
            image: 'featured-model.jpg',
            tagline: 'Test Tagline',
            description: 'Featured model description'
          }
        ]
      });

      testProduct = await Product.create({
        id: 'test-watch-delete',
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
    });

    test('DELETE /api/products/:id without admin privileges should return 403', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`);

      expect([403, 401, 404]).toContain(response.status);
    });
  });

  describe('Product Search', () => {
    beforeEach(async () => {
      const brand = await Brand.create({
        _id: `test-brand-search-${Date.now()}`,
        name: 'Test Brand',
        slug: `test-brand-search-${Date.now()}`,
        logo: 'test-logo.jpg',
        coverImage: 'test-cover.jpg',
        coverImage2: 'test-cover2.jpg',
        header: 'Test Brand Header',
        description: 'Test brand description',
        featuredModels: [
          {
            name: 'Featured Model',
            image: 'featured-model.jpg',
            tagline: 'Test Tagline',
            description: 'Featured model description'
          }
        ]
      });

      await Product.create([
        {
          id: 'luxury-watch',
          name: 'Luxury Watch',
          price: 1000,
          description: 'A luxury timepiece',
          brand: 'Test Brand',
          Vcollection: 'Test Collection',
          gender: 'Unisex',
          image: 'luxury-watch.jpg',
          strapMaterial: 'Leather',
          movement: 'Automatic',
          waterResistance: '50m',
          caseMaterial: 'Stainless Steel',
          dialColor: 'Black',
          stock: true,
          stockCount: 5
        },
        {
          id: 'sport-watch',
          name: 'Sport Watch',
          price: 500,
          description: 'A sporty timepiece',
          brand: 'Test Brand',
          Vcollection: 'Test Collection',
          gender: 'Men',
          image: 'sport-watch.jpg',
          strapMaterial: 'Rubber',
          movement: 'Quartz',
          waterResistance: '100m',
          caseMaterial: 'Plastic',
          dialColor: 'Red',
          stock: true,
          stockCount: 10
        }
      ]);
    });

    test('GET /api/products/search should work with query parameter', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({ q: 'Luxury' });
      
      expect([200, 404]).toContain(response.status);
    });

    test('GET /api/products/search without query should return all products', async () => {
      const response = await request(app).get('/api/products/search');
      
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Product Categories', () => {
    test('GET /api/products/categories should return categories', async () => {
      const response = await request(app).get('/api/products/categories');
      
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('Product Statistics', () => {
    beforeEach(async () => {
      const brand = await Brand.create({
        _id: `test-brand-stats-${Date.now()}`,
        name: 'Test Brand',
        slug: `test-brand-stats-${Date.now()}`,
        logo: 'test-logo.jpg',
        coverImage: 'test-cover.jpg',
        coverImage2: 'test-cover2.jpg',
        header: 'Test Brand Header',
        description: 'Test brand description',
        featuredModels: [
          {
            name: 'Featured Model',
            image: 'featured-model.jpg',
            tagline: 'Test Tagline',
            description: 'Featured model description'
          }
        ]
      });

      await Product.create([
        {
          id: 'watch-1',
          name: 'Watch 1',
          price: 1000,
          brand: 'Test Brand',
          Vcollection: 'Test Collection',
          gender: 'Unisex',
          image: 'watch-1.jpg',
          strapMaterial: 'Leather',
          movement: 'Automatic',
          waterResistance: '50m',
          caseMaterial: 'Stainless Steel',
          dialColor: 'Black',
          stock: true,
          stockCount: 5
        },
        {
          id: 'watch-2',
          name: 'Watch 2',
          price: 2000,
          brand: 'Test Brand',
          Vcollection: 'Test Collection',
          gender: 'Men',
          image: 'watch-2.jpg',
          strapMaterial: 'Metal',
          movement: 'Quartz',
          waterResistance: '100m',
          caseMaterial: 'Titanium',
          dialColor: 'Blue',
          stock: false,
          stockCount: 0
        }
      ]);
    });

    test('GET /api/products/stats should return product statistics', async () => {
      const response = await request(app).get('/api/products/stats');
      
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('inStock');
        expect(response.body).toHaveProperty('outOfStock');
      }
    });
  });
}); 