const User = require("../models/Users");
const Product = require("../models/Products");
const Order = require("../models/Orders");
const Collection = require("../models/Collections");
const Brand = require("../models/Brands");
const Todo = require("../models/Todos");
const Session = require("../models/Sessions");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const path = require("path");
const fs = require("fs");

// Store todos in memory since we're not using the database
let todos = [
  {
    id: '1',
    text: "Review and approve pending orders",
    completed: false,
    createdAt: new Date()
  },
  {
    id: '2',
    text: "Update product inventory levels",
    completed: true,
    createdAt: new Date()
  },
  {
    id: '3',
    text: "Check customer support tickets",
    completed: false,
    createdAt: new Date()
  },
  {
    id: '4',
    text: "Prepare weekly sales report",
    completed: false,
    createdAt: new Date()
  },
  {
    id: '5',
    text: "Update store promotions",
    completed: false,
    createdAt: new Date()
  }
];

// Load users from database
const loadUsers = async () => {
  try {
    // Check database connection
    if (!mongoose.connection.readyState) {
      throw new Error("Database connection not established");
    }

    // Try to load users with timeout
    const users = await Promise.race([
      User.find()
        .select({
          Name: 1,
          username: 1,
          email: 1,
          DOB: 1,
          phone_number: 1,
          language: 1,
          role: 1,
          createdAt: 1,
          Address: 1,
          "Payment.cardHolder": 1,
          "Payment.expiryDate": 1,
          "Payment.paymentType": 1,
        })
        .sort({ createdAt: -1 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 5000)
      ),
    ]);

    if (!users || !Array.isArray(users)) {
      throw new Error("Invalid user data received from database");
    }

    console.log(`Successfully loaded ${users.length} users`);
    return users;
  } catch (error) {
    console.error("Error loading users:", error);
    if (error.name === "MongoError") {
      throw new Error("Database error occurred while loading users");
    } else if (error.name === "ValidationError") {
      throw new Error("Invalid user data in database");
    } else {
      throw new Error(`Failed to load users: ${error.message}`);
    }
  }
};

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

// Render Dashboard View
exports.renderDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total sales from all orders
    const totalSales = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } }, // Exclude cancelled orders
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const recentOrdersRaw = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "Name email");

    // Map recentOrders to the format expected by the EJS template
    const recentOrders = recentOrdersRaw.map(order => ({
      userName: order.userId?.Name || order.shipping?.name || 'Unknown',
      dateOrder: order.createdAt,
      status: order.status || 'Unknown',
    }));

    res.render("AdminHubHomePage", {
      title: "Admin Dashboard",
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      recentOrders,
      todos,
      user: req.user,
    });
  } catch (error) {
    console.error('Dashboard render error:', error);
    res.status(500).render("error", {
      title: "Error",
      type: "error",
      message: "Error loading dashboard",
      error: error.message,
    });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -Payment");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Fetching user with ID:', userId);
    
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid user ID format:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Find user and explicitly select fields
    const user = await User.findById(userId).select({
      Name: 1,
      username: 1,
      email: 1,
      DOB: 1,
      phone_number: 1,
      language: 1,
      role: 1,
      Address: 1,
      createdAt: 1
    });
    
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Successfully fetched user:', user);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Only allow specific fields to be updated
    const allowedFields = [
      'Name',
      'username',
      'email',
      'phone_number',
      'DOB',
      'language',
      'role',
      'Address'
    ];

    // Filter out any fields that aren't in the allowed list
    const updateData = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Get the current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only check for duplicates if email or username is being changed
    if (updateData.email && updateData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingEmail = await User.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: userId }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    if (updateData.username && updateData.username !== currentUser.username) {
      const existingUsername = await User.findOne({ 
        username: updateData.username,
        _id: { $ne: userId }
      });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken by another user'
        });
      }
    }

    // Handle password update
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    // Update the user using findOneAndUpdate with strict field selection
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        select: 'Name username email DOB phone_number language role Address createdAt'
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { Name, username, email, password, DOB, phone_number, language, role, Address, Payment } = req.body;

    // Validate required fields
    if (!Name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, username, email, and password',
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      Name,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      DOB: DOB || undefined,
      phone_number: phone_number || undefined,
      language: language || "English",
      role: role || "user",
      Address: Address || undefined,
      Payment: Payment || undefined,
    });

    // Save user to database
    await newUser.save();

    // Remove sensitive information from response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.Payment;
    if (userResponse.Payment) {
      delete userResponse.Payment.cvv;
      if (userResponse.Payment.cardNumber) {
        userResponse.Payment.cardNumber = `**** **** **** ${userResponse.Payment.cardNumber.slice(-4)}`;
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
};

// Product Management
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

exports.createProduct = async (req, res) => {
    try {
        console.log('Received product creation request:', {
            body: req.body,
            files: req.files
        });

        // Validate required fields
        const requiredFields = ['id', 'name', 'brand', 'price', 'description', 'strapMaterial', 'movement', 'waterResistance', 'caseMaterial', 'dialColor', 'Vcollection', 'gender'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Check for product image
        if (!req.files?.image) {
            console.log('No product image provided');
            return res.status(400).json({
                success: false,
                message: 'Product image is required'
            });
        }

        // Find the brand by name
        const brand = await Brand.findOne({ name: req.body.brand });
        if (!brand) {
            console.log('Brand not found:', req.body.brand);
            return res.status(400).json({
                success: false,
                message: `Brand "${req.body.brand}" not found`
            });
        }

        // Process file paths
        const imagePath = req.files.image[0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
        const galleryPaths = req.files.galleryImages?.map(file => file.path.replace(/\\/g, '/').replace(/^.*?public/, '')) || [];
        const videoPath = req.files.video?.[0]?.path.replace(/\\/g, '/').replace(/^.*?public/, '');
        const modelPath = req.files.model3D?.[0]?.path.replace(/\\/g, '/').replace(/^.*?public/, '');

        // Format special features
        const specialFeatures = [];
        if (req.body.featureName && req.body.featureDesc) {
            const featureNames = Array.isArray(req.body.featureName) ? req.body.featureName : [req.body.featureName];
            const featureDescs = Array.isArray(req.body.featureDesc) ? req.body.featureDesc : [req.body.featureDesc];
            
            for (let i = 0; i < featureNames.length; i++) {
                if (featureNames[i] && featureDescs[i]) {
                    specialFeatures.push({
                        featureName: featureNames[i],
                        featureDesc: featureDescs[i]
                    });
                }
            }
        }

        // Format specifications
        const specifications = [];
        if (req.body.specName && req.body.specValue) {
            const specNames = Array.isArray(req.body.specName) ? req.body.specName : [req.body.specName];
            const specValues = Array.isArray(req.body.specValue) ? req.body.specValue : [req.body.specValue];
            
            for (let i = 0; i < specNames.length; i++) {
                if (specNames[i] && specValues[i]) {
                    specifications.push({
                        specName: specNames[i],
                        specValue: specValues[i]
                    });
                }
            }
        }

        // Create product data object
        const productData = {
            id: req.body.id,
            name: req.body.name,
            brand: brand._id, // Use the brand's _id (String)
            strapMaterial: req.body.strapMaterial,
            movement: req.body.movement,
            waterResistance: req.body.waterResistance,
            caseMaterial: req.body.caseMaterial,
            dialColor: req.body.dialColor,
            price: Number(req.body.price),
            stock: req.body.stock === 'true',
            stockCount: Number(req.body.stockCount),
            Vcollection: req.body.Vcollection,
            gender: req.body.gender,
            image: imagePath,
            galleryImages: galleryPaths,
            video: videoPath,
            model3D: modelPath,
            productPageUrl: req.body.productPageUrl,
            description: req.body.description,
            specialFeatures,
            specifications
        };

        console.log('Creating product with data:', productData);

        // Create the product
        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Error creating product:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            errors: error.errors
        });

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));
            console.log('Validation errors:', validationErrors);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `A product with this ${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        console.log('Update product request received:', {
            params: req.params,
            body: req.body,
            files: req.files
        });

        const productId = req.params.id;
        const updateData = { ...req.body };

        // Find the brand by name
        if (updateData.brand) {
            const brand = await Brand.findOne({ name: updateData.brand });
            if (!brand) {
                return res.status(400).json({
                    success: false,
                    message: `Brand "${updateData.brand}" not found`
                });
            }
            updateData.brand = brand._id;
        }

        // Handle special features
        if (req.body.featureName && req.body.featureDesc) {
            const featureNames = Array.isArray(req.body.featureName) ? req.body.featureName : [req.body.featureName];
            const featureDescs = Array.isArray(req.body.featureDesc) ? req.body.featureDesc : [req.body.featureDesc];
            
            updateData.specialFeatures = [];
            for (let i = 0; i < featureNames.length; i++) {
                if (featureNames[i] && featureDescs[i]) {
                    updateData.specialFeatures.push({
                        name: featureNames[i],
                        description: featureDescs[i]
                    });
                }
            }
        }

        // Handle file uploads if new files are provided
        if (req.files) {
            if (req.files.image) {
                updateData.image = req.files.image[0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
            }
            if (req.files.galleryImages) {
                updateData.galleryImages = req.files.galleryImages.map(file => 
                    file.path.replace(/\\/g, '/').replace(/^.*?public/, '')
                );
            }
            if (req.files.video) {
                updateData.video = req.files.video[0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
            }
            if (req.files.model3D) {
                updateData.model3D = req.files.model3D[0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
            }
        }

        // Convert stock to boolean
        if (updateData.stock !== undefined) {
            updateData.stock = updateData.stock === 'true' || updateData.stock === true;
        }

        // Convert price and stockCount to numbers
        if (updateData.price) {
            updateData.price = Number(updateData.price);
        }
        if (updateData.stockCount) {
            updateData.stockCount = Number(updateData.stockCount);
        }

        console.log('Updating product with data:', updateData);

        // Find and update the product
        const product = await Product.findByIdAndUpdate(
            productId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('brand', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Always return JSON response
        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Error updating product:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            errors: error.errors
        });

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// Order Management
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "Name email");
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "Name email"
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Update the order
        const order = await Order.findByIdAndUpdate(
            id,
            { 
                status,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update the order status in the user's orders array
        if (order.userId) {
            try {
                const user = await User.findById(order.userId);
                if (user && user.orders) {
                    // Find and update the order in the user's orders array
                    const orderIndex = user.orders.findIndex(
                        orderRef => orderRef.orderId === order._id.toString()
                    );

                    if (orderIndex !== -1) {
                        // Update the status in the user's orders array
                        user.orders[orderIndex].status = status.charAt(0).toUpperCase() + status.slice(1);
                        await user.save();
                        console.log('Updated user order status:', user.orders[orderIndex]);
                    }
                }
            } catch (userUpdateError) {
                console.error('Error updating user orders:', userUpdateError);
                // Continue even if user update fails - the order is already updated
            }
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Collection Management
exports.getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find();
    res.status(200).json({
      success: true,
      data: collections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching collections",
      error: error.message,
    });
  }
};

exports.renderCollections = async (req, res) => {
  try {
    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCollections = await Collection.countDocuments();
    const totalPages = Math.ceil(totalCollections / limit);

    // Get paginated collections with populated featured items
    const collections = await Collection.find()
      .populate('featuredItems', 'name images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.render('ManageCollections', {
      title: 'Manage Collections',
      collections,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1
      },
      user: req.user,
      error: null
    });
  } catch (error) {
    console.error('Error in renderCollections:', error);
    res.status(500).render('ManageCollections', {
      title: 'Manage Collections',
      collections: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      },
      user: req.user,
      error: error.message || 'Error loading collections. Please try again later.'
    });
  }
};

exports.createCollection = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const {
      name,
      slug,
      header,
      description,
      featuredItems
    } = req.body;

    // Handle file uploads
    const logo = req.files?.logo ? `/Assets/Images/${req.files.logo[0].filename}` : null;
    const coverImage = req.files?.coverImage ? `/Assets/Images/${req.files.coverImage[0].filename}` : null;
    const heroVideo = req.files?.heroVideo ? `/Assets/Videos/${req.files.heroVideo[0].filename}` : null;

    console.log('Processed file paths:', { logo, coverImage, heroVideo });

    // Process featured items
    const processedFeaturedItems = [];
    if (featuredItems) {
        console.log('Featured items before processing:', featuredItems);
        const items = Array.isArray(featuredItems) ? featuredItems : [featuredItems];
        for (const item of items) {
            const itemImage = req.files?.[`featuredItems[${items.indexOf(item)}][image]`]?.[0];
            processedFeaturedItems.push({
                name: item.name,
                image: itemImage ? `/Assets/Images/${itemImage.filename}` : null,
                tagline: item.tagline,
                description: item.description
            });
        }
        console.log('Processed featured items:', processedFeaturedItems);
    }

    const collection = new Collection({
      _id: `COL_${Date.now()}`, // Generate a unique ID
      name,
      slug,
      logo,
      coverImage,
      heroVideo,
      header,
      description,
      featuredItems: processedFeaturedItems
    });

    console.log('Collection object before save:', collection);

    await collection.save();
    console.log('Collection saved successfully');
    
    res.json({ success: true, message: 'Collection created successfully' });
  } catch (error) {
    console.error('Detailed error in createCollection:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Error creating collection',
      error: error.message
    });
  }
};

exports.updateCollection = async (req, res) => {
    try {
        console.log('Updating collection:', req.params.id);
        const collection = await Collection.findById(req.params.id);
        
        if (!collection) {
            console.log('Collection not found');
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.logo) {
                collection.logo = `/Assets/Images/${req.files.logo[0].filename}`;
            }
            if (req.files.coverImage) {
                collection.coverImage = `/Assets/Images/${req.files.coverImage[0].filename}`;
            }
            if (req.files.heroVideo) {
                collection.heroVideo = `/Assets/Videos/${req.files.heroVideo[0].filename}`;
            }
        }

        // Update basic information
        collection.name = req.body.name;
        collection.slug = req.body.slug;
        collection.header = req.body.header;
        collection.description = req.body.description;

        // Handle featured items
        if (req.body.featuredItems) {
            const featuredItems = [];
            for (let i = 0; i < req.body.featuredItems.length; i++) {
                const item = {
                    name: req.body.featuredItems[i].name,
                    tagline: req.body.featuredItems[i].tagline,
                    description: req.body.featuredItems[i].description
                };

                // Handle featured item image if uploaded
                if (req.files && req.files[`featuredItems[${i}][image]`]) {
                    item.image = `/Assets/Images/${req.files[`featuredItems[${i}][image]`][0].filename}`;
                } else if (collection.featuredItems[i] && collection.featuredItems[i].image) {
                    // Keep existing image if no new one uploaded
                    item.image = collection.featuredItems[i].image;
                }

                featuredItems.push(item);
            }
            collection.featuredItems = featuredItems;
        }

        await collection.save();
        console.log('Collection updated successfully');
        res.json({ message: 'Collection updated successfully', collection });
    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ message: 'Error updating collection', error: error.message });
    }
};

exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete collection with ID:', id);

    const collection = await Collection.findById(id);
    
    if (!collection) {
      console.log('Collection not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: "Collection not found"
      });
    }

    // Delete the collection
    await Collection.deleteOne({ _id: id });
    console.log('Collection deleted successfully:', id);

    res.json({ 
      success: true,
      message: "Collection deleted successfully"
    });
  } catch (error) {
    console.error('Error in deleteCollection:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: "Error deleting collection",
      error: error.message
    });
  }
};

exports.getCollection = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching collection with ID:', id);

    const collection = await Collection.findById(id);
    
    if (!collection) {
      console.log('Collection not found with ID:', id);
      return res.status(404).render("error", {
        title: "Error",
        message: "Collection not found"
      });
    }

    res.render("ViewCollection", {
      title: collection.name,
      collection,
      user: req.user
    });
  } catch (error) {
    console.error('Error in getCollection:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading collection",
      error: error.message
    });
  }
};

exports.renderEditCollection = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Rendering edit form for collection ID:', id);

    const collection = await Collection.findById(id);
    
    if (!collection) {
      console.log('Collection not found with ID:', id);
      return res.status(404).render("error", {
        title: "Error",
        message: "Collection not found"
      });
    }

    res.render("EditCollection", {
      title: "Edit Collection",
      collection,
      user: req.user
    });
  } catch (error) {
    console.error('Error in renderEditCollection:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading collection",
      error: error.message
    });
  }
};

// Brand Management
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching brands",
      error: error.message,
    });
  }
};

exports.renderBrands = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const brands = await Brand.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Brand.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.render('ManageBrands', {
            title: 'Manage Brands',
            brands,
            pagination: {
                currentPage: page,
                totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevPage: page - 1,
                nextPage: page + 1
            },
            user: req.user,
            error: null
        });
    } catch (error) {
        console.error('Error rendering brands:', error);
        res.status(500).render('ManageBrands', {
            title: 'Error',
            brands: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                hasPrevPage: false,
                hasNextPage: false,
                prevPage: null,
                nextPage: null
            },
            user: req.user,
            error: 'Error loading brands: ' + error.message
        });
    }
};

exports.renderCreateBrand = async (req, res) => {
    try {
        res.render('CreateBrand', {
            title: 'Create Brand',
            user: req.user
        });
    } catch (error) {
        console.error('Error rendering create brand form:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error rendering create brand form',
            error: error.message
        });
    }
};

exports.createBrand = async (req, res) => {
    try {
        console.log('=== Create Brand Request ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('Request headers:', req.headers);

        const brandData = {
            _id: req.body._id,
            name: req.body.name,
            slug: req.body.slug,
            header: req.body.header,
            description: req.body.description,
            website: req.body.website
        };

        console.log('Initial brand data:', brandData);

        // Handle logo
        if (req.files && req.files.logo) {
            console.log('Processing logo file:', req.files.logo[0]);
            const fileExt = path.extname(req.files.logo[0].originalname);
            const newFilename = `${req.body.name}${fileExt}`;
            const oldPath = req.files.logo[0].path;
            const newPath = path.join(__dirname, '..', 'public', 'Assets', 'Brands Logos', newFilename);
            
            // Create directory if it doesn't exist
            const logoDir = path.dirname(newPath);
            if (!fs.existsSync(logoDir)) {
                console.log('Creating logo directory:', logoDir);
                fs.mkdirSync(logoDir, { recursive: true });
            }
            
            // Rename the file
            console.log('Renaming logo file from', oldPath, 'to', newPath);
            fs.renameSync(oldPath, newPath);
            brandData.logo = `/Assets/Brands Logos/${newFilename}`;
        }

        // Handle cover images
        if (req.files && req.files.coverImage) {
            console.log('Processing cover image:', req.files.coverImage[0]);
            brandData.coverImage = req.files.coverImage[0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
        }
        if (req.files && req.files.coverImage2) {
            console.log('Processing secondary cover image:', req.files.coverImage2[0]);
            brandData.coverImage2 = req.files.coverImage2[0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
        }

        // Handle hero video
        if (req.files && req.files.heroVideo) {
            console.log('Processing hero video:', req.files.heroVideo[0]);
            brandData.heroVideo = req.files.heroVideo[0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
        }

        // Handle 3D model
        if (req.files && req.files.model3d) {
            console.log('Processing 3D model:', req.files.model3d[0]);
            brandData.Model3d = req.files.model3d[0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
        }

        // Handle featured models
        brandData.featuredModels = [];
        const featuredModelCount = Object.keys(req.body).filter(key => key.startsWith('featuredModels[')).length / 4; // 4 fields per model
        console.log('Processing featured models. Count:', featuredModelCount);

        for (let i = 0; i < featuredModelCount; i++) {
            const model = {
                name: req.body[`featuredModels[${i}][name]`],
                tagline: req.body[`featuredModels[${i}][tagline]`],
                description: req.body[`featuredModels[${i}][description]`]
            };

            // Handle model image
            const imageField = `featuredModels[${i}][image]`;
            if (req.files && req.files[imageField]) {
                console.log(`Processing featured model ${i} image:`, req.files[imageField][0]);
                model.image = req.files[imageField][0].path.replace(/\\/g, '/').replace(/^.*?public/, '');
            }

            brandData.featuredModels.push(model);
        }

        console.log('Final brand data before save:', brandData);

        const brand = new Brand(brandData);
        await brand.save();

        console.log('Brand created successfully:', brand);
        res.json({ 
            success: true, 
            message: 'Brand created successfully',
            brand 
        });
    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating brand',
            error: error.message 
        });
    }
};

exports.getBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Brand not found'
            });
        }
        res.render('ViewBrand', {
            title: brand.name,
            brand,
            user: req.user
        });
    } catch (error) {
        console.error('Error getting brand:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading brand',
            error: error.message
        });
    }
};

exports.renderEditBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Brand not found'
            });
        }
        res.render('EditBrand', {
            title: `Edit ${brand.name}`,
            brand,
            user: req.user
        });
    } catch (error) {
        console.error('Error rendering edit brand form:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading brand',
            error: error.message
        });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        console.log('Updating brand:', req.params.id);
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            console.log('Brand not found');
            return res.status(404).json({ message: 'Brand not found' });
        }

        // Handle file upload
        if (req.files && req.files.logo) {
            // Create a consistent filename based on the brand name
            const fileExt = path.extname(req.files.logo[0].originalname);
            const newFilename = `${req.body.name}${fileExt}`;
            const oldPath = req.files.logo[0].path;
            const newPath = path.join(__dirname, '..', 'public', 'Assets', 'Brands Logos', newFilename);
            
            // Delete old logo if it exists
            if (brand.logo) {
                const oldLogoPath = path.join(__dirname, '..', 'public', brand.logo);
                if (fs.existsSync(oldLogoPath)) {
                    fs.unlinkSync(oldLogoPath);
                }
            }
            
            // Rename the new file
            fs.renameSync(oldPath, newPath);
            
            brand.logo = `/Assets/Brands Logos/${newFilename}`;
        }

        // Update basic information
        brand.name = req.body.name;
        brand.slug = req.body.slug;
        brand.description = req.body.description;
        brand.website = req.body.website;

        await brand.save();
        console.log('Brand updated successfully');
        res.json({ message: 'Brand updated successfully', brand });
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ message: 'Error updating brand', error: error.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        console.log('Deleting brand:', req.params.id);
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            console.log('Brand not found');
            return res.status(404).json({ message: 'Brand not found' });
        }

        await brand.deleteOne();
        console.log('Brand deleted successfully');
        res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({ message: 'Error deleting brand', error: error.message });
    }
};

// Analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sales analytics",
      error: error.message,
    });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const userData = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user analytics",
      error: error.message,
    });
  }
};

exports.getProductAnalytics = async (req, res) => {
  try {
    const productData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
    ]);

    res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product analytics",
      error: error.message,
    });
  }
};

// Admin Page Rendering Functions
exports.renderUsers = async (req, res) => {
  try {
    // Load users from database
    const allUsers = await loadUsers();

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get paginated users
    const users = allUsers.slice(skip, skip + limit);
    const totalUsers = allUsers.length;

    // If editing a specific user
    let editUser = null;
    if (req.query.edit) {
      editUser = allUsers.find(
        (user) => user._id.toString() === req.query.edit
      );
      if (!editUser) {
        return res.status(404).render("error", {
          title: "Error",
          type: "error",
          message: "User not found",
        });
      }
    }

    // If viewing a specific user's details
    let userDetails = null;
    let userOrders = null;
    if (req.params.id) {
      userDetails = allUsers.find(
        (user) => user._id.toString() === req.params.id
      );
      if (!userDetails) {
        return res.status(404).render("error", {
          title: "Error",
          type: "error",
          message: "User not found",
        });
      }

      // If viewing user orders
      if (req.query.view === "orders") {
        userOrders = await Order.find({ userId: req.params.id })
          .sort({ date: -1 })
          .populate("items.product", "name price");
      }
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.render("ManageUsers", {
      title: "Manage Users",
      users,
      userDetails,
      userOrders,
      editUser,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: page + 1,
        prevPage: page - 1,
      },
      user: req.user,
      error: null,
    });
  } catch (error) {
    console.error("Error in renderUsers:", error);
    res.status(500).render("ManageUsers", {
      title: "Manage Users",
      users: [],
      userDetails: null,
      userOrders: null,
      editUser: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      user: req.user,
      error: error.message || "Error loading users. Please try again later.",
    });
  }
};

exports.renderProducts = async (req, res) => {
  try {
    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // Get paginated products with populated brand information
    const products = await Product.find()
      .populate('brand', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.render('ManageProducts', {
      title: 'Manage Products',
      products,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1
      },
      user: req.user,
      error: null
    });
  } catch (error) {
    console.error('Error in renderProducts:', error);
    res.status(500).render('ManageProducts', {
      title: 'Manage Products',
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      },
      user: req.user,
      error: error.message || 'Error loading products. Please try again later.'
    });
  }
};

exports.renderCreateProduct = async (req, res) => {
  try {
    const collections = await Collection.find();
    const brands = await Brand.find();

    res.render("CreateProduct", {
      title: "Create Product",
      collections,
      brands,
      user: req.user,
    });
  } catch (error) {
    res.status(500).render("error", {
      title: "Error",
      type: "error",
      message: "Error loading create product page",
      error: error.message,
    });
  }
};

exports.renderAnalytics = async (req, res) => {
  try {
    // Get active users count
    const activeUsers = await User.countDocuments({ status: "active" });
    const totalUsers = await User.countDocuments();
    const totalSessions = await Session.countDocuments();

    // Calculate session growth
    const sessionGrowthData = await Session.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1
        }
      },
      {
        $limit: 2
      }
    ]);

    let sessionGrowth = 0;
    if (sessionGrowthData.length >= 2) {
      const currentMonth = sessionGrowthData[0].count;
      const lastMonth = sessionGrowthData[1].count;
      sessionGrowth = lastMonth === 0 ? 100 : ((currentMonth - lastMonth) / lastMonth) * 100;
    }

    // Get sales data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // Format data for chart
    const months = [];
    const sales = [];
    const orders = [];
    let totalSales = 0;
    let totalOrders = 0;

    salesData.forEach(data => {
      const monthName = new Date(data._id.year, data._id.month - 1).toLocaleString('default', { month: 'short' });
      months.push(monthName);
      sales.push(data.totalSales);
      orders.push(data.orderCount);
      totalSales += data.totalSales;
      totalOrders += data.orderCount;
    });

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate user growth
    const userGrowthData = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1
        }
      },
      {
        $limit: 2
      }
    ]);

    let userGrowth = 0;
    if (userGrowthData.length >= 2) {
      const currentMonth = userGrowthData[0].count;
      const lastMonth = userGrowthData[1].count;
      userGrowth = lastMonth === 0 ? 100 : ((currentMonth - lastMonth) / lastMonth) * 100;
    }

    res.render('analytics', {
      title: 'Analytics Dashboard',
      activeUsers,
      totalUsers,
      totalSessions,
      sessionGrowth,
      totalSales,
      totalOrders,
      averageOrderValue,
      userGrowth,
      salesChartData: {
        labels: months,
        sales: sales,
        orders: orders
      },
      user: req.user,
      error: null
    });
  } catch (error) {
    console.error('Error in renderAnalytics:', error);
    res.status(500).render('analytics', {
      title: 'Analytics Dashboard',
      activeUsers: 0,
      totalUsers: 0,
      totalSessions: 0,
      sessionGrowth: 0,
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      userGrowth: 0,
      salesChartData: {
        labels: [],
        sales: [],
        orders: []
      },
      user: req.user,
      error: error.message || 'Error loading analytics. Please try again later.'
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const orders = await Order.find({ userId: req.params.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user orders',
      error: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand', 'name');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If it's an API request or format=json, return JSON
    if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({
        success: true,
        data: product
      });
    }

    // Otherwise render the view
    res.render('ViewProduct', {
      title: product.name,
      product: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({
        success: false,
        message: "Error fetching product",
        error: error.message,
      });
    }
    res.status(500).render('error', {
      title: 'Error',
      type: 'error',
      message: 'Error loading product details',
      error: error.message
    });
  }
};

exports.renderProductView = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('brand', 'name');
        
        if (!product) {
            return res.status(404).render('error', {
                title: 'Error',
                type: 'error',
                message: 'Product not found'
            });
        }

        res.render('ViewProduct', {
            title: 'View Product',
            product,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).render('error', {
            title: 'Error',
            type: 'error',
            message: 'Error loading product details'
        });
    }
};

exports.renderProductEdit = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('brand', 'name');
        
        if (!product) {
            return res.status(404).render('error', {
                title: 'Error',
                type: 'error',
                message: 'Product not found'
            });
        }

        res.render('EditProduct', {
            title: 'Edit Product',
            product,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).render('error', {
            title: 'Error',
            type: 'error',
            message: 'Error loading product details'
        });
    }
};

// Render Manage Store Dashboard
exports.renderManageStore = (req, res) => {
  res.render('managestore', {
    title: 'Manage Store',
    user: req.user
  });
};

// Collection Management
exports.listCollections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const collections = await Collection.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('featuredItems', 'name images');

    const total = await Collection.countDocuments();

    res.render('ManageCollections', {
      title: 'Manage Collections',
      collections,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      user: req.user
    });
  } catch (error) {
    console.error('Error listing collections:', error);
    res.status(500).render('error', {
      title: 'Error',
      type: 'error',
      message: 'Error loading collections',
      error: error.message
    });
  }
};

// Add todo
exports.addTodo = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Todo text is required"
      });
    }

    const newTodo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date()
    };

    todos.unshift(newTodo);
    
    res.status(201).json({
      success: true,
      data: newTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding todo",
      error: error.message
    });
  }
};

// Remove todo
exports.removeTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== id);

    if (todos.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Todo removed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing todo",
      error: error.message
    });
  }
};

// Toggle todo completion
exports.toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = todos.find(todo => todo.id === id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    todo.completed = !todo.completed;

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling todo",
      error: error.message
    });
  }
};

exports.renderCreateCollection = async (req, res) => {
    try {
        res.render('CreateCollection', {
            title: 'Create Collection',
            user: req.user
        });
    } catch (error) {
        console.error('Error rendering create collection form:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error rendering create collection form',
            error: error.message
        });
    }
};

exports.renderOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.dateFrom || req.query.dateTo) {
            filter.createdAt = {};
            if (req.query.dateFrom) {
                filter.createdAt.$gte = new Date(req.query.dateFrom);
            }
            if (req.query.dateTo) {
                filter.createdAt.$lte = new Date(req.query.dateTo);
            }
        }
        if (req.query.search) {
            filter.$or = [
                { orderNumber: { $regex: req.query.search, $options: 'i' } },
                { 'shipping.name': { $regex: req.query.search, $options: 'i' } },
                { 'shipping.email': { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.render('ManageOrders', {
            title: 'Manage Orders',
            orders,
            currentPage: page,
            totalPages,
            status: req.query.status || '',
            dateFrom: req.query.dateFrom || '',
            dateTo: req.query.dateTo || '',
            search: req.query.search || '',
            user: req.user
        });
    } catch (error) {
        console.error('Error rendering orders:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading orders',
            error: error.message
        });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email address')
            .populate('items.product', 'name price images');

        if (!order) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Order not found'
            });
        }

        res.render('ViewOrder', {
            title: `Order ${order._id}`,
            order,
            user: req.user
        });
    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading order',
            error: error.message
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.deleteOne();
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting order',
            error: error.message 
        });
    }
};
