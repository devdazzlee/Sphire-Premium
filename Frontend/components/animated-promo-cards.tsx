"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function AnimatedPromoCards() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const router = useRouter()

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

  const promoItems = [
    {
      title: "New arrivals",
      subtitle: "Made with care and unconditionally loved by our customers",
      image: "/product1.webp",
      searchTerm: "new",
    },
    {
      title: "Premium skincare",
      subtitle: "Luxury formulations for radiant skin",
      image: "/product2.webp",
      searchTerm: "skincare",
    },
    {
      title: "Natural beauty",
      subtitle: "Organic ingredients, extraordinary results",
      image: "/product3.webp",
      searchTerm: "natural",
    },
    {
      title: "Wellness essentials",
      subtitle: "Self-care rituals for mind and body",
      image: "/product4.webp",
      searchTerm: "wellness",
    },
    {
      title: "Clean beauty",
      subtitle: "Pure ingredients, powerful results",
      image: "/product5.webp",
      searchTerm: "clean",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promoItems.length)
        
        setTimeout(() => {
          setIsTransitioning(false)
        }, 100)
      }, 750)
      
    }, 8000)

    return () => {
      clearInterval(interval)
    }
  }, [promoItems.length])

  const handleShopNow = () => {
    router.push('/products')
  }

  const handleDotClick = (index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(index)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 750)
    }
  }

  const currentItem = promoItems[currentIndex]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative z-10">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="max-w-4xl w-full">
          <div className="mb-8">
            <div
              className={`w-full h-96 md:h-[500px] rounded-2xl shadow-2xl overflow-hidden relative transition-all duration-1000 ease-in-out ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {/* Optimized background image */}
              <Image
                src={currentItem.image || "/luxury-cosmetics-skincare-products-flatlay-with-gl.png"}
                alt={currentItem.title}
                fill
                className="object-cover"
                priority={currentIndex === 0} // Prioritize first image
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              
              {/* Preload next image */}
              {currentIndex < promoItems.length - 1 && (
                <Image
                  src={promoItems[currentIndex + 1].image}
                  alt=""
                  fill
                  className="hidden"
                  priority={false}
                />
              )}
              
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
              <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 transition-all duration-1000 ease-in-out ${
                isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
              }`}>
                <h2 className="text-4xl md:text-6xl font-light tracking-wide text-white mb-4 drop-shadow-lg">
                  {currentItem.title}
                </h2>
                {currentItem.subtitle && (
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed font-light drop-shadow-md">
                    {currentItem.subtitle}
                  </p>
                )}
                <Button
                  onClick={handleShopNow}
                  size="lg"
                  className="bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-all duration-500 rounded-full px-12 py-4 text-lg font-light tracking-wide hover:shadow-lg transform hover:scale-105"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-8 space-x-3">
        {promoItems.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-500 hover:scale-110 ${
              index === currentIndex ? "bg-gray-800 scale-125" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  )
}