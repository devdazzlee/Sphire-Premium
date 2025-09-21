import express from 'express';
import { body, query } from 'express-validator';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { handleValidationErrors, validatePagination, validateOrder } from '../middleware/validation.js';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, validateOrder, async (req, res) => {
  try {
    const { shippingAddress, notes } = req.body;

    // Get user's cart
    const cart = await Cart.getCartWithProducts(req.user._id);
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cart is empty'
      });
    }

    // Validate all products are still available
    const unavailableProducts = [];
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product._id);
      if (!product || !product.isAvailable() || product.stockQuantity < cartItem.quantity) {
        unavailableProducts.push({
          product: cartItem.product.name,
          requested: cartItem.quantity,
          available: product ? product.stockQuantity : 0
        });
      }
    }

    if (unavailableProducts.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Some products are no longer available',
        data: {
          unavailableProducts
        }
      });
    }

    // Calculate totals
    const subtotal = cart.total;
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;

    // Create order items
    const orderItems = cart.items.map(cartItem => ({
      product: cartItem.product._id,
      name: cartItem.product.name,
      price: cartItem.price,
      quantity: cartItem.quantity,
      image: cartItem.product.images[0]
    }));

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderNumber: Order.generateOrderNumber(),
      items: orderItems,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal,
      shippingCost,
      tax,
      total,
      notes
    });

    // Update product stock
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        { $inc: { stockQuantity: -cartItem.quantity } }
      );
    }

    // Clear cart
    await cart.clearCart();

    // Populate order with user details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone');

    // Send email notifications
    try {
      // Send confirmation email to customer
      await sendOrderConfirmationEmail(populatedOrder, req.user);
      
      // Send notification email to admin
      await sendAdminNotificationEmail(populatedOrder, req.user);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order: populatedOrder
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during order creation'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    let query = { user: req.user._id };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
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

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
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

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        status: 'error',
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    await order.updateStatus('cancelled', cancellationReason);

    // Restore product stock
    for (const orderItem of order.items) {
      await Product.findByIdAndUpdate(
        orderItem.product,
        { $inc: { stockQuantity: orderItem.quantity } }
      );
    }

    res.json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics for user
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'confirmed'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    };

    res.json({
      status: 'success',
      data: {
        stats: result
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/tracking/:orderNumber
// @desc    Track order by order number
// @access  Public
router.get('/tracking/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Return limited information for public tracking
    res.json({
      status: 'success',
      data: {
        order: {
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          statusDisplay: order.statusDisplay,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt,
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            image: item.image
          }))
        }
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

export default router;