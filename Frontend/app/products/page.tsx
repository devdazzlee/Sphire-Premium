"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { productsApi, type Product } from "@/lib/api"

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlSearch = searchParams.get("search")
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory, sortBy, priceRange])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: any = {
        limit: 50,
      }

      if (searchQuery) params.search = searchQuery
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (sortBy) params.sort = sortBy
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(p => p === '+' ? undefined : parseInt(p))
        if (min !== undefined) params.minPrice = min
        if (max !== undefined) params.maxPrice = max
      }

      const response = await productsApi.getAll(params)
      if (response.status === 'success' && response.data) {
        setProducts(response.data.products)
      } else {
        setError(response.message || 'Failed to fetch products')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch products')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await productsApi.getCategories()
      if (response.status === 'success' && response.data) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const categoryOptions = [
    { value: "all", label: "All Products" },
    ...categories.map(cat => ({
      value: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || '',
      label: cat.name || ''
    }))
  ]

  const sortOptions = [
    { value: "name_asc", label: "Name A-Z" },
    { value: "name_desc", label: "Name Z-A" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating_desc", label: "Highest Rated" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ]

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-50", label: "Under PKR 50" },
    { value: "50-75", label: "PKR 50 - PKR 75" },
    { value: "75-100", label: "PKR 75 - PKR 100" },
    { value: "100+", label: "PKR 100+" },
  ]

  // Products are already filtered and sorted by the API
  const filteredAndSortedProducts = products

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <AnimatedHeader />

      <main className="container mx-auto px-4 py-12 pt-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide text-gray-800 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Discover our carefully curated collection of premium beauty and skincare products
          </p>
          {searchQuery && <p className="text-md text-gray-700 mt-4 font-medium">Search results for "{searchQuery}"</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-gray-400"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {isLoading ? 'Loading products...' : `Showing ${filteredAndSortedProducts.length} products`}
          </div>
        </div>

        {error ? (
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-light text-red-600 mb-2">Error Loading Products</h3>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchProducts} className="bg-gray-800 hover:bg-gray-700 text-white">
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-light text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setPriceRange("all")
                setSortBy("name")
              }}
              className="mt-4 bg-gray-800 hover:bg-gray-700 text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  )
}
