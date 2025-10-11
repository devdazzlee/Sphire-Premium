"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToastContext } from "@/components/ui/toast"
import { ordersApi, usersApi, type Address } from "@/lib/api"
import { isTokenValid, isTokenExpired } from "@/lib/token-utils"
import { ShoppingCart, MapPin, CreditCard, Package, ArrowLeft, CheckCircle, Clock, Truck, Shield } from "lucide-react"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { items, total, clearCart } = useCart()
  const { success, error } = useToastContext()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [orderCompleted, setOrderCompleted] = useState(false)

  const [addressForm, setAddressForm] = useState({
    type: "home" as "home" | "work" | "other",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    isDefault: false,
  })

  const [orderNotes, setOrderNotes] = useState("")

  useEffect(() => {
    console.log('=== CHECKOUT USEEFFECT ===') // Debug log
    console.log('isAuthenticated:', isAuthenticated) // Debug log
    console.log('items.length:', items.length) // Debug log
    console.log('isLoading:', isLoading) // Debug log
    console.log('orderCompleted:', orderCompleted) // Debug log
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login...') // Debug log
      router.push('/login')
      return
    }

    // Only redirect to cart if items are empty, we're not loading, and order wasn't just completed
    if (items.length === 0 && !isLoading && !orderCompleted) {
      console.log('No items in cart, redirecting to cart...') // Debug log
      router.push('/cart')
      return
    }

    console.log('Fetching addresses...') // Debug log
    fetchAddresses()
  }, [isAuthenticated, items.length, router, isLoading, orderCompleted])

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('No token found for fetching addresses')
        return
      }

      const response = await usersApi.getAddresses(token)
      if (response.status === 'success' && response.data) {
        setAddresses(response.data.addresses)
        const defaultAddress = response.data.addresses.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
        }
      }
    } catch (err: any) {
      console.error('Error fetching addresses:', err)
    }
  }

  const handleAddAddress = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('Please log in to add an address')
        return
      }

      // Validate required fields
      if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
        toast.error('Please fill in all required address fields')
        return
      }

      // Check if token is valid and not expired
      if (!isTokenValid(token)) {
        toast.error('Your session has expired or is invalid. Please log in again.')
        localStorage.removeItem('auth_token')
        router.push('/login')
        return
      }

      if (isTokenExpired(token)) {
        toast.error('Your session has expired. Please log in again.')
        localStorage.removeItem('auth_token')
        router.push('/login')
        return
      }

      const response = await usersApi.addAddress(token, addressForm)
      if (response.status === 'success' && response.data) {
        setAddresses(response.data.addresses)
        setIsAddingAddress(false)
        setAddressForm({
          type: "home",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States",
          isDefault: false,
        })
        toast.success('Address added successfully')
      } else {
        toast.error(response.message || 'Failed to add address')
      }
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to add address")
    }
  }

  const handlePlaceOrder = async () => {
    console.log('=== PLACE ORDER CLICKED ===') // Debug log
    console.log('Selected address:', selectedAddress) // Debug log
    console.log('Cart items:', items) // Debug log
    
    if (!selectedAddress) {
      toast.error("Please select a shipping address")
      return
    }

    // Now that navigation is working, restore full order functionality

    try {
      setIsLoading(true)
      console.log('Starting order creation...') // Debug log
      
      const token = localStorage.getItem('auth_token')
      console.log('Token exists:', !!token) // Debug log
      
      if (!token) {
        toast.error("Please log in to place an order")
        // Force redirect to home instead of login
        await clearCart()
        router.push('/')
        return
      }

      // Check if token is valid and not expired
      if (!isTokenValid(token)) {
        toast.error("Your session has expired or is invalid. Please log in again.")
        localStorage.removeItem('auth_token')
        await clearCart()
        router.push('/') // Force redirect to home
        return
      }

      if (isTokenExpired(token)) {
        toast.error("Your session has expired. Please log in again.")
        localStorage.removeItem('auth_token')
        await clearCart()
        router.push('/') // Force redirect to home
        return
      }

      console.log('Calling ordersApi.create...') // Debug log
      console.log('Order data being sent:', {
        shippingAddress: selectedAddress,
        notes: orderNotes,
      }) // Debug log
      
      const response = await ordersApi.create(token, {
        shippingAddress: selectedAddress,
        notes: orderNotes,
      })

      console.log('=== ORDER API RESPONSE ===') // Debug log
      console.log('Full response:', JSON.stringify(response, null, 2)) // Debug log
      console.log('Response status:', response.status) // Debug log
      console.log('Response data:', response.data) // Debug log
      
      if (response.status === 'success' && response.data) {
        // Set order completed flag to prevent cart redirect
        setOrderCompleted(true)
        
        // Clear cart after successful order
        await clearCart()
        console.log('Cart cleared after successful order') // Debug log
        
        toast.success("Order placed successfully!")
        
        // Navigate to order success page with order number
        const orderNumber = response.data.order?.orderNumber || (response.data as any).orderNumber || (response.data as any)._id
        console.log('Order number found:', orderNumber) // Debug log
        
        if (orderNumber) {
          router.push(`/order-success?orderNumber=${orderNumber}`)
        } else {
          // Fallback to home page if no order number
          console.log('No order number, redirecting to home...') // Debug log
          router.push('/')
        }
      } else {
        console.log('Order creation failed, showing error and redirecting to home...') // Debug log
        toast.error(response.message || "Failed to place order")
        
        // Clear cart even on failure to prevent stuck state
        await clearCart()
        router.push('/') // Immediate redirect to home
      }
    } catch (err: any) {
      console.log('=== ORDER CREATION ERROR ===') // Debug log
      console.error('Error details:', err) // Debug log
      toast.error(err.message || "Failed to place order")
      
      // Always clear cart and redirect to home on error
      await clearCart()
      console.log('Error occurred, clearing cart and redirecting to home...') // Debug log
      router.push('/') // Immediate redirect to home
    } finally {
      setIsLoading(false)
      console.log('=== PLACE ORDER COMPLETED ===') // Debug log
    }
  }

  const steps = [
    { id: 1, name: 'Address', icon: MapPin },
    { id: 2, name: 'Review', icon: Package },
    { id: 3, name: 'Payment', icon: CreditCard },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AnimatedHeader />

      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/cart')}
            className="mb-3 md:mb-4 text-gray-600 hover:text-gray-900 text-sm md:text-base"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Back to Cart
          </Button>
          
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">Checkout</h1>
          <p className="text-sm md:text-base text-gray-600">Complete your order securely</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 md:mb-12">
          <div className="flex items-center justify-between md:justify-center px-2">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep >= step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 md:w-6 md:h-6" />
                      ) : (
                        <Icon className="w-4 h-4 md:w-6 md:h-6" />
                      )}
                    </div>
                    <span className={`mt-1 md:mt-0 md:ml-3 font-medium text-xs md:text-base ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-0.5 mx-2 md:mx-4 mt-0 md:mt-0 transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6">
                  <CardTitle className="flex items-center text-base md:text-xl">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Select or add a shipping address</CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  {addresses.length > 0 && (
                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Select Address</h4>
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`p-3 md:p-6 border-2 rounded-lg md:rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedAddress?._id === address._id
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-2 md:mb-3">
                                <span className="text-xs md:text-sm font-semibold capitalize bg-gray-100 text-gray-700 px-2 md:px-3 py-1 rounded-full">
                                  {address.type}
                                </span>
                                {address.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm md:text-base text-gray-700 font-medium">{address.street}</p>
                              <p className="text-xs md:text-sm text-gray-600">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                              <p className="text-xs md:text-sm text-gray-600">{address.country}</p>
                            </div>
                            {selectedAddress?._id === address._id && (
                              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Address */}
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        {addresses.length > 0 ? 'Add New Address' : 'Add Address'}
                      </h4>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingAddress(!isAddingAddress)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs md:text-sm px-3 md:px-4 py-2"
                      >
                        {isAddingAddress ? 'Cancel' : '+ Add New'}
                      </Button>
                    </div>

                    {isAddingAddress && (
                      <div className="bg-gray-50 p-3 md:p-6 rounded-lg md:rounded-xl space-y-3 md:space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <Label htmlFor="addressType" className="text-xs md:text-sm">Address Type</Label>
                            <select
                              value={addressForm.type}
                              onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as any })}
                              className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="zipCode" className="text-xs md:text-sm">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              value={addressForm.zipCode}
                              onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                              placeholder="12345"
                              className="p-2 md:p-3 text-sm md:text-base"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="street" className="text-xs md:text-sm">Street Address</Label>
                          <Input
                            id="street"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                            placeholder="123 Main Street"
                            className="p-2 md:p-3 text-sm md:text-base"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <Label htmlFor="city" className="text-xs md:text-sm">City</Label>
                            <Input
                              id="city"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              placeholder="New York"
                              className="p-2 md:p-3 text-sm md:text-base"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state" className="text-xs md:text-sm">State</Label>
                            <Input
                              id="state"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              placeholder="NY"
                              className="p-2 md:p-3 text-sm md:text-base"
                            />
                          </div>
                        </div>
                        
                        <Button
                          onClick={handleAddAddress}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 md:py-3 rounded-lg text-sm md:text-base"
                        >
                          Add Address
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Review Order */}
            {currentStep === 2 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 p-4 md:p-6">
                  <CardTitle className="flex items-center text-lg md:text-2xl">
                    <Package className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-green-600" />
                    Review Your Order
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Review your items and shipping details</CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-8">
                  {/* Order Items */}
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-lg">Order Items</h4>
                    <div className="space-y-3 md:space-y-4">
                      {items.map((item) => (
                        <div key={item.product._id} className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.images[0] || '/placeholder.jpg'}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm md:text-base truncate">{item.product.name}</h5>
                            <p className="text-xs md:text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-gray-900 text-sm md:text-base">Rs {(item.product.price || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6 md:my-8" />

                  {/* Shipping Address */}
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-lg">Shipping Address</h4>
                    {selectedAddress ? (
                      <div className="p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-200">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="text-xs md:text-sm font-semibold capitalize bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-full">
                            {selectedAddress.type}
                          </span>
                          {selectedAddress.isDefault && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm md:text-base text-gray-700 font-medium">{selectedAddress.street}</p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">{selectedAddress.country}</p>
                      </div>
                    ) : (
                      <p className="text-red-600 text-sm md:text-base">No shipping address selected</p>
                    )}
                    </div>

                  {/* Order Notes */}
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-lg">Order Notes</h4>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special instructions for delivery..."
                      className="w-full p-3 md:p-4 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 md:p-6">
                  <CardTitle className="flex items-center text-lg md:text-2xl">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-purple-600" />
                    Payment Method
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Cash on Delivery - Pay when your order arrives</CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Truck className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm md:text-lg">Cash on Delivery</h4>
                        <p className="text-blue-700 text-xs md:text-base">
                          Pay with cash when your order is delivered. No online payment required.
                        </p>
                        <div className="flex items-center space-x-3 md:space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-xs md:text-sm text-blue-600">
                            <Shield className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Secure</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs md:text-sm text-blue-600">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Convenient</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>

          {/* Order Summary Sidebar */}
            <div className="space-y-4 md:space-y-6">
            <Card className="border-0 shadow-xl lg:sticky lg:top-8">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 md:p-6">
                <CardTitle className="flex items-center text-base md:text-lg">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Order Summary
                </CardTitle>
                </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-3 md:space-y-4">
                    {items.map((item) => (
                    <div key={item.product._id} className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900 flex-shrink-0">Rs {(item.product.price || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                <Separator className="my-4 md:my-6" />

                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs {(total || 0).toFixed(2)}</span>
                    </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">Rs 0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base md:text-lg font-bold">
                    <span>Total</span>
                    <span>Rs {(total || 0).toFixed(2)}</span>
                  </div>
                  </div>

                <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
                  {currentStep < 3 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={currentStep === 1 && !selectedAddress}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 md:py-3 rounded-lg text-sm md:text-base"
                    >
                      Continue to {steps[currentStep]?.name}
                    </Button>
                  ) : (
                  <Button
                    onClick={handlePlaceOrder}
                      disabled={isLoading || !selectedAddress}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 md:py-3 rounded-lg text-sm md:text-base"
                    >
                      {isLoading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  )}
                  
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="w-full text-sm md:text-base py-2.5 md:py-3"
                    >
                      Back to {steps[currentStep - 2]?.name}
                  </Button>
                  )}
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      <Footer />
    </main>
  )
}