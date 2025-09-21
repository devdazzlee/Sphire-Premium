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

  // Generate visible items for carousel
  const visibleItems = useMemo(() => {
    if (displayItems.length === 0) return []
    
    const items = []
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + displayItems.length) % displayItems.length
      items.push({
        ...displayItems[index],
        index: index,
        position: i,
        isActive: i === 0,
        isLeft: i === -1,
        isRight: i === 1,
      })
    }
    return items
  }, [displayItems, currentIndex])

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
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="text-center">
          <h2 className={`font-bold text-gray-900 mb-4 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
            Best Selling Products
          </h2>
          <p className={`text-gray-600 max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}>
            Discover our most popular and highly-rated products loved by customers worldwide
          </p>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="max-w-7xl mx-auto px-4">
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
          className="relative h-[650px] flex items-center justify-center select-none overflow-hidden"
        >
          {/* Product Cards */}
          <div className="relative w-full h-full flex items-center justify-center">
            {visibleItems.map((item, idx) => {
              const quantity = quantities[item.index] || 1
              const scale = item.isActive ? 1 : 0.75
              const opacity = item.isActive ? 1 : 0.4
              const zIndex = item.isActive ? 20 : 10
              const translateX = item.position * (isMobile ? 320 : 380)
              const translateY = item.isActive ? 0 : 20

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
                  <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ${isMobile ? 'w-72' : 'w-80'} ${item.isActive ? 'shadow-2xl' : 'shadow-md'}`}>
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
                          <button className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110">
                            <Heart className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
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
                            className="w-7 h-7 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                            disabled={quantity <= 1}
                          >
                            −
                          </button>
                          <span className="font-medium text-gray-900 min-w-[25px] text-center text-sm">
                            {quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuantityChange(item.index, 1)
                            }}
                            className="w-7 h-7 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm"
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
                            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2.5 rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBuyNow(item.index, item.name)
                            }}
                            className="w-full border-2 border-gray-900 text-gray-900 py-2.5 rounded-xl font-medium hover:bg-gray-900 hover:text-white transition-all duration-200 text-sm"
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

          {/* Navigation Arrows - Only show at ends */}
          {displayItems.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300 z-30 border border-gray-200 ${isMobile ? 'w-10 h-10 left-1' : 'left-4'}`}
              >
                <span className="text-xl font-bold">‹</span>
              </button>
              
              <button
                onClick={nextSlide}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300 z-30 border border-gray-200 ${isMobile ? 'w-10 h-10 right-1' : 'right-4'}`}
              >
                <span className="text-xl font-bold">›</span>
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
                  : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Product Counter */}
        <div className="flex justify-center mt-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
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