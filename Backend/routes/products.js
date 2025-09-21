import express from 'express';
import { query } from 'express-validator';
import Product from '../models/Product.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';
import { handleValidationErrors, validatePagination, validateProductFilters, validateObjectId } from '../middleware/validation.js';
import { uploadMultiple } from '../config/cloudinary.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', validatePagination.concat(validateProductFilters), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      minPrice,
      maxPrice,
      inStock,
      featured,
      sort = 'newest',
      search
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (featured !== undefined) query.isFeatured = featured === 'true';

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating_desc':
        sortOption = { rating: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'name_asc':
        sortOption = { name: 1 };
        break;
      case 'name_desc':
        sortOption = { name: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Add text score for search results
    if (search) {
      sortOption = { score: { $meta: 'textScore' }, ...sortOption };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query, search ? { score: { $meta: 'textScore' } } : {})
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.getFeatured(parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all categories and subcategories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          subcategories: { $addToSet: '$subcategory' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formattedCategories = categories.map(cat => ({
      category: cat._id,
      subcategories: cat.subcategories,
      productCount: cat.count
    }));

    res.json({
      status: 'success',
      data: {
        categories: formattedCategories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Get related products
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
    .limit(4)
    .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id/reviews
// @desc    Get product reviews (redirect to reviews route)
// @access  Public
router.get('/:id/reviews', (req, res) => {
  // Redirect to the dedicated reviews route
  const { id } = req.params;
  const queryParams = new URLSearchParams(req.query).toString();
  const redirectUrl = `/api/reviews/product/${id}${queryParams ? `?${queryParams}` : ''}`;
  res.redirect(redirectUrl);
});

// @route   POST /api/products
// @desc    Create new product (Admin only)
// @access  Private/Admin
router.post('/', protect, restrictTo('admin'), uploadMultiple('images', 5), async (req, res) => {
  try {
    const productData = req.body;
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path);
    }

    // Parse arrays from string format
    if (productData.features) {
      productData.features = Array.isArray(productData.features) 
        ? productData.features 
        : productData.features.split(',').map(item => item.trim());
    }
    
    if (productData.ingredients) {
      productData.ingredients = Array.isArray(productData.ingredients) 
        ? productData.ingredients 
        : productData.ingredients.split(',').map(item => item.trim());
    }
    
    if (productData.skinType) {
      productData.skinType = Array.isArray(productData.skinType) 
        ? productData.skinType 
        : productData.skinType.split(',').map(item => item.trim());
    }
    
    if (productData.benefits) {
      productData.benefits = Array.isArray(productData.benefits) 
        ? productData.benefits 
        : productData.benefits.split(',').map(item => item.trim());
    }
    
    if (productData.tags) {
      productData.tags = Array.isArray(productData.tags) 
        ? productData.tags 
        : productData.tags.split(',').map(item => item.trim());
    }

    // Convert numeric fields
    productData.price = parseFloat(productData.price);
    if (productData.originalPrice) {
      productData.originalPrice = parseFloat(productData.originalPrice);
    }
    if (productData.stockQuantity) {
      productData.stockQuantity = parseInt(productData.stockQuantity);
    }
    if (productData.weight) {
      productData.weight = parseFloat(productData.weight);
    }

    // Set boolean fields
    productData.inStock = productData.stockQuantity > 0;
    productData.isActive = productData.isActive !== 'false';
    productData.isFeatured = productData.isFeatured === 'true';
    productData.isNew = productData.isNew !== 'false';
    productData.isOnSale = productData.isOnSale === 'true';

    const product = await Product.create(productData);

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during product creation'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/:id', protect, restrictTo('admin'), uploadMultiple('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    const updateData = req.body;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    // Parse arrays from string format
    if (updateData.features) {
      updateData.features = Array.isArray(updateData.features) 
        ? updateData.features 
        : updateData.features.split(',').map(item => item.trim());
    }
    
    if (updateData.ingredients) {
      updateData.ingredients = Array.isArray(updateData.ingredients) 
        ? updateData.ingredients 
        : updateData.ingredients.split(',').map(item => item.trim());
    }
    
    if (updateData.skinType) {
      updateData.skinType = Array.isArray(updateData.skinType) 
        ? updateData.skinType 
        : updateData.skinType.split(',').map(item => item.trim());
    }
    
    if (updateData.benefits) {
      updateData.benefits = Array.isArray(updateData.benefits) 
        ? updateData.benefits 
        : updateData.benefits.split(',').map(item => item.trim());
    }
    
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags) 
        ? updateData.tags 
        : updateData.tags.split(',').map(item => item.trim());
    }

    // Convert numeric fields
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.originalPrice) {
      updateData.originalPrice = parseFloat(updateData.originalPrice);
    }
    if (updateData.stockQuantity) {
      updateData.stockQuantity = parseInt(updateData.stockQuantity);
    }
    if (updateData.weight) {
      updateData.weight = parseFloat(updateData.weight);
    }

    // Set boolean fields
    if (updateData.stockQuantity !== undefined) {
      updateData.inStock = updateData.stockQuantity > 0;
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive !== 'false';
    }
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = updateData.isFeatured === 'true';
    }
    if (updateData.isNew !== undefined) {
      updateData.isNew = updateData.isNew !== 'false';
    }
    if (updateData.isOnSale !== undefined) {
      updateData.isOnSale = updateData.isOnSale === 'true';
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during product update'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during product deletion'
    });
  }
});

export default router;