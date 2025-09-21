"use client"

import { useState } from "react"
import { CircularGallery } from "./circular-gallery"
import { CartDrawer } from "./cart-drawer"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/types/product"

const galleryProducts: Product[] = [
  {
    id: "headphones-1",
    name: "Premium Headphones",
    price: 299,
    originalPrice: 399,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"],
    category: "electronics",
    description: "High-quality wireless headphones with noise cancellation",
  },
  {
    id: "smartwatch-1",
    name: "Smart Watch Collection",
    price: 499,
    originalPrice: 599,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"],
    category: "electronics",
    description: "Advanced smartwatch with health monitoring",
  },
  {
    id: "sunglasses-1",
    name: "Designer Sunglasses",
    price: 199,
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop"],
    category: "accessories",
    description: "Stylish designer sunglasses with UV protection",
  },
  {
    id: "handbag-1",
    name: "Luxury Handbags",
    price: 799,
    originalPrice: 999,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop"],
    category: "accessories",
    description: "Premium leather handbag collection",
  },
  {
    id: "athletic-1",
    name: "Athletic Wear",
    price: 89,
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop"],
    category: "clothing",
    description: "High-performance athletic wear for active lifestyle",
  },
  {
    id: "decor-1",
    name: "Home Decor",
    price: 149,
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"],
    category: "home",
    description: "Modern home decor accessories",
  },
  {
    id: "tech-1",
    name: "Tech Accessories",
    price: 79,
    images: ["https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop"],
    category: "electronics",
    description: "Essential tech accessories and gadgets",
  },
  {
    id: "jewelry-1",
    name: "Fashion Jewelry",
    price: 259,
    originalPrice: 329,
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop"],
    category: "accessories",
    description: "Elegant fashion jewelry collection",
  },
]

export function ProductGallery() {
  const { addItem, setIsOpen } = useCart()
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  const galleryItems = galleryProducts.map((product) => ({
    image: product.images[0],
    text: product.name,
    price: `$${product.price}`,
  }))

  const handleAddToCart = (index: number, text: string, quantity: number) => {
    const product = galleryProducts[index]
    if (product) {
      // Add the specified quantity
      for (let i = 0; i < quantity; i++) {
        addItem(product)
      }
      // Open cart drawer to show the added item
      setCartDrawerOpen(true)
      setIsOpen(true)
    }
  }

  const handleBuyNow = (index: number, text: string, quantity: number) => {
    const product = galleryProducts[index]
    if (product) {
      // Add the specified quantity
      for (let i = 0; i < quantity; i++) {
        addItem(product)
      }
      // Open cart drawer for immediate checkout
      setCartDrawerOpen(true)
      setIsOpen(true)
    }
  }

  return (
    <>
      <CircularGallery
        items={galleryItems}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        autoPlay={true}
        autoPlaySpeed={5000}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => {
          setCartDrawerOpen(false)
          setIsOpen(false)
        }}
      />
    </>
  )
}
