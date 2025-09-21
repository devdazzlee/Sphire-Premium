import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Location from '../models/Location.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

const sampleCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronic gadgets and devices',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing and accessories',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Beauty & Health',
    slug: 'beauty-health',
    description: 'Beauty products and health supplements',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Sports equipment and fitness gear',
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Books for all ages and interests',
    isActive: true,
    sortOrder: 6
  }
];

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 15999,
    originalPrice: 19999,
    images: ['https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/wireless-headphones.png'],
    category: 'electronics',
    subcategory: 'audio',
    brand: 'TechSound',
    inStock: true,
    stockQuantity: 50,
    rating: 4.5,
    reviewCount: 128,
    features: ['Noise Cancellation', '30-hour Battery', 'Quick Charge', 'Bluetooth 5.0'],
    tags: ['wireless', 'bluetooth', 'headphones', 'audio'],
    isActive: true,
    isFeatured: true,
    isNew: true,
    isOnSale: true
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and water resistance.',
    price: 23999,
    originalPrice: 27999,
    images: ['https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/smartwatch-lifestyle.png'],
    category: 'electronics',
    subcategory: 'wearables',
    brand: 'FitTech',
    inStock: true,
    stockQuantity: 30,
    rating: 4.7,
    reviewCount: 89,
    features: ['Heart Rate Monitor', 'GPS Tracking', 'Water Resistant', '7-day Battery'],
    tags: ['smartwatch', 'fitness', 'tracker', 'health'],
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: 'Premium Laptop Stand',
    description: 'Adjustable aluminum laptop stand for better ergonomics and cooling.',
    price: 7199,
    images: ['https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/laptop-stand.png'],
    category: 'electronics',
    subcategory: 'accessories',
    brand: 'ErgoTech',
    inStock: true,
    stockQuantity: 75,
    rating: 4.3,
    reviewCount: 156,
    features: ['Adjustable Height', 'Aluminum Build', 'Non-slip Base', 'Portable'],
    tags: ['laptop', 'stand', 'ergonomic', 'aluminum'],
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: false
  },
  {
    name: 'High-Speed USB-C Cable',
    description: 'Durable USB-C to USB-C cable with fast charging and data transfer capabilities.',
    price: 1999,
    images: ['https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/usb-cable.png'],
    category: 'electronics',
    subcategory: 'cables',
    brand: 'CablePro',
    inStock: true,
    stockQuantity: 200,
    rating: 4.1,
    reviewCount: 203,
    features: ['Fast Charging', 'Data Transfer', 'Durable Build', '6ft Length'],
    tags: ['usb-c', 'cable', 'charging', 'data'],
    isActive: true,
    isFeatured: false,
    isNew: true,
    isOnSale: false
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 360-degree sound and 12-hour battery life.',
    price: 6399,
    originalPrice: 7999,
    images: ['https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/bluetooth-speaker.png'],
    category: 'electronics',
    subcategory: 'audio',
    brand: 'SoundWave',
    inStock: true,
    stockQuantity: 40,
    rating: 4.4,
    reviewCount: 92,
    features: ['360° Sound', '12-hour Battery', 'Water Resistant', 'Voice Assistant'],
    tags: ['speaker', 'bluetooth', 'portable', 'audio'],
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: 'Gaming Mouse',
    description: 'High-precision gaming mouse with customizable RGB lighting and programmable buttons.',
    price: 5599,
    images: ['https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/gaming-mouse.png'],
    category: 'electronics',
    subcategory: 'gaming',
    brand: 'GameTech',
    inStock: true,
    stockQuantity: 60,
    rating: 4.6,
    reviewCount: 147,
    features: ['High DPI', 'RGB Lighting', 'Programmable Buttons', 'Ergonomic Design'],
    tags: ['gaming', 'mouse', 'rgb', 'precision'],
    isActive: true,
    isFeatured: false,
    isNew: true,
    isOnSale: false
  }
];

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '+1234567890',
    role: 'user',
    isActive: true,
    addresses: [{
      type: 'home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      isDefault: true
    }]
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    phone: '+1234567891',
    role: 'user',
    isActive: true,
    addresses: [{
      type: 'home',
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'United States',
      isDefault: true
    }]
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '+1234567892',
    role: 'admin',
    isActive: true,
    addresses: [{
      type: 'work',
      street: '789 Business Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'United States',
      isDefault: true
    }]
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create products
    console.log('Creating products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products`);

    // Create sample orders
    console.log('Creating sample orders...');
    const sampleOrders = [
      {
        user: createdUsers[0]._id,
        orderNumber: Order.generateOrderNumber(),
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            price: createdProducts[0].price,
            quantity: 1,
            image: createdProducts[0].images[0]
          }
        ],
        shippingAddress: createdUsers[0].addresses[0],
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        subtotal: createdProducts[0].price,
        shippingCost: 10.00,
        tax: 20.00,
        total: createdProducts[0].price + 10.00 + 20.00,
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user: createdUsers[1]._id,
        orderNumber: Order.generateOrderNumber(),
        items: [
          {
            product: createdProducts[1]._id,
            name: createdProducts[1].name,
            price: createdProducts[1].price,
            quantity: 1,
            image: createdProducts[1].images[0]
          },
          {
            product: createdProducts[2]._id,
            name: createdProducts[2].name,
            price: createdProducts[2].price,
            quantity: 2,
            image: createdProducts[2].images[0]
          }
        ],
        shippingAddress: createdUsers[1].addresses[0],
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'processing',
        subtotal: createdProducts[1].price + (createdProducts[2].price * 2),
        shippingCost: 15.00,
        tax: 45.00,
        total: createdProducts[1].price + (createdProducts[2].price * 2) + 15.00 + 45.00
      },
      {
        user: createdUsers[0]._id,
        orderNumber: Order.generateOrderNumber(),
        items: [
          {
            product: createdProducts[4]._id,
            name: createdProducts[4].name,
            price: createdProducts[4].price,
            quantity: 1,
            image: createdProducts[4].images[0]
          }
        ],
        shippingAddress: createdUsers[0].addresses[0],
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        orderStatus: 'shipped',
        subtotal: createdProducts[4].price,
        shippingCost: 10.00,
        tax: 18.00,
        total: createdProducts[4].price + 10.00 + 18.00,
        trackingNumber: 'TRK123456789',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`Created ${createdOrders.length} orders`);

    // Create sample reviews
    console.log('Creating sample reviews...');
    const sampleReviews = [
      {
        user: createdUsers[0]._id,
        product: createdProducts[0]._id,
        order: createdOrders[0]._id,
        rating: 5,
        title: 'Excellent headphones!',
        comment: 'Great sound quality and comfortable to wear for long periods.',
        isVerified: true,
        isApproved: true,
        isPublished: true
      },
      {
        user: createdUsers[1]._id,
        product: createdProducts[1]._id,
        order: createdOrders[1]._id,
        rating: 4,
        title: 'Good fitness tracker',
        comment: 'Tracks activities well, battery life could be better.',
        isVerified: true,
        isApproved: false,
        isPublished: false
      },
      {
        user: createdUsers[0]._id,
        product: createdProducts[2]._id,
        order: createdOrders[2]._id,
        rating: 5,
        title: 'Perfect laptop stand',
        comment: 'Sturdy and adjustable, exactly what I needed.',
        isVerified: true,
        isApproved: true,
        isPublished: true
      }
    ];

    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`Created ${createdReviews.length} reviews`);

    // Create sample locations
    console.log('Creating sample locations...');
    const sampleLocations = [
      {
        name: 'Main Warehouse - Karachi',
        type: 'warehouse',
        description: 'Primary distribution center',
        address: {
          street: 'Industrial Area Block 6',
          city: 'Karachi',
          state: 'Sindh',
          zipCode: '75000',
          country: 'Pakistan'
        },
        contactInfo: {
          phone: '+92-21-1234567',
          email: 'warehouse@example.com',
          manager: 'Ahmed Ali'
        },
        services: ['storage', 'packaging', 'pickup'],
        shippingZones: [{
          name: 'Karachi Metro',
          description: 'Karachi metropolitan area',
          areas: ['Karachi', '75000', '75100', '75200'],
          deliveryDays: { min: 1, max: 2 },
          shippingCost: 200,
          freeShippingThreshold: 5000,
          isActive: true
        }],
        isActive: true,
        isDefault: true,
        inventory: [
          { product: createdProducts[0]._id, quantity: 50, reserved: 0 },
          { product: createdProducts[1]._id, quantity: 30, reserved: 0 },
          { product: createdProducts[2]._id, quantity: 75, reserved: 0 }
        ]
      },
      {
        name: 'Lahore Store',
        type: 'store',
        description: 'Retail store in Lahore',
        address: {
          street: 'Gulberg Main Boulevard',
          city: 'Lahore',
          state: 'Punjab',
          zipCode: '54600',
          country: 'Pakistan'
        },
        contactInfo: {
          phone: '+92-42-9876543',
          email: 'lahore@example.com',
          manager: 'Fatima Khan'
        },
        services: ['pickup', 'delivery'],
        shippingZones: [{
          name: 'Lahore City',
          description: 'Lahore city delivery',
          areas: ['Lahore', '54600', '54700'],
          deliveryDays: { min: 2, max: 3 },
          shippingCost: 300,
          freeShippingThreshold: 7000,
          isActive: true
        }],
        isActive: true,
        isDefault: false,
        inventory: [
          { product: createdProducts[3]._id, quantity: 100, reserved: 0 },
          { product: createdProducts[4]._id, quantity: 25, reserved: 0 }
        ]
      }
    ];

    const createdLocations = await Location.insertMany(sampleLocations);
    console.log(`Created ${createdLocations.length} locations`);

    // Create default settings
    console.log('Creating default settings...');
    const defaultSettings = {
      businessInfo: {
        name: 'TechStore Pakistan',
        tagline: 'Your Premier Tech Destination',
        description: 'Leading electronics and technology retailer in Pakistan',
        email: 'info@techstore.pk',
        phone: '+92-XXX-XXXXXXX',
        address: {
          street: '123 Business District',
          city: 'Karachi',
          state: 'Sindh',
          zipCode: '75000',
          country: 'Pakistan'
        }
      },
      shipping: {
        defaultShippingCost: 200,
        freeShippingThreshold: 5000
      },
      currency: {
        primary: 'PKR',
        symbol: '₨',
        position: 'before'
      },
      timezone: 'Asia/Karachi',
      language: 'en',
      dateFormat: 'DD/MM/YYYY'
    };

    const settings = new Settings(defaultSettings);
    await settings.save();
    console.log('Created default settings');

    // Create sample activity logs
    console.log('Creating sample activity logs...');
    const sampleActivityLogs = [
      {
        user: createdUsers[2]._id, // Admin user
        action: 'create_product',
        entityType: 'product',
        entityId: createdProducts[0]._id,
        entityName: createdProducts[0].name,
        description: `Created product: ${createdProducts[0].name}`,
        severity: 'low',
        status: 'success'
      },
      {
        user: createdUsers[2]._id,
        action: 'approve_review',
        entityType: 'review',
        entityId: createdReviews[0]._id,
        entityName: `Review for ${createdProducts[0].name}`,
        description: `Approved review by ${createdUsers[0].name}`,
        severity: 'low',
        status: 'success'
      },
      {
        user: createdUsers[2]._id,
        action: 'update_order',
        entityType: 'order',
        entityId: createdOrders[0]._id,
        entityName: createdOrders[0].orderNumber,
        description: `Updated order status to delivered`,
        severity: 'medium',
        status: 'success'
      }
    ];

    const createdActivityLogs = await ActivityLog.insertMany(sampleActivityLogs);
    console.log(`Created ${createdActivityLogs.length} activity logs`);

    // Create sample notifications
    console.log('Creating sample notifications...');
    const sampleNotifications = [
      {
        user: null, // System-wide notification
        type: 'general',
        title: 'Welcome to TechStore Pakistan',
        message: 'Thank you for choosing TechStore Pakistan. Explore our latest products and enjoy fast delivery across Pakistan.',
        priority: 'medium',
        isRead: false,
        isActive: true,
        actionUrl: '/products',
        actionText: 'Browse Products',
        metadata: {
          source: 'system',
          tags: ['welcome', 'general']
        }
      },
      {
        user: createdUsers[0]._id, // John Doe
        type: 'order_update',
        title: 'Order Shipped',
        message: `Your order #${createdOrders[0].orderNumber} has been shipped and is on its way to you.`,
        priority: 'high',
        isRead: false,
        isActive: true,
        data: {
          orderId: createdOrders[0]._id,
          orderNumber: createdOrders[0].orderNumber
        },
        actionUrl: `/orders/${createdOrders[0]._id}`,
        actionText: 'Track Order',
        metadata: {
          source: 'order_system',
          tags: ['shipping', 'order']
        }
      },
      {
        user: createdUsers[1]._id, // Jane Smith
        type: 'payment_received',
        title: 'Payment Confirmed',
        message: `Payment for order #${createdOrders[1].orderNumber} has been received and your order is being processed.`,
        priority: 'high',
        isRead: false,
        isActive: true,
        data: {
          orderId: createdOrders[1]._id,
          orderNumber: createdOrders[1].orderNumber,
          amount: createdOrders[1].total
        },
        actionUrl: `/orders/${createdOrders[1]._id}`,
        actionText: 'View Order',
        metadata: {
          source: 'payment_system',
          tags: ['payment', 'order']
        }
      },
      {
        user: createdUsers[2]._id, // Admin user
        type: 'new_review',
        title: 'New Product Review',
        message: `A new review has been submitted for ${createdProducts[0].name}. Please review and approve.`,
        priority: 'medium',
        isRead: false,
        isActive: true,
        data: {
          productId: createdProducts[0]._id,
          reviewId: createdReviews[0]._id,
          rating: createdReviews[0].rating
        },
        actionUrl: `/reviews`,
        actionText: 'Review Now',
        metadata: {
          source: 'review_system',
          tags: ['review', 'moderation']
        }
      },
      {
        user: createdUsers[2]._id, // Admin user
        type: 'inventory_low',
        title: 'Low Stock Alert',
        message: `${createdProducts[1].name} is running low on stock. Current quantity: ${createdProducts[1].stockQuantity}`,
        priority: 'high',
        isRead: false,
        isActive: true,
        data: {
          productId: createdProducts[1]._id,
          productName: createdProducts[1].name,
          currentStock: createdProducts[1].stockQuantity
        },
        actionUrl: `/products/${createdProducts[1]._id}`,
        actionText: 'Manage Stock',
        metadata: {
          source: 'inventory_system',
          tags: ['inventory', 'stock']
        }
      }
    ];

    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(`Created ${createdNotifications.length} notifications`);

    console.log('Database seeded successfully!');
    console.log('\nSample Admin Login:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    console.log('\nSample User Logins:');
    console.log('Email: john.doe@example.com, Password: password123');
    console.log('Email: jane.smith@example.com, Password: password123');
    
    console.log('\nDatabase Summary:');
    console.log(`- ${createdCategories.length} categories`);
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdProducts.length} products`);
    console.log(`- ${createdOrders.length} orders`);
    console.log(`- ${createdReviews.length} reviews`);
    console.log(`- ${createdLocations.length} locations`);
    console.log(`- 1 settings configuration`);
    console.log(`- ${createdActivityLogs.length} activity logs`);
    console.log(`- ${createdNotifications.length} notifications`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDatabase();
