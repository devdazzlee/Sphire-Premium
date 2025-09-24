"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight, Heart, ShoppingCart, Zap, Sparkles, TrendingUp, Eye, X } from "lucide-react"
import { productsApi, type Product } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"
import { useToastContext } from "@/components/ui/toast"

interface AttractiveProductSliderProps {
  title?: string
  subtitle?: string
  badge?: string
  apiEndpoint?: 'featured' | 'all'
  limit?: number
  autoPlay?: boolean
  autoPlaySpeed?: number
}

export function AttractiveProductSlider({ 
  title = "Trending Products",
  subtitle = "Discover our most popular and trending products that everyone is loving right now",
  badge = "🔥 Trending Now",
  apiEndpoint = 'featured',
  limit = 8,
  autoPlay = true,
  autoPlaySpeed = 4000
}: AttractiveProductSliderProps) {
  // console.log('AttractiveProductSlider component loaded!', { title, apiEndpoint, limit })
  
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { addItemWithQuantity } = useCart()
  const { success } = useToastContext()
  
  // console.log('AttractiveProductSlider contexts:', { addItemWithQuantity: !!addItemWithQuantity, success: !!success })

  const itemsPerView = 4
  const maxIndex = Math.max(0, products.length - itemsPerView)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        let response
        
        if (apiEndpoint === 'featured') {
          response = await productsApi.getFeatured(limit)
        } else {
          response = await productsApi.getAll({ limit, sort: 'rating_desc' })
        }
        
        console.log('AttractiveProductSlider API Response:', response) // Debug log
        
        if (response.status === 'success' && response.data) {
          const productsData = response.data.products || response.data
          console.log('AttractiveProductSlider products loaded:', productsData)
          if (Array.isArray(productsData)) {
            setProducts(productsData)
            console.log('AttractiveProductSlider products set successfully:', productsData.length, 'products')
          } else {
            console.error('Invalid products data format:', productsData)
            setProducts([])
          }
        } else {
          console.error('API Error:', response.message)
          setProducts([])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [apiEndpoint, limit])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return

    intervalRef.current = setInterval(() => {
      if (!isDragging) {
        nextSlide()
      }
    }, autoPlaySpeed)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isAutoPlaying, products.length, isDragging, autoPlaySpeed])

  const nextSlide = () => {
    if (isTransitioning || products.length === 0) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 400)
  }

  const prevSlide = () => {
    if (isTransitioning || products.length === 0) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
      setIsTransitioning(false)
    }, 400)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex || products.length === 0) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 400)
  }

  const handleAddToCart = async (product: Product) => {
    console.log('Adding product to cart:', product) // Debug log
    try {
      const result = await addItemWithQuantity(product, 1)
      if (result.success) {
        success("Added to Cart", `${product.name} has been added to your cart`)
        console.log('Product added to cart successfully') // Debug log
      } else {
        console.error('Failed to add product to cart:', result.message)
      }
    } catch (error) {
      console.error('Error adding product to cart:', error) // Debug log
    }
  }

  const handleQuickView = (product: Product) => {
    console.log('Opening modal for product:', product.name)
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    setIsAutoPlaying(false)
    if (sliderRef.current) {
      setStartX(e.pageX - sliderRef.current.offsetLeft)
      setScrollLeft(sliderRef.current.scrollLeft)
    }
  }

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX) * 2
    sliderRef.current.scrollLeft = scrollLeft - walk
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setTimeout(() => setIsAutoPlaying(true), 2000)
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView)
  

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-6 py-3 rounded-full text-sm font-semibold mb-6 animate-pulse">
              <Sparkles className="w-5 h-5 fill-current" />
              <TrendingUp className="w-5 h-5" />
              {badge}
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-5 h-5 fill-current" />
              <TrendingUp className="w-5 h-5" />
              {badge}
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{subtitle}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-lg">No products available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-2 rounded-full text-xs font-semibold mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            <TrendingUp className="w-4 h-4" />
            {badge}
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 leading-tight">
            {title}
          </h2>
          
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            {subtitle}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center group">
              <div className="text-2xl font-bold text-indigo-600 mb-1 group-hover:scale-110 transition-transform duration-300">{products.length}+</div>
              <div className="text-sm text-gray-600 font-medium">Products</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-purple-600 mb-1 group-hover:scale-110 transition-transform duration-300">4.8</div>
              <div className="text-sm text-gray-600 font-medium">Avg Rating</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-pink-600 mb-1 group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-sm text-gray-600 font-medium">Quality</div>
            </div>
          </div>
        </div>

        {/* Slider Container */}
        <div 
          ref={sliderRef}
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          // onMouseLeave={handleDragEnd}
        >
          {/* Products Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ease-out ${
            isTransitioning ? 'opacity-60 scale-95' : 'opacity-100 scale-100'
          }`}>
            {visibleProducts.map((product, index) => (
              <div
                key={product._id}
                className={`group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 ease-out overflow-hidden border border-gray-100 cursor-pointer ${
                  isTransitioning ? 'translate-y-8 opacity-70' : 'translate-y-0 opacity-100'
                } ${hoveredCard === product._id ? 'scale-105 z-10' : 'scale-100'}`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  transform: hoveredCard === product._id ? 'scale(1.05) translateY(-15px)' : 'scale(1) translateY(0)'
                }}
                onMouseEnter={() => setHoveredCard(product._id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => router.push(`/products/${product._id}`)}
              >
                {/* Product Image Container */}
                <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <Image
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      {product.isFeatured ? 'Featured' : 'Popular'}
                    </span>
                  </div>

                  {/* Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 pointer-events-auto" style={{ zIndex: 10002 }}>
                    <button className="bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Eye View button clicked!', product)
                        handleQuickView(product)
                      }}
                      className="bg-white/90 hover:bg-white text-gray-600 hover:text-blue-500 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                      style={{ zIndex: 10001, position: 'relative' }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Add Button */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center pointer-events-none">
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Quick Add button clicked!', product)
                        handleAddToCart(product)
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 hover:bg-gray-100 transition-all duration-500 transform translate-y-8 group-hover:translate-y-0 shadow-xl hover:scale-105 pointer-events-auto"
                      size="sm"
                      style={{ zIndex: 10000, position: 'relative' }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Quick Add
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Category */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                      {product.category?.replace('-', ' ') || 'Beauty'}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 transition-all duration-300 ${
                            i < Math.floor(product.rating || 4.5)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {product.rating?.toFixed(1) || '4.5'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.reviewsCount?.toLocaleString() || '0'})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full text-xs font-bold">
                          Save ${(product.originalPrice - product.price).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Add to cart button clicked!', product)
                      handleAddToCart(product)
                    }}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl group-hover:shadow-2xl"
                    size="sm"
                    style={{ zIndex: 9999, position: 'relative' }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-500"></div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {products.length > itemsPerView && (
            <>
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {products.length > itemsPerView && (
          <div className="flex justify-center gap-3 mt-12">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 scale-125 shadow-lg'
                    : 'bg-gray-300 hover:bg-gray-400'
                } disabled:cursor-not-allowed`}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => router.push('/products')}
            variant="outline" 
            size="md"
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 font-bold px-6 py-2.5 rounded-lg transition-all duration-500 hover:scale-105 shadow-lg"
          >
            View All Products
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row">
              {/* Product Image */}
              <div className="lg:w-1/2 p-6">
                <div className="relative h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                  <Image
                    src={selectedProduct.images?.[0] || '/placeholder.jpg'}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="lg:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Category */}
                  <div className="mb-3">
                    <span className="text-sm font-medium text-indigo-600 capitalize">
                      {selectedProduct.category?.replace('-', ' ') || 'Beauty'}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedProduct.name}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(selectedProduct.rating || 4.5)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-700">
                      {selectedProduct.rating?.toFixed(1) || '4.5'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({selectedProduct.reviewsCount?.toLocaleString() || '0'} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      PKR {selectedProduct.price.toFixed(2)}
                    </span>
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <>
                        <span className="text-2xl text-gray-400 line-through">
                          PKR {selectedProduct.originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                          Save PKR {(selectedProduct.originalPrice - selectedProduct.price).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Features */}
                  {selectedProduct.features && selectedProduct.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Key Features:</h3>
                      <ul className="space-y-2">
                        {selectedProduct.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-600">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={() => {
                      closeModal()
                      router.push(`/products/${selectedProduct._id}`)
                    }}
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 font-bold py-4 rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl"
                    size="lg"
                  >
                    View Full Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
