import express from 'express';
import Newsletter from '../models/Newsletter.js';
import { protect, restrictTo } from '../middleware/auth.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email, source = 'footer' } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email: email.toLowerCase().trim() });

    if (subscriber) {
      // If already subscribed and active
      if (subscriber.isActive) {
        return res.status(200).json({
          status: 'success',
          message: 'You are already subscribed to our newsletter!',
          data: { subscriber }
        });
      } else {
        // Resubscribe if previously unsubscribed
        await subscriber.resubscribe();
        
        // Send welcome back email
        try {
          await emailService.sendNewsletterWelcome(email);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        return res.status(200).json({
          status: 'success',
          message: 'Welcome back! You have been resubscribed to our newsletter.',
          data: { subscriber }
        });
      }
    }

    // Create new subscriber
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      referrer: req.get('referrer') || 'direct'
    };

    subscriber = await Newsletter.create({
      email: email.toLowerCase().trim(),
      source,
      metadata
    });

    // Send welcome email
    try {
      await emailService.sendNewsletterWelcome(email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({
      status: 'success',
      message: 'Successfully subscribed to our newsletter! Check your email for confirmation.',
      data: { subscriber }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to subscribe. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase().trim() });

    if (!subscriber) {
      return res.status(404).json({
        status: 'error',
        message: 'Email not found in our newsletter list'
      });
    }

    if (!subscriber.isActive) {
      return res.status(200).json({
        status: 'success',
        message: 'You are already unsubscribed from our newsletter'
      });
    }

    await subscriber.unsubscribe();

    res.status(200).json({
      status: 'success',
      message: 'Successfully unsubscribed from our newsletter. Sorry to see you go!'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsubscribe. Please try again later.'
    });
  }
});

// @route   GET /api/newsletter/subscribers
// @desc    Get all subscribers (Admin only)
// @access  Private/Admin
router.get('/subscribers', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, isActive, search } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Newsletter.countDocuments(query);
    const activeCount = await Newsletter.getActiveCount();

    res.status(200).json({
      status: 'success',
      data: {
        subscribers,
        pagination: {
          total,
          activeCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscribers'
    });
  }
});

// @route   GET /api/newsletter/stats
// @desc    Get newsletter statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, restrictTo('admin'), async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments();
    const activeSubscribers = await Newsletter.countDocuments({ isActive: true });
    const unsubscribedCount = await Newsletter.countDocuments({ isActive: false });

    // Get subscribers from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSubscribers = await Newsletter.countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo }
    });

    // Get subscribers by source
    const subscribersBySource = await Newsletter.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalSubscribers,
        activeSubscribers,
        unsubscribedCount,
        recentSubscribers,
        subscribersBySource,
        subscriptionRate: totalSubscribers > 0 
          ? ((activeSubscribers / totalSubscribers) * 100).toFixed(2) + '%'
          : '0%'
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch newsletter statistics'
    });
  }
});

// @route   DELETE /api/newsletter/subscriber/:id
// @desc    Delete a subscriber (Admin only)
// @access  Private/Admin
router.delete('/subscriber/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete subscriber'
    });
  }
});

// @route   POST /api/newsletter/send
// @desc    Send newsletter to all active subscribers (Admin only)
// @access  Private/Admin
router.post('/send', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { subject, content, htmlContent } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject and content are required'
      });
    }

    // Get all active subscribers
    const subscribers = await Newsletter.find({ isActive: true }).select('email');
    const emails = subscribers.map(sub => sub.email);

    if (emails.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No active subscribers found'
      });
    }

    // Send newsletter to all subscribers
    try {
      await emailService.sendBulkNewsletter(emails, subject, content, htmlContent);
    } catch (emailError) {
      console.error('Failed to send newsletter:', emailError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send newsletter emails'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Newsletter sent successfully to ${emails.length} subscribers`,
      data: {
        recipientCount: emails.length
      }
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send newsletter'
    });
  }
});

export default router;

