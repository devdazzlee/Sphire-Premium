"use client"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useToastContext } from "@/components/ui/toast"
import { productsApi, type Product as ApiProduct } from "@/lib/api"
import type React from "react"
import type { Product } from "@/types/product"
import { Star, ShoppingCart, Heart, Eye } from "lucide-react"

interface GalleryItem {
  id: string
  name: string
  description: string
  price: string
  originalPrice?: string
  images: string[]
  category: string
  subcategory: string
  inStock: boolean
  rating: number
  reviewCount: number
  features: string[]
  ingredients?: string[]
  howToUse?: string
  skinType?: string[]
  benefits?: string[]
  image: string
  text: string
}

interface CircularGalleryProps {
  items?: GalleryItem[]
  autoPlay?: boolean
  autoPlaySpeed?: number
  onAddToCart?: (index: number, text: string, quantity: number) => void
  onBuyNow?: (index: number, text: string, quantity: number) => void
  onQuantityChange?: (index: number, quantity: number) => void
}

function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

const CircularGallery: React.FC<CircularGalleryProps> = ({
  items = [],
  autoPlay = true,
  autoPlaySpeed = 4000,
  onAddToCart,
  onBuyNow,
  onQuantityChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout>()
  const router = useRouter()
  const { addItemWithQuantity } = useCart()
  const { success } = useToastContext()

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const [featuredProducts, setFeaturedProducts] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true)
        const response = await productsApi.getFeatured(8)
        if (response.status === 'success' && response.data) {
          const galleryItems: GalleryItem[] = response.data.products.map((product: ApiProduct) => ({
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            originalPrice: product.originalPrice?.toString(),
            images: product.images,
            category: product.category,
            subcategory: product.subcategory,
            inStock: product.inStock,
            rating: product.rating,
            reviewCount: product.reviewCount,
            features: product.features,
            ingredients: product.ingredients,
            howToUse: product.howToUse,
            skinType: product.skinType,
            benefits: product.benefits,
            image: product.images[0] || '/placeholder.jpg',
            text: product.name,
          }))
          setFeaturedProducts(galleryItems)
        }
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  const displayItems = items.length > 0 ? items : featuredProducts

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isUserInteracting || displayItems.length === 0) return

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length)
    }, autoPlaySpeed)

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [autoPlay, autoPlaySpeed, isUserInteracting, displayItems.length])

  const handleQuantityChange = useCallback(
    (originalIndex: number, delta: number) => {
      setQuantities((prev) => {
        const newQuantity = Math.max(1, (prev[originalIndex] || 1) + delta)
        onQuantityChange?.(originalIndex, newQuantity)
        return { ...prev, [originalIndex]: newQuantity }
      })
    },
    [onQuantityChange],
  )

  const handleAddToCart = useCallback(
    (originalIndex: number, text: string) => {
      const item = displayItems[originalIndex]
      const quantity = quantities[originalIndex] || 1
      
      const product: Product = {
        _id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price.toString()),
        originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : undefined,
        images: item.images,
        category: item.category,
        subcategory: item.subcategory,
        inStock: item.inStock,
        rating: item.rating,
        reviewCount: item.reviewCount,
        features: item.features,
        ingredients: item.ingredients,
        howToUse: item.howToUse,
        skinType: item.skinType,
        benefits: item.benefits
      }
      
      addItemWithQuantity(product, quantity)
      success("Added to Cart", `${quantity} x ${product.name} has been added to your cart`)
      
      onAddToCart?.(originalIndex, text, quantity)
    },
    [onAddToCart, quantities, displayItems, addItemWithQuantity, success],
  )

  const handleBuyNow = useCallback(
    (originalIndex: number, text: string) => {
      const item = displayItems[originalIndex]
      const quantity = quantities[originalIndex] || 1
      
      const product: Product = {
        _id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price.toString()),
        originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : undefined,
        images: item.images,
        category: item.category,
        subcategory: item.subcategory,
        inStock: item.inStock,
        rating: item.rating,
        reviewCount: item.reviewCount,
        features: item.features,
        ingredients: item.ingredients,
        howToUse: item.howToUse,
        skinType: item.skinType,
        benefits: item.benefits
      }
      
      addItemWithQuantity(product, quantity)
      success("Added to Cart", `${quantity} x ${product.name} has been added to your cart`)
      
      window.dispatchEvent(new CustomEvent('openCartDrawer'))
      
      onBuyNow?.(originalIndex, text, quantity)
    },
    [onBuyNow, quantities, displayItems, addItemWithQuantity, success],
  )

  const handleProductClick = useCallback(
    (originalIndex: number) => {
      const product = displayItems[originalIndex]
      router.push(`/products/${product.id}`)
    },
    [displayItems, router],
  )

  const nextSlide = useCallback(() => {
    setIsUserInteracting(true)
    setCurrentIndex((prev) => (prev + 1) % displayItems.length)
    setTimeout(() => setIsUserInteracting(false), 1000)
  }, [displayItems.length])

  const prevSlide = useCallback(() => {
    setIsUserInteracting(true)
    setCurrentIndex((prev) => prev === 0 ? displayItems.length - 1 : prev - 1)
    setTimeout(() => setIsUserInteracting(false), 1000)
  }, [displayItems.length])

  const [startX, setStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleStart = useCallback((clientX: number) => {
    setStartX(clientX)
    setIsDragging(true)
    setIsUserInteracting(true)
  }, [])

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return
    // Simple swipe detection
    const deltaX = startX - clientX
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
      setIsDragging(false)
    }
  }, [isDragging, startX, nextSlide, prevSlide])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => setIsUserInteracting(false), 1000)
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
    },
    [nextSlide, prevSlide],
  )

  // Generate visible items for carousel based on screen size
  const visibleItems = useMemo(() => {
    if (displayItems.length === 0) return []
    
    const items = []
    let range: number
    
    if (isMobile) {
      // Mobile: show 1 slide (center only)
      range = 0
    } else if (isTablet) {
      // Tablet: show 3 slides (left, center, right)
      range = 1
    } else {
      // Desktop: show 5 slides (2 left, center, 2 right)
      range = 2
    }
    
    for (let i = -range; i <= range; i++) {
      const index = (currentIndex + i + displayItems.length) % displayItems.length
      items.push({
        ...displayItems[index],
        index: index,
        position: i,
        isActive: i === 0,
        isLeft: i < 0,
        isRight: i > 0,
      })
    }
    return items
  }, [displayItems, currentIndex, isMobile, isTablet])

  if (isLoading) {
    return (
      <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Loading Best Sellers</h3>
            <p className="text-gray-500">Discovering amazing products for you...</p>
          </div>
        </div>
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Products Available</h3>
          <p className="text-gray-500">Check back soon for amazing products!</p>
        </div>
      </div>
    )
  }

  return (
    <section className="relative w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-12 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-xs font-semibold mb-4 shadow-lg">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Best Sellers
          </div>
          <h2 className={`font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-4 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
            Best Selling Products
          </h2>
          <p className={`text-gray-600 max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}>
            Discover our most popular and highly-rated products loved by customers worldwide
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              4.9★ Rating
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              10K+ Reviews
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Premium Quality
            </span>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div
          ref={containerRef}
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseMove={(e) => isDragging && handleMove(e.clientX)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
          onWheel={handleWheel}
          className={`relative flex items-center justify-center select-none overflow-hidden ${
            isMobile ? 'h-[500px]' : isTablet ? 'h-[600px]' : 'h-[650px]'
          }`}
        >
          {/* Product Cards */}
          <div className="relative w-full h-full flex items-center justify-center">
            {visibleItems.map((item, idx) => {
              const quantity = quantities[item.index] || 1
              
              // Enhanced scaling and positioning based on screen size and position
              let scale: number
              let opacity: number
              let zIndex: number
              let translateX: number
              let translateY: number
              
              if (isMobile) {
                // Mobile: single card centered
                scale = 1
                opacity = 1
                zIndex = 20
                translateX = 0
                translateY = 0
              } else if (isTablet) {
                // Tablet: 3 cards with center focus
                scale = item.isActive ? 1 : 0.7
                opacity = item.isActive ? 1 : 0.3
                zIndex = item.isActive ? 20 : 10
                translateX = item.position * 280
                translateY = item.isActive ? 0 : 15
              } else {
                // Desktop: 5 cards with center focus
                scale = item.isActive ? 1 : (Math.abs(item.position) === 1 ? 0.8 : 0.6)
                opacity = item.isActive ? 1 : (Math.abs(item.position) === 1 ? 0.6 : 0.2)
                zIndex = item.isActive ? 30 : (Math.abs(item.position) === 1 ? 20 : 10)
                translateX = item.position * 240
                translateY = item.isActive ? 0 : (Math.abs(item.position) === 1 ? 10 : 20)
              }

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="absolute transition-all duration-500 ease-out"
                  style={{
                    transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  {/* Product Card */}
                  <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ${
                    isMobile ? 'w-72' : isTablet ? 'w-76' : 'w-80'
                  } ${item.isActive ? 'shadow-2xl border-2 border-gray-900' : 'shadow-md'}`}>
                    {/* Image Container */}
                    <div className="relative overflow-hidden">
                      <div
                        className={`bg-gray-100 bg-cover bg-center transition-transform duration-500 ${isMobile ? 'h-52' : 'h-60'} ${item.isActive ? 'group-hover:scale-105' : ''}`}
                        style={{ backgroundImage: `url(${item.image})` }}
                        onClick={() => handleProductClick(item.index)}
                      />
                      
                      {/* Sale Badge */}
                      {item.originalPrice && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          SALE
                        </div>
                      )}

                      {/* Overlay Icons - Only show on center card */}
                      {item.isActive && (
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 hover:text-red-500">
                            <Heart className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 hover:text-blue-500"
                            onClick={() => handleProductClick(item.index)}
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`p-5 ${isMobile ? 'p-4' : ''}`}>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-2">({item.reviewCount})</span>
                      </div>

                      {/* Title */}
                      <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        {item.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                          PKR {item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-gray-500 line-through text-xs">
                            PKR {item.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls - Only show on center card */}
                      {item.isActive && (
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuantityChange(item.index, -1)
                            }}
                            className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 text-sm font-bold"
                            disabled={quantity <= 1}
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-900 min-w-[30px] text-center text-sm bg-gray-50 px-2 py-1 rounded-md">
                            {quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuantityChange(item.index, 1)
                            }}
                            className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Action Buttons - Only show on center card */}
                      {item.isActive && (
                        <div className="space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToCart(item.index, item.name)
                            }}
                            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBuyNow(item.index, item.name)
                            }}
                            className="w-full border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all duration-200 text-sm hover:scale-105"
                          >
                            Buy Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation Arrows - Enhanced design */}
          {displayItems.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300 z-30 border-2 border-gray-200 hover:border-gray-300 ${
                  isMobile ? 'w-10 h-10 left-1' : isTablet ? 'w-11 h-11 left-2' : 'w-12 h-12 left-4'
                }`}
              >
                <span className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>‹</span>
              </button>
              
              <button
                onClick={nextSlide}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300 z-30 border-2 border-gray-200 hover:border-gray-300 ${
                  isMobile ? 'w-10 h-10 right-1' : isTablet ? 'w-11 h-11 right-2' : 'w-12 h-12 right-4'
                }`}
              >
                <span className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>›</span>
              </button>
            </>
          )}
        </div>

        {/* Enhanced Dots Indicator */}
        <div className="flex justify-center mt-8 gap-3">
          {displayItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsUserInteracting(true)
                setTimeout(() => setIsUserInteracting(false), 1000)
              }}
              className={`transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 h-3 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full shadow-lg' 
                  : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 hover:scale-110 hover:shadow-md'
              }`}
            />
          ))}
        </div>

        {/* Product Counter */}
        <div className="flex justify-center mt-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
            <span className="text-sm font-bold text-gray-700">
              {currentIndex + 1} of {displayItems.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export { CircularGallery }
export default CircularGallery