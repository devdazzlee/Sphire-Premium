"use client"

import { useState, useEffect } from "react"
import { Star, MapPin, Calendar, ThumbsUp, Flag, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Review {
  _id: string
  product: string
  user: {
    _id: string
    name: string
    location?: string
  }
  rating: number
  review: string
  location?: string
  isApproved: boolean
  helpful: number
  createdAt: string
}

interface ProductReviewsProps {
  productId: string
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
}

export function ProductReviews({ productId, reviews = [], averageRating = 0, totalReviews = 0 }: ProductReviewsProps) {
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([])
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest')

  // Mock data for demonstration - replace with actual API call
  const mockReviews: Review[] = [
    {
      _id: "1",
      product: productId,
      user: {
        _id: "user1",
        name: "Sarah Ahmed",
        location: "Karachi, Pakistan"
      },
      rating: 5,
      review: "Absolutely love this product! The quality is outstanding and it arrived faster than expected. Will definitely order again.",
      location: "Karachi, Pakistan",
      isApproved: true,
      helpful: 12,
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      _id: "2",
      product: productId,
      user: {
        _id: "user2",
        name: "Muhammad Hassan",
        location: "Lahore, Pakistan"
      },
      rating: 4,
      review: "Good product overall. The packaging could be better, but the quality is solid. Recommended for the price.",
      location: "Lahore, Pakistan",
      isApproved: true,
      helpful: 8,
      createdAt: "2024-01-12T14:20:00Z"
    },
    {
      _id: "3",
      product: productId,
      user: {
        _id: "user3",
        name: "Fatima Khan",
        location: "Islamabad, Pakistan"
      },
      rating: 5,
      review: "Exceeded my expectations! The customer service was excellent and the product quality is top-notch. Highly recommended!",
      location: "Islamabad, Pakistan",
      isApproved: true,
      helpful: 15,
      createdAt: "2024-01-10T09:15:00Z"
    },
    {
      _id: "4",
      product: productId,
      user: {
        _id: "user4",
        name: "Ali Raza",
        location: "Rawalpindi, Pakistan"
      },
      rating: 3,
      review: "Decent product but took longer to arrive than expected. Quality is okay for the price point.",
      location: "Rawalpindi, Pakistan",
      isApproved: true,
      helpful: 3,
      createdAt: "2024-01-08T16:45:00Z"
    }
  ]

  useEffect(() => {
    // Use mock data if no reviews provided
    const reviewsToUse = reviews.length > 0 ? reviews : mockReviews
    
    // Sort reviews based on selected option
    let sortedReviews = [...reviewsToUse]
    
    switch (sortBy) {
      case 'newest':
        sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        sortedReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'rating':
        sortedReviews.sort((a, b) => b.rating - a.rating)
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

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(averageRating))}
                <span className="text-lg font-semibold text-gray-700">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">
                Based on {totalReviews || displayedReviews.length} reviews
              </span>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex gap-2">
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
              variant={sortBy === 'rating' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('rating')}
              className="text-sm"
            >
              Highest Rating
            </Button>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = displayedReviews.filter(r => r.rating === stars).length
            const percentage = displayedReviews.length > 0 ? (count / displayedReviews.length) * 100 : 0
            
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
                    {review.user.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{review.user.location}</span>
                      </div>
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

                {/* Review Text */}
                <p className="text-gray-700 mb-4 leading-relaxed">{review.review}</p>

                {/* Helpful Button */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful})
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
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
