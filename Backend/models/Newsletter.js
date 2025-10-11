import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    enum: ['footer', 'popup', 'checkout', 'other'],
    default: 'footer'
  },
  preferences: {
    newArrivals: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    productUpdates: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Index for faster queries
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1 });
newsletterSchema.index({ subscribedAt: -1 });

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function() {
  this.isActive = true;
  this.unsubscribedAt = null;
  return this.save();
};

// Static method to get active subscribers count
newsletterSchema.statics.getActiveCount = function() {
  return this.countDocuments({ isActive: true });
};

// Static method to get subscribers by date range
newsletterSchema.statics.getSubscribersByDateRange = function(startDate, endDate) {
  return this.find({
    subscribedAt: {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true
  }).sort({ subscribedAt: -1 });
};

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;

