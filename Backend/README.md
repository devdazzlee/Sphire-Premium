# E-commerce Backend API

A complete Node.js backend API for an e-commerce platform with MongoDB, Cloudinary integration, and Cash on Delivery payment system.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **Product Management**: Full CRUD operations for products with image uploads via Cloudinary
- **Shopping Cart**: Persistent cart functionality with offline support
- **Order Management**: Complete order lifecycle with Cash on Delivery payment
- **Admin Dashboard**: Comprehensive admin panel for managing products, users, and orders
- **Image Storage**: Cloudinary integration for product images and user avatars
- **Security**: Rate limiting, CORS, helmet security, input validation
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js (ES6 modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator
- **Password Hashing**: bcryptjs

## Environment Variables

Create a `config.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://api-key:api-secret@cloud-name

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `config.env`

3. Start the development server:
```bash
npm run dev
```

4. Seed the database with sample data:
```bash
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload user avatar
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add new address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address
- `PUT /api/users/password` - Change password
- `PUT /api/users/preferences` - Update preferences

### Products
- `GET /api/products` - Get all products (with filtering & pagination)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get categories
- `GET /api/products/:id` - Get single product
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:productId` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart
- `GET /api/cart/count` - Get cart item count
- `POST /api/cart/sync` - Sync local cart with server

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/stats/summary` - Get order statistics
- `GET /api/orders/tracking/:orderNumber` - Track order (public)

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get single user
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/products` - Get all products (including inactive)
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/orders/:id` - Get single order
- `GET /api/admin/analytics/revenue` - Get revenue analytics

## Database Models

### User
- Personal information (name, email, phone, avatar)
- Authentication (password, role, isActive)
- Addresses (multiple addresses with default)
- Preferences (newsletter, notifications)
- Timestamps

### Product
- Basic info (name, description, price, images)
- Categorization (category, subcategory, brand)
- Inventory (stockQuantity, inStock)
- Features (rating, reviewCount, features, ingredients)
- Status flags (isActive, isFeatured, isNew, isOnSale)

### Cart
- User reference
- Items array (product, quantity, price)
- Calculated totals (total, itemCount)
- Last updated timestamp

### Order
- User reference and order number
- Items array (product details snapshot)
- Shipping address
- Payment info (method: 'cod', status)
- Order status and tracking
- Financial totals (subtotal, shipping, tax, total)
- Timestamps and delivery info

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevents abuse with request limits
- **CORS**: Configured for frontend domains
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation with express-validator
- **File Upload Security**: File type and size restrictions

## Error Handling

- Global error handling middleware
- Consistent error response format
- Detailed validation error messages
- Proper HTTP status codes

## Sample Data

The seeding script creates:
- 1 admin user (admin@luxurybeauty.com / admin123)
- 3 sample users with different preferences
- 8 sample products with complete details
- Categories: skincare, body-care
- Subcategories: serums, moisturizers, cleansers, eye-care, masks

## Development

- **Hot Reload**: Nodemon for development
- **ES6 Modules**: Modern JavaScript syntax
- **Environment-based**: Different configs for dev/prod
- **Logging**: Console logging for debugging

## Production Considerations

- Change JWT secret in production
- Use environment-specific MongoDB URI
- Configure proper CORS origins
- Set up proper logging
- Use HTTPS in production
- Configure rate limiting appropriately
- Set up monitoring and error tracking

## API Response Format

All API responses follow this format:

```json
{
  "status": "success" | "error",
  "message": "Human readable message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Health Check

- `GET /health` - Server health check endpoint

## License

MIT License