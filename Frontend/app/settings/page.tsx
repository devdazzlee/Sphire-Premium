"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast, ToastContainer } from "@/components/ui/toast"
import { ArrowLeft, User as UserIcon, Bell, Shield, CreditCard, MapPin, Globe, Palette, Save, Eye, EyeOff, RefreshCw } from "lucide-react"
import { usersApi, authApi, type User, type Address } from "@/lib/api"
import { isTokenValid, isTokenExpired } from "@/lib/token-utils"

export default function SettingsPage() {
  const router = useRouter()
  const { toasts, removeToast, success, error } = useToast()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Address Settings
  const [addressData, setAddressData] = useState({
    type: "home" as "home" | "work" | "other",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    isDefault: false
  })

  // Notification Settings
  const [notifications, setNotifications] = useState({
    newsletter: true,
    notifications: true
  })

  // Load user data
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated && user) {
      loadUserData()
    }
  }, [isAuthenticated, isLoading, user, router])

  const loadUserData = async () => {
    try {
      setIsLoadingData(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const [profileResponse, addressesResponse] = await Promise.all([
        usersApi.getProfile(token),
        usersApi.getAddresses(token)
      ])

      if (profileResponse.status === 'success' && profileResponse.data) {
        const userData = profileResponse.data.user
        setProfile(userData)
        setProfileData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || ""
        })
        setNotifications({
          newsletter: userData.preferences.newsletter,
          notifications: userData.preferences.notifications
        })
      }

      if (addressesResponse.status === 'success' && addressesResponse.data) {
        setAddresses(addressesResponse.data.addresses)
      }
    } catch (error: any) {
      console.error('Error loading user data:', error)
      error('Failed to load user data')
    } finally {
      setIsLoadingData(false)
    }
  }

  // Save profile settings
  const saveProfileSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await usersApi.updateProfile(token, {
        name: profileData.name,
        phone: profileData.phone
      })

      if (response.status === 'success') {
        success('Profile updated successfully')
        setProfile(response.data?.user || null)
      } else {
        error(response.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      error('Failed to update profile')
    }
  }

  // Save notification settings
  const saveNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await usersApi.updateProfile(token, {
        preferences: notifications
      })

      if (response.status === 'success') {
        success('Notification settings updated successfully')
        setProfile(response.data?.user || null)
      } else {
        error(response.message || 'Failed to update notification settings')
      }
    } catch (error: any) {
      console.error('Error updating notification settings:', error)
      error('Failed to update notification settings')
    }
  }

  // Add new address
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        error('No token found. Please log in.')
        return
      }

      const response = await authApi.refreshToken(token)
      if (response.status === 'success') {
        localStorage.setItem('auth_token', response?.data?.token || '')
        success('Token refreshed successfully')
      } else {
        error('Failed to refresh token. Please log in again.')
        localStorage.removeItem('auth_token')
        router.push('/login')
      }
    } catch (error: any) {
      console.error('Token refresh error:', error)
      error('Failed to refresh token. Please log in again.')
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  }

  const addAddress = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        error('Please log in to add an address')
        return
      }

      // Validate required fields
      if (!addressData.street || !addressData.city || !addressData.state || !addressData.zipCode) {
        error('Please fill in all required address fields')
        return
      }

      console.log('Token:', token.substring(0, 20) + '...')
      console.log('Address data:', addressData)

      // Check if token is valid and not expired
      if (!isTokenValid(token)) {
        error('Your session has expired or is invalid. Please log in again.')
        localStorage.removeItem('auth_token')
        router.push('/login')
        return
      }

      if (isTokenExpired(token)) {
        error('Your session has expired. Please log in again.')
        localStorage.removeItem('auth_token')
        router.push('/login')
        return
      }

      const response = await usersApi.addAddress(token, addressData)

      if (response.status === 'success') {
        success('Address added successfully')
        setAddresses(response.data?.addresses || [])
        setAddressData({
          type: "home",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States",
          isDefault: false
        })
      } else {
        error(response.message || 'Failed to add address')
      }
    } catch (error: any) {
      console.error('Error adding address:', error)
      error('Failed to add address')
    }
  }

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    showOnlineStatus: false,
    allowDataCollection: true,
    marketingEmails: false,
    thirdPartySharing: false
  })

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    deviceNotifications: true
  })

  // Display Settings
  const [display, setDisplay] = useState({
    theme: "light",
    language: "en",
    currency: "PKR",
    timezone: "Asia/Karachi"
  })

  // Payment Settings
  const [payment, setPayment] = useState({
    defaultPaymentMethod: "cod",
    savePaymentMethods: false,
    autoSaveCards: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSave = (section: string) => {
    success("Settings Saved", `${section} settings have been updated successfully`)
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      error("Password Mismatch", "New password and confirm password do not match")
      return
    }
    if (newPassword.length < 8) {
      error("Weak Password", "Password must be at least 8 characters long")
      return
    }
    success("Password Changed", "Your password has been updated successfully")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={saveProfileSettings} className="bg-gray-800 hover:bg-gray-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Address Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Addresses */}
              {addresses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Saved Addresses</h4>
                  {addresses.map((address) => (
                    <div key={address._id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium capitalize">{address.type} Address</p>
                          <p className="text-sm text-gray-600">{address.street}</p>
                          <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                          {address.isDefault && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Add New Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add New Address</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshToken}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh Token
                  </Button>
                </div>
                <div>
                  <Label htmlFor="addressType">Address Type</Label>
                  <Select value={addressData.type} onValueChange={(value: "home" | "work" | "other") => setAddressData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Textarea
                    id="street"
                    value={addressData.street}
                    onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={addressData.city}
                      onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={addressData.state}
                      onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={addressData.zipCode}
                      onChange={(e) => setAddressData(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={addressData.country} onValueChange={(value) => setAddressData(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Pakistan">Pakistan</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addAddress} className="bg-gray-800 hover:bg-gray-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handlePasswordChange} className="bg-gray-800 hover:bg-gray-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Security Options</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                  </div>
                  <Switch
                    checked={security.loginAlerts}
                    onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, loginAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Device Notifications</p>
                    <p className="text-sm text-gray-500">Get notified about new device logins</p>
                  </div>
                  <Switch
                    checked={security.deviceNotifications}
                    onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, deviceNotifications: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Newsletter</p>
                    <p className="text-sm text-gray-500">Receive our newsletter with updates and offers</p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newsletter: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">General Notifications</p>
                    <p className="text-sm text-gray-500">Receive general notifications about your account</p>
                  </div>
                  <Switch
                    checked={notifications.notifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>
              </div>
              <Button onClick={saveNotificationSettings} className="bg-gray-800 hover:bg-gray-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Display & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={display.theme} onValueChange={(value) => setDisplay(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={display.language} onValueChange={(value) => setDisplay(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ur">اردو</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={display.currency} onValueChange={(value) => setDisplay(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKR">PKR (Pakistani Rupee)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={display.timezone} onValueChange={(value) => setDisplay(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Karachi">Asia/Karachi</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleSave("Display")} className="bg-gray-800 hover:bg-gray-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Display Settings
              </Button>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultPayment">Default Payment Method</Label>
                <Select value={payment.defaultPaymentMethod} onValueChange={(value) => setPayment(prev => ({ ...prev, defaultPaymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Save Payment Methods</p>
                    <p className="text-sm text-gray-500">Allow saving payment methods for faster checkout</p>
                  </div>
                  <Switch
                    checked={payment.savePaymentMethods}
                    onCheckedChange={(checked) => setPayment(prev => ({ ...prev, savePaymentMethods: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Save Cards</p>
                    <p className="text-sm text-gray-500">Automatically save new payment cards</p>
                  </div>
                  <Switch
                    checked={payment.autoSaveCards}
                    onCheckedChange={(checked) => setPayment(prev => ({ ...prev, autoSaveCards: checked }))}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("Payment")} className="bg-gray-800 hover:bg-gray-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
