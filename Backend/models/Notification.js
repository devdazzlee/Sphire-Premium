import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // null for system-wide notifications
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'order_update', 'stock_alert', 'new_review', 'payment_received',
      'order_cancelled', 'product_discontinued', 'system_maintenance',
      'security_alert', 'inventory_low', 'new_customer', 'refund_processed',
      'shipping_update', 'review_approved', 'review_rejected', 'general'
    ]
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null // Store additional data like order ID, product ID, etc.
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null // Optional expiration date
  },
  actionUrl: {
    type: String,
    required: false // URL to redirect when notification is clicked
  },
  actionText: {
    type: String,
    required: false // Text for the action button
  },
  metadata: {
    source: {
      type: String,
      required: false // e.g., 'order_system', 'inventory_system'
    },
    version: {
      type: String,
      required: false
    },
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ isActive: 1, expiresAt: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for notification ID
notificationSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Static method to create notification
notificationSchema.statics.createNotification = function(notificationData) {
  const {
    user = null,
    type,
    title,
    message,
    data = null,
    priority = 'medium',
    actionUrl = null,
    actionText = null,
    expiresAt = null,
    metadata = {}
  } = notificationData;

  return this.create({
    user,
    type,
    title,
    message,
    data,
    priority,
    actionUrl,
    actionText,
    expiresAt,
    metadata
  });
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const query = {
    $or: [
      { user: userId },
      { user: null } // System-wide notifications
    ],
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };

  if (options.unreadOnly) {
    query.isRead = false;
  }

  if (options.type) {
    query.type = options.type;
  }

  if (options.priority) {
    query.priority = options.priority;
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get system notifications
notificationSchema.statics.getSystemNotifications = function(options = {}) {
  const query = { user: null, isActive: true };

  if (options.type) {
    query.type = options.type;
  }

  if (options.priority) {
    query.priority = options.priority;
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds = []) {
  const query = { user: userId, isRead: false };
  
  if (notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }

  return this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    $or: [
      { user: userId },
      { user: null }
    ],
    isRead: false,
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      isActive: true
    },
    {
      isActive: false
    }
  );
};

// Static method to bulk create notifications
notificationSchema.statics.bulkCreate = function(notifications) {
  return this.insertMany(notifications);
};

// Static method to get notification statistics
notificationSchema.statics.getStats = function(startDate = null, endDate = null) {
  const match = {};
  
  if (startDate && endDate) {
    match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        unreadNotifications: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        readNotifications: {
          $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] }
        },
        typeCounts: {
          $push: '$type'
        },
        priorityCounts: {
          $push: '$priority'
        }
      }
    }
  ]);
};

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

export default mongoose.model('Notification', notificationSchema);
