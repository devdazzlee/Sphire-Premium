# Automatic Product Rating System

## Overview

Product ratings are now **automatically calculated** based on customer reviews. Admins cannot manually set ratings.

---

## How It Works

### 1. **Customer Submits Review**
- Customer writes a review and gives a rating (1-5 stars)
- Review is saved with `isApproved: false` (pending approval)
- Product rating is **NOT updated yet**

### 2. **Admin Approves Review** (in Dashboard)
- Admin reviews and approves the customer review
- System **automatically recalculates** product rating
- Product rating = Average of all approved reviews
- Review count = Total number of approved reviews

### 3. **Admin Rejects/Deletes Review**
- Admin rejects or deletes a review
- System **automatically recalculates** product rating
- Product rating and review count are updated to exclude the rejected review

---

## Automatic Updates

The system automatically updates product ratings when:

✅ A review is **approved** → Rating recalculated  
✅ A review is **rejected** → Rating recalculated (if it was previously approved)  
✅ A review is **deleted** → Rating recalculated  

---

## Calculation Formula

```javascript
// Average Rating Calculation
averageRating = (Sum of all approved review ratings) / (Total approved reviews)
averageRating = Round to 1 decimal place

// Review Count
reviewCount = Total number of approved and active reviews
```

### Example:

If a product has these **approved** reviews:
- Review 1: 5 stars
- Review 2: 4 stars
- Review 3: 5 stars
- Review 4: 3 stars
- Review 5: 5 stars

**Calculation:**
```
averageRating = (5 + 4 + 5 + 3 + 5) / 5 = 22 / 5 = 4.4
reviewCount = 5
```

**Result:** Product shows **4.4 stars (5 reviews)**

---

## Database Schema

### Product Model (`rating` and `reviewCount` fields)
```javascript
{
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0
  }
}
```

**Note:** These fields are **read-only** for admins. They are automatically calculated by the system.

### Review Model
```javascript
{
  rating: Number,         // 1-5 stars (customer's rating)
  isApproved: Boolean,    // Must be true to count
  isActive: Boolean       // Must be true to count
}
```

---

## Implementation Details

### Review Model Methods

#### `approve()` Method
```javascript
reviewSchema.methods.approve = async function(moderatorId, notes) {
  this.isApproved = true;
  await this.save();
  
  // Automatically update product rating
  await this.updateProductRating();
  
  return this;
};
```

#### `reject()` Method
```javascript
reviewSchema.methods.reject = async function(moderatorId, notes) {
  const wasApproved = this.isApproved;
  this.isApproved = false;
  this.isActive = false;
  await this.save();
  
  // Update rating if it was previously approved
  if (wasApproved) {
    await this.updateProductRating();
  }
  
  return this;
};
```

#### `updateProductRating()` Method
```javascript
reviewSchema.methods.updateProductRating = async function() {
  const stats = await Review.aggregate([
    {
      $match: {
        product: this.product,
        isApproved: true,
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      rating: parseFloat(stats[0].averageRating.toFixed(1)),
      reviewCount: stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(this.product, {
      rating: 0,
      reviewCount: 0
    });
  }
};
```

### Mongoose Hooks
```javascript
// Auto-update when review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.isApproved && doc.isActive) {
    await doc.updateProductRating();
  }
});

reviewSchema.post('remove', async function(doc) {
  if (doc.isApproved && doc.isActive) {
    await doc.updateProductRating();
  }
});
```

---

## Recalculate Ratings Script

If you need to recalculate ratings for **all products** (e.g., after data migration):

### Run the Script:
```bash
cd Backend
node scripts/recalculateRatings.js
```

### What It Does:
1. Connects to MongoDB
2. Fetches all products
3. For each product:
   - Counts all approved, active reviews
   - Calculates average rating
   - Updates product rating and review count
4. Shows summary of updates

### Output Example:
```
Connecting to MongoDB...
✅ Connected to MongoDB

Found 50 products

Processing: Hydrating Vitamin C Serum (65d2e8e7a1b2c3d4e5f6a7c0)
  Old: 4.8 (0 reviews)
  New: 4.5 (12 reviews)
  ✅ Updated

Processing: Anti-Aging Night Cream (65d2e8e7a1b2c3d4e5f6a7c1)
  Old: 0 (0 reviews)
  New: 0 (0 reviews)
  ✅ Updated

...

==================================================
SUMMARY:
==================================================
Total products: 50
✅ Successfully updated: 50
❌ Errors: 0
==================================================
```

---

## Admin Dashboard

### What Admins See:
- **Product Rating**: Display only (cannot edit manually)
- **Review Count**: Display only (cannot edit manually)
- **Review Management**: Approve/Reject buttons
  - When clicking "Approve" → Rating updates automatically
  - When clicking "Reject" → Rating updates automatically

### What Admins Do:
1. View pending reviews
2. Approve or reject each review
3. System automatically updates product ratings

### What Admins CANNOT Do:
❌ Manually set product rating  
❌ Manually set review count  
❌ Override calculated ratings  

---

## Frontend Display

### Product Card:
```typescript
<StarRating rating={product.rating} />
<span>({product.reviewCount} reviews)</span>
```

### Product Detail Page:
```typescript
<StarRating 
  rating={product.rating} 
  reviewCount={product.reviewCount}
  showText={true}
/>
<span>({product.reviewCount} reviews)</span>
```

---

## Benefits

✅ **Accurate Ratings**: Based on real customer feedback  
✅ **Automatic Updates**: No manual work required  
✅ **Prevents Manipulation**: Admins can't fake ratings  
✅ **Transparent**: Customers see real average ratings  
✅ **Real-Time**: Updates immediately when reviews are approved/rejected  

---

## Review Approval Workflow

```
Customer writes review
         ↓
Review saved (isApproved: false)
         ↓
Admin sees in "Pending Reviews"
         ↓
Admin approves ──→ isApproved: true ──→ Rating recalculated ✅
         ↓
Product page shows new rating
```

---

## Testing

### Test Scenario 1: New Review Approved
1. Create a product with 0 reviews (rating: 0)
2. Customer submits a 5-star review
3. Admin approves the review
4. **Expected**: Product rating = 5.0, reviewCount = 1

### Test Scenario 2: Multiple Reviews
1. Product has 4.0 rating (2 reviews: 5★, 3★)
2. Customer submits a 5-star review
3. Admin approves the review
4. **Expected**: (5+3+5)/3 = 4.3 rating, reviewCount = 3

### Test Scenario 3: Review Rejected
1. Product has 4.0 rating (2 reviews: 5★, 3★)
2. Admin rejects the 3-star review
3. **Expected**: rating = 5.0, reviewCount = 1

### Test Scenario 4: All Reviews Deleted
1. Product has 4.5 rating (4 reviews)
2. Admin deletes all 4 reviews
3. **Expected**: rating = 0, reviewCount = 0

---

## Troubleshooting

### Issue: Ratings not updating after approval
**Solution:** Run the recalculate script:
```bash
node scripts/recalculateRatings.js
```

### Issue: Old products show wrong ratings
**Solution:** Run the recalculate script to fix all products at once.

### Issue: Rating shows as 0 even with reviews
**Check:**
1. Are the reviews approved? (`isApproved: true`)
2. Are the reviews active? (`isActive: true`)
3. Check MongoDB for the product's reviews

### Issue: Rating doesn't match manual calculation
**Reason:** System only counts `isApproved: true` AND `isActive: true` reviews.

---

## API Endpoints

### Get Product with Rating
```
GET /api/products/:id
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "...",
      "name": "Product Name",
      "rating": 4.5,
      "reviewCount": 12,
      ...
    }
  }
}
```

### Approve Review (Triggers Auto-Update)
```
PATCH /api/reviews/:reviewId/approve
Headers: Authorization: Bearer {token}
```
**Result:** Product rating automatically recalculated

### Reject Review (Triggers Auto-Update)
```
PATCH /api/reviews/:reviewId/reject
Headers: Authorization: Bearer {token}
```
**Result:** Product rating automatically recalculated

---

## Summary

🎯 **Product ratings are 100% automatic and based on real customer reviews**  
🎯 **Admins only approve/reject reviews, ratings update automatically**  
🎯 **System calculates average rating from all approved reviews**  
🎯 **No manual intervention needed or allowed**  

This ensures **authentic, trustworthy product ratings** for your customers! ⭐

