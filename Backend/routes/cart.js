import express from 'express';
import { body } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors, validateCartItem } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.getCartWithProducts(req.user._id);
    
    if (!cart) {
      return res.json({
        status: 'success',
        data: {
          cart: {
            items: [],
            total: 0,
            itemCount: 0
          }
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        cart: {
          items: cart.items,
          total: cart.total,
          itemCount: cart.itemCount
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', protect, validateCartItem, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    if (!product.isAvailable()) {
      return res.status(400).json({
        status: 'error',
        message: 'Product is not available'
      });
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Only ${product.stockQuantity} items available in stock`
      });
    }

    // Get or create cart
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Add item to cart
    await cart.addItem(productId, quantity, product.price);

    // Populate the cart with product details
    const populatedCart = await Cart.getCartWithProducts(req.user._id);

    res.json({
      status: 'success',
      message: 'Item added to cart successfully',
      data: {
        cart: {
          items: populatedCart.items,
          total: populatedCart.total,
          itemCount: populatedCart.itemCount
        }
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/update/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid quantity is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }

    // Check if item exists in cart
    const cartItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart'
      });
    }

    // Check stock availability if increasing quantity
    if (quantity > cartItem.quantity && product.stockQuantity < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Only ${product.stockQuantity} items available in stock`
      });
    }

    // Update quantity
    await cart.updateItemQuantity(productId, quantity);

    // Populate the cart with product details
    const populatedCart = await Cart.getCartWithProducts(req.user._id);

    res.json({
      status: 'success',
      message: 'Cart updated successfully',
      data: {
        cart: {
          items: populatedCart.items,
          total: populatedCart.total,
          itemCount: populatedCart.itemCount
        }
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }

    // Check if item exists in cart
    const cartItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart'
      });
    }

    // Remove item
    await cart.removeItem(productId);

    // Populate the cart with product details
    const populatedCart = await Cart.getCartWithProducts(req.user._id);

    res.json({
      status: 'success',
      message: 'Item removed from cart successfully',
      data: {
        cart: {
          items: populatedCart.items,
          total: populatedCart.total,
          itemCount: populatedCart.itemCount
        }
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    // Get cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }

    // Clear cart
    await cart.clearCart();

    res.json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: {
        cart: {
          items: [],
          total: 0,
          itemCount: 0
        }
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/cart/count
// @desc    Get cart item count
// @access  Private
router.get('/count', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    const itemCount = cart ? cart.itemCount : 0;

    res.json({
      status: 'success',
      data: {
        itemCount
      }
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/cart/sync
// @desc    Sync local cart with server cart
// @access  Private
router.post('/sync', protect, async (req, res) => {
  try {
    const { localCart } = req.body;

    if (!localCart || !Array.isArray(localCart.items)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid cart data'
      });
    }

    // Get or create cart
    const cart = await Cart.getOrCreateCart(req.user._id);

    // Clear existing cart
    await cart.clearCart();

    // Add items from local cart
    for (const item of localCart.items) {
      const product = await Product.findById(item.product.id || item.product._id);
      if (product && product.isAvailable()) {
        await cart.addItem(product._id, item.quantity, product.price);
      }
    }

    // Populate the cart with product details
    const populatedCart = await Cart.getCartWithProducts(req.user._id);

    res.json({
      status: 'success',
      message: 'Cart synced successfully',
      data: {
        cart: {
          items: populatedCart.items,
          total: populatedCart.total,
          itemCount: populatedCart.itemCount
        }
      }
    });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

export default router;