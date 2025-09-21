# Complete E-commerce Platform

A full-stack e-commerce platform built with Next.js frontend, Node.js backend, MongoDB database, and Cloudinary image storage. Features include user authentication, product management, shopping cart, order processing with Cash on Delivery, and admin dashboard.

## 🚀 Features

### Frontend (Next.js)
- **Modern UI**: Beautiful, responsive design with Tailwind CSS and Radix UI components
- **User Authentication**: Complete login/signup system with JWT tokens
- **Product Catalog**: Browse products with filtering, search, and pagination
- **Shopping Cart**: Persistent cart with offline support
- **User Profile**: Manage personal information and shipping addresses
- **Order Management**: View order history and track orders
- **Checkout Process**: Cash on Delivery payment system
- **Responsive Design**: Mobile-first approach with smooth animations

### Backend (Node.js)
- **RESTful API**: Complete API with Express.js
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Product Management**: Full CRUD operations with image uploads
- **Order Processing**: Complete order lifecycle management
- **Admin Dashboard**: Comprehensive admin panel for managing the platform
- **Security**: Rate limiting, CORS, helmet security, input validation
- **Database**: MongoDB with Mongoose ODM
- **Image Storage**: Cloudinary integration for product images

### Admin Dashboard
- **Real-time Analytics**: Dashboard with key metrics and charts
- **User Management**: View and manage user accounts
- **Product Management**: Add, edit, and manage products
- **Order Management**: Process orders and update status
- **Inventory Tracking**: Monitor stock levels and low stock alerts

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Animations**: GSAP
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (ES6 modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator

### Infrastructure
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary
- **Deployment**: Vercel (Frontend), Railway/Heroku (Backend)

## 📁 Project Structure

```
├── Frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (auth, cart)
│   ├── lib/                 # API client and utilities
│   ├── types/               # TypeScript type definitions
│   └── public/              # Static assets
├── Dashboard/               # Admin dashboard (Next.js)
│   ├── app/                 # Dashboard pages
│   ├── components/          # Dashboard components
│   ├── contexts/            # Auth context
│   └── lib/                 # API client
├── Backend/                 # Node.js backend API
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/           # Custom middleware
│   ├── config/              # Configuration files
│   └── scripts/             # Database seeding
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Cloudinary account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-platform
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create `config.env` file:
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

# Frontend URLs
FRONTEND_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001
```

Start the backend:
```bash
npm run dev
```

Seed the database:
```bash
npm run seed
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Dashboard Setup
```bash
cd Dashboard
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the dashboard:
```bash
npm run dev
```

## 🔐 Default Credentials

### Admin Account
- **Email**: admin@luxurybeauty.com
- **Password**: admin123

### Sample User Accounts
- **Email**: sarah.johnson@email.com
- **Password**: password123

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/health

## 🛒 E-commerce Flow

1. **Browse Products**: Users can browse products with filtering and search
2. **Add to Cart**: Add products to cart with quantity selection
3. **User Registration**: Create account or login
4. **Checkout**: Select shipping address and place order
5. **Order Processing**: Admin processes orders and updates status
6. **Cash on Delivery**: Payment collected upon delivery

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:productId` - Update item quantity

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/products` - Get all products
- `GET /api/admin/orders` - Get all orders

## 🎨 UI Components

The project uses a comprehensive set of UI components:
- **Forms**: Input, Select, Textarea with validation
- **Navigation**: Header, Sidebar, Breadcrumbs
- **Data Display**: Cards, Tables, Badges
- **Feedback**: Toast notifications, Loading states
- **Layout**: Grid, Flexbox, Responsive design

## 🔒 Security Features

- **Authentication**: JWT tokens with secure storage
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: API request limiting
- **CORS**: Configured for specific origins
- **Input Validation**: Comprehensive validation middleware
- **File Upload Security**: Type and size restrictions

## 📊 Database Models

### User
- Personal information (name, email, phone, avatar)
- Authentication (password, role, isActive)
- Addresses (multiple addresses with default)
- Preferences (newsletter, notifications)

### Product
- Basic info (name, description, price, images)
- Categorization (category, subcategory, brand)
- Inventory (stockQuantity, inStock)
- Features (rating, reviewCount, features, ingredients)
- Status flags (isActive, isFeatured, isNew, isOnSale)

### Order
- User reference and order number
- Items array (product details snapshot)
- Shipping address
- Payment info (method: 'cod', status)
- Order status and tracking
- Financial totals (subtotal, shipping, tax, total)

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Backend (Railway/Heroku)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Database (MongoDB Atlas)
1. Create cluster
2. Set up database user
3. Configure network access
4. Get connection string

## 🧪 Testing

The platform includes comprehensive testing:
- **API Testing**: All endpoints tested
- **Authentication Flow**: Login/logout tested
- **Cart Functionality**: Add/remove items tested
- **Order Processing**: Complete flow tested
- **Admin Operations**: CRUD operations tested

## 📈 Performance

- **Frontend**: Optimized with Next.js 14 features
- **Backend**: Efficient database queries with indexes
- **Images**: Optimized with Cloudinary transformations
- **Caching**: Strategic caching for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🎯 Future Enhancements

- **Payment Integration**: Add online payment methods
- **Email Notifications**: Order confirmations and updates
- **Advanced Analytics**: More detailed reporting
- **Mobile App**: React Native mobile application
- **Multi-language**: Internationalization support
- **Advanced Search**: Elasticsearch integration
- **Inventory Management**: Advanced stock tracking
- **Customer Reviews**: Product review system

---

**Built with ❤️ by Metaxoft AI Assistant**
