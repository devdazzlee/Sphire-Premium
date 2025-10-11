import ProductDetailClient from './ProductDetailClient'

// Generate static params for all products at build time
export async function generateStaticParams() {
  try {
    // Use test data for static generation if available
    const { USE_TEST_DATA } = await import('@/utils/testData')
    
    if (USE_TEST_DATA) {
      console.log('Using test data for static generation')
      const testProducts = await import('@/data/testProducts.json')
      return testProducts.default.map((product: any) => ({
        id: product._id,
      }))
    }
    
    // Fallback: fetch from API (make sure your backend is running during build)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    console.log('Fetching products from:', `${API_BASE_URL}/products`)
    
    const response = await fetch(`${API_BASE_URL}/products?limit=1000`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.warn(`Failed to fetch products: ${response.status} ${response.statusText}`)
      // Fallback to test data if API fails
      console.log('Falling back to test data')
      const testProducts = await import('@/data/testProducts.json')
      return testProducts.default.map((product: any) => ({
        id: product._id,
      }))
    }
    
    const data = await response.json()
    console.log('Fetched products:', data.data?.products?.length || 0)
    
    if (data.status === 'success' && data.data?.products && data.data.products.length > 0) {
      return data.data.products.map((product: any) => ({
        id: product._id,
      }))
    }
    
    // Fallback to test data if no products returned
    console.log('No products from API, falling back to test data')
    const testProducts = await import('@/data/testProducts.json')
    return testProducts.default.map((product: any) => ({
      id: product._id,
    }))
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    // Fallback to test data on any error
    try {
      console.log('Exception occurred, falling back to test data')
      const testProducts = await import('@/data/testProducts.json')
      return testProducts.default.map((product: any) => ({
        id: product._id,
      }))
    } catch (fallbackError) {
      console.error('Even test data failed:', fallbackError)
      return []
    }
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />
}
