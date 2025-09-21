"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  description?: string
  inStock: boolean
}

export interface WishlistItem {
  product: Product
  addedAt: Date
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  useEffect(() => {
    const savedWishlist = localStorage.getItem('sphire-wishlist')
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist)
        const wishlistWithDates = parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
        setWishlist(wishlistWithDates)
      } catch (error) {
        console.error('Error loading wishlist:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sphire-wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.product.id === product.id)
      if (exists) {
        return prev
      }
      
      return [...prev, {
        product,
        addedAt: new Date()
      }]
    })
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(item => item.product.id !== productId))
  }, [])

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.product.id === productId)
  }, [wishlist])

  const clearWishlist = useCallback(() => {
    setWishlist([])
  }, [])

  const wishlistCount = wishlist.length

  const contextValue = useMemo(() => ({
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount
  }), [wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, wishlistCount])

  return (
    <WishlistContext.Provider value={contextValue}>
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
