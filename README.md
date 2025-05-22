# Vaultique - Luxury Watch E-commerce Platform

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

## Development

### Environment Setup

1. Create a `.env` file based on `.env.example`
2. Set `JWT_SECRET` to a secure random string
3. Configure MongoDB connection string

### Running the Application

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

### API Endpoints

- `POST /api/auth/login` - Authenticate user and receive JWT
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/logout` - Clear authentication tokens
