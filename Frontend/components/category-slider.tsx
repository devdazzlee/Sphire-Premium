"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

const categories = [
  {
    id: 1,
    title: "Electronics",
    image: "/modern-electronics.png",
    description: "Latest tech gadgets and devices",
  },
  {
    id: 2,
    title: "Fashion",
    image: "/stylish-fashion-clothing-and-accessories.png",
    description: "Trendy clothing and accessories",
  },
  {
    id: 3,
    title: "Home & Garden",
    image: "/beautiful-home-decor-and-garden-items.png",
    description: "Transform your living space",
  },
  {
    id: 4,
    title: "Sports & Fitness",
    image: "/sports-and-fitness.png",
    description: "Stay active and healthy",
  },
  {
    id: 5,
    title: "Beauty & Health",
    image: "/beauty-products-and-health-items.png",
    description: "Look and feel your best",
  },
  {
    id: 6,
    title: "Books & Media",
    image: "/books-magazines-and-media-collection.png",
    description: "Expand your knowledge",
  },
]

export function CategorySlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerView >= categories.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, categories.length - itemsPerView) : prev - 1))
  }

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4 font-sans">Shop by Category</h2>
          <p className="text-lg text-muted-foreground font-serif">Discover our wide range of product categories</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {categories.map((category) => (
                <div key={category.id} className="flex-shrink-0" style={{ width: `${100 / itemsPerView}%` }}>
                  <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-card border-border">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={category.image || "/placeholder.svg"}
                          alt={category.title}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-card-foreground mb-2 font-sans">{category.title}</h3>
                        <p className="text-muted-foreground mb-4 font-serif">{category.description}</p>
                        <Button
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                          size="lg"
                        >
                          Shop Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground"
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= categories.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.ceil(categories.length / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                Math.floor(currentIndex / itemsPerView) === index ? "bg-accent" : "bg-muted"
              }`}
              onClick={() => setCurrentIndex(index * itemsPerView)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
