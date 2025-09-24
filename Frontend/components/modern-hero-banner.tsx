"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, Sparkles, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"

export function ModernHeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const router = useRouter()

  const promoItems = [
    {
      id: 1,
      title: "Premium Skincare Collection",
      subtitle: "Luxury formulations crafted with the finest ingredients for radiant, healthy skin",
      image: "/luxury-beauty-products-arranged-elegantly-on-marbl.png",
      searchTerm: "skincare",
      badge: "New Collection",
      discount: "30% OFF",
      features: ["Anti-Aging", "Hydrating", "Natural"],
      gradient: "from-blue-600/90 to-purple-600/90"
    },
    {
      id: 2,
      title: "Natural Beauty Essentials",
      subtitle: "Organic ingredients meet cutting-edge science for extraordinary results",
      image: "/elegant-beauty-laboratory-with-natural-ingredients.png",
      searchTerm: "natural",
      badge: "Best Seller",
      discount: "25% OFF",
      features: ["Organic", "Cruelty-Free", "Vegan"],
      gradient: "from-green-600/90 to-teal-600/90"
    },
    {
      id: 3,
      title: "Anti-Aging Solutions",
      subtitle: "Advanced formulas that turn back time and restore youthful radiance",
      image: "/wellness-spa-products.png",
      searchTerm: "anti-aging",
      badge: "Trending",
      discount: "40% OFF",
      features: ["Advanced", "Clinical", "Results"],
      gradient: "from-pink-600/90 to-rose-600/90"
    },
    {
      id: 4,
      title: "Hydrating Essentials",
      subtitle: "Deep moisture therapy for all skin types, from dry to combination",
      image: "/product1.webp",
      searchTerm: "hydrating",
      badge: "Popular",
      discount: "20% OFF",
      features: ["Deep Hydration", "All Skin Types", "Fast Absorbing"],
      gradient: "from-indigo-600/90 to-blue-600/90"
    },
  ]

  // Preload images for faster loading
  useEffect(() => {
    const preloadImages = () => {
      const imagePromises = promoItems.map((item) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image()
          img.onload = resolve
          img.onerror = reject
          img.src = item.image
        })
      })
      
      Promise.all(imagePromises)
        .then(() => setImagesLoaded(true))
        .catch(() => setImagesLoaded(true)) // Continue even if some images fail
    }

    preloadImages()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promoItems.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [promoItems.length])

  const nextSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % promoItems.length)
      setIsTransitioning(false)
    }, 300)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + promoItems.length) % promoItems.length)
      setIsTransitioning(false)
    }, 300)
  }

  const handleShopNow = () => {
    router.push('/products')
  }

  const currentItem = promoItems[currentIndex]

  return (
    <section className="relative h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
          {/* Content Side */}
          <div className={`space-y-4 transition-all duration-700 ease-out ${
            isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
          }`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              {currentItem.badge}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
              {currentItem.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base lg:text-lg text-gray-300 leading-relaxed max-w-xl">
              {currentItem.subtitle}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {currentItem.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Price & Discount */}
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-white">
                {currentItem.discount}
              </div>
              <div className="text-sm text-gray-400">
                Limited Time Offer
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleShopNow}
                size="md"
                className="bg-white text-black hover:bg-gray-100 font-semibold py-2.5 px-6 text-sm rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="md"
                className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white/30 font-semibold py-2.5 px-6 text-sm rounded-lg transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-xl font-bold text-white">50K+</div>
                <div className="text-xs text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">4.9</div>
                <div className="text-xs text-gray-400">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">100%</div>
                <div className="text-xs text-gray-400">Natural</div>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative">
            <div className={`relative transition-all duration-700 ease-out ${
              isTransitioning ? 'opacity-0 scale-95 rotate-2' : 'opacity-100 scale-100 rotate-0'
            }`}>
              {/* Main Image Container */}
              <div className="relative w-full h-[400px] lg:h-[450px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  fill
                  className="object-cover"
                  priority={currentIndex === 0}
                  quality={95}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Floating Elements */}
                <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 fill-current text-yellow-400" />
                    <span className="font-semibold">4.9</span>
                    <span className="text-sm text-gray-300">(2.1k reviews)</span>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-white">
                    <div className="text-sm text-gray-300">Starting from</div>
                    <div className="text-2xl font-bold">$29.99</div>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-white/30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-white/30"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-3 mt-8">
          {promoItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrentIndex(index)
                  setIsTransitioning(false)
                }, 300)
              }}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
