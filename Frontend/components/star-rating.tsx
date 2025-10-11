"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  showText?: boolean
  reviewCount?: number
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  showText = false,
  reviewCount = 0,
  onRatingChange,
  className = ""
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  const handleClick = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating)
    }
  }

  const handleMouseEnter = (hoveredRating: number) => {
    if (interactive) {
      setHoveredRating(hoveredRating)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredRating(0)
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={() => handleClick(i + 1)}
            onMouseEnter={() => handleMouseEnter(i + 1)}
            onMouseLeave={handleMouseLeave}
            className={`transition-all duration-200 ${
              interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            } focus:outline-none`}
            disabled={!interactive}
          >
            <Star
              className={`${sizeClasses[size]} ${
                i < displayRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
      
      {showText && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)} {reviewCount > 0 && `(${reviewCount})`}
        </span>
      )}
    </div>
  )
}

// Product Card Star Rating Component
interface ProductStarRatingProps {
  rating: number
  reviewCount: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export function ProductStarRating({ 
  rating, 
  reviewCount, 
  size = 'md',
  showCount = true 
}: ProductStarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} size={size} />
      {showCount && reviewCount > 0 && (
        <span className="text-sm text-gray-600">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  )
}

// Interactive Star Rating for Reviews
interface InteractiveStarRatingProps {
  initialRating?: number
  onRatingChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  required?: boolean
}

export function InteractiveStarRating({ 
  initialRating = 0, 
  onRatingChange, 
  size = 'lg',
  label,
  required = false
}: InteractiveStarRatingProps) {
  const [rating, setRating] = useState(initialRating)

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    onRatingChange(newRating)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <StarRating
        rating={rating}
        interactive={true}
        onRatingChange={handleRatingChange}
        size={size}
        showText={false}
      />
    </div>
  )
}
