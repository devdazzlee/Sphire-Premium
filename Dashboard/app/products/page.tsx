"use client"

import { useState, useEffect } from "react"
import { adminApi, tokenManager, type Product, type Category } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Package,
  TrendingUp,
  AlertCircle,
  Upload,
  Save,
  X,
  Star
} from "lucide-react"

function ProductsContent() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    stockQuantity: '',
    rating: '',
    features: [] as string[],
    tags: [] as string[],
    images: [] as string[],
    imageFiles: [] as File[],
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: false
  })

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false)
  const [newFeature, setNewFeature] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [currentPage, searchTerm, filterCategory, filterStatus])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = tokenManager.getToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const params: any = {
        page: currentPage,
        limit: 10
      }

      if (searchTerm) params.search = searchTerm
      if (filterCategory !== "all") params.category = filterCategory
      if (filterStatus !== "all") params.isActive = filterStatus === "active"

      const response = await adminApi.getProducts(token, params)
      
      if (response.status === 'success' && response.data) {
        setProducts(response.data.products)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        setError(response.message || 'Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.getCategories(token, { limit: 100 })
      
      if (response.status === 'success' && response.data) {
        setCategories(response.data.categories)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleCreateProduct = async () => {
    try {
      setActionLoading('create')
      const token = tokenManager.getToken()
      if (!token) return

      const productData = new FormData()
      
      // Add regular form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'imageFiles') return // Skip imageFiles, handled separately
        if (key === 'images') return // Skip images preview URLs
        
        if (Array.isArray(value)) {
          productData.append(key, JSON.stringify(value))
        } else {
          productData.append(key, value.toString())
        }
      })

      // Add image files
      formData.imageFiles.forEach((file, index) => {
        productData.append('images', file)
      })

      const response = await adminApi.createProduct(token, productData)
      
      if (response.status === 'success') {
        setSuccess('Product created successfully')
        setIsModalOpen(false)
        resetForm()
        await fetchProducts()
      } else {
        setError(response.message || 'Failed to create product')
      }
    } catch (err: any) {
      console.error('Error creating product:', err)
      // Show the actual backend error message
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create product'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      setActionLoading('update')
      const token = tokenManager.getToken()
      if (!token) return

      const productData = new FormData()
      
      // Add regular form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'imageFiles') return // Skip imageFiles, handled separately
        if (key === 'images') return // Skip images preview URLs
        
        if (Array.isArray(value)) {
          productData.append(key, JSON.stringify(value))
        } else {
          productData.append(key, value.toString())
        }
      })

      // Add image files if any
      formData.imageFiles.forEach((file, index) => {
        productData.append('images', file)
      })

      const response = await adminApi.updateProduct(token, editingProduct._id, productData)
      
      if (response.status === 'success') {
        setSuccess('Product updated successfully')
        setIsModalOpen(false)
        setEditingProduct(null)
        resetForm()
        await fetchProducts()
      } else {
        setError(response.message || 'Failed to update product')
      }
    } catch (err: any) {
      console.error('Error updating product:', err)
      // Show the actual backend error message
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update product'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return

    try {
      setActionLoading(deletingProduct._id)
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.deleteProduct(token, deletingProduct._id)
      
      if (response.status === 'success') {
        setSuccess('Product deleted successfully')
        setDeletingProduct(null)
        await fetchProducts()
      } else {
        setError(response.message || 'Failed to delete product')
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product')
    } finally {
      setActionLoading(null)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand || '',
      stockQuantity: product.stockQuantity.toString(),
      rating: product.rating.toString(),
      features: product.features,
      tags: product.tags,
      images: product.images || [],
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isOnSale: product.isOnSale
    })
    setIsModalOpen(true)
  }

  const openViewModal = (product: Product) => {
    setViewingProduct(product)
  }

  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      subcategory: '',
      brand: '',
      stockQuantity: '',
      rating: '',
      features: [],
      tags: [],
      images: [],
      imageFiles: [],
      isActive: true,
      isFeatured: false,
      isNew: false,
      isOnSale: false
    })
    setNewFeature('')
    setNewTag('')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount)
  }

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (product.stockQuantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (product.stockQuantity <= 10) {
      return <Badge variant="secondary">Low Stock</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    try {
      // Store the actual File objects for upload, and create preview URLs
      const newFiles = Array.from(files)
      const previewUrls = newFiles.map(file => URL.createObjectURL(file))
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...previewUrls]
      }))

      // Store the actual files separately for form submission
      setFormData(prev => ({
        ...prev,
        imageFiles: [...(prev as any).imageFiles || [], ...newFiles]
      }))
    } catch (error) {
      console.error('Error uploading images:', error)
      setError('Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
              <CardDescription>Your product catalog</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {product.brand && `${product.brand} • `}
                                  SKU: {product._id.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{formatCurrency(product.price)}</p>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(product.originalPrice)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={product.stockQuantity <= 10 ? 'text-orange-600 font-medium' : ''}>
                                {product.stockQuantity}
                              </span>
                              {product.isFeatured && (
                                <Badge variant="secondary" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {renderStars(Math.floor(product.rating))}
                              <span className="text-sm text-muted-foreground ml-1">
                                ({product.reviewCount})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(product)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* Direct action buttons - always visible */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openEditModal(product)
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="Edit product"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openViewModal(product)
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="View product details"
                              >
                                <Eye className="w-4 h-4 text-green-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openDeleteModal(product)
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Delete product"
                                disabled={actionLoading === product._id}
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
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterCategory !== "all" || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Get started by adding your first product"}
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

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (PKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="originalPrice">Original Price (PKR)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  placeholder="Enter subcategory"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                  placeholder="0.0"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active
                </Label>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  Featured
                </Label>
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <Label>Product Images</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingImages ? 'Uploading...' : 'Upload Images'}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  You can upload multiple images. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>

              {/* Display uploaded images */}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Features Section */}
            <div>
              <Label>Product Features</Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Enter a feature"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} size="sm">
                    Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-1 text-xs hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <Label>Product Tags</Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-1 text-xs hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
              disabled={actionLoading === 'create' || actionLoading === 'update'}
            >
              {actionLoading === 'create' || actionLoading === 'update' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Details Modal */}
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View detailed information about this product
            </DialogDescription>
          </DialogHeader>

          {viewingProduct && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Product Images */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Product Images</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {viewingProduct.images && viewingProduct.images.length > 0 ? (
                      viewingProduct.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${viewingProduct.name} ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                      ))
                    ) : (
                      <div className="col-span-2 h-24 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-gray-500">No images</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Product Name</Label>
                    <p className="text-lg font-semibold">{viewingProduct.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-muted-foreground">{viewingProduct.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Brand</Label>
                    <p className="text-sm text-muted-foreground">{viewingProduct.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingProduct)}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {viewingProduct.description || 'No description provided'}
                </p>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <p className="text-lg font-semibold">{formatCurrency(viewingProduct.price)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Original Price</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingProduct.originalPrice ? formatCurrency(viewingProduct.originalPrice) : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Stock Quantity</Label>
                  <p className="text-lg font-semibold">{viewingProduct.stockQuantity}</p>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Rating</Label>
                  <p className="text-lg font-semibold">{viewingProduct.rating}/5</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reviews</Label>
                  <p className="text-lg font-semibold">{viewingProduct.reviewCount || 0}</p>
                </div>
              </div>

              {/* Features & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Features */}
                {viewingProduct.features && viewingProduct.features.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Features</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewingProduct.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewingProduct.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingProduct.createdAt ? new Date(viewingProduct.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingProduct.updatedAt ? new Date(viewingProduct.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingProduct(null)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingProduct) {
                  openEditModal(viewingProduct)
                  setViewingProduct(null)
                }
              }}
            >
              Edit Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingProduct && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {deletingProduct.images && deletingProduct.images.length > 0 ? (
                    <img
                      src={deletingProduct.images[0]}
                      alt={deletingProduct.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-red-900">{deletingProduct.name}</p>
                    <p className="text-sm text-red-700">
                      {deletingProduct.category} • {formatCurrency(deletingProduct.price)}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This will permanently remove the product and cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingProduct(null)}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={actionLoading !== null}
            >
              {actionLoading !== null ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <ProductsContent />
    </AuthGuard>
  )
}