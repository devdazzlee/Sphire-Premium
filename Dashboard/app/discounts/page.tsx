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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Percent,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { adminApi, tokenManager } from "@/lib/api"

interface Discount {
  _id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

function DiscountsContent() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [viewingDiscount, setViewingDiscount] = useState<Discount | null>(null)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [deletingDiscount, setDeletingDiscount] = useState<Discount | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDiscounts, setTotalDiscounts] = useState(0)

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minimumAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    isActive: true,
    startDate: '',
    endDate: ''
  })

  // Fetch discounts
  const fetchDiscounts = async () => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      // For now, we'll use mock data since we need to create the discount API
      const mockDiscounts: Discount[] = [
        {
          _id: '1',
          code: 'WELCOME10',
          name: 'Welcome Discount',
          description: '10% off for new customers',
          type: 'percentage',
          value: 10,
          minimumAmount: 100,
          usageLimit: 100,
          usedCount: 45,
          isActive: true,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          code: 'SAVE50',
          name: 'Fixed Discount',
          description: 'PKR 50 off on orders above PKR 500',
          type: 'fixed',
          value: 50,
          minimumAmount: 500,
          maximumDiscount: 50,
          usageLimit: 50,
          usedCount: 23,
          isActive: true,
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      setDiscounts(mockDiscounts)
      setTotalDiscounts(mockDiscounts.length)
      setTotalPages(1)
    } catch (err) {
      console.error('Error fetching discounts:', err)
      setError('Failed to load discounts')
    }
  }

  useEffect(() => {
    fetchDiscounts()
  }, [currentPage, searchTerm, filterStatus])

  const openCreateModal = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minimumAmount: '',
      maximumDiscount: '',
      usageLimit: '',
      isActive: true,
      startDate: '',
      endDate: ''
    })
    setIsCreateModalOpen(true)
  }

  const openViewModal = (discount: Discount) => {
    setViewingDiscount(discount)
  }

  const openEditModal = (discount: Discount) => {
    setEditingDiscount(discount)
    setFormData({
      code: discount.code,
      name: discount.name,
      description: discount.description,
      type: discount.type,
      value: discount.value.toString(),
      minimumAmount: discount.minimumAmount?.toString() || '',
      maximumDiscount: discount.maximumDiscount?.toString() || '',
      usageLimit: discount.usageLimit?.toString() || '',
      isActive: discount.isActive,
      startDate: discount.startDate.split('T')[0],
      endDate: discount.endDate.split('T')[0]
    })
  }

  const openDeleteModal = (discount: Discount) => {
    setDeletingDiscount(discount)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minimumAmount: '',
      maximumDiscount: '',
      usageLimit: '',
      isActive: true,
      startDate: '',
      endDate: ''
    })
  }

  const handleCreateDiscount = async () => {
    try {
      setActionLoading('create')
      const token = tokenManager.getToken()
      if (!token) return

      // For now, just simulate success since we need to create the backend API
      setTimeout(() => {
        setSuccess('Discount created successfully')
        setIsCreateModalOpen(false)
        resetForm()
        fetchDiscounts()
        setActionLoading(null)
      }, 1000)
    } catch (err: any) {
      console.error('Error creating discount:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create discount'
      setError(errorMessage)
      setActionLoading(null)
    }
  }

  const handleUpdateDiscount = async () => {
    if (!editingDiscount) return

    try {
      setActionLoading('update')
      const token = tokenManager.getToken()
      if (!token) return

      // For now, just simulate success since we need to create the backend API
      setTimeout(() => {
        setSuccess('Discount updated successfully')
        setEditingDiscount(null)
        resetForm()
        fetchDiscounts()
        setActionLoading(null)
      }, 1000)
    } catch (err: any) {
      console.error('Error updating discount:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update discount'
      setError(errorMessage)
      setActionLoading(null)
    }
  }

  const handleDeleteDiscount = async () => {
    if (!deletingDiscount) return

    try {
      setActionLoading('delete')
      const token = tokenManager.getToken()
      if (!token) return

      // For now, just simulate success since we need to create the backend API
      setTimeout(() => {
        setSuccess('Discount deleted successfully')
        setDeletingDiscount(null)
        fetchDiscounts()
        setActionLoading(null)
      }, 1000)
    } catch (err: any) {
      console.error('Error deleting discount:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete discount'
      setError(errorMessage)
      setActionLoading(null)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Percentage</Badge>
      case 'fixed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Fixed Amount</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount)
  }

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const isActive = (discount: Discount) => {
    const now = new Date()
    const start = new Date(discount.startDate)
    const end = new Date(discount.endDate)
    return discount.isActive && now >= start && now <= end
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
              <h1 className="text-3xl font-bold text-foreground">Discounts</h1>
              <p className="text-muted-foreground">
                Manage discount codes and promotional offers
              </p>
            </div>
            <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Discount
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
                <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDiscounts}</div>
                <p className="text-xs text-muted-foreground">
                  All discount codes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {discounts.filter(d => isActive(d)).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Percentage Discounts</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {discounts.filter(d => d.type === 'percentage').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  % based discounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fixed Discounts</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {discounts.filter(d => d.type === 'fixed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Fixed amount discounts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Discounts Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Discounts</CardTitle>
                  <CardDescription>
                    Manage discount codes and promotional offers
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search discounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {discounts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discounts.map((discount) => (
                        <TableRow key={discount._id}>
                          <TableCell>
                            <div className="font-mono text-sm font-medium">
                              {discount.code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{discount.name}</p>
                              <p className="text-sm text-muted-foreground">{discount.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(discount.type)}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              {discount.type === 'percentage' 
                                ? `${discount.value}%` 
                                : formatCurrency(discount.value)
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-muted-foreground" />
                                {discount.usedCount}/{discount.usageLimit || '∞'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isActive(discount) ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                            ) : isExpired(discount.endDate) ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(discount.endDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openViewModal(discount)
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="View discount details"
                              >
                                <Eye className="w-4 h-4 text-green-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openEditModal(discount)
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="Edit discount"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openDeleteModal(discount)
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Delete discount"
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
                  <Percent className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No discounts found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first discount code to start offering promotions
                  </p>
                  <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Discount
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

      {/* Create Discount Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Discount</DialogTitle>
            <DialogDescription>
              Create a new discount code for promotions
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Discount Code</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., WELCOME10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Discount Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Welcome Discount"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of the discount"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Discount Type</label>
                  <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={formData.type === 'percentage' ? '10' : '50'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Amount</label>
                  <Input
                    type="number"
                    value={formData.minimumAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumAmount: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Usage Limit</label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>
              {formData.type === 'percentage' && (
                <div>
                  <label className="text-sm font-medium">Maximum Discount</label>
                  <Input
                    type="number"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData(prev => ({ ...prev, maximumDiscount: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active discount
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
              onClick={handleCreateDiscount}
              disabled={actionLoading === 'create'}
            >
              {actionLoading === 'create' ? 'Creating...' : 'Create Discount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Discount Details Modal */}
      <Dialog open={!!viewingDiscount} onOpenChange={() => setViewingDiscount(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Discount Details</DialogTitle>
            <DialogDescription>
              View detailed information about this discount
            </DialogDescription>
          </DialogHeader>

          {viewingDiscount && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-mono">{viewingDiscount.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{viewingDiscount.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      {getTypeBadge(viewingDiscount.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-semibold">
                        {viewingDiscount.type === 'percentage' 
                          ? `${viewingDiscount.value}%` 
                          : formatCurrency(viewingDiscount.value)
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Usage & Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {isActive(viewingDiscount) ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                      ) : isExpired(viewingDiscount.endDate) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usage:</span>
                      <span>{viewingDiscount.usedCount}/{viewingDiscount.usageLimit || '∞'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Amount:</span>
                      <span>{viewingDiscount.minimumAmount ? formatCurrency(viewingDiscount.minimumAmount) : 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Discount:</span>
                      <span>{viewingDiscount.maximumDiscount ? formatCurrency(viewingDiscount.maximumDiscount) : 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {viewingDiscount.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Validity Period</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{new Date(viewingDiscount.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span>{new Date(viewingDiscount.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Created</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(viewingDiscount.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{new Date(viewingDiscount.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingDiscount(null)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingDiscount) {
                  openEditModal(viewingDiscount)
                  setViewingDiscount(null)
                }
              }}
            >
              Edit Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Discount Modal */}
      <Dialog open={!!editingDiscount} onOpenChange={() => setEditingDiscount(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
            <DialogDescription>
              Update discount information
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Discount Code</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., WELCOME10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Discount Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Welcome Discount"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of the discount"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Discount Type</label>
                  <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={formData.type === 'percentage' ? '10' : '50'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Amount</label>
                  <Input
                    type="number"
                    value={formData.minimumAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumAmount: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Usage Limit</label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>
              {formData.type === 'percentage' && (
                <div>
                  <label className="text-sm font-medium">Maximum Discount</label>
                  <Input
                    type="number"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData(prev => ({ ...prev, maximumDiscount: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActiveEdit" className="text-sm font-medium">
                  Active discount
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingDiscount(null)}
              disabled={actionLoading === 'update'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDiscount}
              disabled={actionLoading === 'update'}
            >
              {actionLoading === 'update' ? 'Updating...' : 'Update Discount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingDiscount} onOpenChange={() => setDeletingDiscount(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Discount</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this discount? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingDiscount && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Percent className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">{deletingDiscount.code}</p>
                    <p className="text-sm text-red-700">{deletingDiscount.name}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This will permanently remove the discount code and cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingDiscount(null)}
              disabled={actionLoading === 'delete'}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDiscount}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete Discount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DiscountsPage() {
  return (
    <AuthGuard>
      <DiscountsContent />
    </AuthGuard>
  )
}
