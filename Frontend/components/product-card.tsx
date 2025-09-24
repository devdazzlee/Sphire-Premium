"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Eye } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useGSAP } from "@/hooks/use-gsap"
import Link from "next/link"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { ref, gsap } = useGSAP()
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseEnter = () => {
      setIsHovered(true)
      const tl = gsap.timeline()

      // Card lift and shadow animation
      tl.to(card, {
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        duration: 0.4,
        ease: "power2.out",
      })

      // Image zoom animation
      tl.to(
        card.querySelector(".product-image"),
        {
          scale: 1.1,
          duration: 0.6,
          ease: "power2.out",
        },
        0,
      )

      // Quick actions slide in
      tl.fromTo(
        card.querySelectorAll(".quick-action"),
        { x: 20, opacity: 0, scale: 0.8 },
        { x: 0, opacity: 1, scale: 1, duration: 0.3, stagger: 0.1, ease: "back.out(1.4)" },
        0.1,
      )

      // Price highlight animation
      tl.to(
        card.querySelector(".price"),
        {
          scale: 1.05,
          color: "#a67c56",
          duration: 0.3,
          ease: "power2.out",
        },
        0.2,
      )
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      const tl = gsap.timeline()

      // Reset card position
      tl.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out",
      })

      // Reset image scale
      tl.to(
        card.querySelector(".product-image"),
        {
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0,
      )

      // Hide quick actions
      tl.to(
        card.querySelectorAll(".quick-action"),
        {
          x: 20,
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          stagger: 0.05,
          ease: "power2.in",
        },
        0,
      )

      // Reset price
      tl.to(
        card.querySelector(".price"),
        {
          scale: 1,
          color: "#374151",
          duration: 0.3,
          ease: "power2.out",
        },
        0,
      )
    }

    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [gsap])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAddingToCart(true)

    const button = e.currentTarget as HTMLElement
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    })

    setTimeout(async () => {
      const result = await addItem(product)
      if (!result.success) {
        console.error('Failed to add to cart:', result.message)
      }
      setIsAddingToCart(false)

      // Success animation
      gsap.fromTo(
        button,
        { backgroundColor: "#16a34a" },
        { backgroundColor: "#374151", duration: 0.6, ease: "power2.out" },
      )
    }, 300)
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Card
      ref={cardRef}
      className="group cursor-pointer transition-all duration-300 bg-white border-0 shadow-md overflow-hidden"
    >
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative overflow-hidden">
          <div className="aspect-square relative bg-gray-50">
            <img
              src={product.images[0] || "/placeholder.svg?height=300&width=300&query=beauty product"}
              alt={product.name}
              className="product-image w-full h-full object-cover transition-transform duration-500"
            />

            {discountPercentage > 0 && (
              <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white font-semibold">
                -{discountPercentage}%
              </Badge>
            )}

            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="quick-action w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-md opacity-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="quick-action w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-md opacity-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            {product.stockQuantity === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="bg-white text-black">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category.replace("-", " ")}</p>

            <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-black transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {product.rating} ({product.reviewCount})
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="price text-lg font-semibold text-gray-800">PKR {product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">PKR {product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0 || isAddingToCart}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 group-hover:bg-black disabled:opacity-50"
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                </div>
              )}
            </Button>
          </CardContent>
        </div>
      </Link>
    </Card>
  )
}
