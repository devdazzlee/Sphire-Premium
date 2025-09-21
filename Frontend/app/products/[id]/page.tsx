"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, Share2, ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw } from "lucide-react"
import { productsApi } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/api"
import Link from "next/link"
import { ReviewForm } from "@/components/review-form"
import { ProductReviews } from "@/components/product-reviews"
import { StarRating } from "@/components/star-rating"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const { addItemWithQuantity } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await productsApi.getById(productId)
          if (response.status === 'success' && response.data) {
            setProduct(response.data.product)
            setRelatedProducts(response.data.relatedProducts)
          }
        } catch (error) {
          console.error('Error fetching product:', error)
        }
      }
      
      fetchProduct()
    }
  }, [productId])

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)

    try {
      const result = await addItemWithQuantity(product, quantity)
      if (!result.success) {
        // Handle error - you might want to show a toast notification
        console.error('Failed to add to cart:', result.message)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change))
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f1e8]">
        <AnimatedHeader />
        <div className="container mx-auto px-4 py-12 pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-light text-gray-800 mb-4">Product not found</h1>
            <Link href="/products">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white">Back to Products</Button>
            </Link>
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
            <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex] || "/placeholder.svg?height=600&width=600&query=beauty product"}
                alt={product.name}
                className="w-full h-full object-cover"
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
            <StarRating 
              rating={product.rating || 0} 
              size="lg" 
              showText={true}
              className="mb-2"
            />
            <span className="text-sm text-gray-600">
              ({product.reviewCount || 0} reviews)
            </span>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-light text-gray-800">PKR {product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">PKR {product.originalPrice.toFixed(2)}</span>
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
                      Add to Cart - PKR {(product.price * quantity).toFixed(2)}
                    </div>
                  )}
                </Button>

                <Button variant="outline" size="lg" className="px-4 bg-transparent">
                  <Heart className="w-5 h-5" />
                </Button>

                <Button variant="outline" size="lg" className="px-4 bg-transparent">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full py-3 text-lg border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white bg-transparent"
              >
                Buy Now
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free delivery on orders over PKR 2,000</span>
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

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-4">Product Details</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                {product.benefits && product.benefits.length > 0 && (
                  <div className="mb-6">
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
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-4">Ingredients</h3>
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
            </TabsContent>

            <TabsContent value="reviews" className="space-y-8">
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
                averageRating={product.rating || 0}
                totalReviews={product.reviewCount || 0}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* You Might Like Section */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-light tracking-wide text-gray-800 mb-8 text-center">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
