# Development vs Production Guide

## The Problem

When using `output: 'export'` for Hostinger deployment, Next.js becomes **very strict** during development and requires ALL dynamic routes to be pre-generated, which breaks the dev experience.

## The Solution

We've configured the app to:
- ✅ **Development**: Normal Next.js behavior (dynamic routes work)
- ✅ **Production Build**: Static export for Hostinger

---

## Configuration

### `next.config.mjs`
```javascript
output: process.env.NODE_ENV === 'production' ? 'export' : undefined
```

This means:
- **Development** (`npm run dev`): `output` is disabled → dynamic routes work normally
- **Production** (`npm run build`): `output: 'export'` → creates static files for Hostinger

---

## Development Workflow

### 1. Start Backend
```bash
cd Backend
npm start
```
Backend runs on: `http://localhost:5000`

### 2. Start Frontend
```bash
cd Frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

### 3. Development Features
✅ Hot reload works  
✅ Dynamic routes work (like `/products/[id]`)  
✅ API calls work  
✅ Full Next.js features available  

---

## Building for Hostinger

### Option 1: Build with Test Data (Fast)

**Step 1:** Enable test data
```typescript
// Frontend/utils/testData.ts
export const USE_TEST_DATA = true;
```

**Step 2:** Build
```bash
cd Frontend
npm run build
```

**Step 3:** Upload `out/` folder to Hostinger

---

### Option 2: Build with Real API Data

**Step 1:** Make sure backend is running
```bash
cd Backend
npm start
```

**Step 2:** Disable test data
```typescript
// Frontend/utils/testData.ts
export const USE_TEST_DATA = false;
```

**Step 3:** Update API URL (if needed)
```typescript
// Frontend/config/api.ts
const productionApiUrl = 'https://your-backend.com/api'
```

**Step 4:** Build (with backend running!)
```bash
cd Frontend
npm run build
```

**Step 5:** Upload `out/` folder to Hostinger

---

## Environment Modes Explained

### Development Mode (`npm run dev`)
```
NODE_ENV = 'development'
output = undefined (disabled)
```
**Features:**
- Dynamic routing works
- Hot reload
- Fast refresh
- Can visit any product page without pre-generation
- API calls work in real-time

### Production Build (`npm run build`)
```
NODE_ENV = 'production'
output = 'export'
```
**Features:**
- Generates static HTML files
- All dynamic routes pre-generated via `generateStaticParams()`
- Output in `out/` folder
- Ready for Hostinger upload

---

## Troubleshooting

### Issue: "Missing param in generateStaticParams" during development
**Cause:** `output: 'export'` was enabled during development  
**Solution:** Already fixed! Config now only enables it for production builds

### Issue: Dynamic routes not working in dev
**Cause:** Old config had `output: 'export'` always enabled  
**Solution:** Restart dev server after the config change:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Issue: Build fails - "Failed to fetch products"
**Solution:** Use test data (Option 1) or ensure backend is running (Option 2)

### Issue: Product pages return 404 on Hostinger
**Solution:** 
1. Upload `.htaccess` file to `public_html/`
2. Make sure all files from `out/` folder are uploaded

---

## Quick Commands

```bash
# Development (with backend running)
cd Backend && npm start
cd Frontend && npm run dev

# Build for Hostinger (with test data)
cd Frontend
npm run build
# Upload 'out/' folder to Hostinger

# Build for Hostinger (with real data - backend must be running)
cd Backend && npm start
cd Frontend && npm run build
# Upload 'out/' folder to Hostinger
```

---

## API Configuration

### Development
```typescript
// Frontend/config/api.ts
const productionApiUrl = 'http://localhost:5000/api'
```

### Production (After Backend Deployment)
```typescript
// Frontend/config/api.ts
const productionApiUrl = 'https://your-backend-domain.com/api'
```

---

## Summary

✅ **Development**: Works like normal Next.js (no static export restrictions)  
✅ **Production Build**: Creates static export for Hostinger  
✅ **Best of both worlds**: Easy development + Hostinger compatibility  

**Your app is now configured perfectly for both development and deployment!** 🚀

