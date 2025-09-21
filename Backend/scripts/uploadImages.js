import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: './config.env' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sample product images (you can replace these with actual local images)
const productImages = [
  {
    name: 'luxury-serum-1',
    localPath: './images/luxury-serum-1.jpg', // Replace with actual local image path
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-serum-2',
    localPath: './images/luxury-serum-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-moisturizer-1',
    localPath: './images/luxury-moisturizer-1.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-moisturizer-2',
    localPath: './images/luxury-moisturizer-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-cleanser-1',
    localPath: './images/luxury-cleanser-1.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-cleanser-2',
    localPath: './images/luxury-cleanser-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-eye-cream-1',
    localPath: './images/luxury-eye-cream-1.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-eye-cream-2',
    localPath: './images/luxury-eye-cream-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-mask-1',
    localPath: './images/luxury-mask-1.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-mask-2',
    localPath: './images/luxury-mask-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-toner-1',
    localPath: './images/luxury-toner-1.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-toner-2',
    localPath: './images/luxury-toner-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-scrub-1',
    localPath: './images/luxury-scrub-1.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-scrub-2',
    localPath: './images/luxury-scrub-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-mist-1',
    localPath: './images/luxury-mist-1.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-mist-2',
    localPath: './images/luxury-mist-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-gift-set-1',
    localPath: './images/luxury-gift-set-1.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-gift-set-2',
    localPath: './images/luxury-gift-set-2.jpg',
    folder: 'ecommerce/products'
  },
  {
    name: 'luxury-gift-set-3',
    localPath: './images/luxury-gift-set-3.jpg',
    folder: 'ecommerce/products'
  }
];

// Function to upload image to Cloudinary
const uploadImage = async (imageData) => {
  try {
    // Check if local file exists
    if (!fs.existsSync(imageData.localPath)) {
      console.log(`Local image not found: ${imageData.localPath}`);
      return null;
    }

    const result = await cloudinary.uploader.upload(imageData.localPath, {
      folder: imageData.folder,
      public_id: imageData.name,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'fill', quality: 'auto' },
        { format: 'webp' }
      ]
    });

    console.log(`✅ Uploaded: ${imageData.name} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading ${imageData.name}:`, error.message);
    return null;
  }
};

// Function to upload all images
const uploadAllImages = async () => {
  console.log('🚀 Starting image upload to Cloudinary...\n');
  
  const uploadedImages = {};
  
  for (const imageData of productImages) {
    const url = await uploadImage(imageData);
    if (url) {
      uploadedImages[imageData.name] = url;
    }
  }
  
  console.log('\n📋 Upload Summary:');
  console.log('==================');
  console.log(JSON.stringify(uploadedImages, null, 2));
  
  return uploadedImages;
};

// Run the upload
uploadAllImages()
  .then((images) => {
    console.log('\n✅ Image upload completed!');
    console.log('Copy the URLs above to use in your product data.');
  })
  .catch((error) => {
    console.error('❌ Upload failed:', error);
  });
