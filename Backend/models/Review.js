import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false // Optional, for verified purchase reviews
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  adminResponse: {
    text: {
      type: String,
      maxlength: [500, 'Admin response cannot be more than 500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderationNotes: {
    type: String,
    maxlength: [500, 'Moderation notes cannot be more than 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reviewSchema.index({ product: 1, isApproved: 1, isActive: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isVerifiedPurchase: 1 });

// Virtual for review ID
reviewSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Virtual for user info (populated)
reviewSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Virtual for product info (populated)
reviewSchema.virtual('productInfo', {
  ref: 'Product',
  localField: 'product',
  foreignField: '_id',
  justOne: true
});

// Static method to get reviews by product
reviewSchema.statics.getByProduct = function(productId, options = {}) {
  const query = {
    product: productId,
    isApproved: true,
    isActive: true
  };

  if (options.verifiedOnly) {
    query.isVerifiedPurchase = true;
  }

  return this.find(query)
    .populate('user', 'name avatar')
    .sort({ isVerifiedPurchase: -1, helpfulVotes: -1, createdAt: -1 })
    .limit(options.limit || 10);
};

// Static method to get reviews by user
reviewSchema.statics.getByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.approvedOnly) {
    query.isApproved = true;
  }

  return this.find(query)
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to get pending reviews
reviewSchema.statics.getPending = function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ isApproved: false, isActive: true })
    .populate('user', 'name email')
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get review statistics
reviewSchema.statics.getStats = function(productId = null) {
  const match = {};
  if (productId) {
    match.product = productId;
  }
  match.isApproved = true;
  match.isActive = true;

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        verifiedReviews: {
          $sum: { $cond: [{ $eq: ['$isVerifiedPurchase', true] }, 1, 0] }
        }
      }
    }
  ]);
};

// Method to approve review
reviewSchema.methods.approve = function(moderatorId, notes = null) {
  this.isApproved = true;
  if (notes) {
    this.moderationNotes = notes;
  }
  return this.save();
};

// Method to reject review
reviewSchema.methods.reject = function(moderatorId, notes = null) {
  this.isApproved = false;
  this.isActive = false;
  if (notes) {
    this.moderationNotes = notes;
  }
  return this.save();
};

// Method to add admin response
reviewSchema.methods.addAdminResponse = function(responseText, adminId) {
  this.adminResponse = {
    text: responseText,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  return this.save();
};

// Method to report review
reviewSchema.methods.report = function(userId, reason) {
  const existingReport = this.reportedBy.find(
    report => report.user.toString() === userId.toString()
  );
  
  if (!existingReport) {
    this.reportedBy.push({
      user: userId,
      reason: reason,
      reportedAt: new Date()
    });
  }
  
  return this.save();
};

export default mongoose.model('Review', reviewSchema);