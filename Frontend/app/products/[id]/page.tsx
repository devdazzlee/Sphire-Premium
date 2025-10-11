import ProductDetailClient from './ProductDetailClient'

// Generate static params for all products at build time
export async function generateStaticParams() {
  try {
    // Use test data for static generation if available
    const { USE_TEST_DATA } = await import('@/utils/testData')
    
    if (USE_TEST_DATA) {
      const testProducts = await import('@/data/testProducts.json')
      return testProducts.default.map((product: any) => ({
        id: product._id,
      }))
    }
    
    // Fallback: fetch from API (make sure your backend is running during build)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const response = await fetch(`${API_BASE_URL}/products?limit=1000`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch products for static generation, using empty array')
      return []
    }
    
    const data = await response.json()
    
    if (data.status === 'success' && data.data?.products) {
      return data.data.products.map((product: any) => ({
        id: product._id,
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    // Return empty array to allow build to continue
    return []
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />
}
