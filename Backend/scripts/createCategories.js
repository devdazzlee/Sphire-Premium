import mongoose from 'mongoose';
import Category from '../models/Category.js';

// Sample categories data
const sampleCategories = [
  {
    name: 'Electronics',
    description: 'Latest electronic gadgets and devices',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Home & Garden',
    description: 'Everything for your home and garden',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Beauty & Health',
    description: 'Beauty products and health supplements',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Sports & Fitness',
    description: 'Sports equipment and fitness gear',
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Books',
    description: 'Books for all ages and interests',
    isActive: true,
    sortOrder: 6
  }
];

async function createCategories() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create new categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`Created ${createdCategories.length} categories:`);
    
    createdCategories.forEach(category => {
      console.log(`- ${category.name} (${category.slug})`);
    });

    console.log('\nCategories created successfully!');
    console.log('You can now use the product creation form with categories.');

  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

createCategories();
