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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Search, 
  Filter,
  Star,
  MessageSquare,
  AlertCircle,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { adminApi, tokenManager, type Review } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

function ReviewsContent() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterRating, setFilterRating] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [currentPage, searchTerm, filterStatus, filterRating])

  const fetchReviews = async () => {
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
      if (filterStatus !== "all") params.isApproved = filterStatus === "approved"
      if (filterRating !== "all") params.rating = parseInt(filterRating)

      const response = await adminApi.getReviews(token, params)
      
      if (response.status === 'success' && response.data) {
        setReviews(response.data.reviews)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        setError(response.message || 'Failed to fetch reviews')
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveReview = async (reviewId: string) => {
    try {
      setActionLoading(reviewId)
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.approveReview(token, reviewId)
      
      if (response.status === 'success') {
        // Refresh reviews
        await fetchReviews()
        setIsModalOpen(false)
      } else {
        setError(response.message || 'Failed to approve review')
      }
    } catch (err) {
      console.error('Error approving review:', err)
      setError('Failed to approve review')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to reject this review?')) {
      return
    }

    try {
      setActionLoading(reviewId)
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.rejectReview(token, reviewId)
      
      if (response.status === 'success') {
        // Refresh reviews
        await fetchReviews()
      } else {
        setError(response.message || 'Failed to reject review')
      }
    } catch (err) {
      console.error('Error rejecting review:', err)
      setError('Failed to reject review')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(reviewId)
      const token = tokenManager.getToken()
      if (!token) return

      const response = await adminApi.deleteReview(token, reviewId)
      
      if (response.status === 'success') {
        // Refresh reviews
        await fetchReviews()
      } else {
        setError(response.message || 'Failed to delete review')
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      setError('Failed to delete review')
    } finally {
      setActionLoading(null)
    }
  }

  const openReviewModal = (review: Review) => {
    setSelectedReview(review)
    setIsModalOpen(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getStatusBadge = (review: Review) => {
    if (!review.isActive) {
      return <Badge variant="destructive">Deleted</Badge>
    }
    if (review.isApproved) {
      return <Badge variant="default">Approved</Badge>
    }
    return <Badge variant="secondary">Pending</Badge>
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
              <p className="text-muted-foreground">Loading reviews...</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Reviews & Comments</h1>
            <p className="text-muted-foreground">Manage customer reviews and comments</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews.length})</CardTitle>
              <CardDescription>Customer reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <Badge variant="outline">
                              {typeof review.user === 'object' ? review.user.name : 'Unknown User'}
                            </Badge>
                            {review.isVerifiedPurchase && (
                              <Badge variant="secondary">Verified Purchase</Badge>
                            )}
                            {getStatusBadge(review)}
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                          <p className="text-muted-foreground mb-3">{review.comment}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Product: {typeof review.product === 'object' && review.product?.name ? review.product.name : 'Unknown Product'}</span>
                            <span>•</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            {review.helpfulVotes > 0 && (
                              <>
                                <span>•</span>
                                <span>{review.helpfulVotes} helpful votes</span>
                              </>
                            )}
                          </div>

                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {review.images.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review image ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewModal(review)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {review.isActive && !review.isApproved && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveReview(review._id)}
                                disabled={actionLoading === review._id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectReview(review._id)}
                                disabled={actionLoading === review._id}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {review.isActive && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReview(review._id)}
                              disabled={actionLoading === review._id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== "all" || filterRating !== "all"
                      ? "Try adjusting your filters"
                      : "No reviews have been submitted yet"}
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

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Review by {selectedReview && typeof selectedReview.user === 'object' ? selectedReview.user.name : 'Unknown User'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(selectedReview.rating)}
                </div>
                <Badge variant="outline">
                  {typeof selectedReview.product === 'object' ? selectedReview.product.name : 'Unknown Product'}
                </Badge>
                {getStatusBadge(selectedReview)}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedReview.title}</h3>
                <p className="text-muted-foreground">{selectedReview.comment}</p>
              </div>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedReview.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Submitted: {new Date(selectedReview.createdAt).toLocaleString()}</p>
                {selectedReview.helpfulVotes > 0 && (
                  <p>Helpful votes: {selectedReview.helpfulVotes}</p>
                )}
                {selectedReview.isVerifiedPurchase && (
                  <p className="text-green-600">✓ Verified Purchase</p>
                )}
              </div>

              {selectedReview.moderationNotes && (
                <div>
                  <h4 className="font-medium mb-2">Moderation Notes:</h4>
                  <p className="text-sm text-muted-foreground">{selectedReview.moderationNotes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedReview && selectedReview.isActive && !selectedReview.isApproved && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleRejectReview(selectedReview._id)}
                  disabled={actionLoading === selectedReview._id}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveReview(selectedReview._id)}
                  disabled={actionLoading === selectedReview._id}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <AuthGuard>
      <ReviewsContent />
    </AuthGuard>
  )
}