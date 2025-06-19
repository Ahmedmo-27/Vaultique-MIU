# Vaultique - Luxury Watch E-commerce Platform

Vaultique is a sophisticated e-commerce platform specializing in luxury watches, built with Node.js, Express, and MongoDB. The platform features a comprehensive test suite ensuring code quality and reliability.

## 🚀 Features

### Core E-commerce Features
- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Admin Dashboard**: Complete product and user management interface
- **Product Catalog**: Advanced filtering, search, and categorization
- **Shopping Cart**: Persistent cart with real-time calculations
- **Order Management**: Complete order lifecycle tracking
- **User Profiles**: Comprehensive user account management

### Advanced Features
- **SMS Notifications**: Twilio integration for order confirmations and password resets
- **Email System**: Contact form and automated email notifications
- **Google OAuth**: Seamless Google Sign-in integration
- **QR Code Generation**: Product identification and sharing
- **3D Product Visualization**: Interactive 3D models using Three.js
- **Real-time Chat**: Stream Chat integration for customer support
- **Payment Processing**: Secure payment gateway integration

### Security & Performance
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive data validation and sanitization
- **Security Headers**: Helmet middleware for enhanced security
- **CORS Configuration**: Proper cross-origin resource sharing
- **Session Management**: Secure session handling with MongoDB store
- **Password Security**: bcrypt hashing with salt rounds

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Google OAuth 2.0
- **Validation**: Express Validator, Mongoose validation

### Frontend
- **Template Engine**: EJS
- **Styling**: CSS3 with responsive design
- **JavaScript**: Vanilla JS with modern ES6+ features
- **3D Graphics**: Three.js for product visualization

### External Services
- **SMS**: Twilio for notifications
- **Email**: Nodemailer for email services
- **Chat**: Stream Chat for real-time messaging
- **File Upload**: Multer for file handling
- **QR Codes**: qrcode library

### Testing & Development
- **Testing Framework**: Jest
- **HTTP Testing**: Supertest
- **Code Formatting**: Prettier
- **Development**: Nodemon for hot reloading

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **MongoDB**: >= 4.4 (local or cloud instance)
- **npm**: >= 8.0.0 or yarn >= 1.22.0
- **Twilio Account**: For SMS functionality
- **Google OAuth Credentials**: For Google Sign-in
- **Stream Chat Account**: For real-time chat features

## 🔧 Installation

1. **Clone the repository**:
```bash
git clone [repository-url]
cd vaultique
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment Configuration**:
Create a `.env` file in the root directory:
```env
# Application
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/vaultique

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stream Chat
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. **Database Setup**:
```bash
# Seed all collections
npm run seed:all

# Or seed individually
npm run seed:users
npm run seed:brands
npm run seed:collections
npm run seed:products
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Server starts at `http://localhost:3000` with hot reloading enabled.

### Production Mode
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:server
npm run test:auth
npm run test:products
npm run test:cart

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 📝 Available Scripts

### Core Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prod-install` - Install production dependencies only

### Database Scripts
- `npm run seed:all` - Seed all database collections
- `npm run seed:users` - Seed user data
- `npm run seed:brands` - Seed brand data
- `npm run seed:collections` - Seed collection data
- `npm run seed:products` - Seed product data

### Testing Scripts
- `npm test` - Run complete test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:verbose` - Run tests with verbose output
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only

### Utility Scripts
- `npm run format` - Format code using Prettier
- `npm run fix-passwords` - Fix user passwords in database

## 🏗️ Project Structure

```
vaultique/
├── __tests__/              # Test files
│   ├── setup.js            # Global test setup
│   ├── test-runner.js      # Mock server for testing
│   ├── server.test.js      # Server functionality tests
│   ├── auth.test.js        # Authentication tests
│   ├── products.test.js    # Product API tests
│   ├── cart.test.js        # Cart functionality tests
│   └── README.md           # Test documentation
├── config/                 # Configuration files
├── controllers/            # Route controllers
├── middleware/             # Custom middleware
├── models/                 # Database models
├── public/                 # Static assets
├── routes/                 # API routes
├── seed/                   # Database seeding
├── utils/                  # Utility functions
├── views/                  # EJS templates
├── scripts/                # Utility scripts
├── .env                    # Environment variables
├── jest.config.js         # Jest configuration
├── package.json           # Dependencies and scripts
├── server.js              # Application entry point
└── README.md              # Project documentation
```

## 🧪 Testing Infrastructure

### Test Coverage
The project includes a comprehensive test suite with **93 tests** covering:

#### Server Tests (25 tests)
- Server initialization and middleware
- Basic routing and redirects
- API health checks and error handling
- Security headers and CORS
- Database connections
- Performance metrics

#### Authentication Tests (18 tests)
- User registration with validation
- Login with credentials
- JWT token authentication
- Password reset functionality
- User profile management
- Admin role verification
- Email verification

#### Products Tests (15 tests)
- Product listing with filters
- Individual product retrieval
- Admin-only operations (create, update, delete)
- Product search functionality
- Category and statistics endpoints

#### Cart Tests (17 tests)
- Cart item management (add, update, remove)
- Cart calculations and totals
- Stock validation
- Authentication requirements
- Session persistence

### Test Features
- **Database Isolation**: Each test runs in isolation with clean state
- **Mock Server**: Prevents port conflicts and external dependencies
- **Schema Validation**: All test data follows model requirements
- **Error Handling**: Tests handle both success and failure scenarios
- **Performance**: Optimized test execution (~49 seconds for full suite)

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- server.test.js

# Run tests in watch mode
npm run test:watch
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and user role management
- **Password Security**: bcrypt hashing with configurable salt rounds
- **Session Management**: Secure session handling with MongoDB store

### API Security
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive data validation and sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Security Headers**: Helmet middleware for enhanced security
- **XSS Protection**: Built-in XSS protection mechanisms
- **CSRF Protection**: Cross-site request forgery protection

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Product Endpoints
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/search` - Search products
- `GET /api/products/categories` - Get product categories

### Cart Endpoints
- `GET /cart` - Get user cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item
- `DELETE /cart/remove` - Remove item from cart
- `DELETE /cart/clear` - Clear entire cart

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Write tests for your feature
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Development Guidelines
- Write tests for all new features
- Follow the existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

### Planned Features
- [ ] Real-time inventory management
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Advanced payment gateways
- [ ] AI-powered product recommendations
- [ ] Advanced search with Elasticsearch
- [ ] Microservices architecture

### Performance Improvements
- [ ] Redis caching implementation
- [ ] Database query optimization
- [ ] CDN integration
- [ ] Image optimization
- [ ] Progressive Web App features

---

**Built with ❤️ by the Vaultique Development Team**
