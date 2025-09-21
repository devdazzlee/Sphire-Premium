import express from 'express';
import { query, body } from 'express-validator';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Location from '../models/Location.js';
import Settings from '../models/Settings.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { handleValidationErrors, validatePagination, validateObjectId } from '../middleware/validation.js';
import { upload, uploadMultiple, uploadSingle } from '../config/cloudinary.js';

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(restrictTo('admin'));

// Activity logging middleware
const logActivity = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log activity after response is sent
    setTimeout(async () => {
      try {
        await ActivityLog.logActivity({
          user: req.user.id,
          action: req.activityAction || 'unknown',
          entityType: req.entityType,
          entityId: req.entityId,
          entityName: req.entityName,
          description: req.activityDescription || 'Admin action performed',
          details: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            sessionId: req.sessionID
          },
          status: res.statusCode < 400 ? 'success' : 'failed'
        });
      } catch (error) {
        console.error('Activity logging error:', error);
      }
    }, 0);
    
    return originalSend.call(this, data);
  };
  
  next();
};

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get statistics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      orderStats,
      productStats,
      userStats
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(dateFilter),
      Order.getStats(startDate, endDate),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$stockQuantity' },
            lowStockProducts: {
              $sum: { $cond: [{ $lte: ['$stockQuantity', 10] }, 1, 0] }
            },
            outOfStockProducts: {
              $sum: { $cond: [{ $eq: ['$stockQuantity', 0] }, 1, 0] }
            },
            averagePrice: { $avg: '$price' }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: null,
            activeUsers: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            inactiveUsers: {
              $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
            },
            adminUsers: {
              $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const orderStatsData = orderStats[0] || {};
    const productStatsData = productStats[0] || {};
    const userStatsData = userStats[0] || {};

    res.json({
      status: 'success',
      data: {
        stats: {
          users: {
            total: totalUsers,
            active: userStatsData.activeUsers || 0,
            inactive: userStatsData.inactiveUsers || 0,
            admins: userStatsData.adminUsers || 0
          },
          products: {
            total: totalProducts,
            totalStock: productStatsData.totalStock || 0,
            lowStock: productStatsData.lowStockProducts || 0,
            outOfStock: productStatsData.outOfStockProducts || 0,
            averagePrice: productStatsData.averagePrice || 0
          },
          orders: {
            total: totalOrders,
            totalRevenue: orderStatsData.totalRevenue || 0,
            averageOrderValue: orderStatsData.averageOrderValue || 0,
            pending: orderStatsData.pendingOrders || 0,
            confirmed: orderStatsData.confirmedOrders || 0,
            processing: orderStatsData.processingOrders || 0,
            shipped: orderStatsData.shippedOrders || 0,
            delivered: orderStatsData.deliveredOrders || 0,
            cancelled: orderStatsData.cancelledOrders || 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/users/:id', validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's orders
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      status: 'success',
      data: {
        user,
        recentOrders: orders
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', validateObjectId('id'), async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private/Admin
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'user', address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role,
      address,
      isActive: true
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: Object.values(error.errors)[0].message
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', validateObjectId('id'), async (req, res) => {
  try {
    const { name, email, password, phone, role, address, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (address !== undefined) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    // Hash password if provided
    if (password) {
      user.password = password; // This will be hashed by the pre-save middleware
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: Object.values(error.errors)[0].message
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user has any orders
    const userOrders = await Order.countDocuments({ user: user._id });
    if (userOrders > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete user with existing orders. Consider deactivating instead.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/addresses
// @desc    Get all customer addresses
// @access  Private/Admin
router.get('/addresses', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, country } = req.query;

    // Build query to find users with addresses
    let userQuery = { addresses: { $exists: true, $ne: null, $not: { $size: 0 } } };
    
    if (search) {
      userQuery.$or = [
        { 'addresses.street': { $regex: search, $options: 'i' } },
        { 'addresses.city': { $regex: search, $options: 'i' } },
        { 'addresses.state': { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(userQuery)
      .select('name email phone addresses createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Extract addresses from users (flatten addresses array)
    const addresses = [];
    users.forEach(user => {
      if (user.addresses && user.addresses.length > 0) {
        user.addresses.forEach(address => {
          addresses.push({
            _id: `${user._id}_address_${address._id}`,
            userId: user._id,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone
            },
            type: address.type || 'home',
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            country: address.country || 'Pakistan',
            postalCode: address.zipCode || address.postalCode || '',
            isDefault: address.isDefault || false,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          });
        });
      }
    });

    // Filter by type and country if specified
    let filteredAddresses = addresses;
    if (type && type !== 'all') {
      filteredAddresses = filteredAddresses.filter(addr => addr.type === type);
    }
    if (country && country !== 'all') {
      filteredAddresses = filteredAddresses.filter(addr => addr.country.toLowerCase().includes(country.toLowerCase()));
    }

    // Count total addresses across all users
    const allUsersWithAddresses = await User.find(userQuery).select('addresses');
    let totalAddresses = 0;
    allUsersWithAddresses.forEach(user => {
      if (user.addresses && user.addresses.length > 0) {
        totalAddresses += user.addresses.length;
      }
    });
    const totalPages = Math.ceil(totalAddresses / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        addresses: filteredAddresses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAddresses: filteredAddresses.length,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/addresses/:userId
// @desc    Update customer address
// @access  Private/Admin
router.put('/addresses/:userId', validateObjectId('userId'), async (req, res) => {
  try {
    const { type, street, city, state, country, postalCode, isDefault } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user's addresses (find and update the first address, or create new one)
    if (!user.addresses || user.addresses.length === 0) {
      // Create new address array
      user.addresses = [{
        type: type || 'home',
        street: street || '',
        city: city || '',
        state: state || '',
        country: country || 'Pakistan',
        zipCode: postalCode || '',
        isDefault: isDefault !== undefined ? isDefault : true
      }];
    } else {
      // Update first address (or you could add logic to update specific address by ID)
      user.addresses[0] = {
        type: type || user.addresses[0]?.type || 'home',
        street: street || user.addresses[0]?.street || '',
        city: city || user.addresses[0]?.city || '',
        state: state || user.addresses[0]?.state || '',
        country: country || user.addresses[0]?.country || 'Pakistan',
        zipCode: postalCode || user.addresses[0]?.zipCode || user.addresses[0]?.postalCode || '',
        isDefault: isDefault !== undefined ? isDefault : user.addresses[0]?.isDefault || false
      };
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      status: 'success',
      message: 'Address updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Update address error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: Object.values(error.errors)[0].message
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/addresses/:userId
// @desc    Delete customer address
// @access  Private/Admin
router.delete('/addresses/:userId', validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Remove addresses array
    user.addresses = [];
    await user.save();

    res.json({
      status: 'success',
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products (including inactive)
// @access  Private/Admin
// Product Management Routes

// Create Product
router.post('/products', uploadMultiple('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      stockQuantity,
      rating,
      features,
      tags,
      isActive,
      isFeatured,
      isNew,
      isOnSale
    } = req.body;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    // Parse JSON arrays
    const parsedFeatures = features ? JSON.parse(features) : [];
    const parsedTags = tags ? JSON.parse(tags) : [];

    const productData = {
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      subcategory,
      brand,
      stockQuantity: parseInt(stockQuantity),
      rating: parseFloat(rating) || 0,
      features: parsedFeatures,
      tags: parsedTags,
      images,
      isActive: isActive === 'true',
      isFeatured: isFeatured === 'true',
      isNew: isNew === 'true',
      isOnSale: isOnSale === 'true'
    };

    const product = await Product.create(productData);

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create product'
    });
  }
});

// Get Products
router.get('/products', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, inStock, isActive } = req.query;

    // Build query
    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query, search ? { score: { $meta: 'textScore' } } : {})
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
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

// Update Product
router.put('/products/:id', uploadMultiple('images', 5), validateObjectId('id'), async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      stockQuantity,
      rating,
      features,
      tags,
      isActive,
      isFeatured,
      isNew,
      isOnSale
    } = req.body;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    // Parse JSON arrays
    const parsedFeatures = features ? JSON.parse(features) : [];
    const parsedTags = tags ? JSON.parse(tags) : [];

    const updateData = {
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      subcategory,
      brand,
      stockQuantity: parseInt(stockQuantity),
      rating: parseFloat(rating) || 0,
      features: parsedFeatures,
      tags: parsedTags,
      isActive: isActive === 'true',
      isFeatured: isFeatured === 'true',
      isNew: isNew === 'true',
      isOnSale: isOnSale === 'true'
    };

    // Only update images if new ones are uploaded
    if (images.length > 0) {
      updateData.images = images;
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update product'
    });
  }
});

// Delete Product
router.delete('/products/:id', validateObjectId('id'), async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findByIdAndDelete(productId);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete product'
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, search } = req.query;

    // Build query
    let query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', validateObjectId('id'), async (req, res) => {
  try {
    console.log('Order status update request body:', req.body);
    const { status, trackingNumber, estimatedDelivery, adminNotes } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Update order status
    await order.updateStatus(status, adminNotes);

    // Add tracking number if provided
    if (trackingNumber) {
      await order.addTrackingNumber(trackingNumber, estimatedDelivery);
    }

    // Populate order with user details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone');

    res.json({
      status: 'success',
      message: 'Order status updated successfully',
      data: {
        order: populatedOrder
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
});

// @route   DELETE /api/admin/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/orders/:id', validateObjectId('id'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if order can be deleted (only pending orders can be deleted)
    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Only pending orders can be deleted'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get single order
// @access  Private/Admin
router.get('/orders/:id', validateObjectId('id'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone addresses');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/analytics/revenue
// @desc    Get revenue analytics
// @access  Private/Admin
router.get('/analytics/revenue', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        revenueData,
        period,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/categories
// @desc    Get all categories
// @access  Private/Admin
router.get('/categories', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCategories,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
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

// @route   GET /api/admin/categories/tree
// @desc    Get category tree structure
// @access  Private/Admin
router.get('/categories/tree', async (req, res) => {
  try {
    const categoryTree = await Category.getCategoryTree();
    
    res.json({
      status: 'success',
      data: {
        categories: categoryTree
      }
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/categories/:id
// @desc    Get single category
// @access  Private/Admin
router.get('/categories/:id', validateObjectId('id'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug');
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/categories
// @desc    Create new category
// @access  Private/Admin
router.post('/categories', uploadSingle('image'), async (req, res) => {
  try {
    const { name, description, parentCategory, isActive, sortOrder } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const category = new Category({
      name,
      slug,
      description,
      image,
      parentCategory,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0
    });

    await category.save();

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Category with this name or slug already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/categories/:id', validateObjectId('id'), uploadSingle('image'), async (req, res) => {
  try {
    const { name, description, parentCategory, isActive, sortOrder } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    const updateData = {};
    if (name) {
      updateData.name = name;
      // Regenerate slug if name changed
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (parentCategory !== undefined) updateData.parentCategory = parentCategory;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Category with this name or slug already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/categories/:id', validateObjectId('id'), async (req, res) => {
  try {
    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category with existing products'
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: req.params.id });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category with subcategories'
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews with filtering and pagination
// @access  Private/Admin
router.get('/reviews', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, rating, product, user } = req.query;

    // Build query
    let query = {};
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (status === 'published') query.isPublished = true;
    if (rating) query.rating = parseInt(rating);
    if (product) query.product = product;
    if (user) query.user = user;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .populate('product', 'name images')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/reviews/:id/approve
// @desc    Approve a review
// @access  Private/Admin
router.put('/reviews/:id/approve', validateObjectId('id'), logActivity, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Set activity logging data
    req.activityAction = 'approve_review';
    req.entityType = 'review';
    req.entityId = review._id;
    req.entityName = `Review for ${review.product}`;
    req.activityDescription = `Approved review by ${review.user}`;

    await review.approveReview(req.user.id);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('product', 'name');

    res.json({
      status: 'success',
      message: 'Review approved successfully',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/reviews/:id/reject
// @desc    Reject a review
// @access  Private/Admin
router.put('/reviews/:id/reject', validateObjectId('id'), logActivity, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Set activity logging data
    req.activityAction = 'reject_review';
    req.entityType = 'review';
    req.entityId = review._id;
    req.entityName = `Review for ${review.product}`;
    req.activityDescription = `Rejected review by ${review.user}`;

    await review.rejectReview(req.user.id);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('product', 'name');

    res.json({
      status: 'success',
      message: 'Review rejected successfully',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a review
// @access  Private/Admin
router.delete('/reviews/:id', validateObjectId('id'), logActivity, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Set activity logging data
    req.activityAction = 'delete_review';
    req.entityType = 'review';
    req.entityId = review._id;
    req.entityName = `Review for ${review.product}`;
    req.activityDescription = `Deleted review by ${review.user}`;

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/locations
// @desc    Get all locations (warehouses, stores, etc.)
// @access  Private/Admin
router.get('/locations', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search, isActive } = req.query;

    // Build query
    let query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const locations = await Location.find(query)
      .populate('inventory.product', 'name images')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLocations = await Location.countDocuments(query);
    const totalPages = Math.ceil(totalLocations / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        locations,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalLocations,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/locations
// @desc    Create new location
// @access  Private/Admin
router.post('/locations', logActivity, async (req, res) => {
  try {
    const locationData = req.body;
    
    const location = new Location(locationData);
    await location.save();

    // Set activity logging data
    req.activityAction = 'create_location';
    req.entityType = 'location';
    req.entityId = location._id;
    req.entityName = location.name;
    req.activityDescription = `Created new location: ${location.name}`;

    res.status(201).json({
      status: 'success',
      message: 'Location created successfully',
      data: {
        location
      }
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/locations/:id
// @desc    Update location
// @access  Private/Admin
router.put('/locations/:id', validateObjectId('id'), logActivity, async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    // Set activity logging data
    req.activityAction = 'update_location';
    req.entityType = 'location';
    req.entityId = location._id;
    req.entityName = location.name;
    req.activityDescription = `Updated location: ${location.name}`;

    res.json({
      status: 'success',
      message: 'Location updated successfully',
      data: {
        location
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/locations/:id
// @desc    Delete location
// @access  Private/Admin
router.delete('/locations/:id', validateObjectId('id'), logActivity, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    // Set activity logging data
    req.activityAction = 'delete_location';
    req.entityType = 'location';
    req.entityId = location._id;
    req.entityName = location.name;
    req.activityDescription = `Deleted location: ${location.name}`;

    await Location.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/settings
// @desc    Get system settings
// @access  Private/Admin
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private/Admin
router.put('/settings', logActivity, async (req, res) => {
  try {
    const updates = req.body;
    
    // Set activity logging data
    req.activityAction = 'update_settings';
    req.entityType = 'settings';
    req.activityDescription = 'Updated system settings';

    const settings = await Settings.updateSettings(updates, req.user.id);

    res.json({
      status: 'success',
      message: 'Settings updated successfully',
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/activity-logs
// @desc    Get activity logs with filtering
// @access  Private/Admin
router.get('/activity-logs', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, action, entityType, userId, severity, startDate, endDate } = req.query;

    const query = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (userId) query.user = userId;
    if (severity) query.severity = severity;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await ActivityLog.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalLogs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/reports/export
// @desc    Export data as CSV
// @access  Private/Admin
router.get('/reports/export', logActivity, async (req, res) => {
  try {
    const { type, format = 'csv', startDate, endDate } = req.query;

    // Set activity logging data
    req.activityAction = 'export_data';
    req.entityType = 'system';
    req.activityDescription = `Exported ${type} data as ${format}`;

    // This is a placeholder for export functionality
    // In a real implementation, you would generate the actual CSV/PDF files
    
    res.json({
      status: 'success',
      message: 'Export functionality will be implemented',
      data: {
        type,
        format,
        startDate,
        endDate,
        downloadUrl: '/api/admin/reports/download/placeholder-file.csv'
      }
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews with filtering
// @access  Private/Admin
router.get('/reviews', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, rating, isApproved, isActive } = req.query;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }
    if (rating) query.rating = parseInt(rating);
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/reviews/pending
// @desc    Get pending reviews for approval
// @access  Private/Admin
router.get('/reviews/pending', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ isApproved: false, isActive: true })
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ isApproved: false, isActive: true });
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/reviews/:id/approve
// @desc    Approve a review
// @access  Private/Admin
router.put('/reviews/:id/approve', validateObjectId('id'), async (req, res) => {
  try {
    const { notes } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    await review.approve(req.user.id, notes);

    // Update product rating
    const productStats = await Review.getStats(review.product);
    if (productStats.length > 0) {
      await Product.findByIdAndUpdate(review.product, {
        rating: productStats[0].averageRating,
        reviewCount: productStats[0].totalReviews
      });
    }

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'approve',
      resource: 'review',
      resourceId: review._id,
      description: `Approved review for product ${review.product}`,
      metadata: { module: 'review_management' }
    });

    res.json({
      status: 'success',
      message: 'Review approved successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/reviews/:id/reject
// @desc    Reject a review
// @access  Private/Admin
router.put('/reviews/:id/reject', validateObjectId('id'), async (req, res) => {
  try {
    const { notes } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    await review.reject(req.user.id, notes);

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'reject',
      resource: 'review',
      resourceId: review._id,
      description: `Rejected review for product ${review.product}`,
      metadata: { module: 'review_management' }
    });

    res.json({
      status: 'success',
      message: 'Review rejected successfully'
    });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a review
// @access  Private/Admin
router.delete('/reviews/:id', validateObjectId('id'), async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'delete',
      resource: 'review',
      resourceId: review._id,
      description: `Deleted review for product ${review.product}`,
      metadata: { module: 'review_management' }
    });

    res.json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

export default router;