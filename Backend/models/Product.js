import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required'],
    trim: true,
    lowercase: true
  },
  brand: {
    type: String,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0
  },
  features: [{
    type: String,
    trim: true
  }],
  ingredients: [{
    type: String,
    trim: true
  }],
  howToUse: {
    type: String,
    maxlength: [1000, 'Usage instructions cannot be more than 1000 characters']
  },
  skinType: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  saleStartDate: Date,
  saleEndDate: Date,
  seoTitle: String,
  seoDescription: String,
  metaKeywords: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for product ID (using 'id' instead of '_id' to avoid conflict)
productSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for availability status
productSchema.virtual('availabilityStatus').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.stockQuantity === 0) return 'out-of-stock';
  if (this.stockQuantity <= 10) return 'low-stock';
  return 'in-stock';
});

// Method to check if product is on sale
productSchema.methods.isOnSaleNow = function() {
  if (!this.isOnSale) return false;
  const now = new Date();
  return (!this.saleStartDate || this.saleStartDate <= now) && 
         (!this.saleEndDate || this.saleEndDate >= now);
};

// Method to update stock
productSchema.methods.updateStock = function(quantity) {
  this.stockQuantity = Math.max(0, this.stockQuantity + quantity);
  this.inStock = this.stockQuantity > 0;
  return this.save();
};

// Method to check if product is available
productSchema.methods.isAvailable = function() {
  return this.isActive && this.inStock && this.stockQuantity > 0;
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    isFeatured: true, 
    isActive: true, 
    inStock: true 
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get products by category
productSchema.statics.getByCategory = function(category, subcategory = null) {
  const query = { category, isActive: true };
  if (subcategory) query.subcategory = subcategory;
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true
  };
  
  if (options.category) query.category = options.category;
  if (options.minPrice) query.price = { $gte: options.minPrice };
  if (options.maxPrice) query.price = { ...query.price, $lte: options.maxPrice };
  if (options.inStock !== undefined) query.inStock = options.inStock;
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

export default mongoose.model('Product', productSchema);