import type { Product } from "@/types/product"

export const products: Product[] = [
  {
    id: "1",
    name: "Radiance Renewal Serum",
    description: "A powerful anti-aging serum that brightens and firms skin with vitamin C and hyaluronic acid.",
    price: 89.99,
    originalPrice: 119.99,
    images: ["/product1.webp", "/product-detail-1.jpg", "/product-detail-2.jpg"],
    category: "skincare",
    subcategory: "serums",
    inStock: true,
    rating: 4.8,
    reviewCount: 324,
    features: ["Vitamin C", "Hyaluronic Acid", "Anti-aging", "Brightening"],
    ingredients: ["Vitamin C", "Hyaluronic Acid", "Niacinamide", "Peptides"],
    howToUse: "Apply 2-3 drops to clean skin morning and evening. Follow with moisturizer and SPF during the day.",
    skinType: ["All skin types", "Mature skin", "Dull skin"],
    benefits: ["Reduces fine lines", "Brightens complexion", "Hydrates deeply", "Improves skin texture"],
  },
  {
    id: "2",
    name: "Luxury Hydrating Moisturizer",
    description: "Rich, nourishing moisturizer with ceramides and peptides for ultimate skin hydration.",
    price: 65.99,
    originalPrice: 85.99,
    images: ["/product2.webp", "/product-detail-3.jpg", "/product-detail-4.jpg"],
    category: "skincare",
    subcategory: "moisturizers",
    inStock: true,
    rating: 4.7,
    reviewCount: 256,
    features: ["Ceramides", "Peptides", "24-hour hydration", "Anti-aging"],
    ingredients: ["Ceramides", "Peptides", "Shea Butter", "Glycerin"],
    howToUse: "Apply to clean skin morning and evening. Massage gently until absorbed.",
    skinType: ["Dry skin", "Mature skin", "Sensitive skin"],
    benefits: ["Deep hydration", "Strengthens skin barrier", "Reduces fine lines", "Soothes irritation"],
  },
  {
    id: "3",
    name: "Gentle Cleansing Oil",
    description: "Luxurious cleansing oil that removes makeup and impurities while nourishing the skin.",
    price: 45.99,
    images: ["/product3.webp", "/product-detail-5.jpg"],
    category: "skincare",
    subcategory: "cleansers",
    inStock: true,
    rating: 4.9,
    reviewCount: 189,
    features: ["Makeup removal", "Gentle formula", "Nourishing oils", "Suitable for all skin types"],
    ingredients: ["Jojoba Oil", "Argan Oil", "Vitamin E", "Chamomile Extract"],
    howToUse: "Apply to dry skin, massage gently, then rinse with warm water or remove with a damp cloth.",
    skinType: ["All skin types", "Sensitive skin"],
    benefits: ["Removes makeup", "Cleanses deeply", "Nourishes skin", "Maintains skin balance"],
  },
  {
    id: "4",
    name: "Revitalizing Eye Cream",
    description:
      "Advanced eye cream that targets dark circles, puffiness, and fine lines around the delicate eye area.",
    price: 75.99,
    originalPrice: 95.99,
    images: ["/product4.webp", "/product-detail-6.jpg"],
    category: "skincare",
    subcategory: "eye-care",
    inStock: true,
    rating: 4.6,
    reviewCount: 142,
    features: ["Reduces dark circles", "Anti-puffiness", "Firming", "Gentle formula"],
    ingredients: ["Caffeine", "Retinol", "Hyaluronic Acid", "Peptides"],
    howToUse: "Gently pat a small amount around the eye area morning and evening.",
    skinType: ["All skin types", "Mature skin"],
    benefits: ["Reduces dark circles", "Minimizes puffiness", "Smooths fine lines", "Brightens eye area"],
  },
  {
    id: "5",
    name: "Purifying Face Mask",
    description: "Deep-cleansing clay mask that purifies pores and leaves skin feeling refreshed and renewed.",
    price: 35.99,
    images: ["/product5.webp", "/product-detail-7.jpg"],
    category: "skincare",
    subcategory: "masks",
    inStock: true,
    rating: 4.5,
    reviewCount: 98,
    features: ["Deep cleansing", "Pore purifying", "Natural clay", "Weekly treatment"],
    ingredients: ["Bentonite Clay", "Kaolin Clay", "Tea Tree Oil", "Aloe Vera"],
    howToUse: "Apply a thin layer to clean skin, avoid eye area. Leave for 10-15 minutes, then rinse with warm water.",
    skinType: ["Oily skin", "Combination skin", "Acne-prone skin"],
    benefits: ["Unclogs pores", "Controls oil", "Improves skin texture", "Refreshes complexion"],
  },
  {
    id: "6",
    name: "Nourishing Body Lotion",
    description: "Luxurious body lotion with natural oils and butters for silky smooth, hydrated skin.",
    price: 42.99,
    images: ["/luxury-cosmetics-skincare-products-flatlay-with-gl.png", "/product-detail-8.jpg"],
    category: "body-care",
    subcategory: "moisturizers",
    inStock: true,
    rating: 4.7,
    reviewCount: 203,
    features: ["Natural oils", "Long-lasting hydration", "Fast-absorbing", "Delicate fragrance"],
    ingredients: ["Shea Butter", "Coconut Oil", "Jojoba Oil", "Vitamin E"],
    howToUse: "Apply to clean skin all over the body, focusing on dry areas.",
    skinType: ["All skin types", "Dry skin"],
    benefits: ["Deep moisturization", "Softens skin", "Non-greasy formula", "Pleasant scent"],
  },
]

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id)
}

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((product) => product.category === category)
}

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const currentProduct = getProductById(productId)
  if (!currentProduct) return []

  return products
    .filter((product) => product.id !== productId && product.category === currentProduct.category)
    .slice(0, limit)
}
