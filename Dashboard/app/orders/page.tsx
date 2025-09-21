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
  ShoppingCart,
  Package,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { adminApi, tokenManager, type Order } from "@/lib/api"

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  // Form state for editing
  const [orderStatus, setOrderStatus] = useState("")

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.getOrders(token, {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: filterStatus === "all" ? undefined : filterStatus
      })

      if (response.status === 'success' && response.data) {
        setOrders(response.data.orders)
        setTotalPages(response.data.pagination.totalPages)
        setTotalOrders(response.data.pagination.totalOrders)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchTerm, filterStatus])

  const openViewModal = (order: Order) => {
    setViewingOrder(order)
  }

  const openEditModal = (order: Order) => {
    setEditingOrder(order)
    setOrderStatus(order.orderStatus || 'pending')
  }

  const openDeleteModal = (order: Order) => {
    setDeletingOrder(order)
  }

  const handleUpdateOrderStatus = async () => {
    if (!editingOrder) return

    try {
      setActionLoading('update')
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.updateOrderStatus(token, editingOrder._id, { status: orderStatus })
      
      if (response.status === 'success') {
        setSuccess('Order status updated successfully')
        setEditingOrder(null)
        await fetchOrders()
      } else {
        setError(response.message || 'Failed to update order status')
      }
    } catch (err: any) {
      console.error('Error updating order status:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update order status'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return

    try {
      setActionLoading('delete')
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.deleteOrder(token, deletingOrder._id)
      
      if (response.status === 'success') {
        setSuccess('Order deleted successfully')
        setDeletingOrder(null)
        await fetchOrders()
      } else {
        setError(response.message || 'Failed to delete order')
      }
    } catch (err: any) {
      console.error('Error deleting order:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete order'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Shipped</Badge>
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount)
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
              <h1 className="text-3xl font-bold text-foreground">Orders</h1>
              <p className="text-muted-foreground">
                Manage customer orders and track fulfillment
              </p>
            </div>
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
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  All time orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.orderStatus === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.orderStatus === 'processing').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  In progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.orderStatus === 'delivered').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed orders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    Manage and track customer orders
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search orders..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            <div className="font-mono text-sm">
                              #{order.orderNumber || order._id.slice(-8)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {typeof order.user === 'object' && order.user?.name 
                                    ? order.user.name 
                                    : 'Guest User'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {typeof order.user === 'object' && order.user?.email 
                                    ? order.user.email 
                                    : 'No email'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {order.items?.length || 0} items
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              {formatCurrency(order.total || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.orderStatus || 'pending')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
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
                                  openViewModal(order)
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="View order details"
                              >
                                <Eye className="w-4 h-4 text-green-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openEditModal(order)
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="Update order status"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openDeleteModal(order)
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Delete order"
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
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
                  <p className="text-muted-foreground">
                    Orders will appear here when customers make purchases
                  </p>
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

      {/* View Order Details Modal */}
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="!w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View detailed information about this order
            </DialogDescription>
          </DialogHeader>

          {viewingOrder && (
            <div className="grid gap-4 py-2">
              {/* Order Info */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <h3 className="font-medium mb-1">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono">#{viewingOrder.orderNumber || viewingOrder._id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(viewingOrder.orderStatus || 'pending')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="capitalize">{viewingOrder.paymentStatus || 'pending'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="capitalize">{viewingOrder.paymentMethod || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{viewingOrder.createdAt ? new Date(viewingOrder.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{typeof viewingOrder.user === 'object' && viewingOrder.user?.name ? viewingOrder.user.name : 'Guest Customer'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{typeof viewingOrder.user === 'object' && viewingOrder.user?.email ? viewingOrder.user.email : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{typeof viewingOrder.user === 'object' && viewingOrder.user?.phone ? viewingOrder.user.phone : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Shipping Address</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{viewingOrder.shippingAddress?.type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">City:</span>
                      <span>{viewingOrder.shippingAddress?.city || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State:</span>
                      <span>{viewingOrder.shippingAddress?.state || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ZIP:</span>
                      <span>{viewingOrder.shippingAddress?.zipCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country:</span>
                      <span>{viewingOrder.shippingAddress?.country || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Payment Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="capitalize">{viewingOrder.paymentMethod || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize">{viewingOrder.paymentStatus || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(viewingOrder.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span>{formatCurrency(viewingOrder.shippingCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>{formatCurrency(viewingOrder.tax || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Shipping Address */}
              {viewingOrder.shippingAddress && (
                <div>
                  <h3 className="font-medium mb-1">Complete Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm">
                      <p className="font-medium capitalize">{viewingOrder.shippingAddress.type} Address</p>
                      <p className="mt-1">
                        {viewingOrder.shippingAddress.street}
                      </p>
                      <p>
                        {viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} {viewingOrder.shippingAddress.zipCode}
                      </p>
                      <p>
                        {viewingOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-1">Order Items</h3>
                <div className="border rounded-lg">
                  <div className="p-3">
                    {viewingOrder.items && viewingOrder.items.length > 0 ? (
                      <div className="space-y-2">
                        {viewingOrder.items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{item.name || 'Product'}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                <p className="text-xs text-muted-foreground">Product ID: {item.product}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(item.price || 0)}</p>
                              <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                              <p className="text-sm font-semibold">{formatCurrency((item.price || 0) * (item.quantity || 1))}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No items found</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-3">
                <div className="flex justify-end">
                  <div className="w-48">
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(viewingOrder.total || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {viewingOrder.notes && (
                <div>
                  <h3 className="font-medium mb-1">Order Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm">{viewingOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingOrder(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Status Modal */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order
            </DialogDescription>
          </DialogHeader>

          {editingOrder && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Order ID</label>
                  <p className="font-mono text-sm">#{editingOrder.orderNumber || editingOrder._id.slice(-8)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Current Status</label>
                  <div className="mt-1">{getStatusBadge(editingOrder.orderStatus || 'pending')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Shipping Address Info */}
                {editingOrder.shippingAddress && (
                  <div>
                    <label className="text-sm font-medium">Shipping Address</label>
                    <div className="mt-1 bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="font-medium capitalize">{editingOrder.shippingAddress.type} Address</p>
                      <p className="mt-1">
                        {editingOrder.shippingAddress.street}
                      </p>
                      <p>
                        {editingOrder.shippingAddress.city}, {editingOrder.shippingAddress.state} {editingOrder.shippingAddress.zipCode}
                      </p>
                      <p>
                        {editingOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingOrder(null)}
              disabled={actionLoading === 'update'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateOrderStatus}
              disabled={actionLoading === 'update'}
            >
              {actionLoading === 'update' ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingOrder && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      Order #{deletingOrder.orderNumber || deletingOrder._id.slice(-8)}
                    </p>
                    <p className="text-sm text-red-700">
                      Total: {formatCurrency(deletingOrder.total || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This will permanently remove the order and cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingOrder(null)}
              disabled={actionLoading === 'delete'}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  )
}