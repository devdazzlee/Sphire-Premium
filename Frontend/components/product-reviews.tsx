"use client"

import { useState, useEffect } from "react"
import { Star, Calendar, ThumbsUp, Flag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reviewsApi, tokenManager, type Review, type ReviewStats } from "@/lib/api"
import { useToastContext } from "@/components/ui/toast"

// Remove duplicate interface since we're importing it from API

interface ProductReviewsProps {
  productId: string
  onReviewSubmitted?: () => void
}

export function ProductReviews({ productId, onReviewSubmitted }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {},
    verifiedReviews: 0
  })
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([])
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' | 'verified'>('newest')
  const [isLoading, setIsLoading] = useState(true)
  const { error, success } = useToastContext()

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)
        const response = await reviewsApi.getByProduct(productId, {
          page: 1,
          limit: 50,
          sort: sortBy
        })

        if (response.status === 'success' && response.data) {
          setReviews(response.data.reviews)
          setStats(response.data.stats)
        }
      } catch (err) {
        console.error('Error fetching reviews:', err)
        error('Failed to Load Reviews', 'Unable to load product reviews')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [productId, sortBy])

  // Handle review submission callback
  useEffect(() => {
    if (onReviewSubmitted) {
      // Refresh reviews when a new one is submitted
      const fetchReviews = async () => {
        try {
          const response = await reviewsApi.getByProduct(productId, {
            page: 1,
            limit: 50,
            sort: sortBy
          })

          if (response.status === 'success' && response.data) {
            setReviews(response.data.reviews)
            setStats(response.data.stats)
          }
        } catch (err) {
          console.error('Error refreshing reviews:', err)
        }
      }

      fetchReviews()
    }
  }, [onReviewSubmitted, productId, sortBy])

  // Sort and display reviews
  useEffect(() => {
    let sortedReviews = [...reviews]
    
    switch (sortBy) {
      case 'newest':
        sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        sortedReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'rating_high':
        sortedReviews.sort((a, b) => b.rating - a.rating)
        break
      case 'rating_low':
        sortedReviews.sort((a, b) => a.rating - b.rating)
        break
      case 'helpful':
        sortedReviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes)
        break
      case 'verified':
        sortedReviews.sort((a, b) => {
          if (a.isVerifiedPurchase && !b.isVerifiedPurchase) return -1
          if (!a.isVerifiedPurchase && b.isVerifiedPurchase) return 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        break
    }
    
    setDisplayedReviews(showAll ? sortedReviews : sortedReviews.slice(0, 3))
  }, [reviews, showAll, sortBy])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleMarkHelpful = async (reviewId: string) => {
    const token = tokenManager.getToken()
    if (!token) {
      error('Authentication Required', 'Please log in to mark reviews as helpful')
      return
    }

    try {
      const response = await reviewsApi.markHelpful(token, reviewId)
      if (response.status === 'success') {
        // Update the review in the local state
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId 
              ? { ...review, helpfulVotes: response.data?.helpfulVotes || review.helpfulVotes + 1 }
              : review
          )
        )
        success('Thank you!', 'Your feedback has been recorded')
      }
    } catch (err) {
      error('Failed to Mark Helpful', 'Please try again later')
    }
  }

  const handleReportReview = async (reviewId: string, reason: string) => {
    const token = tokenManager.getToken()
    if (!token) {
      error('Authentication Required', 'Please log in to report reviews')
      return
    }

    try {
      const response = await reviewsApi.report(token, reviewId, reason)
      if (response.status === 'success') {
        success('Review Reported', 'Thank you for your feedback. We will review this report.')
      }
    } catch (err) {
      error('Failed to Report Review', 'Please try again later')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(stats.averageRating))}
                <span className="text-lg font-semibold text-gray-700">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">
                Based on {stats.totalReviews} reviews
              </span>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={sortBy === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('newest')}
              className="text-sm"
            >
              Newest
            </Button>
            <Button
              variant={sortBy === 'oldest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('oldest')}
              className="text-sm"
            >
              Oldest
            </Button>
            <Button
              variant={sortBy === 'rating_high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('rating_high')}
              className="text-sm"
            >
              Highest Rating
            </Button>
            <Button
              variant={sortBy === 'helpful' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('helpful')}
              className="text-sm"
            >
              Most Helpful
            </Button>
            <Button
              variant={sortBy === 'verified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('verified')}
              className="text-sm"
            >
              Verified
            </Button>
          </div>
        </div>

        {/* Rating Distribution */}
        {stats.totalReviews > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.ratingDistribution[stars] || 0
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">{stars}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <div key={review._id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-1">
                {/* User Info & Rating */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                    {review.isVerifiedPurchase && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>

                {/* Review Text */}
                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                )}

                {/* Admin Response */}
                {review.adminResponse && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h6 className="font-semibold text-blue-900 mb-2">Admin Response</h6>
                    <p className="text-blue-800 text-sm">{review.adminResponse.text}</p>
                    <p className="text-blue-600 text-xs mt-2">
                      {formatDate(review.adminResponse.respondedAt)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkHelpful(review._id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpfulVotes})
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReportReview(review._id, 'inappropriate')}
                    className="text-gray-500 hover:text-red-600 text-sm"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Show More/Less Button */}
        {displayedReviews.length > 3 && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3"
            >
              {showAll ? 'Show Less Reviews' : `Show All ${displayedReviews.length} Reviews`}
            </Button>
          </div>
        )}

        {/* No Reviews Message */}
        {displayedReviews.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  )
}
