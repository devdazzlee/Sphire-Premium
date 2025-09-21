"use client"

import { useEffect, useRef } from "react"
import { CircularGallery } from "@/components/CircularGallery"
import { useCart } from "@/contexts/cart-context"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function AnimatedBestSelling() {
  const ref = useRef<HTMLElement>(null)
  const { addToCart } = useCart()

  const bestSellingItems = [
    { 
      image: "/premium-wireless-headphones.jpg", 
      text: "Premium Wireless Headphones",
      price: 8999,
      originalPrice: 12999,
      id: "headphones-1"
    },
    { 
      image: "/smart-fitness-watch.jpg", 
      text: "Smart Fitness Watch",
      price: 15999,
      originalPrice: 19999,
      id: "watch-1"
    },
    { 
      image: "/designer-sunglasses.jpg", 
      text: "Designer Sunglasses",
      price: 5999,
      originalPrice: 8999,
      id: "sunglasses-1"
    },
    { 
      image: "/luxury-handbag.jpg", 
      text: "Luxury Handbag",
      price: 25999,
      originalPrice: 35999,
      id: "handbag-1"
    },
    { 
      image: "/athletic-sneakers.jpg", 
      text: "Athletic Sneakers",
      price: 12999,
      originalPrice: 16999,
      id: "sneakers-1"
    },
    { 
      image: "/home-decor-set.jpg", 
      text: "Home Decor Set",
      price: 18999,
      originalPrice: 24999,
      id: "decor-1"
    },
    { 
      image: "/tech-accessories.jpg", 
      text: "Tech Accessories Kit",
      price: 7999,
      originalPrice: 10999,
      id: "tech-1"
    },
    { 
      image: "/fashion-jewelry.jpg", 
      text: "Fashion Jewelry Set",
      price: 9999,
      originalPrice: 14999,
      id: "jewelry-1"
    },
  ]

  useEffect(() => {
    // Ensure ScrollTrigger is registered
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ".best-selling-section",
        start: "top 80%",
        onEnter: () => {
          // Title animation
          gsap.fromTo(
            ".best-selling-title",
            { opacity: 0, y: 50, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }
          )
          
          // Subtitle animation
          gsap.fromTo(
            ".best-selling-subtitle",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" }
          )
          
          // Gallery container animation
          gsap.fromTo(
            ".gallery-container",
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 1, delay: 0.5, ease: "power2.out" }
          )
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  const handleAddToCart = (index, text) => {
    const item = bestSellingItems[index % bestSellingItems.length]
    addToCart({
      id: item.id,
      name: item.text,
      price: item.price,
      image: item.image,
      quantity: 1
    })
    
    console.log(`Added ${text} to cart`)
  }

  const handleBuyNow = (index, text) => {
    const item = bestSellingItems[index % bestSellingItems.length]
    // Add to cart first
    addToCart({
      id: item.id,
      name: item.text,
      price: item.price,
      image: item.image,
      quantity: 1
    })
    
    console.log(`Buy now: ${text}`)
  }

  const handleQuantityChange = (index, quantity) => {
    console.log(`Quantity changed for item ${index}: ${quantity}`)
  }

  return (
    <section 
      ref={ref} 
      className="best-selling-section py-20 bg-gradient-to-br from-[#f5f1e8] via-[#f0ebe0] to-[#ede7d9] relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="best-selling-title text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Best Selling Products
          </h2>
          <p className="best-selling-subtitle text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular items loved by thousands of customers worldwide
          </p>
        </div>

        {/* Circular Gallery Container */}
        <div className="gallery-container">
          <div className="h-[600px] w-full">
            <CircularGallery
              items={bestSellingItems}
              textColor="#1f2937"
              borderRadius={0.08}
              font="bold 24px 'Inter', 'Helvetica Neue', Arial, sans-serif"
              scrollSpeed={2.5}
              scrollEase={0.08}
              autoPlay={true}
              autoPlaySpeed={4000}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onQuantityChange={handleQuantityChange}
            />
          </div>
        </div>

        {/* Features below gallery */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-pink-600">10K+</div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-pink-600">4.9★</div>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-pink-600">24/7</div>
            <p className="text-gray-600">Customer Support</p>
          </div>
        </div>
      </div>
    </section>
  )
}