"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FolderTree,
  FolderPlus,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { adminApi, tokenManager, type Category } from "@/lib/api"

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    sortOrder: '',
    isActive: true,
    image: '',
    imageFile: null as File | null,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCategories, setTotalCategories] = useState(0)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.getCategories(token, {
        page: currentPage,
        limit: 20,
        search: searchTerm
      })

      if (response.status === 'success' && response.data) {
        setCategories(response.data.categories)
        setTotalPages(response.data.pagination.totalPages)
        setTotalCategories(response.data.pagination.totalCategories)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [currentPage, searchTerm])

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      parentCategory: '',
      sortOrder: '',
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      sortOrder: category.sortOrder?.toString() || '',
      isActive: category.isActive,
      image: category.image || '',
      imageFile: null,
    })
    setIsModalOpen(true)
  }

  const openViewModal = (category: Category) => {
    setViewingCategory(category)
  }

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category)
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        image: previewUrl,
        imageFile: file
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Remove image
  const removeImage = () => {
    if (formData.image) {
      URL.revokeObjectURL(formData.image)
    }
    setFormData(prev => ({
      ...prev,
      image: '',
      imageFile: null
    }))
  }

  const resetForm = () => {
    if (formData.image) {
      URL.revokeObjectURL(formData.image)
    }
    setFormData({
      name: '',
      description: '',
      parentCategory: '',
      sortOrder: '',
      isActive: true,
      image: '',
      imageFile: null,
    })
  }

  const handleCreateCategory = async () => {
    try {
      setActionLoading('create')
      const token = tokenManager.getToken()
      if (!token) return

      const categoryData = new FormData()
      categoryData.append('name', formData.name)
      categoryData.append('description', formData.description)
      if (formData.parentCategory) {
        categoryData.append('parentCategory', formData.parentCategory)
      }
      categoryData.append('sortOrder', formData.sortOrder || '0')
      categoryData.append('isActive', formData.isActive.toString())
      
      if (formData.imageFile) {
        categoryData.append('image', formData.imageFile)
      }

      const response = await adminApi.createCategory(token, categoryData)
      
      if (response.status === 'success') {
        setSuccess('Category created successfully')
        setIsModalOpen(false)
        resetForm()
        await fetchCategories()
      } else {
        setError(response.message || 'Failed to create category')
      }
    } catch (err) {
      console.error('Error creating category:', err)
      setError('Failed to create category')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      setActionLoading('update')
      const token = tokenManager.getToken()
      if (!token) return

      const categoryData = new FormData()
      categoryData.append('name', formData.name)
      categoryData.append('description', formData.description)
      if (formData.parentCategory) {
        categoryData.append('parentCategory', formData.parentCategory)
      }
      categoryData.append('sortOrder', formData.sortOrder || '0')
      categoryData.append('isActive', formData.isActive.toString())
      
      if (formData.imageFile) {
        categoryData.append('image', formData.imageFile)
      }

      const response = await adminApi.updateCategory(token, editingCategory._id, categoryData)
      
      if (response.status === 'success') {
        setSuccess('Category updated successfully')
        setIsModalOpen(false)
        setEditingCategory(null)
        resetForm()
        await fetchCategories()
      } else {
        setError(response.message || 'Failed to update category')
      }
    } catch (err) {
      console.error('Error updating category:', err)
      setError('Failed to update category')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    try {
      setActionLoading('delete')
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.deleteCategory(token, deletingCategory._id)
      
      if (response.status === 'success') {
        setSuccess('Category deleted successfully')
        setDeletingCategory(null)
        await fetchCategories()
      } else {
        setError(response.message || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Failed to delete category')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (category: Category) => {
    if (category.isActive) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          Inactive
        </Badge>
      )
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
              <h1 className="text-3xl font-bold text-foreground">Categories</h1>
              <p className="text-muted-foreground">
                Manage product categories and organize your catalog
              </p>
            </div>
            <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                <FolderTree className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCategories}</div>
                <p className="text-xs text-muted-foreground">
                  {categories.filter(c => c.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parent Categories</CardTitle>
                <FolderPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {categories.filter(c => !c.parentCategory).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Top-level categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
                <FolderTree className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {categories.filter(c => c.parentCategory).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Nested categories
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Categories</CardTitle>
                  <CardDescription>
                    Manage your product categories and their hierarchy
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Sort Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FolderTree className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Slug: {category.slug}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground max-w-xs truncate">
                              {category.description || 'No description'}
                            </p>
                          </TableCell>
                          <TableCell>
                            {category.parentCategory ? (
                              <Badge variant="outline">{category.parentCategory}</Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">Root</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{category.sortOrder || 0}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(category)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* Direct action buttons - always visible */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openEditModal(category)
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="Edit category"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openViewModal(category)
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="View category details"
                              >
                                <Eye className="w-4 h-4 text-green-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openDeleteModal(category)
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Delete category"
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
                  <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No categories found</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first category
                  </p>
                  <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
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

      {/* Create/Edit Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update the category information below.' 
                : 'Add a new category to organize your products.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Electronics"
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category..."
                rows={3}
              />
            </div>

            {/* Category Image Upload */}
            <div>
              <Label htmlFor="image">Category Image</Label>
              <div className="mt-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="mb-2"
                />
                {uploadingImage && (
                  <p className="text-sm text-muted-foreground">Uploading image...</p>
                )}
                
                {formData.image && (
                  <div className="relative inline-block">
                    <img
                      src={formData.image}
                      alt="Category preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="parentCategory">Parent Category</Label>
              <Input
                id="parentCategory"
                value={formData.parentCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, parentCategory: e.target.value }))}
                placeholder="Leave empty for root category"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active Category</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              disabled={!formData.name || actionLoading !== null}
            >
              {actionLoading === 'create' && 'Creating...'}
              {actionLoading === 'update' && 'Updating...'}
              {!actionLoading && (editingCategory ? 'Update Category' : 'Create Category')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Category Details Modal */}
      <Dialog open={!!viewingCategory} onOpenChange={() => setViewingCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>
              View detailed information about this category
            </DialogDescription>
          </DialogHeader>

          {viewingCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category Name</Label>
                  <p className="text-lg font-semibold">{viewingCategory.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Slug</Label>
                  <p className="text-sm text-muted-foreground font-mono">{viewingCategory.slug}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">
                  {viewingCategory.description || 'No description provided'}
                </p>
              </div>

              {/* Category Image */}
              {viewingCategory.image && (
                <div>
                  <Label className="text-sm font-medium">Category Image</Label>
                  <div className="mt-2">
                    <img
                      src={viewingCategory.image}
                      alt={viewingCategory.name}
                      className="w-48 h-48 object-cover rounded border"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Parent Category</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingCategory.parentCategory || 'Root Category'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sort Order</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {viewingCategory.sortOrder || 0}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(viewingCategory)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingCategory.createdAt ? new Date(viewingCategory.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingCategory.updatedAt ? new Date(viewingCategory.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingCategory(null)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingCategory) {
                  openEditModal(viewingCategory)
                  setViewingCategory(null)
                }
              }}
            >
              Edit Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingCategory && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">{deletingCategory.name}</p>
                    <p className="text-sm text-red-700">
                      {deletingCategory.description || 'No description'}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This will permanently remove the category and cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCategory(null)}
              disabled={actionLoading === 'delete'}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <AuthGuard>
      <CategoriesContent />
    </AuthGuard>
  )
}
