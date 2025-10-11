import express from 'express';
import { body, param, query } from 'express-validator';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';
import { handleValidationErrors, validatePagination, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a specific product
// @access  Public
router.get('/product/:productId', 
  validateObjectId('productId'), 
  validatePagination,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, sort = 'newest' } = req.query;
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Build sort options
      let sortOption = {};
      switch (sort) {
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'rating_high':
          sortOption = { rating: -1, createdAt: -1 };
          break;
        case 'rating_low':
          sortOption = { rating: 1, createdAt: -1 };
          break;
        case 'helpful':
          sortOption = { helpfulVotes: -1, createdAt: -1 };
          break;
        case 'verified':
          sortOption = { isVerifiedPurchase: -1, createdAt: -1 };
          break;
        case 'newest':
        default:
          sortOption = { createdAt: -1 };
          break;
      }

      const reviews = await Review.find({
        product: productId,
        isApproved: true,
        isActive: true
      })
      .populate('user', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

      const totalReviews = await Review.countDocuments({
        product: productId,
        isApproved: true,
        isActive: true
      });

      // Get review statistics
      const stats = await Review.getStats(productId);
      const reviewStats = stats.length > 0 ? stats[0] : {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
        verifiedReviews: 0
      };

      // Calculate rating distribution
      const ratingDistribution = {};
      for (let i = 1; i <= 5; i++) {
        ratingDistribution[i] = 0;
      }
      
      if (reviewStats.ratingDistribution) {
        reviewStats.ratingDistribution.forEach(rating => {
          ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
        });
      }

      res.json({
        status: 'success',
        data: {
          reviews,
          stats: {
            totalReviews: reviewStats.totalReviews,
            averageRating: reviewStats.averageRating || 0,
            ratingDistribution,
            verifiedReviews: reviewStats.verifiedReviews || 0
          },
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReviews / parseInt(limit)),
            totalReviews,
            hasNextPage: parseInt(page) < Math.ceil(totalReviews / parseInt(limit)),
            hasPrevPage: parseInt(page) > 1,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get product reviews error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
);

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/',
  protect,
  [
    body('productId').isMongoId().withMessage('Valid product ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
    body('images').optional().isArray().withMessage('Images must be an array'),
    body('images.*').optional().isURL().withMessage('Invalid image URL'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { productId, rating, title, comment, images = [] } = req.body;
      const userId = req.user.id;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({
        user: userId,
        product: productId,
        isActive: true
      });

      if (existingReview) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already reviewed this product'
        });
      }

      // Create review
      const review = await Review.create({
        user: userId,
        product: productId,
        rating,
        title,
        comment,
        images,
        isVerifiedPurchase: false, // TODO: Check if user has purchased this product
        isApproved: false // Requires moderation
      });

      // Populate user data for response
      await review.populate('user', 'name avatar');

      res.status(201).json({
        status: 'success',
        message: 'Review submitted successfully. It will be published after moderation.',
        data: {
          review
        }
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error during review creation'
      });
    }
  }
);

// @route   PUT /api/reviews/:reviewId/helpful
// @desc    Mark a review as helpful
// @access  Private
router.put('/:reviewId/helpful',
  protect,
  validateObjectId('reviewId'),
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Review not found'
        });
      }

      review.helpfulVotes += 1;
      await review.save();

      res.json({
        status: 'success',
        message: 'Review marked as helpful',
        data: {
          helpfulVotes: review.helpfulVotes
        }
      });
    } catch (error) {
      console.error('Mark review helpful error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
);

// @route   POST /api/reviews/:reviewId/report
// @desc    Report a review
// @access  Private
router.post('/:reviewId/report',
  protect,
  validateObjectId('reviewId'),
  [
    body('reason').isIn(['inappropriate', 'spam', 'fake', 'offensive', 'other'])
      .withMessage('Valid reason is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;
      
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Review not found'
        });
      }

      await review.report(userId, reason);

      res.json({
        status: 'success',
        message: 'Review reported successfully'
      });
    } catch (error) {
      console.error('Report review error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
);

// @route   GET /api/reviews/user
// @desc    Get user's reviews
// @access  Private
router.get('/user',
  protect,
  validatePagination,
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const reviews = await Review.find({ user: userId })
        .populate('product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalReviews = await Review.countDocuments({ user: userId });

      res.json({
        status: 'success',
        data: {
          reviews,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReviews / parseInt(limit)),
            totalReviews,
            hasNextPage: parseInt(page) < Math.ceil(totalReviews / parseInt(limit)),
            hasPrevPage: parseInt(page) > 1,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
);

// @route   PUT /api/reviews/:reviewId
// @desc    Update user's review
// @access  Private
router.put('/:reviewId',
  protect,
  validateObjectId('reviewId'),
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    body('comment').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
    body('images').optional().isArray().withMessage('Images must be an array'),
    body('images.*').optional().isURL().withMessage('Invalid image URL'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;
      
      const review = await Review.findOne({
        _id: reviewId,
        user: userId,
        isActive: true
      });

      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Review not found or you are not authorized to update it'
        });
      }

      // If review is already approved, reset approval status for moderation
      if (review.isApproved) {
        updateData.isApproved = false;
      }

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updateData,
        { new: true, runValidators: true }
      ).populate('user', 'name avatar');

      res.json({
        status: 'success',
        message: 'Review updated successfully',
        data: {
          review: updatedReview
        }
      });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error during review update'
      });
    }
  }
);

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete user's review
// @access  Private
router.delete('/:reviewId',
  protect,
  validateObjectId('reviewId'),
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      
      const review = await Review.findOne({
        _id: reviewId,
        user: userId,
        isActive: true
      });

      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Review not found or you are not authorized to delete it'
        });
      }

      // Soft delete
      review.isActive = false;
      await review.save();

      res.json({
        status: 'success',
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error during review deletion'
      });
    }
  }
);

// @route   PATCH /api/reviews/:reviewId/approve
// @desc    Approve a review (Admin only)
// @access  Private/Admin
router.patch('/:reviewId/approve',
  protect,
  restrictTo('admin'),
  validateObjectId('reviewId'),
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Review not found'
        });
      }

      review.isApproved = true;
      await review.save();

      await review.populate('user', 'name avatar');
      await review.populate('product', 'name');

      res.json({
        status: 'success',
        message: 'Review approved successfully',
        data: {
          review
        }
      });
    } catch (error) {
      console.error('Approve review error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error during review approval'
      });
    }
  }
);

// @route   PATCH /api/reviews/:reviewId/reject
// @desc    Reject a review (Admin only)
// @access  Private/Admin
router.patch('/:reviewId/reject',
  protect,
  restrictTo('admin'),
  validateObjectId('reviewId'),
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Review not found'
        });
      }

      review.isApproved = false;
      review.isActive = false;
      await review.save();

      res.json({
        status: 'success',
        message: 'Review rejected successfully',
        data: {
          review
        }
      });
    } catch (error) {
      console.error('Reject review error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error during review rejection'
      });
    }
  }
);

export default router;
