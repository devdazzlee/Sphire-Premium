import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'login', 'logout', 'create', 'update', 'delete', 'view', 'export',
      'approve', 'reject', 'activate', 'deactivate', 'upload', 'download',
      'send_email', 'send_notification', 'backup', 'restore', 'import'
    ]
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    enum: ['user', 'product', 'order', 'category', 'review', 'location', 'settings', 'inventory']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Optional, for actions that don't target specific resources
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null // Store additional context data
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  sessionId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    required: false
  },
  metadata: {
    module: {
      type: String,
      required: false
    },
    feature: {
      type: String,
      required: false
    },
    version: {
      type: String,
      required: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, createdAt: -1 });
activityLogSchema.index({ resourceId: 1 });
activityLogSchema.index({ status: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ ipAddress: 1 });

// Virtual for log ID
activityLogSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Virtual for formatted timestamp
activityLogSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleString();
});

// Static method to log user activity
activityLogSchema.statics.logActivity = function(data) {
  const {
    user,
    action,
    resource,
    resourceId = null,
    description,
    details = null,
    ipAddress = null,
    userAgent = null,
    sessionId = null,
    status = 'success',
    errorMessage = null,
    metadata = {}
  } = data;

  return this.create({
    user,
    action,
    resource,
    resourceId,
    description,
    details,
    ipAddress,
    userAgent,
    sessionId,
    status,
    errorMessage,
    metadata
  });
};

// Static method to get user activity
activityLogSchema.statics.getUserActivity = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.action) {
    query.action = options.action;
  }
  
  if (options.resource) {
    query.resource = options.resource;
  }
  
  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get system activity
activityLogSchema.statics.getSystemActivity = function(options = {}) {
  const query = {};
  
  if (options.action) {
    query.action = options.action;
  }
  
  if (options.resource) {
    query.resource = options.resource;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get activity statistics
activityLogSchema.statics.getActivityStats = function(startDate = null, endDate = null) {
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
        totalActivities: { $sum: 1 },
        successfulActivities: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failedActivities: {
          $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
        },
        uniqueUsers: { $addToSet: '$user' },
        actionCounts: {
          $push: {
            action: '$action',
            resource: '$resource'
          }
        }
      }
    },
    {
      $project: {
        totalActivities: 1,
        successfulActivities: 1,
        failedActivities: 1,
        uniqueUserCount: { $size: '$uniqueUsers' },
        successRate: {
          $multiply: [
            { $divide: ['$successfulActivities', '$totalActivities'] },
            100
          ]
        }
      }
    }
  ]);
};

// Static method to get recent activities
activityLogSchema.statics.getRecentActivity = function(limit = 10) {
  return this.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to cleanup old logs
activityLogSchema.statics.cleanupOldLogs = function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate }
  });
};

// Static method to get user login history
activityLogSchema.statics.getUserLoginHistory = function(userId, limit = 20) {
  return this.find({
    user: userId,
    action: 'login'
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get security events
activityLogSchema.statics.getSecurityEvents = function(options = {}) {
  const query = {
    $or: [
      { action: 'login' },
      { action: 'logout' },
      { status: 'failure' }
    ]
  };
  
  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export default mongoose.model('ActivityLog', activityLogSchema);