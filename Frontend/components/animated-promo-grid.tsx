"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useGSAP } from "@/hooks/use-gsap"

export function AnimatedPromoGrid() {
  const { ref, gsap, ScrollTrigger } = useGSAP()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Grid entrance animation with scroll trigger
      ScrollTrigger.create({
        trigger: ".promo-grid",
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(
            ".promo-card",
            {
              opacity: 0,
              y: 60,
              scale: 0.9,
              rotationX: 15,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotationX: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
            },
          )
        },
      })

      // Hover animations for each card
      const cards = gsap.utils.toArray(".promo-card")
      cards.forEach((card: any) => {
        const button = card.querySelector(".shop-btn")
        const image = card.querySelector(".promo-image")

        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
          })
          gsap.to(image, {
            scale: 1.1,
            duration: 0.4,
            ease: "power2.out",
          })
          gsap.to(button, {
            scale: 1.05,
            backgroundColor: "#1e40af",
            duration: 0.2,
            ease: "power2.out",
          })
        })

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          })
          gsap.to(image, {
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          })
          gsap.to(button, {
            scale: 1,
            backgroundColor: "#2563eb",
            duration: 0.2,
            ease: "power2.out",
          })
        })
      })
    }, ref)

    return () => ctx.revert()
  }, [gsap, ScrollTrigger])

  const promoItems = [
    {
      title: "Vacuums & more under $150",
      image: "/robot-vacuum-cleaner.png",
      bgColor: "bg-amber-100",
      textColor: "text-gray-800",
    },
    {
      title: "Backpacks from Wonder Nation, Pokémon & more",
      image: "/colorful-school-backpacks-pokemon.png",
      bgColor: "bg-sky-200",
      textColor: "text-gray-800",
    },
    {
      title: "Your fave brands, for less",
      subtitle: "Resold at Walmart",
      image: "/apple-watch-white-band.png",
      bgColor: "bg-blue-100",
      textColor: "text-gray-800",
      large: true,
    },
    {
      title: "Hot new arrivals",
      image: "/trendy-sneakers-shoes.png",
      bgColor: "bg-green-700",
      textColor: "text-white",
    },
    {
      title: "College tech starting at $19.88",
      image: "/laptop-computer-monitor-tech.png",
      bgColor: "bg-yellow-200",
      textColor: "text-gray-800",
    },
    {
      title: "Top 100 school picks",
      image: "/school-supplies-backpack-lunch-box.png",
      bgColor: "bg-orange-100",
      textColor: "text-gray-800",
    },
    {
      title: "Up to 55% off",
      subtitle: "Flash deals",
      image: "/summer-dress-clothing.png",
      bgColor: "bg-yellow-100",
      textColor: "text-gray-800",
    },
    {
      title: "New decor from Mainstays",
      image: "/home-decor-vase-lamp.png",
      bgColor: "bg-pink-100",
      textColor: "text-gray-800",
    },
  ]

  return (
    <section ref={ref} className="promo-grid max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {promoItems.map((item, index) => (
          <div
            key={index}
            className={`promo-card ${item.bgColor} ${item.textColor} rounded-lg p-6 relative overflow-hidden cursor-pointer transition-all duration-300 ${
              item.large ? "md:col-span-2 md:row-span-2" : ""
            }`}
          >
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2 leading-tight">{item.title}</h3>
              {item.subtitle && <p className="text-2xl font-bold mb-4">{item.subtitle}</p>}
              <Button
                variant="outline"
                size="sm"
                className="shop-btn bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-all duration-200"
              >
                Shop now
              </Button>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="promo-image w-full h-full object-cover transition-transform duration-400"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
