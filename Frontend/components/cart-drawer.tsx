"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, ShoppingBag, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()

  const deliveryFee = total > 2000 ? 0 : 200
  const finalTotal = total + deliveryFee

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Animate cart items
  const [itemAnimations, setItemAnimations] = useState<Record<string, boolean>>({})

  useEffect(() => {
    items.forEach((item, index) => {
      setTimeout(() => {
        setItemAnimations(prev => ({ ...prev, [item.product._id]: true }))
      }, index * 100)
    })
  }, [items])

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Simulate checkout process
    setTimeout(() => {
      setIsCheckingOut(false)
      onClose() // Close the cart drawer
      router.push('/checkout') // Redirect to checkout page
    }, 1000)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 ease-out animate-in fade-in-0"
          onClick={onClose}
          style={{ zIndex: 80 }}
        />
      )}

      {/* Cart Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-all duration-500 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ zIndex: 90 }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 transition-all duration-400 ease-out ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`} style={{ transitionDelay: isOpen ? '150ms' : '0ms' }}>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-gray-700 transition-transform duration-300 hover:scale-110" />
              <h2 className="text-xl font-medium text-gray-800">Shopping Cart ({itemCount})</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Content */}
          <div className={`flex-1 overflow-y-auto transition-all duration-400 ease-out ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`} style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}>
            {items.length === 0 ? (
              /* Empty Cart */
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some products to get started</p>
                <Link href="/products">
                  <Button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              /* Cart Items */
              <div className="p-6 space-y-6">
                {items.map((item, index) => (
                  <div 
                    key={item.product._id} 
                    className={`flex gap-4 transform transition-all duration-400 ease-out ${
                      isOpen 
                        ? 'translate-x-0 opacity-100 scale-100' 
                        : 'translate-x-8 opacity-0 scale-95'
                    }`}
                    style={{ transitionDelay: isOpen ? `${index * 100 + 250}ms` : '0ms' }}
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 group">
                      <img
                        src={item.product.images[0] || "/placeholder.svg?height=80&width=80&query=beauty product"}
                        alt={item.product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{item.product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{item.product.category?.replace("-", " ") || "Product"}</p>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">PKR {item.product.price.toFixed(2)}</span>
                          {item.product.originalPrice && (
                            <span className="text-xs text-gray-500 line-through">
                              PKR {item.product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="w-8 h-8 p-0 border-gray-300 hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium transition-all duration-200">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="w-8 h-8 p-0 border-gray-300 hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-auto mt-2 text-xs transition-all duration-200 hover:scale-105"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Clear Cart */}
                {items.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      Clear all items
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Order Summary */}
          {items.length > 0 && (
            <div className={`border-t border-gray-200 p-6 space-y-4 transition-all duration-400 ease-out ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}>
              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {total > 2000 ? (
                    <span className="text-green-600 font-medium">Free delivery!</span>
                  ) : (
                    <span>Add PKR {(2000 - total).toFixed(2)} more for free delivery</span>
                  )}
                </span>
              </div>

              {/* Progress Bar for Free Delivery */}
              {total <= 2000 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((total / 2000) * 100, 100)}%` }}
                  />
                </div>
              )}

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">PKR {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? <span className="text-green-600">Free</span> : `PKR ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>PKR {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 text-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-70"
              >
                {isCheckingOut ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Checkout - PKR ${finalTotal.toFixed(2)}`
                )}
              </Button>

              {/* Continue Shopping */}
              <Link href="/products">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}