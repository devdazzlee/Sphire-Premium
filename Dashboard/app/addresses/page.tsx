"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  MapPinIcon,
  User,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { adminApi, tokenManager } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
interface Address {
  _id: string
  userId?: string
  user: string | { _id: string; name: string; email: string; phone?: string }
  type: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [viewingAddress, setViewingAddress] = useState<Address | null>(null)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCountry, setFilterCountry] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAddresses, setTotalAddresses] = useState(0)

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    userId: '',
    type: 'home',
    street: '',
    city: '',
    state: '',
    country: 'Pakistan',
    postalCode: '',
    isDefault: false
  })

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.getAddresses(token, {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        type: filterType === "all" ? undefined : filterType,
        country: filterCountry === "all" ? undefined : filterCountry
      })

      if (response.status === 'success' && response.data) {
        setAddresses(response.data.addresses)
        setTotalPages(response.data.pagination.totalPages)
        setTotalAddresses(response.data.pagination.totalAddresses)
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
      setError('Failed to load addresses')
    }
  }

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.getUsers(token, { limit: 100 })
      if (response.status === 'success' && response.data) {
        setCustomers(response.data.users)
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  useEffect(() => {
    fetchAddresses()
    fetchCustomers()
  }, [currentPage, searchTerm, filterType, filterCountry])

  const openCreateModal = () => {
    setFormData({
      userId: '',
      type: 'home',
      street: '',
      city: '',
      state: '',
      country: 'Pakistan',
      postalCode: '',
      isDefault: false
    })
    setIsCreateModalOpen(true)
  }

  const openViewModal = (address: Address) => {
    setViewingAddress(address)
  }

  const openEditModal = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      userId: address.userId || (typeof address.user === 'object' ? address.user._id : address.user),
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    })
  }

  const openDeleteModal = (address: Address) => {
    setDeletingAddress(address)
  }

  const resetForm = () => {
    setFormData({
      userId: '',
      type: 'home',
      street: '',
      city: '',
      state: '',
      country: 'Pakistan',
      postalCode: '',
      isDefault: false
    })
  }

  const handleCreateAddress = async () => {
    // Validate required fields
    if (!formData.userId) {
      setError('Please select a customer')
      return
    }
    if (!formData.street || !formData.city || !formData.state || !formData.country) {
      setError('Please fill in all required address fields')
      return
    }

    try {
      setActionLoading('create')
      setError(null) // Clear any previous errors
      const token = tokenManager.getToken()
      if (!token) return

      // Update user with address information
      const addressData = {
        addresses: [{
          type: formData.type,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.postalCode,
          isDefault: formData.isDefault
        }]
      }

      const response = await adminApi.updateUser(token, formData.userId, addressData)
      
      if (response.status === 'success') {
        setSuccess('Address created successfully')
        setIsCreateModalOpen(false)
        resetForm()
        await fetchAddresses()
      } else {
        setError(response.message || 'Failed to create address')
      }
    } catch (err: any) {
      console.error('Error creating address:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create address'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateAddress = async () => {
    if (!editingAddress) return

    // Validate required fields
    if (!formData.userId) {
      setError('Please select a customer')
      return
    }
    if (!formData.street || !formData.city || !formData.state || !formData.country) {
      setError('Please fill in all required address fields')
      return
    }

    try {
      setActionLoading('update')
      setError(null) // Clear any previous errors
      const token = tokenManager.getToken()
      if (!token) return

      const addressData = {
        type: formData.type,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        isDefault: formData.isDefault
      }

      const userId = editingAddress.userId || (typeof editingAddress.user === 'object' ? editingAddress.user._id : editingAddress.user)
      const response = await adminApi.updateAddress(token, userId, addressData)
      
      if (response.status === 'success') {
        setSuccess('Address updated successfully')
        setEditingAddress(null)
        resetForm()
        await fetchAddresses()
      } else {
        setError(response.message || 'Failed to update address')
      }
    } catch (err: any) {
      console.error('Error updating address:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update address'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteAddress = async () => {
    if (!deletingAddress) return

    try {
      setActionLoading('delete')
      const token = tokenManager.getToken()
      if (!token) return

      const userId = deletingAddress.userId || (typeof deletingAddress.user === 'object' ? deletingAddress.user._id : deletingAddress.user)
      
      const response = await adminApi.deleteAddress(token, userId)
      
      if (response.status === 'success') {
        setSuccess('Address deleted successfully')
        setDeletingAddress(null)
        await fetchAddresses()
      } else {
        setError(response.message || 'Failed to delete address')
      }
    } catch (err: any) {
      console.error('Error deleting address:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete address'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'home':
        return <Badge variant="default">Home</Badge>
      case 'work':
        return <Badge variant="secondary">Work</Badge>
      case 'billing':
        return <Badge variant="outline">Billing</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Addresses</h1>
              <p className="text-muted-foreground">
                Manage customer addresses and delivery locations
              </p>
            </div>
            <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAddresses}</div>
                <p className="text-xs text-muted-foreground">
                  All registered addresses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Home Addresses</CardTitle>
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {addresses.filter(a => a.type === 'home').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Residential addresses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Work Addresses</CardTitle>
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {addresses.filter(a => a.type === 'work').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Business addresses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Default Addresses</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {addresses.filter(a => a.isDefault).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Primary addresses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Addresses Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Addresses</CardTitle>
                  <CardDescription>
                    Manage customer delivery addresses
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search addresses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="Pakistan">Pakistan</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addresses.map((address) => (
                        <TableRow key={address._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {typeof address.user === 'object' ? address.user.name : 'Unknown User'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {typeof address.user === 'object' ? address.user.email : 'No email'}
                                </p>
                                {typeof address.user === 'object' && address.user.phone && (
                                  <p className="text-xs text-muted-foreground">
                                    {address.user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(address.type)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{address.street}</p>
                              <p className="text-muted-foreground">{address.postalCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{address.city}</p>
                              <p className="text-muted-foreground">{address.state}, {address.country}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {address.isDefault ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">Default</Badge>
                            ) : (
                              <Badge variant="secondary">Secondary</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openViewModal(address)
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="View address details"
                              >
                                <Eye className="w-4 h-4 text-green-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openEditModal(address)
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="Edit address"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openDeleteModal(address)
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Delete address"
                                disabled={actionLoading !== null}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPinIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No addresses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Customer addresses will appear here when they add them
                  </p>
                  <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Address Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Address</DialogTitle>
            <DialogDescription>
              Add a new address for a customer
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer</label>
                <Select value={formData.userId} onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name || 'Unknown Customer'}</span>
                            <span className="text-xs text-muted-foreground">{customer.email}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-customers" disabled>No customers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Address Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Street Address</label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Postal Code</label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Postal code"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default address
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={actionLoading === 'create'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAddress}
              disabled={actionLoading === 'create'}
            >
              {actionLoading === 'create' ? 'Creating...' : 'Create Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Address Details Modal */}
      <Dialog open={!!viewingAddress} onOpenChange={() => setViewingAddress(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Address Details</DialogTitle>
            <DialogDescription>
              View detailed information about this address
            </DialogDescription>
          </DialogHeader>

          {viewingAddress && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{typeof viewingAddress.user === 'object' ? viewingAddress.user.name : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{typeof viewingAddress.user === 'object' ? viewingAddress.user.email : 'No email'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{typeof viewingAddress.user === 'object' && viewingAddress.user.phone ? viewingAddress.user.phone : 'No phone'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-mono text-xs">{viewingAddress.userId || (typeof viewingAddress.user === 'object' ? viewingAddress.user._id : 'N/A')}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Address Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      {getTypeBadge(viewingAddress.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Default:</span>
                      {viewingAddress.isDefault ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(viewingAddress.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{new Date(viewingAddress.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Address */}
              <div>
                <h3 className="font-medium mb-2">Complete Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm">
                    <p className="font-medium capitalize">{viewingAddress.type} Address</p>
                    <p className="mt-1">{viewingAddress.street}</p>
                    <p>{viewingAddress.city}, {viewingAddress.state} {viewingAddress.postalCode}</p>
                    <p>{viewingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingAddress(null)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingAddress) {
                  openEditModal(viewingAddress)
                  setViewingAddress(null)
                }
              }}
            >
              Edit Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Address Modal */}
      <Dialog open={!!editingAddress} onOpenChange={() => setEditingAddress(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update address information
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer</label>
                <Select value={formData.userId} onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name || 'Unknown Customer'}</span>
                            <span className="text-xs text-muted-foreground">{customer.email}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-customers" disabled>No customers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Address Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Street Address</label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Postal Code</label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Postal code"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefaultEdit"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isDefaultEdit" className="text-sm font-medium">
                  Set as default address
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingAddress(null)}
              disabled={actionLoading === 'update'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAddress}
              disabled={actionLoading === 'update'}
            >
              {actionLoading === 'update' ? 'Updating...' : 'Update Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingAddress} onOpenChange={() => setDeletingAddress(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingAddress && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      {deletingAddress.street}
                    </p>
                    <p className="text-sm text-red-700">
                      {deletingAddress.city}, {deletingAddress.state}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This will permanently remove the address and cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingAddress(null)}
              disabled={actionLoading === 'delete'}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAddress}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AddressesPage() {
  return (
    <AuthGuard>
      <AddressesContent />
    </AuthGuard>
  )
}
