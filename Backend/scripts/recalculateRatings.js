import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../config.env') });

// Import models
import Product from '../models/Product.js';
import Review from '../models/Review.js';

/**
 * Recalculate ratings for all products based on approved reviews
 */
async function recalculateAllRatings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);

    let updatedCount = 0;
    let errorCount = 0;

    // Process each product
    for (const product of products) {
      try {
        console.log(`Processing: ${product.name} (${product._id})`);

        // Calculate stats for this product
        const stats = await Review.aggregate([
          {
            $match: {
              product: product._id,
              isApproved: true,
              isActive: true
            }
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 }
            }
          }
        ]);

        let newRating = 0;
        let newReviewCount = 0;

        if (stats.length > 0) {
          newRating = parseFloat(stats[0].averageRating.toFixed(1));
          newReviewCount = stats[0].totalReviews;
        }

        // Update product
        await Product.findByIdAndUpdate(product._id, {
          rating: newRating,
          reviewCount: newReviewCount
        });

        console.log(`  Old: ${product.rating} (${product.reviewCount} reviews)`);
        console.log(`  New: ${newRating} (${newReviewCount} reviews)`);
        console.log(`  ✅ Updated\n`);
        
        updatedCount++;
      } catch (error) {
        console.error(`  ❌ Error updating ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total products: ${products.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
recalculateAllRatings();

