import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  businessInfo: {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      maxlength: [100, 'Business name cannot be more than 100 characters']
    },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot be more than 200 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    email: {
      type: String,
      required: [true, 'Business email is required'],
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please provide a valid email'
      }
    },
    phone: {
      type: String,
      required: [true, 'Business phone is required'],
      validate: {
        validator: function(v) {
          return /^[\+]?[0-9\-\s\(\)\.]{7,20}$/.test(v);
        },
        message: 'Please provide a valid phone number'
      }
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      zipCode: {
        type: String,
        required: [true, 'ZIP code is required']
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'Pakistan'
      }
    },
    logo: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
        },
        message: 'Invalid logo URL format'
      }
    },
    favicon: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(v);
        },
        message: 'Invalid favicon URL format'
      }
    }
  },
  shipping: {
    defaultShippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    freeShippingThreshold: {
      type: Number,
      default: 0,
      min: [0, 'Free shipping threshold cannot be negative']
    },
    processingTime: {
      type: Number,
      default: 1,
      min: [0, 'Processing time cannot be negative']
    },
    shippingMethods: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      cost: {
        type: Number,
        required: true,
        min: [0, 'Shipping cost cannot be negative']
      },
      estimatedDays: {
        min: {
          type: Number,
          required: true,
          min: [0, 'Minimum days cannot be negative']
        },
        max: {
          type: Number,
          required: true,
          min: [0, 'Maximum days cannot be negative']
        }
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  payment: {
    acceptedMethods: [{
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery', 'digital_wallet', 'cryptocurrency']
    }],
    currency: {
      primary: {
        type: String,
        default: 'PKR',
        uppercase: true
      },
      symbol: {
        type: String,
        default: '₨'
      },
      position: {
        type: String,
        enum: ['before', 'after'],
        default: 'before'
      }
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    invoicePrefix: {
      type: String,
      default: 'INV',
      uppercase: true
    }
  },
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      smtp: {
        host: String,
        port: Number,
        secure: Boolean,
        auth: {
          user: String,
          pass: String
        }
      },
      fromEmail: {
        type: String,
        lowercase: true
      },
      fromName: String
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: String,
      apiKey: String,
      fromNumber: String
    },
    push: {
      enabled: {
        type: Boolean,
        default: false
      },
      vapidKeys: {
        publicKey: String,
        privateKey: String
      }
    }
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    metaKeywords: [String],
    googleAnalyticsId: String,
    facebookPixelId: String,
    customHeadCode: String,
    customFooterCode: String
  },
  socialMedia: {
    facebook: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?facebook\.com\/.+/.test(v);
        },
        message: 'Invalid Facebook URL'
      }
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?twitter\.com\/.+/.test(v);
        },
        message: 'Invalid Twitter URL'
      }
    },
    instagram: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?instagram\.com\/.+/.test(v);
        },
        message: 'Invalid Instagram URL'
      }
    },
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
        },
        message: 'Invalid LinkedIn URL'
      }
    },
    youtube: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?youtube\.com\/.+/.test(v);
        },
        message: 'Invalid YouTube URL'
      }
    }
  },
  maintenance: {
    isMaintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      maxlength: [500, 'Maintenance message cannot be more than 500 characters']
    },
    allowedIPs: [String]
  },
  security: {
    sessionTimeout: {
      type: Number,
      default: 3600, // 1 hour in seconds
      min: [300, 'Session timeout cannot be less than 5 minutes']
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: [3, 'Max login attempts cannot be less than 3']
    },
    lockoutDuration: {
      type: Number,
      default: 900, // 15 minutes in seconds
      min: [300, 'Lockout duration cannot be less than 5 minutes']
    },
    requireEmailVerification: {
      type: Boolean,
      default: false
    },
    requireTwoFactor: {
      type: Boolean,
      default: false
    }
  },
  system: {
    timezone: {
      type: String,
      default: 'Asia/Karachi'
    },
    language: {
      type: String,
      default: 'en'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    itemsPerPage: {
      type: Number,
      default: 20,
      min: [5, 'Items per page cannot be less than 5'],
      max: [100, 'Items per page cannot be more than 100']
    },
    autoBackup: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
      },
      retentionDays: {
        type: Number,
        default: 30,
        min: [7, 'Retention cannot be less than 7 days']
      }
    }
  },
  features: {
    reviews: {
      enabled: {
        type: Boolean,
        default: true
      },
      requireApproval: {
        type: Boolean,
        default: true
      },
      allowImages: {
        type: Boolean,
        default: true
      }
    },
    wishlist: {
      enabled: {
        type: Boolean,
        default: true
      }
    },
    compare: {
      enabled: {
        type: Boolean,
        default: true
      },
      maxItems: {
        type: Number,
        default: 4,
        min: [2, 'Max compare items cannot be less than 2']
      }
    },
    coupons: {
      enabled: {
        type: Boolean,
        default: true
      }
    },
    giftCards: {
      enabled: {
        type: Boolean,
        default: false
      }
    },
    loyalty: {
      enabled: {
        type: Boolean,
        default: false
      },
      pointsPerDollar: {
        type: Number,
        default: 1,
        min: [0.1, 'Points per dollar cannot be less than 0.1']
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
settingsSchema.index({ isActive: 1 });

// Virtual for settings ID
settingsSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Static method to get active settings
settingsSchema.statics.getActive = function() {
  return this.findOne({ isActive: true });
};

// Static method to update settings
settingsSchema.statics.updateSettings = function(updates) {
  return this.findOneAndUpdate(
    { isActive: true },
    { $set: updates },
    { new: true, upsert: true }
  );
};

// Method to get formatted currency
settingsSchema.methods.formatCurrency = function(amount) {
  const { primary, symbol, position } = this.payment.currency;
  
  if (position === 'before') {
    return `${symbol} ${amount.toLocaleString()}`;
  } else {
    return `${amount.toLocaleString()} ${symbol}`;
  }
};

// Method to get business address as string
settingsSchema.methods.getFullAddress = function() {
  const { address } = this.businessInfo;
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
};

export default mongoose.model('Settings', settingsSchema);