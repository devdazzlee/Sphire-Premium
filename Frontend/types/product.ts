export interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subcategory: string
  inStock: boolean
  rating: number
  reviewCount: number
  features: string[]
  ingredients?: string[]
  howToUse?: string
  skinType?: string[]
  benefits?: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}
