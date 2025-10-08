"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Package, TrendingUp } from "lucide-react"
import { productsApi } from "@/lib/api"
import Image from "next/image"

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  image: string | null
  isActive: boolean
  sortOrder: number
  productCount?: number
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await productsApi.getCategories()
      
      if (response.status === 'success' && response.data?.categories) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryClick = (category: Category) => {
    router.push(`/products?category=${category.slug}`)
  }

  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-purple-500 to-pink-500",
    "from-pink-500 to-rose-500",
    "from-orange-500 to-amber-500",
    "from-indigo-500 to-blue-500",
    "from-red-500 to-orange-500",
    "from-teal-500 to-green-500"
  ]

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <AnimatedHeader />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <AnimatedHeader />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-6 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wide">All Categories</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Explore Our Collections
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the perfect products for your needs. Browse through our carefully curated categories
            and find exactly what you're looking for.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Categories Found</h3>
            <p className="text-gray-500">Categories will appear here once they are added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Card
                key={category._id}
                className={`group cursor-pointer overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  hoveredCard === category._id ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredCard(category._id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCategoryClick(category)}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Category Image */}
                <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]}`}>
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Trending Badge */}
                  {index < 3 && (
                    <Badge className="absolute top-4 right-4 bg-white/90 text-purple-700 font-bold px-3 py-1">
                      <TrendingUp className="w-3 h-3 mr-1 inline" />
                      Popular
                    </Badge>
                  )}
                </div>

                {/* Category Info */}
                <CardContent className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description || `Explore our ${category.name.toLowerCase()} collection`}
                  </p>

                  {/* Products Count */}
                  {category.productCount !== undefined && (
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Package className="w-4 h-4 mr-2" />
                      <span>{category.productCount} Products</span>
                    </div>
                  )}

                  {/* View Button */}
                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-purple-600 group-hover:text-white transition-all duration-300"
                  >
                    Browse Products
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-16">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="lg"
            className="bg-white hover:bg-gray-50 border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Back to Home
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}

