"use client"

import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function WishlistPage() {
  const router = useRouter()
  const { items, removeFromWishlist, clearWishlist } = useWishlist()
  const { addItem } = useCart()

  const handleAddToCart = async (item: any) => {
    // Convert wishlist item to Product format for cart
    const product = {
      _id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      images: item.images,
      category: item.category,
      subcategory: '',
      brand: '',
      inStock: item.inStock,
      stockQuantity: 100,
      rating: item.rating,
      reviewCount: item.reviewCount,
      features: [],
      tags: [],
      isActive: true,
      isFeatured: false,
      isNew: false,
      isOnSale: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const result = await addItem(product)
    if (!result.success) {
      console.error('Failed to add to cart:', result.message)
    }
  }

  const handleMoveAllToCart = async () => {
    for (const item of items) {
      await handleAddToCart(item)
    }
    clearWishlist()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AnimatedHeader />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Heart className="w-8 h-8 md:w-10 md:h-10 mr-3 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {items.length === 0
                  ? "Your wishlist is empty"
                  : `${items.length} ${items.length === 1 ? "item" : "items"} in your wishlist`}
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex gap-3">
                <Button
                  onClick={handleMoveAllToCart}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add All to Cart
                </Button>
                <Button
                  onClick={clearWishlist}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Wishlist
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
              <p className="text-gray-600 mb-6">
                Save your favorite products here to easily find them later
              </p>
              <Button
                onClick={() => router.push("/products")}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Discover Products
              </Button>
            </div>
          </Card>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item._id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  {/* Product Image */}
                  <Link href={`/products/${item._id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <Image
                      src={item.images[0] || "/placeholder.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 group/btn shadow-lg"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4 text-gray-700 group-hover/btn:text-white transition-colors" />
                  </button>

                  {/* Badges */}
                  {!item.inStock && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Out of Stock
                    </div>
                  )}
                  {item.originalPrice && item.originalPrice > item.price && (
                    <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${item._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Category */}
                  <p className="text-sm text-gray-500 mb-2">{item.category}</p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({item.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center mb-4">
                    <span className="text-lg font-bold text-gray-900">Rs {item.price.toFixed(2)}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        Rs {item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock}
                      className="w-full bg-black hover:bg-gray-800 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {items.length > 0 && (
          <div className="mt-12 text-center">
            <Button
              onClick={() => router.push("/products")}
              variant="outline"
              size="lg"
              className="border-gray-300 hover:bg-gray-50"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
