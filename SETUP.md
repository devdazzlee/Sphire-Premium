# Complete Setup Guide

This guide will help you set up the complete e-commerce platform from scratch.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **Git** installed
- **MongoDB Atlas** account (free tier available)
- **Cloudinary** account (free tier available)
- **Code Editor** (VS Code recommended)

## 🚀 Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repository-url>
cd ecommerce-platform

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install

# Install dashboard dependencies
cd ../Dashboard
npm install

cd ..
```

### 2. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier)

2. **Configure Database Access**
   - Go to "Database Access"
   - Create a new database user
   - Set username and password (remember these!)

3. **Configure Network Access**
   - Go to "Network Access"
   - Add IP address (0.0.0.0/0 for development)

4. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 3. Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy the following values:
     - Cloud Name
     - API Key
     - API Secret

### 4. Backend Configuration

Create `Backend/config.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Replace with your MongoDB connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0

# JWT (Change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d

# Cloudinary (Replace with your Cloudinary credentials)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://your-api-key:your-api-secret@your-cloud-name

# Frontend URLs
FRONTEND_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001
```

### 5. Frontend Configuration

Create `Frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Dashboard Configuration

Create `Dashboard/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 7. Start the Services

#### Option A: Using the Startup Scripts

**Windows:**
```bash
# Double-click start-all.bat or run:
start-all.bat
```

**Mac/Linux:**
```bash
# Make executable and run:
chmod +x start-all.sh
./start-all.sh
```

#### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

**Terminal 3 - Dashboard:**
```bash
cd Dashboard
npm run dev
```

### 8. Seed the Database

In a new terminal:

```bash
cd Backend
npm run seed
```

This will create:
- 1 admin user
- 3 sample users
- 8 sample products

### 9. Access the Applications

- **Frontend**: http://localhost:3000
- **Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:5000/api

## 🔐 Default Login Credentials

### Admin Account
- **Email**: admin@luxurybeauty.com
- **Password**: admin123

### Sample User Accounts
- **Email**: sarah.johnson@email.com
- **Password**: password123

## 🧪 Testing the Setup

### 1. Test Backend API
Visit: http://localhost:5000/health
Should return: `{"status":"success","message":"Server is running"}`

### 2. Test Frontend
- Visit: http://localhost:3000
- Try browsing products
- Create a user account
- Add items to cart

### 3. Test Dashboard
- Visit: http://localhost:3001
- Login with admin credentials
- Check dashboard statistics

## 🛠 Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `Backend/`
   - Server auto-restarts with nodemon

2. **Frontend Changes**
   - Edit files in `Frontend/`
   - Browser auto-refreshes

3. **Dashboard Changes**
   - Edit files in `Dashboard/`
   - Browser auto-refreshes

### Database Changes

If you need to reset the database:

```bash
cd Backend
npm run seed
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

2. **MongoDB Connection Error**
   - Check your connection string
   - Ensure IP is whitelisted in MongoDB Atlas
   - Verify username/password

3. **Cloudinary Upload Error**
   - Check your Cloudinary credentials
   - Ensure API key/secret are correct

4. **Frontend API Connection Error**
   - Check if backend is running on port 5000
   - Verify NEXT_PUBLIC_API_URL in .env.local

### Logs and Debugging

- **Backend logs**: Check terminal running `npm run dev`
- **Frontend logs**: Check browser console
- **Dashboard logs**: Check browser console

## 📱 Mobile Testing

Test the responsive design:
1. Open browser dev tools
2. Toggle device toolbar
3. Test on different screen sizes

## 🔄 Updating Dependencies

```bash
# Update backend dependencies
cd Backend
npm update

# Update frontend dependencies
cd ../Frontend
npm update

# Update dashboard dependencies
cd ../Dashboard
npm update
```

## 🚀 Production Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend (Railway/Heroku)
1. Push code to GitHub
2. Connect repository to hosting service
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
- Already hosted in the cloud
- No additional setup needed

## 📞 Support

If you encounter issues:

1. Check this setup guide
2. Review error messages in terminal/browser
3. Check MongoDB Atlas and Cloudinary dashboards
4. Verify all environment variables are set correctly

## 🎯 Next Steps

After successful setup:

1. **Customize Products**: Add your own products via admin dashboard
2. **Configure Branding**: Update logos, colors, and content
3. **Set Up Email**: Configure email notifications
4. **Deploy**: Deploy to production servers
5. **Monitor**: Set up monitoring and analytics

---

**Happy Coding! 🚀**
