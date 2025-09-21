"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, MapPin, Send, ThumbsUp } from "lucide-react"
import { useToastContext } from "@/components/ui/toast"

interface ReviewFormProps {
  productId: string
  productName: string
  onReviewSubmitted?: () => void
}

export function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [userName, setUserName] = useState("")
  const [userLocation, setUserLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error } = useToastContext()

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleRatingHover = (hoveredRating: number) => {
    setHoveredRating(hoveredRating)
  }

  const handleRatingLeave = () => {
    setHoveredRating(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      error("Please select a rating", "You must provide a star rating for your review")
      return
    }

    if (!reviewText.trim()) {
      error("Please write a review", "Your review text cannot be empty")
      return
    }

    if (!userName.trim()) {
      error("Please provide your name", "Your name is required for the review")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would make the actual API call to submit the review
      // const response = await reviewsApi.createReview({
      //   productId,
      //   rating,
      //   review: reviewText,
      //   userName,
      //   userLocation
      // })

      success(
        "Review Submitted Successfully!", 
        "Thank you for your feedback. Your review will be published after moderation."
      )

      // Reset form
      setRating(0)
      setReviewText("")
      setUserName("")
      setUserLocation("")
      
      // Notify parent component
      onReviewSubmitted?.()
      
    } catch (err) {
      error("Failed to Submit Review", "Please try again later")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h3>
        <p className="text-gray-600">
          Share your experience with <span className="font-semibold text-blue-600">{productName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <Label className="text-lg font-semibold text-gray-800 mb-3 block">
            Your Rating *
          </Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => handleRatingHover(star)}
                onMouseLeave={handleRatingLeave}
                className="transition-all duration-200 hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-lg font-medium text-gray-700">
              {rating > 0 ? (
                <>
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </>
              ) : (
                'Select rating'
              )}
            </span>
          </div>
        </div>

        {/* User Name */}
        <div>
          <Label htmlFor="userName" className="text-lg font-semibold text-gray-800 mb-2 block">
            Your Name *
          </Label>
          <Input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your full name"
            className="h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* User Location */}
        <div>
          <Label htmlFor="userLocation" className="text-lg font-semibold text-gray-800 mb-2 block">
            <MapPin className="w-5 h-5 inline mr-2" />
            Your Location (Optional)
          </Label>
          <Input
            id="userLocation"
            type="text"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
            placeholder="e.g., Karachi, Pakistan"
            className="h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Review Text */}
        <div>
          <Label htmlFor="reviewText" className="text-lg font-semibold text-gray-800 mb-2 block">
            Your Review *
          </Label>
          <Textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your detailed experience with this product. What did you like? What could be improved?"
            className="min-h-32 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            {reviewText.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0 || !reviewText.trim() || !userName.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Review...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5" />
              Submit Review
            </div>
          )}
        </Button>

        {/* Review Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Review Guidelines
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be honest and constructive in your feedback</li>
            <li>• Focus on the product and your experience</li>
            <li>• Avoid personal attacks or inappropriate language</li>
            <li>• Your review will be moderated before publication</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
