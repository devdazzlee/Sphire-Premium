"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useGSAP } from "@/hooks/use-gsap"

export function FullScreenPromoSlider() {
  const { ref, gsap } = useGSAP()
  const [currentSlide, setCurrentSlide] = useState(0)

  const promoItems = [
    {
      title: "Vacuums & more under $150",
      image: "/robot-vacuum-cleaner.png",
    },
    {
      title: "Backpacks from Wonder Nation, Pokémon & more",
      image: "/colorful-school-backpacks-pokemon.png",
    },
    {
      title: "Your fave brands, for less",
      subtitle: "Resold at Sphire Premium",
      image: "/apple-watch-white-band.png",
    },
    {
      title: "Hot new arrivals",
      image: "/trendy-sneakers-shoes.png",
    },
    {
      title: "College tech starting at $19.88",
      image: "/laptop-computer-monitor-tech.png",
    },
    {
      title: "Top 100 school picks",
      image: "/school-supplies-backpack-lunch-box.png",
    },
    {
      title: "Up to 55% off",
      subtitle: "Flash deals",
      image: "/summer-dress-clothing.png",
    },
    {
      title: "New decor from Mainstays",
      image: "/home-decor-vase-lamp.png",
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Auto-slide functionality
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % promoItems.length)
      }, 4000)

      return () => clearInterval(interval)
    }, ref)

    return () => ctx.revert()
  }, [gsap, promoItems.length])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Slide transition animation
      gsap.fromTo(
        ".slide-content",
        {
          opacity: 0,
          x: 100,
          scale: 0.9,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
        },
      )

      // Text entrance animation
      gsap.fromTo(
        ".slide-title",
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.3,
          ease: "power2.out",
        },
      )

      gsap.fromTo(
        ".slide-button",
        {
          opacity: 0,
          y: 30,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: 0.5,
          ease: "back.out(1.7)",
        },
      )
    }, ref)

    return () => ctx.revert()
  }, [currentSlide, gsap])

  const currentItem = promoItems[currentSlide]

  return (
    <section ref={ref} className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentItem.image || "/placeholder.svg"}
          alt={currentItem.title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text visibility */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="slide-content relative z-10 flex items-center justify-center h-full px-8">
        <div className="text-center max-w-4xl">
          <h1 className="slide-title text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight font-serif">
            {currentItem.title}
          </h1>
          {currentItem.subtitle && (
            <p className="slide-title text-2xl md:text-4xl lg:text-5xl font-semibold text-white mb-8 opacity-90">
              {currentItem.subtitle}
            </p>
          )}
          <Button
            size="lg"
            className="slide-button bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-full px-8 py-4 text-lg font-medium"
          >
            Shop now
          </Button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {promoItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + promoItems.length) % promoItems.length)}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % promoItems.length)}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
