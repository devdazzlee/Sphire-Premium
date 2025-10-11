"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, Share2, ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw, X, ChevronLeft, ChevronRight } from "lucide-react"
import { productsApi } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useToastContext } from "@/components/ui/toast"
import type { Product } from "@/lib/api"
import Link from "next/link"
import { ReviewForm } from "@/components/review-form"
import { ProductReviews } from "@/components/product-reviews"
import { StarRating } from "@/components/star-rating"

export default function ProductDetailClient() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { addItemWithQuantity } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { success, error } = useToastContext()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const isWishlisted = product ? isInWishlist(product._id) : false
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({
    details: false,
    ingredients: false,
    reviews: false
  })
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await productsApi.getById(productId)
          if (response.status === 'success' && response.data) {
            setProduct(response.data.product)
            setRelatedProducts(response.data.relatedProducts)
          }
        } catch (error: any) {
          console.error('Error fetching product:', error)
        }
      }
      
      const fetchFeaturedProducts = async () => {
        try {
          const response = await productsApi.getFeatured(4)
          if (response.status === 'success' && response.data) {
            // Filter out the current product from featured products
            const filteredFeatured = response.data.products.filter(p => p._id !== productId)
            setFeaturedProducts(filteredFeatured.slice(0, 4))
          }
        } catch (error: any) {
          console.error('Error fetching featured products:', error)
        }
      }
      
      const fetchTrendingProducts = async () => {
        try {
          const response = await productsApi.getAll({ limit: 4, sort: 'rating_desc' })
          if (response.status === 'success' && response.data) {
            // Filter out the current product from trending products
            const filteredTrending = response.data.products.filter(p => p._id !== productId)
            setTrendingProducts(filteredTrending.slice(0, 4))
          }
        } catch (error: any) {
          console.error('Error fetching trending products:', error)
        }
      }
      
      fetchProduct()
      fetchFeaturedProducts()
      fetchTrendingProducts()
    }
  }, [productId])

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)

    try {
      const result = await addItemWithQuantity(product, quantity)
      if (result.success) {
        success("Added to Cart", `${product.name} has been added to your cart`)
      } else {
        error("Failed to add to cart", result.message || "Please try again")
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      error("Failed to add to cart", "Please try again")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return

    try {
      const result = await addItemWithQuantity(product, quantity)
      if (result.success) {
        router.push('/checkout')
      } else {
        error("Failed to add to cart", result.message || "Please try again")
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      error("Failed to add to cart", "Please try again")
    }
  }

  const handleWishlist = () => {
    if (!product) return
    
    if (isWishlisted) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        category: product.category,
        inStock: product.inStock,
        rating: product.rating,
        reviewCount: product.reviewCount || 0
      })
    }
  }

  const handleShare = async () => {
    if (!product) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        success("Link Copied", "Product link has been copied to clipboard")
      }
    } catch (error: any) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        success("Link Copied", "Product link has been copied to clipboard")
      } catch (clipboardError: any) {
        error("Share Failed", "Unable to share product")
      }
    }
  }

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change))
  }

  const toggleDropdown = (dropdownKey: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey]
    }))
  }

  const openImageModal = (index: number) => {
    setModalImageIndex(index)
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  const nextModalImage = () => {
    if (!product) return
    setModalImageIndex((modalImageIndex + 1) % product.images.length)
  }

  const prevModalImage = () => {
    if (!product) return
    setModalImageIndex((modalImageIndex - 1 + product.images.length) % product.images.length)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f1e8]">
        <AnimatedHeader />
        <div className="container mx-auto px-4 py-12 pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-light text-gray-800 mb-4">Loading product...</h1>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <AnimatedHeader />

      <main className="container mx-auto px-4 py-8 pt-32">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-800">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-800">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => openImageModal(selectedImageIndex)}
            >
              <img
                src={product.images[selectedImageIndex] || "/placeholder.svg?height=600&width=600&query=beauty product"}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? "border-gray-800" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg?height=80&width=80&query=beauty product"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <Badge variant="secondary" className="text-xs uppercase tracking-wide">
              {product.category.replace("-", " ")}
            </Badge>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-800">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating 
                rating={product.rating || 0} 
                size="lg" 
                showText={true}
                reviewCount={product.reviewCount || 0}
                className="mb-0"
              />
              <span className="text-sm text-gray-600">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-light text-gray-800">Rs {product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">Rs {product.originalPrice.toFixed(2)}</span>
                  <Badge className="bg-red-500 hover:bg-red-500 text-white">Save {discountPercentage}%</Badge>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Key Features:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-800">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 text-lg"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart - Rs {(product.price * quantity).toFixed(2)}
                    </div>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className={`px-4 transition-colors ${
                    isWishlisted 
                      ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                      : "bg-transparent"
                  }`}
                  onClick={handleWishlist}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-4 bg-transparent"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full py-3 text-lg border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white bg-transparent"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free delivery on orders over Rs 2,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5" />
                <span>2-year warranty included</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Dropdowns */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16 space-y-4">
          {/* Details Dropdown */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleDropdown('details')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-medium text-gray-800">Product Details</span>
              {openDropdowns.details ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {openDropdowns.details && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-4 space-y-6">
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>

                  {product.benefits && product.benefits.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Benefits:</h4>
                      <ul className="space-y-2">
                        {product.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.howToUse && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">How to Use:</h4>
                      <p className="text-gray-600 leading-relaxed">{product.howToUse}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ingredients Dropdown */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleDropdown('ingredients')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-medium text-gray-800">Ingredients</span>
              {openDropdowns.ingredients ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {openDropdowns.ingredients && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-4">
                  {product.ingredients && product.ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-gray-700">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Ingredient information not available.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Dropdown */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleDropdown('reviews')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-medium text-gray-800">Reviews</span>
              {openDropdowns.reviews ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {openDropdowns.reviews && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-4 space-y-8">
                  {/* Review Form */}
                  <ReviewForm 
                    productId={productId} 
                    productName={product.name}
                    onReviewSubmitted={() => {
                      // Refresh reviews or show success message
                      console.log('Review submitted successfully')
                    }}
                  />

                  {/* Existing Reviews */}
                  <ProductReviews 
                    productId={productId}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Suggestions Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light tracking-wide text-gray-800 mb-4">You Might Also Like</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover more amazing products that complement your style and enhance your beauty routine
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light tracking-wide text-gray-800 mb-4">Featured Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Check out our most popular and highly-rated products that customers love
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((featuredProduct) => (
                <ProductCard key={featuredProduct._id} product={featuredProduct} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Image Modal */}
      {isImageModalOpen && product && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevModalImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextModalImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={product.images[modalImageIndex] || "/placeholder.svg"}
              alt={product.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Image Counter */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {modalImageIndex + 1} / {product.images.length}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

