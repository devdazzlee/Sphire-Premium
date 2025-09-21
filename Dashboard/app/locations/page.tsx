"use client"

import { useState, useEffect } from "react"
import { adminApi, tokenManager, type Location } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Building,
  Store,
  Package,
  AlertCircle,
  CheckCircle
} from "lucide-react"

export default function LocationsPage() {
  const { user } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchLocations()
  }, [currentPage, searchTerm, typeFilter])

  const fetchLocations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = tokenManager.getToken()
      if (!token) {
        setError("Authentication required")
        return
      }

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined
      }

      const response = await adminApi.getLocations(token, params)
      
      if (response.status === 'success') {
        setLocations(response.data.locations)
        setPagination(response.data.pagination)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        setError(response.message || "Failed to fetch locations")
      }
    } catch (error) {
      console.error('Fetch locations error:', error)
      setError("Failed to fetch locations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return

    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.deleteLocation(token, locationId)
      
      if (response.status === 'success') {
        // Refresh locations
        fetchLocations()
      } else {
        setError(response.message || "Failed to delete location")
      }
    } catch (error) {
      console.error('Delete location error:', error)
      setError("Failed to delete location")
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'warehouse':
        return <Building className="h-4 w-4" />
      case 'store':
        return <Store className="h-4 w-4" />
      case 'pickup_point':
        return <Package className="h-4 w-4" />
      case 'office':
        return <MapPin className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getStatusBadge = (location: Location) => {
    if (!location.isActive) return <Badge variant="destructive">Inactive</Badge>
    if (location.isDefault) return <Badge variant="default">Default</Badge>
    return <Badge variant="secondary">Active</Badge>
  }

  const getTotalInventory = (location: Location) => {
    return location.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  const getLowStockItems = (location: Location) => {
    return location.inventory?.filter(item => item.quantity < 10).length || 0
  }

  if (isLoading && locations.length === 0) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MapPin className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading locations...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
              <p className="text-muted-foreground">
                Manage warehouses, stores, and pickup points
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pagination?.totalLocations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All locations
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locations.filter(l => l.type === 'warehouse').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Storage facilities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retail Stores</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locations.filter(l => l.type === 'store').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer-facing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locations.filter(l => l.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Type: {typeFilter === 'all' ? 'All' : typeFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                      All Types
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('warehouse')}>
                      Warehouses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('store')}>
                      Stores
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('pickup_point')}>
                      Pickup Points
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('office')}>
                      Offices
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
          </Card>

          {/* Locations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Manage your warehouses, stores, and pickup points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            {getLocationIcon(location.type)}
                          </div>
                          <div>
                            <div className="font-medium">{location.name}</div>
                            {location.description && (
                              <div className="text-sm text-muted-foreground">
                                {location.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {location.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{location.address.street}</div>
                          <div className="text-muted-foreground">
                            {location.address.city}, {location.address.state}
                          </div>
                          <div className="text-muted-foreground">
                            {location.address.zipCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {location.contactInfo.phone && (
                            <div>{location.contactInfo.phone}</div>
                          )}
                          {location.contactInfo.email && (
                            <div className="text-muted-foreground">
                              {location.contactInfo.email}
                            </div>
                          )}
                          {location.contactInfo.manager && (
                            <div className="text-xs text-muted-foreground">
                              Manager: {location.contactInfo.manager}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            Total: {getTotalInventory(location)} items
                          </div>
                          {getLowStockItems(location) > 0 && (
                            <div className="text-xs text-yellow-600">
                              {getLowStockItems(location)} low stock
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(location)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteLocation(location._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination?.totalLocations || 0)} of {pagination?.totalLocations || 0} locations
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
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
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
