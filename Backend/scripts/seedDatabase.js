import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config({ path: './config.env' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sample product data
const sampleProducts = [
  {
    name: "Radiance Renewal Serum",
    description: "A powerful anti-aging serum that brightens and firms skin with vitamin C and hyaluronic acid. This luxurious formula helps reduce fine lines, improve skin texture, and restore youthful radiance.",
    price: 89.99,
    originalPrice: 119.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product1_serum.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product1_detail1.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product1_detail2.jpg"
    ],
    category: "skincare",
    subcategory: "serums",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 50,
    rating: 4.8,
    reviewCount: 324,
    features: ["Vitamin C", "Hyaluronic Acid", "Anti-aging", "Brightening", "Firming"],
    ingredients: ["Vitamin C", "Hyaluronic Acid", "Niacinamide", "Peptides", "Retinol"],
    howToUse: "Apply 2-3 drops to clean skin morning and evening. Follow with moisturizer and SPF during the day.",
    skinType: ["All skin types", "Mature skin", "Dull skin"],
    benefits: ["Reduces fine lines", "Brightens complexion", "Hydrates deeply", "Improves skin texture"],
    tags: ["anti-aging", "vitamin-c", "serum", "luxury", "skincare"],
    weight: 30,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Luxury Hydrating Moisturizer",
    description: "Rich, nourishing moisturizer with ceramides and peptides for ultimate skin hydration. This premium formula provides 24-hour moisture and helps strengthen the skin barrier.",
    price: 65.99,
    originalPrice: 85.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product2_moisturizer.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product2_detail1.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product2_detail2.jpg"
    ],
    category: "skincare",
    subcategory: "moisturizers",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 75,
    rating: 4.7,
    reviewCount: 256,
    features: ["Ceramides", "Peptides", "24-hour hydration", "Anti-aging", "Barrier repair"],
    ingredients: ["Ceramides", "Peptides", "Shea Butter", "Glycerin", "Hyaluronic Acid"],
    howToUse: "Apply to clean skin morning and evening. Massage gently until absorbed.",
    skinType: ["Dry skin", "Mature skin", "Sensitive skin"],
    benefits: ["Deep hydration", "Strengthens skin barrier", "Reduces fine lines", "Soothes irritation"],
    tags: ["moisturizer", "hydration", "ceramides", "anti-aging", "luxury"],
    weight: 50,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Gentle Cleansing Oil",
    description: "Luxurious cleansing oil that removes makeup and impurities while nourishing the skin. This gentle formula is suitable for all skin types and leaves skin feeling soft and clean.",
    price: 45.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product3_cleansing_oil.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product3_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "cleansers",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 60,
    rating: 4.9,
    reviewCount: 189,
    features: ["Makeup removal", "Gentle formula", "Nourishing oils", "Suitable for all skin types"],
    ingredients: ["Jojoba Oil", "Argan Oil", "Vitamin E", "Chamomile Extract"],
    howToUse: "Apply to dry skin, massage gently, then rinse with warm water or remove with a damp cloth.",
    skinType: ["All skin types", "Sensitive skin"],
    benefits: ["Removes makeup", "Cleanses deeply", "Nourishes skin", "Maintains skin balance"],
    tags: ["cleanser", "oil", "makeup-removal", "gentle", "nourishing"],
    weight: 200,
    isActive: true,
    isFeatured: false,
    isNew: true,
    isOnSale: false
  },
  {
    name: "Revitalizing Eye Cream",
    description: "Advanced eye cream that targets dark circles, puffiness, and fine lines around the delicate eye area. This potent formula provides visible results in just 2 weeks.",
    price: 75.99,
    originalPrice: 95.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product4_eye_cream.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product4_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "eye-care",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 40,
    rating: 4.6,
    reviewCount: 142,
    features: ["Reduces dark circles", "Anti-puffiness", "Firming", "Gentle formula"],
    ingredients: ["Caffeine", "Retinol", "Hyaluronic Acid", "Peptides"],
    howToUse: "Gently pat a small amount around the eye area morning and evening.",
    skinType: ["All skin types", "Mature skin"],
    benefits: ["Reduces dark circles", "Minimizes puffiness", "Smooths fine lines", "Brightens eye area"],
    tags: ["eye-cream", "anti-aging", "dark-circles", "puffiness", "luxury"],
    weight: 15,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Purifying Face Mask",
    description: "Deep-cleansing clay mask that purifies pores and leaves skin feeling refreshed and renewed. This weekly treatment helps control oil and improve skin texture.",
    price: 35.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product5_face_mask.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product5_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "masks",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 80,
    rating: 4.5,
    reviewCount: 98,
    features: ["Deep cleansing", "Pore purifying", "Natural clay", "Weekly treatment"],
    ingredients: ["Bentonite Clay", "Kaolin Clay", "Tea Tree Oil", "Aloe Vera"],
    howToUse: "Apply a thin layer to clean skin, avoid eye area. Leave for 10-15 minutes, then rinse with warm water.",
    skinType: ["Oily skin", "Combination skin", "Acne-prone skin"],
    benefits: ["Unclogs pores", "Controls oil", "Improves skin texture", "Refreshes complexion"],
    tags: ["face-mask", "clay", "purifying", "pores", "weekly-treatment"],
    weight: 100,
    isActive: true,
    isFeatured: false,
    isNew: true,
    isOnSale: false
  },
  {
    name: "Nourishing Body Lotion",
    description: "Luxurious body lotion with natural oils and butters for silky smooth, hydrated skin. This fast-absorbing formula provides long-lasting moisture without greasiness.",
    price: 42.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product6_body_lotion.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product6_detail1.jpg"
    ],
    category: "body-care",
    subcategory: "moisturizers",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 100,
    rating: 4.7,
    reviewCount: 203,
    features: ["Natural oils", "Long-lasting hydration", "Fast-absorbing", "Delicate fragrance"],
    ingredients: ["Shea Butter", "Coconut Oil", "Jojoba Oil", "Vitamin E"],
    howToUse: "Apply to clean skin all over the body, focusing on dry areas.",
    skinType: ["All skin types", "Dry skin"],
    benefits: ["Deep moisturization", "Softens skin", "Non-greasy formula", "Pleasant scent"],
    tags: ["body-lotion", "moisturizer", "natural", "hydrating", "luxury"],
    weight: 250,
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: false
  },
  {
    name: "Premium Face Cleanser",
    description: "Gentle yet effective face cleanser that removes dirt, oil, and makeup without stripping the skin. This pH-balanced formula maintains the skin's natural barrier.",
    price: 38.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product7_face_cleanser.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product7_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "cleansers",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 65,
    rating: 4.6,
    reviewCount: 156,
    features: ["Gentle formula", "pH-balanced", "Makeup removal", "Non-stripping"],
    ingredients: ["Glycerin", "Chamomile Extract", "Aloe Vera", "Vitamin E"],
    howToUse: "Wet face, apply cleanser, massage gently, then rinse with warm water.",
    skinType: ["All skin types", "Sensitive skin"],
    benefits: ["Cleanses thoroughly", "Maintains skin barrier", "Soothes irritation", "Removes makeup"],
    tags: ["cleanser", "gentle", "ph-balanced", "makeup-removal", "luxury"],
    weight: 150,
    isActive: true,
    isFeatured: false,
    isNew: true,
    isOnSale: false
  },
  {
    name: "Anti-Aging Night Cream",
    description: "Intensive night cream with retinol and peptides that works while you sleep to reduce fine lines and improve skin texture. Wake up to smoother, more youthful-looking skin.",
    price: 95.99,
    originalPrice: 125.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product8_night_cream.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product8_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "moisturizers",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 35,
    rating: 4.9,
    reviewCount: 287,
    features: ["Retinol", "Peptides", "Night treatment", "Anti-aging", "Intensive"],
    ingredients: ["Retinol", "Peptides", "Hyaluronic Acid", "Niacinamide", "Ceramides"],
    howToUse: "Apply to clean skin before bedtime. Use SPF during the day.",
    skinType: ["Mature skin", "All skin types"],
    benefits: ["Reduces fine lines", "Improves texture", "Boosts collagen", "Hydrates deeply"],
    tags: ["night-cream", "retinol", "anti-aging", "peptides", "luxury"],
    weight: 50,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Vitamin C Brightening Serum",
    description: "Powerful vitamin C serum that brightens skin tone, reduces dark spots, and provides antioxidant protection. This lightweight formula absorbs quickly and delivers visible results.",
    price: 55.99,
    originalPrice: 75.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product9_vitamin_c_serum.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product9_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "serums",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 65,
    rating: 4.7,
    reviewCount: 203,
    features: ["Vitamin C", "Brightening", "Antioxidant", "Lightweight", "Fast-absorbing"],
    ingredients: ["Vitamin C", "Vitamin E", "Ferulic Acid", "Hyaluronic Acid"],
    howToUse: "Apply 2-3 drops to clean skin morning and evening. Follow with moisturizer and SPF.",
    skinType: ["All skin types", "Dull skin", "Uneven skin tone"],
    benefits: ["Brightens complexion", "Reduces dark spots", "Antioxidant protection", "Improves skin texture"],
    tags: ["vitamin-c", "brightening", "serum", "antioxidant", "luxury"],
    weight: 30,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Hydrating Face Mist",
    description: "Refreshing face mist with rose water and hyaluronic acid that instantly hydrates and refreshes skin throughout the day. Perfect for on-the-go hydration.",
    price: 25.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product10_face_mist.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product10_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "mists",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 90,
    rating: 4.4,
    reviewCount: 127,
    features: ["Rose water", "Hyaluronic acid", "Instant hydration", "Refreshing", "Portable"],
    ingredients: ["Rose Water", "Hyaluronic Acid", "Glycerin", "Chamomile Extract"],
    howToUse: "Spray evenly over face and neck. Can be used throughout the day as needed.",
    skinType: ["All skin types", "Dry skin", "Dehydrated skin"],
    benefits: ["Instant hydration", "Refreshes skin", "Soothes irritation", "Sets makeup"],
    tags: ["face-mist", "hydration", "rose-water", "refreshing", "luxury"],
    weight: 100,
    isActive: true,
    isFeatured: false,
    isNew: true,
    isOnSale: false
  },
  {
    name: "Exfoliating Facial Scrub",
    description: "Gentle exfoliating scrub with natural jojoba beads that removes dead skin cells and reveals smoother, brighter skin. Suitable for all skin types.",
    price: 42.99,
    originalPrice: 52.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product11_facial_scrub.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product11_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "exfoliators",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 55,
    rating: 4.5,
    reviewCount: 89,
    features: ["Natural jojoba beads", "Gentle exfoliation", "All skin types", "Brightening"],
    ingredients: ["Jojoba Beads", "Aloe Vera", "Vitamin E", "Chamomile Extract"],
    howToUse: "Apply to wet skin, massage gently in circular motions, then rinse thoroughly.",
    skinType: ["All skin types", "Dull skin"],
    benefits: ["Removes dead skin", "Reveals brighter skin", "Improves texture", "Gentle exfoliation"],
    tags: ["scrub", "exfoliating", "jojoba-beads", "brightening", "luxury"],
    weight: 120,
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Soothing Toner",
    description: "Alcohol-free toner with chamomile and aloe vera that balances skin pH and soothes irritation. Perfect for sensitive skin and daily use.",
    price: 38.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product12_toner.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product12_detail1.jpg"
    ],
    category: "skincare",
    subcategory: "toners",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 70,
    rating: 4.6,
    reviewCount: 156,
    features: ["Alcohol-free", "pH-balancing", "Soothing", "Sensitive skin friendly"],
    ingredients: ["Chamomile Extract", "Aloe Vera", "Rose Water", "Glycerin"],
    howToUse: "Apply to clean skin with cotton pad or spray directly onto face.",
    skinType: ["All skin types", "Sensitive skin", "Irritated skin"],
    benefits: ["Balances pH", "Soothes irritation", "Prepares skin", "Gentle cleansing"],
    tags: ["toner", "soothing", "alcohol-free", "ph-balancing", "luxury"],
    weight: 200,
    isActive: true,
    isFeatured: false,
    isNew: true,
    isOnSale: false
  },
  {
    name: "Luxury Gift Set",
    description: "Premium gift set containing our best-selling products: Radiance Renewal Serum, Luxury Hydrating Moisturizer, and Revitalizing Eye Cream. Perfect for gifting or treating yourself.",
    price: 199.99,
    originalPrice: 249.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product13_gift_set.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product13_detail1.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/product13_detail2.jpg"
    ],
    category: "skincare",
    subcategory: "gift-sets",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 25,
    rating: 4.9,
    reviewCount: 45,
    features: ["Complete skincare routine", "Premium packaging", "Best sellers", "Gift ready"],
    ingredients: ["Multiple products", "Premium ingredients", "Complete formula"],
    howToUse: "Follow individual product instructions for each item in the set.",
    skinType: ["All skin types"],
    benefits: ["Complete routine", "Premium experience", "Great value", "Perfect gift"],
    tags: ["gift-set", "luxury", "complete-routine", "premium", "skincare"],
    weight: 500,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Premium Anti-Aging Night Serum",
    description: "Advanced night serum with retinol and peptides that works while you sleep to reduce fine lines, improve skin texture, and boost collagen production. This luxurious formula provides intensive overnight treatment for mature skin.",
    price: 125.99,
    originalPrice: 155.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-serum-1.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-serum-2.jpg"
    ],
    category: "skincare",
    subcategory: "serums",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 30,
    rating: 4.9,
    reviewCount: 156,
    features: ["Retinol", "Peptides", "Night treatment", "Anti-aging", "Collagen boost"],
    ingredients: ["Retinol", "Peptides", "Hyaluronic Acid", "Niacinamide", "Ceramides", "Vitamin E"],
    howToUse: "Apply 2-3 drops to clean skin before bedtime. Use SPF during the day. Start with every other night.",
    skinType: ["Mature skin", "All skin types"],
    benefits: ["Reduces fine lines", "Improves texture", "Boosts collagen", "Hydrates deeply", "Brightens skin"],
    tags: ["night-serum", "retinol", "anti-aging", "peptides", "luxury", "premium"],
    weight: 30,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Ultra-Hydrating Face Mist",
    description: "Refreshing face mist with rose water, hyaluronic acid, and botanical extracts that instantly hydrates and refreshes skin throughout the day. Perfect for on-the-go hydration and setting makeup.",
    price: 35.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-mist-1.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-mist-2.jpg"
    ],
    category: "skincare",
    subcategory: "mists",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 85,
    rating: 4.6,
    reviewCount: 98,
    features: ["Rose water", "Hyaluronic acid", "Instant hydration", "Refreshing", "Portable", "Makeup setting"],
    ingredients: ["Rose Water", "Hyaluronic Acid", "Glycerin", "Chamomile Extract", "Aloe Vera"],
    howToUse: "Spray evenly over face and neck. Can be used throughout the day as needed or to set makeup.",
    skinType: ["All skin types", "Dry skin", "Dehydrated skin"],
    benefits: ["Instant hydration", "Refreshes skin", "Soothes irritation", "Sets makeup", "Portable"],
    tags: ["face-mist", "hydration", "rose-water", "refreshing", "luxury", "portable"],
    weight: 100,
    isActive: true,
    isFeatured: true,
    isNew: true,
    isOnSale: false
  },
  {
    name: "Gentle Exfoliating Facial Scrub",
    description: "Gentle exfoliating scrub with natural jojoba beads and fruit enzymes that removes dead skin cells and reveals smoother, brighter skin. Suitable for all skin types and provides gentle exfoliation.",
    price: 48.99,
    originalPrice: 58.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-scrub-1.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-scrub-2.jpg"
    ],
    category: "skincare",
    subcategory: "exfoliators",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 65,
    rating: 4.7,
    reviewCount: 124,
    features: ["Natural jojoba beads", "Fruit enzymes", "Gentle exfoliation", "All skin types", "Brightening"],
    ingredients: ["Jojoba Beads", "Papaya Enzymes", "Aloe Vera", "Vitamin E", "Chamomile Extract"],
    howToUse: "Apply to wet skin, massage gently in circular motions for 30 seconds, then rinse thoroughly. Use 2-3 times per week.",
    skinType: ["All skin types", "Dull skin"],
    benefits: ["Removes dead skin", "Reveals brighter skin", "Improves texture", "Gentle exfoliation", "Smooths skin"],
    tags: ["scrub", "exfoliating", "jojoba-beads", "brightening", "luxury", "gentle"],
    weight: 120,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  },
  {
    name: "Soothing Hydrating Toner",
    description: "Alcohol-free toner with chamomile, aloe vera, and rose water that balances skin pH and soothes irritation. Perfect for sensitive skin and daily use. Prepares skin for better product absorption.",
    price: 42.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-toner-1.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-toner-2.jpg"
    ],
    category: "skincare",
    subcategory: "toners",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 75,
    rating: 4.8,
    reviewCount: 189,
    features: ["Alcohol-free", "pH-balancing", "Soothing", "Sensitive skin friendly", "Hydrating"],
    ingredients: ["Chamomile Extract", "Aloe Vera", "Rose Water", "Glycerin", "Hyaluronic Acid"],
    howToUse: "Apply to clean skin with cotton pad or spray directly onto face. Follow with serum and moisturizer.",
    skinType: ["All skin types", "Sensitive skin", "Irritated skin"],
    benefits: ["Balances pH", "Soothes irritation", "Prepares skin", "Gentle cleansing", "Hydrates"],
    tags: ["toner", "soothing", "alcohol-free", "ph-balancing", "luxury", "hydrating"],
    weight: 200,
    isActive: true,
    isFeatured: true,
    isNew: true,
    isOnSale: false
  },
  {
    name: "Premium Skincare Gift Set",
    description: "Luxurious gift set containing our signature products: Premium Anti-Aging Night Serum, Ultra-Hydrating Face Mist, and Soothing Hydrating Toner. Perfect for gifting or treating yourself to a complete skincare routine.",
    price: 189.99,
    originalPrice: 229.99,
    images: [
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-gift-set-1.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-gift-set-2.jpg",
      "https://res.cloudinary.com/dxm7stflg/image/upload/v1703123456/ecommerce/luxury-gift-set-3.jpg"
    ],
    category: "skincare",
    subcategory: "gift-sets",
    brand: "Luxury Beauty",
    inStock: true,
    stockQuantity: 20,
    rating: 4.9,
    reviewCount: 67,
    features: ["Complete skincare routine", "Premium packaging", "Signature products", "Gift ready", "Great value"],
    ingredients: ["Multiple premium products", "Signature formulas", "Complete routine"],
    howToUse: "Follow individual product instructions for each item in the set. Use toner first, then serum, and finish with face mist.",
    skinType: ["All skin types"],
    benefits: ["Complete routine", "Premium experience", "Great value", "Perfect gift", "Signature products"],
    tags: ["gift-set", "luxury", "complete-routine", "premium", "skincare", "signature"],
    weight: 600,
    isActive: true,
    isFeatured: true,
    isNew: false,
    isOnSale: true
  }
];

// Sample admin user
const adminUser = {
  name: "Super Admin",
  email: "admin@luxurybeauty.com",
  password: "admin123",
  role: "admin",
  phone: "+15550123",
  addresses: [{
    type: "work",
    street: "123 Beauty Lane",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    isDefault: true
  }],
  preferences: {
    newsletter: true,
    notifications: true
  }
};

// Sample regular users
const sampleUsers = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    password: "password123",
    phone: "+15550101",
    addresses: [{
      type: "home",
      street: "456 Oak Street",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "United States",
      isDefault: true
    }],
    preferences: {
      newsletter: true,
      notifications: true
    }
  },
  {
    name: "Michael Chen",
    email: "michael.chen@email.com",
    password: "password123",
    phone: "+15550102",
    addresses: [{
      type: "home",
      street: "789 Pine Avenue",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "United States",
      isDefault: true
    }],
    preferences: {
      newsletter: false,
      notifications: true
    }
  },
  {
    name: "Emily Davis",
    email: "emily.davis@email.com",
    password: "password123",
    phone: "+15550103",
    addresses: [{
      type: "home",
      street: "321 Elm Street",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "United States",
      isDefault: true
    }],
    preferences: {
      newsletter: true,
      notifications: false
    }
  }
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create(adminUser);
    console.log(`Admin user created: ${admin.email}`);

    // Create sample users
    console.log('Creating sample users...');
    const users = await User.create(sampleUsers);
    console.log(`${users.length} sample users created`);

    // Create sample products
    console.log('Creating sample products...');
    const products = await Product.create(sampleProducts);
    console.log(`${products.length} sample products created`);

    console.log('Database seeded successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@luxurybeauty.com');
    console.log('Password: admin123');
    console.log('\nSample User Credentials:');
    console.log('Email: sarah.johnson@email.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedDatabase();