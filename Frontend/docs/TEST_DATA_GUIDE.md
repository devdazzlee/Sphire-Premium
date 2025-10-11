# Test Data Usage Guide

## Overview
This guide explains how to use test data when the backend server is offline and how to revert to the real API when the server is working.

## Files Created
- `Frontend/data/testCategories.json` - 3 sample categories
- `Frontend/data/testProducts.json` - 3 sample products  
- `Frontend/utils/testData.ts` - Utility functions and configuration

## Test Data Content

### Categories (3 items)
1. **Skincare** - Premium skincare products
2. **Makeup** - Professional makeup products
3. **Hair Care** - Luxurious hair care products

### Products (3 items)
1. **Hydrating Vitamin C Serum** - Skincare product ($45.99)
2. **Luxury Matte Lipstick Set** - Makeup product ($89.99)
3. **Repairing Hair Mask** - Hair care product ($34.99)

## How to Use Test Data

### Step 1: Enable Test Data Mode
In `Frontend/utils/testData.ts`, set:
```typescript
export const USE_TEST_DATA = true; // Set to true when server is offline
```

### Step 2: Use in Your Components
```typescript
import { USE_TEST_DATA, getTestCategories, getTestProducts, simulateApiResponse } from '@/utils/testData';

const fetchCategories = async () => {
  if (USE_TEST_DATA) {
    const categories = getTestCategories();
    return await simulateApiResponse(categories);
  } else {
    // Use real API
    const response = await fetch('/api/categories');
    return await response.json();
  }
};
```

### Step 3: Available Functions
- `getTestCategories()` - Get all categories
- `getTestProducts()` - Get all products
- `getTestProductById(id)` - Get product by ID
- `getTestProductsByCategory(category)` - Get products by category
- `getTestFeaturedProducts()` - Get featured products
- `simulateApiResponse(data, delay)` - Simulate API response with delay

## How to Revert to Real API

### Step 1: Fix Server Connection
1. Resolve the MongoDB connection issue (DNS/network problem)
2. Ensure server starts successfully with: `yarn dev`
3. Verify API endpoints are working

### Step 2: Disable Test Data Mode
In `Frontend/utils/testData.ts`, change:
```typescript
export const USE_TEST_DATA = false; // Set to false when server is working
```

### Step 3: Update API Calls
Replace test data calls with real API calls:
```typescript
// Instead of:
const categories = getTestCategories();

// Use:
const response = await fetch('/api/categories');
const data = await response.json();
```

### Step 4: Remove Test Data Files (Optional)
Once server is working, you can delete:
- `Frontend/data/testCategories.json`
- `Frontend/data/testProducts.json`
- `Frontend/utils/testData.ts`
- `Frontend/docs/TEST_DATA_GUIDE.md`

## Current Server Issue
The server is currently experiencing a DNS timeout error when connecting to MongoDB Atlas:
```
Database connection error: Error: queryTxt ETIMEOUT cluster0.8fnxgil.mongodb.net
```

### Solutions to Try:
1. **Mobile Hotspot Test** - Connect to phone hotspot to bypass network issues
2. **DNS Settings** - Change DNS to 8.8.8.8 and 8.8.4.4
3. **Router Restart** - Unplug router for 30 seconds
4. **Different Network** - Try different WiFi or internet connection

## Benefits of Test Data
- ✅ Continue frontend development while server is offline
- ✅ Test UI components with realistic data
- ✅ Simulate API delays and responses
- ✅ Easy to switch between test and real data
- ✅ No dependency on backend server

## Notes
- Test data matches the actual database schema
- All products have realistic pricing, descriptions, and images
- Categories include proper metadata and SEO fields
- Products include detailed features, ingredients, and usage instructions



