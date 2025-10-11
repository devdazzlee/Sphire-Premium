"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface WishlistItem {
  _id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  inStock: boolean
  rating: number
  reviewCount: number
}

interface WishlistContextType {
  items: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  itemCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        try {
          setItems(JSON.parse(savedWishlist))
        } catch (error) {
          console.error('Error loading wishlist:', error)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addToWishlist = (item: WishlistItem) => {
    setItems((prevItems) => {
      const exists = prevItems.find((i) => i._id === item._id)
      if (exists) {
        toast.info('Already in wishlist', {
          description: 'This item is already in your wishlist'
        })
        return prevItems
      }
      toast.success('Added to wishlist!', {
        description: `${item.name} has been added to your wishlist`
      })
      return [...prevItems, item]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i._id === productId)
      if (item) {
        toast.success('Removed from wishlist', {
          description: `${item.name} has been removed from your wishlist`
        })
      }
      return prevItems.filter((i) => i._id !== productId)
    })
  }

  const isInWishlist = (productId: string) => {
    return items.some((item) => item._id === productId)
  }

  const clearWishlist = () => {
    setItems([])
    toast.success('Wishlist cleared', {
      description: 'All items have been removed from your wishlist'
    })
  }

  const itemCount = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
