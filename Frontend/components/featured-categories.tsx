"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Star, TrendingUp, Heart, ShoppingCart, Zap } from "lucide-react"
import { productsApi } from "@/lib/api"

interface Category {
  id: number
  name: string
  description: string
  image: string
  productCount: number
  discount: string
  badge: string
  color: string
  gradient: string
}

const categories: Category[] = [
  {
    id: 1,
    name: "Skincare Essentials",
    description: "Premium skincare products for radiant, healthy skin",
    image: "/luxury-beauty-products-arranged-elegantly-on-marbl.png",
    productCount: 24,
    discount: "Up to 40% OFF",
    badge: "Most Popular",
    color: "blue",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    name: "Natural Beauty",
    description: "Organic ingredients meet cutting-edge science",
    image: "/elegant-beauty-laboratory-with-natural-ingredients.png",
    productCount: 18,
    discount: "Up to 35% OFF",
    badge: "Trending",
    color: "green",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: 3,
    name: "Anti-Aging",
    description: "Advanced formulas that turn back time",
    image: "/wellness-spa-products.png",
    productCount: 15,
    discount: "Up to 45% OFF",
    badge: "Premium",
    color: "purple",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 4,
    name: "Hydration",
    description: "Deep moisture therapy for all skin types",
    image: "/product1.webp",
    productCount: 12,
    discount: "Up to 30% OFF",
    badge: "New",
    color: "pink",
    gradient: "from-pink-500 to-rose-500"
  }
]

export function FeaturedCategories() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    fetchCategories()
  }, [])

  const handleCategoryClick = (category: Category) => {
    // Convert category name to URL-friendly format
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-')
    router.push(`/products?category=${categorySlug}`)
  }

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      
      // First, get all products to analyze categories
      const allProductsResponse = await productsApi.getAll({ limit: 100 })
      console.log('All products response:', allProductsResponse)
      
      if (allProductsResponse.status === 'success' && allProductsResponse.data?.products) {
        const allProducts = allProductsResponse.data.products
        
        // Group products by category
        const categoryGroups: { [key: string]: any[] } = {}
        allProducts.forEach((product: any) => {
          const category = product.category || 'general'
          if (!categoryGroups[category]) {
            categoryGroups[category] = []
          }
          categoryGroups[category].push(product)
        })
        
        console.log('Category groups:', categoryGroups)
        
        // Create dynamic categories from real data
        const dynamicCategories: Category[] = []
        let categoryId = 1
        
        Object.entries(categoryGroups).forEach(([categoryKey, products]) => {
          if (products.length > 0) {
            const firstProduct = products[0]
            const categoryName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).replace('-', ' ')
            
            dynamicCategories.push({
              id: categoryId++,
              name: categoryName,
              description: `Premium ${categoryName.toLowerCase()} products for your beauty needs`,
              image: firstProduct.images?.[0] || "/luxury-beauty-products-arranged-elegantly-on-marbl.png",
              productCount: products.length,
              discount: "Up to 40% OFF",
              badge: products.length > 10 ? "Most Popular" : products.length > 5 ? "Trending" : "New",
              color: categoryId % 2 === 0 ? "blue" : "green",
              gradient: categoryId % 2 === 0 ? "from-blue-500 to-cyan-500" : "from-green-500 to-emerald-500"
            })
          }
        })
        
        // If we have categories, use them, otherwise fallback to static
        if (dynamicCategories.length > 0) {
          setCategories(dynamicCategories.slice(0, 4)) // Limit to 4 categories
        } else {
          // Fallback to static categories if no dynamic data
          setCategories(categories)
        }
      } else {
        console.error('Failed to fetch products:', allProductsResponse)
        setCategories(categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories(categories)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-5 h-5 fill-current animate-spin" />
              <TrendingUp className="w-5 h-5" />
              Featured Categories
            </div>
            <h2 className="text-6xl font-bold text-gray-900 mb-6">Discover Your Style</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">Loading categories...</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-xs font-semibold mb-4 shadow-lg transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Sparkles className="w-4 h-4 fill-current animate-spin" />
            <TrendingUp className="w-4 h-4" />
            Featured Categories
          </div>
          
          <h2 className={`text-3xl font-bold text-gray-900 mb-4 leading-tight transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">Your Style</span>
          </h2>
          
          <p className={`text-base text-gray-600 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Explore our carefully curated categories featuring the finest beauty products. 
            Each category is designed to meet your specific skincare and beauty needs.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 ease-out overflow-hidden border border-gray-100 cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              } ${hoveredCard === category.id ? 'scale-105 z-10' : 'scale-100'}`}
              style={{ 
                transitionDelay: `${index * 200}ms`,
                transform: hoveredCard === category.id ? 'scale(1.05) translateY(-10px)' : 'scale(1) translateY(0)'
              }}
              onMouseEnter={() => setHoveredCard(category.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCategoryClick(category)}
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-${category.color}-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r ${category.gradient} text-white`}>
                    {category.badge}
                  </span>
                </div>

                {/* Discount Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                    {category.discount}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <button className="bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="bg-white/90 hover:bg-white text-gray-600 hover:text-blue-500 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Category Name */}
                <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-purple-600 transition-colors duration-300">
                  {category.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {category.description}
                </p>
                
                {/* Product Count */}
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-medium text-gray-700">
                    {category.productCount} Products
                  </span>
                </div>

                {/* Explore Button */}
                <Button 
                  className={`w-full bg-gradient-to-r ${category.gradient} hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all duration-500 hover:scale-105 shadow-lg group-hover:shadow-xl`}
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Explore Category
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-${category.color}-500 group-hover:to-purple-500 transition-all duration-500`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-8 transition-all duration-1000 delay-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Button 
            onClick={() => router.push('/products')}
            variant="outline" 
            size="md"
            className="bg-white hover:bg-gray-50 border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 font-bold px-6 py-2.5 rounded-lg transition-all duration-500 hover:scale-105 shadow-lg"
          >
            View All Categories
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
