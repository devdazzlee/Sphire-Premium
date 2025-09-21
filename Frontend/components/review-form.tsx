"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, Send, ThumbsUp } from "lucide-react"
import { useToastContext } from "@/components/ui/toast"
import { reviewsApi, tokenManager } from "@/lib/api"

interface ReviewFormProps {
  productId: string
  productName: string
  onReviewSubmitted?: () => void
}

export function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
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

    if (!title.trim()) {
      error("Please provide a title", "Review title is required")
      return
    }

    if (!comment.trim()) {
      error("Please write a review", "Your review comment cannot be empty")
      return
    }

    const token = tokenManager.getToken()
    if (!token) {
      error("Authentication Required", "Please log in to submit a review")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await reviewsApi.create(token, {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      })

      if (response.status === 'success') {
        success(
          "Review Submitted Successfully!", 
          "Thank you for your feedback. Your review will be published after moderation."
        )

        // Reset form
        setRating(0)
        setTitle("")
        setComment("")
        
        // Notify parent component
        onReviewSubmitted?.()
      } else {
        error("Failed to Submit Review", response.message || "Please try again later")
      }
      
    } catch (err) {
      console.error('Review submission error:', err)
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

        {/* Review Title */}
        <div>
          <Label htmlFor="title" className="text-lg font-semibold text-gray-800 mb-2 block">
            Review Title *
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience in a few words"
            className="h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            maxLength={100}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Review Comment */}
        <div>
          <Label htmlFor="comment" className="text-lg font-semibold text-gray-800 mb-2 block">
            Your Review *
          </Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your detailed experience with this product. What did you like? What could be improved?"
            className="min-h-32 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            maxLength={1000}
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            {comment.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0 || !title.trim() || !comment.trim()}
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
