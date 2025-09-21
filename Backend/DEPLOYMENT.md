# Backend Deployment Guide for Vercel

## Prerequisites
1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. MongoDB Atlas account (for database)
3. Cloudinary account (for image storage)
4. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Environment Variables

Create a `.env` file in your project root with the following variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Step 2: Deploy to Vercel

### Method 1: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to Backend directory
cd Backend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? Your account
# - Link to existing project? N
# - Project name? ecommerce-backend (or your preferred name)
# - Directory? ./
# - Override settings? N
```

### Method 2: Using Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Set the following:
   - **Framework Preset**: Other
   - **Root Directory**: `Backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

## Step 3: Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add all the environment variables from your `.env` file
5. Make sure to set them for "Production" environment

## Step 4: Update Frontend API URLs

Update your frontend configuration to use the deployed backend URL:

```typescript
// Frontend/config/api.ts
const defaultApiUrl = 'https://your-backend-domain.vercel.app/api'
```

## Step 5: Test Deployment

1. Visit your deployed API: `https://your-backend-domain.vercel.app/health`
2. Test API endpoints: `https://your-backend-domain.vercel.app/api/products`
3. Verify authentication works
4. Test file uploads with Cloudinary

## Important Notes

### Vercel Limitations
- **Serverless Functions**: Vercel uses serverless functions, so your app will be stateless
- **Cold Starts**: First request might be slower due to cold starts
- **Timeouts**: Functions have execution time limits (10s for hobby, 60s for pro)
- **Memory**: Limited memory allocation

### Database Considerations
- Use MongoDB Atlas (cloud database)
- Ensure your database allows connections from Vercel's IP ranges
- Consider connection pooling for better performance

### File Uploads
- Cloudinary integration is already configured
- Large files should be uploaded directly to Cloudinary
- Use presigned URLs for better performance

### CORS Configuration
Make sure your CORS is configured to allow your frontend domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json
   - Check for ES modules compatibility

2. **Environment Variables**
   - Verify all required variables are set in Vercel dashboard
   - Check variable names match exactly
   - Ensure no trailing spaces or quotes

3. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Check network access settings in MongoDB Atlas
   - Ensure database user has proper permissions

4. **CORS Issues**
   - Update CORS origin to include your frontend URL
   - Check if credentials are properly configured

### Debugging
- Check Vercel function logs in the dashboard
- Use `console.log` statements for debugging
- Test endpoints individually

## Post-Deployment

1. **Monitor Performance**: Use Vercel analytics to monitor your API performance
2. **Set up Monitoring**: Consider adding error tracking (Sentry, etc.)
3. **Backup**: Ensure your database has proper backups
4. **Security**: Regularly update dependencies and review security settings

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update CORS and environment variables with new domain

Your backend should now be successfully deployed on Vercel! 🚀
