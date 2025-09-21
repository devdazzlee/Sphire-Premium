"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToastContext } from "@/components/ui/toast"
import { usersApi, type User, type Address } from "@/lib/api"
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Edit, Plus, Trash2 } from "lucide-react"

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const { success, error } = useToastContext()
  const [profile, setProfile] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  })

  const [addressForm, setAddressForm] = useState({
    type: "home" as "home" | "work" | "other",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    isDefault: false,
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile()
    }
  }, [isAuthenticated, user])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await usersApi.getProfile(user!.email)
      if (response.status === 'success' && response.data) {
        setProfile(response.data.user)
        setAddresses(response.data.user.addresses || [])
        setFormData({
          name: response.data.user.name,
          phone: response.data.user.phone || "",
        })
      }
    } catch (err: any) {
      error("Error", err.message || "Failed to fetch profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await usersApi.updateProfile(user!.email, formData)
      if (response.status === 'success' && response.data) {
        setProfile(response.data.user)
        setIsEditing(false)
        success("Success", "Profile updated successfully")
      } else {
        error("Error", response.message || "Failed to update profile")
      }
    } catch (err: any) {
      error("Error", err.message || "Failed to update profile")
    }
  }

  const handleAddAddress = async () => {
    try {
      const response = await usersApi.addAddress(user!.email, addressForm)
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
        success("Success", "Address added successfully")
      } else {
        error("Error", response.message || "Failed to add address")
      }
    } catch (err: any) {
      error("Error", err.message || "Failed to add address")
    }
  }

  const handleUpdateAddress = async (addressId: string) => {
    try {
      const response = await usersApi.updateAddress(user!.email, addressId, addressForm)
      if (response.status === 'success' && response.data) {
        setAddresses(response.data.addresses)
        setEditingAddressId(null)
        setAddressForm({
          type: "home",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States",
          isDefault: false,
        })
        success("Success", "Address updated successfully")
      } else {
        error("Error", response.message || "Failed to update address")
      }
    } catch (err: any) {
      error("Error", err.message || "Failed to update address")
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await usersApi.deleteAddress(user!.email, addressId)
      if (response.status === 'success' && response.data) {
        setAddresses(response.data.addresses)
        success("Success", "Address deleted successfully")
      } else {
        error("Error", response.message || "Failed to delete address")
      }
    } catch (err: any) {
      error("Error", err.message || "Failed to delete address")
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const response = await usersApi.setDefaultAddress(user!.email, addressId)
      if (response.status === 'success' && response.data) {
        setAddresses(response.data.addresses)
        success("Success", "Default address updated")
      } else {
        error("Error", response.message || "Failed to update default address")
      }
    } catch (err: any) {
      error("Error", err.message || "Failed to update default address")
    }
  }

  const startEditingAddress = (address: Address) => {
    setEditingAddressId(address._id!)
    setAddressForm({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
    })
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setIsAddingAddress(false)
    setEditingAddressId(null)
    setAddressForm({
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      isDefault: false,
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <AnimatedHeader />
      
      <main className="container mx-auto px-4 py-12 pt-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light tracking-wide text-gray-800 mb-2">My Profile</h1>
            <p className="text-lg text-gray-600">Manage your account information and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                    >
                      {isEditing ? "Save Changes" : <><Edit className="w-4 h-4 mr-2" />Edit</>}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Account Type</Label>
                      <div className="flex items-center space-x-2">
                        <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                          {profile?.role === 'admin' ? 'Admin' : 'Customer'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleUpdateProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-gray-600">
                          {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Account Status</p>
                        <Badge variant={profile?.isActive ? 'default' : 'destructive'}>
                          {profile?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Preferences</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Newsletter</span>
                        <Badge variant={profile?.preferences?.newsletter ? 'default' : 'secondary'}>
                          {profile?.preferences?.newsletter ? 'Subscribed' : 'Not Subscribed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Notifications</span>
                        <Badge variant={profile?.preferences?.notifications ? 'default' : 'secondary'}>
                          {profile?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Shipping Addresses</CardTitle>
                      <CardDescription>Manage your shipping addresses</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddingAddress(true)}>
                      <Plus className="w-4 h-4 mr-2" />Add Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No addresses added yet</p>
                      <Button onClick={() => setIsAddingAddress(true)}>
                        <Plus className="w-4 h-4 mr-2" />Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <Card key={address._id} className={address.isDefault ? "border-primary" : ""}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline" className="capitalize">
                                    {address.type}
                                  </Badge>
                                  {address.isDefault && (
                                    <Badge variant="default">Default</Badge>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium">{address.street}</p>
                                  <p className="text-sm text-gray-600">
                                    {address.city}, {address.state} {address.zipCode}
                                  </p>
                                  <p className="text-sm text-gray-600">{address.country}</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {!address.isDefault && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetDefaultAddress(address._id!)}
                                  >
                                    Set Default
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditingAddress(address)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAddress(address._id!)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {(isAddingAddress || editingAddressId) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingAddressId ? "Edit Address" : "Add New Address"}
                    </CardTitle>
                    <CardDescription>
                      {editingAddressId ? "Update address information" : "Add a new shipping address"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressType">Address Type</Label>
                        <select
                          id="addressType"
                          value={addressForm.type}
                          onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as any })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="NY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          placeholder="United States"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="isDefault">Set as default address</Label>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={() => editingAddressId ? handleUpdateAddress(editingAddressId) : handleAddAddress()}
                      >
                        {editingAddressId ? "Update Address" : "Add Address"}
                      </Button>
                      <Button variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}