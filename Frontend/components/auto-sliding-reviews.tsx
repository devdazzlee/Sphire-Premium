"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "Amazing quality and fast shipping! The product exceeded my expectations. Will definitely shop here again.",
    product: "iPhone 15 Pro",
    avatar: "/happy-female-customer.png",
  },
  {
    id: 2,
    name: "Mike Chen",
    rating: 5,
    comment: "Great customer service and the MacBook Pro works perfectly. Highly recommend this store!",
    product: "MacBook Pro",
    avatar: "/satisfied-male-customer.png",
  },
  {
    id: 3,
    name: "Emily Davis",
    rating: 4,
    comment: "Love my new headphones! The sound quality is incredible and they're so comfortable to wear.",
    product: "Sony WH-1000XM5",
    avatar: "/young-woman-headphones.png",
  },
  {
    id: 4,
    name: "David Wilson",
    rating: 5,
    comment: "The TV arrived quickly and the picture quality is stunning. Perfect for movie nights!",
    product: "Samsung 4K Smart TV",
    avatar: "/happy-man-watching-tv.png",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    rating: 5,
    comment: "These sneakers are so comfortable and stylish. I get compliments everywhere I go!",
    product: "Air Jordan Retro",
    avatar: "/woman-wearing-sneakers.png",
  },
  {
    id: 6,
    name: "James Rodriguez",
    rating: 4,
    comment: "The Apple Watch has been a game-changer for my fitness routine. Love all the features!",
    product: "Apple Watch Series 9",
    avatar: "/athletic-man-with-smartwatch.png",
  },
]

export function AutoSlidingReviews() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
        setIsVisible(true)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const currentReview = reviews[currentIndex]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600">Real reviews from real customers</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div
            className={`transition-all duration-300 ${
              isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
            }`}
          >
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${i < currentReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>

              <blockquote className="text-xl text-gray-800 mb-6 italic">"{currentReview.comment}"</blockquote>

              <div className="flex items-center justify-center space-x-4">
                <img
                  src={currentReview.avatar || "/placeholder.svg"}
                  alt={currentReview.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{currentReview.name}</div>
                  <div className="text-sm text-gray-600">Purchased: {currentReview.product}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
