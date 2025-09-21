"use client"

import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, X, ShoppingBag, Truck, ArrowLeft } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"
import { useState } from "react"

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const deliveryFee = total > 75 ? 0 : 8.99
  const finalTotal = total + deliveryFee

  const handleCheckout = () => {
    setIsCheckingOut(true)
    setTimeout(() => {
      setIsCheckingOut(false)
      alert("Redirecting to checkout...")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <AnimatedHeader />

      <main className="container mx-auto px-4 py-12 pt-32">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-800 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {itemCount === 0 ? "Your cart is empty" : `PKR {itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Discover our amazing products and add them to your cart</p>
            <Link href="/products">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-gray-800">Cart Items</h2>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-gray-500 hover:text-red-600">
                    Clear All
                  </Button>
                </div>

                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div key={item.product.id}>
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.images[0] || "/placeholder.svg?height=96&width=96&query=beauty product"}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-gray-800 mb-1">{item.product.name}</h3>
                              <p className="text-sm text-gray-500">{item.product.category.replace("-", " ")}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.product.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">PKR {item.product.price.toFixed(2)}</span>
                              {item.product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  PKR {item.product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="mt-2 text-right">
                            <span className="text-sm text-gray-600">
                              Item total:{" "}
                              <span className="font-semibold">PKR {(item.product.price * item.quantity).toFixed(2)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      {index < items.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-medium text-gray-800 mb-6">Order Summary</h2>

                {/* Delivery Progress */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {total > 75 ? (
                        <span className="text-green-600 font-medium">Free delivery included!</span>
                      ) : (
                        <span>Add PKR {(75 - total).toFixed(2)} more for free delivery</span>
                      )}
                    </span>
                  </div>
                  {total <= 75 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((total / 75) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <Separator className="mb-6" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">PKR {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? <span className="text-green-600">Free</span> : `$${deliveryFee.toFixed(2)}`}
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
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 text-lg mb-4"
                >
                  {isCheckingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Proceed to Checkout`
                  )}
                </Button>

                {/* Continue Shopping */}
                <Link href="/products">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
