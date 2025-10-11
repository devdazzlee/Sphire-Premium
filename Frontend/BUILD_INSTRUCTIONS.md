# Building for Hostinger Deployment

This guide explains how to build your Next.js app for static hosting on Hostinger.

## Prerequisites

Before building, you have **TWO OPTIONS**:

---

## **OPTION 1: Use Test Data (Recommended for Quick Build)**

This is the fastest way to build without needing a running backend.

### Steps:

1. **Enable test data** in `Frontend/utils/testData.ts`:
   ```typescript
   export const USE_TEST_DATA = true;  // Set to true
   ```

2. **Build the project**:
   ```bash
   cd Frontend
   npm run build
   ```

3. **The output will be in** `Frontend/out/` folder

4. **Upload to Hostinger**:
   - Upload all contents of the `out/` folder to your Hostinger public_html directory
   - Make sure to upload the `.next` folder as well

---

## **OPTION 2: Build with Real API Data**

This requires your backend to be accessible during the build process.

### Steps:

1. **Disable test data** in `Frontend/utils/testData.ts`:
   ```typescript
   export const USE_TEST_DATA = false;  // Set to false
   ```

2. **Start your backend server**:
   ```bash
   cd Backend
   npm start
   ```
   Make sure it's running on `http://localhost:5000`

3. **Update API URL** in `Frontend/.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Build the project** (with backend running):
   ```bash
   cd Frontend
   npm run build
   ```

5. **The output will be in** `Frontend/out/` folder

6. **Upload to Hostinger**:
   - Upload all contents of the `out/` folder to your Hostinger public_html directory

---

## **For Production Backend**

If you have a deployed backend (not localhost), update the API URL:

### Edit `Frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### Edit `Frontend/config/api.ts`:
```typescript
const productionApiUrl = 'https://your-backend-domain.com/api'
```

Then rebuild:
```bash
cd Frontend
npm run build
```

---

## **Important Notes for Hostinger**

### 1. **File Structure on Hostinger**
Upload everything from the `out/` folder to `public_html/`:
```
public_html/
├── _next/
├── images/
├── index.html
├── products.html
├── contact.html
└── ... (all other files)
```

### 2. **API Configuration**
Since Hostinger is static hosting, your frontend will make API calls to your backend server. Make sure:
- Your backend is deployed and accessible online
- Update `NEXT_PUBLIC_API_URL` to your backend URL
- Enable CORS on your backend for your Hostinger domain

### 3. **Add .htaccess for Clean URLs** (Optional)
Create `.htaccess` in `public_html/`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 4. **404 Page**
Next.js export will create a `404.html` automatically.

---

## **Troubleshooting**

### Build fails with "Failed to fetch products"
- **Solution**: Use Option 1 (test data) or make sure your backend is running for Option 2

### Pages show 404 on Hostinger
- **Solution**: Add the `.htaccess` file (see above)

### API calls not working after deployment
- **Solution**: 
  1. Check that `NEXT_PUBLIC_API_URL` is set to your production backend URL
  2. Verify CORS is enabled on backend
  3. Make sure backend accepts requests from your Hostinger domain

### Images not loading
- **Solution**: Make sure `images: { unoptimized: true }` is in `next.config.mjs` (already set)

---

## **Quick Build Command**

```bash
# Option 1: With test data (fast)
cd Frontend
npm run build

# Option 2: With real API (backend must be running)
cd Backend
npm start
# In another terminal:
cd Frontend
npm run build
```

---

## **Deploy Command for Hostinger**

After building, you can use FTP/SFTP to upload:

```bash
# Using FileZilla or similar FTP client:
# - Connect to your Hostinger FTP
# - Navigate to public_html/
# - Upload all contents from Frontend/out/
```

Or use the Hostinger File Manager directly.

---

## **Summary**

✅ **For Quick Testing**: Use test data (Option 1)  
✅ **For Production**: Deploy backend first, then build frontend with production API URL  
✅ **For Hostinger**: Upload contents of `out/` folder to `public_html/`  
✅ **For Clean URLs**: Add `.htaccess` file  

