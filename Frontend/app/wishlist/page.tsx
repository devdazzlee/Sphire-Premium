"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { useToast, ToastContainer } from "@/components/ui/toast"
import { ArrowLeft, Heart, ShoppingCart, Trash2, Eye } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { toasts, removeToast, success, error } = useToast()
  const router = useRouter()

  const handleAddToCart = (product: any) => {
    addToCart(product)
    success("Added to Cart", `${product.name} has been added to your cart`)
  }

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeFromWishlist(productId)
    success("Removed from Wishlist", `${productName} has been removed from your wishlist`)
  }

  const handleClearWishlist = () => {
    if (wishlist.length === 0) return
    
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      clearWishlist()
      success("Wishlist Cleared", "All items have been removed from your wishlist")
    }
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love by clicking the heart icon on any product. They'll appear here for easy access.
            </p>
            <Link href="/products">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
              <span className="text-gray-500">({wishlist.length} items)</span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleClearWishlist}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <Card key={item.product.id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Remove from wishlist button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.product.id, item.product.name)}
                  className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full shadow-sm"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </Button>

                {/* Quick view button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 left-2 w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">
                  {item.product.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-gray-800">
                    PKR {item.product.price.toFixed(2)}
                  </span>
                  {item.product.originalPrice && (
                    <span className="text-xs text-gray-500 line-through">
                      PKR {item.product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(item.product)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromWishlist(item.product.id, item.product.name)}
                    className="px-3 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Added {item.addedAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button variant="outline" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
          <Button 
            onClick={handleClearWishlist}
            variant="outline"
            className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>
      </div>
    </div>
  )
}
