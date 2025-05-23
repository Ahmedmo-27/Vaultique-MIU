# Vaultique - Luxury Watch E-commerce Platform

Vaultique is a sophisticated e-commerce platform specializing in luxury watches, built with Node.js, Express, and MongoDB.

## 🚀 Features

- User authentication and authorization
- Admin dashboard for product and user management
- Real-time chat functionality using Stream Chat
- Secure payment processing
- Responsive design
- Product catalog with filtering and search
- User profile management
- Order tracking and management

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: EJS templating engine
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Chat**: Stream Chat
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd vaultique
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STREAM_CHAT_API_KEY=your_stream_chat_api_key
STREAM_CHAT_API_SECRET=your_stream_chat_api_secret
```

4. Seed the database (optional):
```bash
npm run seed:all
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📝 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run seed:all` - Seed all database collections
- `npm test` - Run tests
- `npm run format` - Format code using Prettier

## 🏗️ Project Structure

```
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── public/         # Static files
├── routes/         # API routes
├── seed/          # Database seed files
├── views/         # EJS templates
└── server.js      # Application entry point
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- XSS protection

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## Authentication System

### JWT Authentication

The application uses JWT (JSON Web Token) authentication to secure API endpoints and protect user data.

#### How It Works

1. **User Login**: When a user logs in with valid credentials, the server generates a JWT token containing user information.

2. **Token Storage**:

   - The token is stored in an HTTP-only cookie for security
   - A copy is also returned to the client for use in API calls

3. **Authentication Flow**:

   - Frontend sends credentials to `/api/auth/login`
   - Server verifies credentials and issues a JWT
   - Token is included in subsequent requests in the `Authorization` header

4. **Protected Routes**:
   - API routes are protected using the `authenticateJWT` middleware
   - Admin routes are protected with additional `isAdmin` middleware

#### Security Features

- Tokens expire after 24 hours
- HTTP-only cookies protect against XSS attacks
- Helmet middleware adds security headers
- Rate limiting prevents brute force attacks

#### Testing Authentication

Run the JWT authentication test:

```bash
node scripts/test-jwt-auth.js
```

### API Endpoints

- `POST /api/auth/login` - Authenticate user and receive JWT
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/logout` - Clear authentication tokens
