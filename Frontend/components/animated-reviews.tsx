"use client"
import { useEffect, useState, useRef } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function AnimatedReviews() {
  const ref = useRef<HTMLElement>(null)
  const [currentReview, setCurrentReview] = useState(0)

  const reviews = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment:
        "Amazing quality and fast shipping! The customer service team went above and beyond to help me find exactly what I needed.",
      avatar: "/happy-female-customer.png",
      product: "Wireless Headphones",
    },
    {
      name: "Mike Chen",
      rating: 5,
      comment:
        "Best online shopping experience I've ever had. The products arrived exactly as described and the packaging was excellent.",
      avatar: "/satisfied-male-customer.png",
      product: "Laptop Computer",
    },
    {
      name: "Emily Rodriguez",
      rating: 5,
      comment:
        "I love shopping here! Great prices, huge selection, and the delivery is always on time. Highly recommend to everyone!",
      avatar: "/young-woman-headphones.png",
      product: "Fashion Accessories",
    },
    {
      name: "David Thompson",
      rating: 5,
      comment:
        "Outstanding service and quality products. The return policy is hassle-free and the staff is incredibly helpful.",
      avatar: "/professional-man-suit.png",
      product: "Business Equipment",
    },
    {
      name: "Lisa Wang",
      rating: 5,
      comment:
        "Five stars! The website is easy to navigate, checkout is smooth, and I always find what I'm looking for at great prices.",
      avatar: "/asian-woman-shopping.png",
      product: "Home Decor",
    },
    {
      name: "James Wilson",
      rating: 5,
      comment:
        "Exceptional quality and value. I've been a customer for years and they never disappoint. Keep up the great work!",
      avatar: "/elderly-man-glasses.png",
      product: "Electronics",
    },
  ]

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ".reviews-section",
        start: "top 80%",
        once: true, 
        onEnter: () => {
          gsap.fromTo(
            ".reviews-title",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
          )

          gsap.fromTo(
            ".reviews-subtitle",
            { opacity: 0 },
            { opacity: 1, duration: 0.6, delay: 0.2 }
          )

          gsap.fromTo(
            ".review-container",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.4 }
          )
        },
      })
      
      const interval = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length)
      }, 6000)

      return () => clearInterval(interval)
    }, ref)

    return () => ctx.revert()
  }, [reviews.length])

  useEffect(() => {
    gsap.fromTo(
      ".review-content",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    )
  }, [currentReview])

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  return (
    <section
      ref={ref}
      className="reviews-section py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-400 rounded-full animate-ping"></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="reviews-title text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
          <p className="reviews-subtitle text-xl opacity-90 max-w-2xl mx-auto">
            Real reviews from real customers who love shopping with us
          </p>
        </div>
        <div className="review-container max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="review-avatar flex-shrink-0">
                <img
                  src={reviews[currentReview].avatar || "/placeholder.svg"}
                  alt={reviews[currentReview].name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
                />
              </div>
              <div className="review-content flex-1 text-center md:text-left">
                <div className="star-rating flex justify-center md:justify-start mb-4">
                  {[...Array(reviews[currentReview].rating)].map((_, i) => (
                    <Star key={i} className="star w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg md:text-xl mb-4 leading-relaxed">
                  "{reviews[currentReview].comment}"
                </blockquote>
                <div>
                  <p className="font-bold text-lg">{reviews[currentReview].name}</p>
                  <p className="text-white/70">Purchased: {reviews[currentReview].product}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center mt-8 space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevReview}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentReview ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextReview}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}