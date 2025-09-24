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
      name: "Aisha Khan",
      rating: 5,
      comment:
        "Absolutely love my new skincare routine! The products are gentle on my sensitive skin and I can see results within just a week. The delivery was super fast too!",
      avatar: "/placeholder-user.jpg",
      product: "Premium Skincare Set",
      location: "Karachi, Pakistan",
      verified: true
    },
    {
      name: "Fatima Ahmed",
      rating: 5,
      comment:
        "Best beauty products I've ever used! The quality is amazing and the prices are so reasonable. My skin has never looked better. Will definitely order again!",
      avatar: "/placeholder-user.jpg",
      product: "Natural Beauty Essentials",
      location: "Lahore, Pakistan",
      verified: true
    },
    {
      name: "Zainab Ali",
      rating: 4,
      comment:
        "Great products with excellent customer service. The team helped me choose the right items for my skin type. Only wish the shipping was a bit faster.",
      avatar: "/placeholder-user.jpg",
      product: "Anti-Aging Serum",
      location: "Islamabad, Pakistan",
      verified: true
    },
    {
      name: "Maryam Sheikh",
      rating: 5,
      comment:
        "I'm obsessed with these products! They've completely transformed my skincare routine. The packaging is beautiful and the ingredients are all natural. Highly recommend!",
      avatar: "/placeholder-user.jpg",
      product: "Hydrating Face Cream",
      location: "Rawalpindi, Pakistan",
      verified: true
    },
    {
      name: "Sana Malik",
      rating: 5,
      comment:
        "Excellent quality products at affordable prices. The customer service team is very helpful and responsive. My order arrived in perfect condition. Thank you!",
      avatar: "/placeholder-user.jpg",
      product: "Vitamin C Serum",
      location: "Faisalabad, Pakistan",
      verified: true
    },
    {
      name: "Hina Raza",
      rating: 5,
      comment:
        "These products are a game-changer! My skin feels so soft and healthy now. The website is easy to use and the checkout process is smooth. Will be a regular customer!",
      avatar: "/placeholder-user.jpg",
      product: "Complete Beauty Kit",
      location: "Multan, Pakistan",
      verified: true
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
          <h2 className="reviews-title text-4xl md:text-5xl font-bold mb-4">Real Customer Reviews</h2>
          <p className="reviews-subtitle text-xl opacity-90 max-w-2xl mx-auto">
            Discover why thousands of satisfied customers choose Sphire Premium for their beauty needs
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm opacity-80">
            <span>⭐ 4.8/5 Average Rating</span>
            <span>👥 10,000+ Happy Customers</span>
            <span>✓ 100% Verified Reviews</span>
          </div>
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
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg">{reviews[currentReview].name}</p>
                    {reviews[currentReview].verified && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm">Purchased: {reviews[currentReview].product}</p>
                  <p className="text-white/60 text-xs">📍 {reviews[currentReview].location}</p>
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