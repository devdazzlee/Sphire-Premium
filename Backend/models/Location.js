import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'Pakistan'
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  }
});

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['warehouse', 'store', 'pickup_point', 'shipping_zone'],
    required: [true, 'Location type is required']
  },
  code: {
    type: String,
    required: [true, 'Location code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Location code cannot be more than 10 characters']
  },
  address: addressSchema,
  contact: {
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[\+]?[0-9\-\s\(\)\.]{7,20}$/.test(v);
      },
        message: 'Please provide a valid phone number'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please provide a valid email'
      }
    }
  },
  manager: {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Manager name cannot be more than 50 characters']
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  capacity: {
    storage: {
      type: Number,
      min: [0, 'Storage capacity cannot be negative']
    },
    unit: {
      type: String,
      enum: ['sqft', 'sqm', 'units'],
      default: 'sqft'
    }
  },
  services: [{
    type: String,
    enum: ['pickup', 'delivery', 'storage', 'packaging', 'shipping']
  }],
  deliveryZones: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    cities: [String],
    deliveryTime: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 3 }
    },
    deliveryCost: {
      type: Number,
      default: 0,
      min: [0, 'Delivery cost cannot be negative']
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 0,
      min: [0, 'Free delivery threshold cannot be negative']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  lastInventoryUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
locationSchema.index({ type: 1, isActive: 1 });
locationSchema.index({ code: 1 });
locationSchema.index({ 'address.city': 1, 'address.state': 1 });
locationSchema.index({ isDefault: 1 });

// Virtual for location ID
locationSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Virtual for full address
locationSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  
  const { street, city, state, zipCode, country } = this.address;
  return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
});

// Static method to get active locations by type
locationSchema.statics.getActiveByType = function(type) {
  return this.find({ type, isActive: true }).sort({ name: 1 });
};

// Static method to get default location
locationSchema.statics.getDefault = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

// Static method to find locations by city
locationSchema.statics.findByCity = function(city) {
  return this.find({
    'address.city': new RegExp(city, 'i'),
    isActive: true
  });
};

// Static method to get delivery zones for a city
locationSchema.statics.getDeliveryZones = function(city) {
  return this.find({
    type: { $in: ['warehouse', 'store'] },
    isActive: true,
    'deliveryZones.cities': new RegExp(city, 'i')
  });
};

// Method to add delivery zone
locationSchema.methods.addDeliveryZone = function(zoneData) {
  this.deliveryZones.push(zoneData);
  return this.save();
};

// Method to update delivery zone
locationSchema.methods.updateDeliveryZone = function(zoneId, zoneData) {
  const zone = this.deliveryZones.id(zoneId);
  if (zone) {
    Object.assign(zone, zoneData);
  }
  return this.save();
};

// Method to remove delivery zone
locationSchema.methods.removeDeliveryZone = function(zoneId) {
  this.deliveryZones.pull(zoneId);
  return this.save();
};

// Method to calculate delivery cost for an order
locationSchema.methods.calculateDeliveryCost = function(city, orderValue = 0) {
  const zone = this.deliveryZones.find(z => 
    z.cities.some(c => new RegExp(city, 'i').test(c))
  );
  
  if (!zone) {
    return null; // No delivery to this city
  }
  
  if (orderValue >= zone.freeDeliveryThreshold) {
    return 0; // Free delivery
  }
  
  return zone.deliveryCost;
};

// Method to check if location serves a city
locationSchema.methods.servesCity = function(city) {
  return this.deliveryZones.some(zone =>
    zone.cities.some(c => new RegExp(city, 'i').test(c))
  );
};

export default mongoose.model('Location', locationSchema);