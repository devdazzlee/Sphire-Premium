import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../config.env') });

const deleteAllProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    console.log('⚠️  WARNING: This will delete ALL products from the database!');
    console.log('⚠️  This action cannot be undone!');
    console.log('');

    // Count existing products
    const productCount = await Product.countDocuments();
    console.log(`Found ${productCount} products in the database`);

    if (productCount === 0) {
      console.log('✅ No products to delete');
      process.exit(0);
    }

    console.log('');
    console.log('Deleting all products in 3 seconds...');
    console.log('Press Ctrl+C to cancel');
    
    // Wait 3 seconds before deleting
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete all products
    const result = await Product.deleteMany({});
    
    console.log('');
    console.log(`✅ Successfully deleted ${result.deletedCount} products`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting products:', error);
    process.exit(1);
  }
};

// Run the script
deleteAllProducts();

