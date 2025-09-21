"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight, Heart, ShoppingCart, Sparkles, TrendingUp, Award, Zap } from "lucide-react"

interface Product {
  id: number
  image: string
  name: string
  price: number
  originalPrice: number
  rating: number
  reviews: number
  badge: string
  category: string
  discount: number
}

const bestSellingProducts: Product[] = [
  {
    id: 1,
    image: "/luxury-beauty-products-arranged-elegantly-on-marbl.png",
    name: "Premium Anti-Aging Night Serum",
    price: 89.99,
    originalPrice: 120.00,
    rating: 4.9,
    reviews: 1247,
    badge: "Best Seller",
    category: "Skincare",
    discount: 25
  },
  {
    id: 2,
    image: "/elegant-beauty-laboratory-with-natural-ingredients.png",
    name: "Ultra-Hydrating Face Mist",
    price: 45.99,
    originalPrice: 65.00,
    rating: 4.8,
    reviews: 892,
    badge: "Trending",
    category: "Hydration",
    discount: 29
  },
  {
    id: 3,
    image: "/wellness-spa-products.png",
    name: "Gentle Exfoliating Facial Scrub",
    price: 32.99,
    originalPrice: 45.00,
    rating: 4.7,
    reviews: 634,
    badge: "Popular",
    category: "Exfoliation",
    discount: 27
  },
  {
    id: 4,
    image: "/product1.webp",
    name: "Soothing Hydrating Toner",
    price: 28.99,
    originalPrice: 40.00,
    rating: 4.6,
    reviews: 456,
    badge: "New",
    category: "Toner",
    discount: 28
  },
  {
    id: 5,
    image: "/product2.webp",
    name: "Premium Skincare Gift Set",
    price: 149.99,
    originalPrice: 200.00,
    rating: 4.9,
    reviews: 234,
    badge: "Limited",
    category: "Gift Set",
    discount: 25
  },
  {
    id: 6,
    image: "/product3.webp",
    name: "Vitamin C Brightening Serum",
    price: 65.99,
    originalPrice: 85.00,
    rating: 4.8,
    reviews: 567,
    badge: "Hot",
    category: "Serum",
    discount: 22
  }
]

export function AttractiveBestSelling() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const itemsPerView = 3
  const maxIndex = Math.max(0, bestSellingProducts.length - itemsPerView)

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (isAutoPlaying) {
        nextSlide()
      }
    }, 5000)
  }

  const stopAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    startAutoSlide()
    return () => stopAutoSlide()
  }, [isAutoPlaying])

  const nextSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 400)
  }

  const prevSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
      setIsTransitioning(false)
    }, 400)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 400)
  }

  const visibleProducts = bestSellingProducts.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-200/10 to-blue-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
            <Sparkles className="w-5 h-5 fill-current animate-pulse" />
            <TrendingUp className="w-5 h-5" />
            Best Selling Products
          </div>
          
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Favorites</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Discover our most loved products that customers can't get enough of. 
            Each item is carefully selected based on reviews, ratings, and sales performance.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">4.9</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Natural</div>
            </div>
          </div>
        </div>

        {/* Slider Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Products Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 ease-out ${
            isTransitioning ? 'opacity-60 scale-95' : 'opacity-100 scale-100'
          }`}>
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className={`group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 ease-out overflow-hidden border border-gray-100 ${
                  isTransitioning ? 'translate-y-8 opacity-70' : 'translate-y-0 opacity-100'
                } ${hoveredCard === product.id ? 'scale-105 z-10' : 'scale-100'}`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  transform: hoveredCard === product.id ? 'scale(1.05) translateY(-10px)' : 'scale(1) translateY(0)'
                }}
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Product Image Container */}
                <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-6 left-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                      product.badge === 'Best Seller' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                      product.badge === 'Trending' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                      product.badge === 'Popular' ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white' :
                      product.badge === 'New' ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white' :
                      product.badge === 'Limited' ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white' :
                      'bg-gradient-to-r from-indigo-400 to-purple-500 text-white'
                    }`}>
                      {product.badge}
                    </span>
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-6 right-6">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
                      -{product.discount}%
                    </div>
                  </div>

                  {/* Wishlist Button */}
                  <button className="absolute bottom-6 right-6 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100">
                    <Heart className="w-5 h-5" />
                  </button>

                  {/* Quick Add Button */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                    <Button
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 hover:bg-gray-100 transition-all duration-500 transform translate-y-8 group-hover:translate-y-0 shadow-xl"
                      size="lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Quick Add
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-8">
                  {/* Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">{product.category}</span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 transition-all duration-300 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-700">
                      {product.rating}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({product.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl group-hover:shadow-2xl"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-500"></div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-4 mt-16">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-4 h-4 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400'
              } disabled:cursor-not-allowed`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-bold px-10 py-4 rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl"
          >
            View All Best Sellers
            <ChevronRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </div>
    </section>
  )
}
