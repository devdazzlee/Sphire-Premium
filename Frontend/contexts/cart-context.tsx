"use client"

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from "react"
import type { Product, CartState } from "@/types/product"
import { cartApi, tokenManager } from "@/lib/api"

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "ADD_ITEM_WITH_QUANTITY"; payload: { product: Product; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

interface CartContextType extends CartState {
  addItem: (product: Product) => Promise<{ success: boolean; message?: string }>
  addItemWithQuantity: (product: Product, quantity: number) => Promise<{ success: boolean; message?: string }>
  removeItem: (productId: string) => Promise<{ success: boolean; message?: string }>
  updateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean; message?: string }>
  clearCart: () => Promise<{ success: boolean; message?: string }>
  syncWithServer: () => Promise<void>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.product.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.product.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        const total = updatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return { items: updatedItems, total, itemCount }
      } else {
        const newItems = [...state.items, { product: action.payload, quantity: 1 }]
        const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

        return { items: newItems, total, itemCount }
      }
    }

    case "ADD_ITEM_WITH_QUANTITY": {
      const existingItem = state.items.find((item) => item.product.id === action.payload.product.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.product.id === action.payload.product.id 
            ? { ...item, quantity: item.quantity + action.payload.quantity } 
            : item,
        )
        const total = updatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return { items: updatedItems, total, itemCount }
      } else {
        const newItems = [...state.items, { product: action.payload.product, quantity: action.payload.quantity }]
        const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

        return { items: newItems, total, itemCount }
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.product.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id })
      }

      const updatedItems = state.items.map((item) =>
        item.product.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      const total = updatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: updatedItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "LOAD_CART":
      return action.payload

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  const [isOpen, setIsOpen] = React.useState(false)

  useEffect(() => {
    // Load cart from localStorage for offline support
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: parsedCart })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }

    // Sync with server if user is authenticated
    const token = tokenManager.getToken()
    if (token) {
      syncWithServer()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state))
  }, [state])

  const syncWithServer = useCallback(async () => {
    const token = tokenManager.getToken()
    if (!token) return

    try {
      const response = await cartApi.get(token)
      if (response.status === 'success' && response.data) {
        const serverCart = response.data.cart
        dispatch({ type: "LOAD_CART", payload: serverCart })
      }
    } catch (error) {
      console.error("Error syncing cart with server:", error)
    }
  }, [])

  const addItem = useCallback(async (product: Product): Promise<{ success: boolean; message?: string }> => {
    const token = tokenManager.getToken()
    
    if (token) {
      try {
        const response = await cartApi.addItem(token, product._id, 1)
        if (response.status === 'success' && response.data) {
          dispatch({ type: "LOAD_CART", payload: response.data.cart })
          return { success: true }
        } else {
          return { success: false, message: response.message || 'Failed to add item' }
        }
      } catch (error: any) {
        return { success: false, message: error.message || 'Failed to add item' }
      }
    } else {
      // Offline mode - use local storage
      dispatch({ type: "ADD_ITEM", payload: product })
      return { success: true }
    }
  }, [])

  const addItemWithQuantity = useCallback(async (product: Product, quantity: number): Promise<{ success: boolean; message?: string }> => {
    const token = tokenManager.getToken()
    
    if (token) {
      try {
        const response = await cartApi.addItem(token, product._id, quantity)
        if (response.status === 'success' && response.data) {
          dispatch({ type: "LOAD_CART", payload: response.data.cart })
          return { success: true }
        } else {
          return { success: false, message: response.message || 'Failed to add item' }
        }
      } catch (error: any) {
        return { success: false, message: error.message || 'Failed to add item' }
      }
    } else {
      // Offline mode - use local storage
      dispatch({ type: "ADD_ITEM_WITH_QUANTITY", payload: { product, quantity } })
      return { success: true }
    }
  }, [])

  const removeItem = useCallback(async (productId: string): Promise<{ success: boolean; message?: string }> => {
    const token = tokenManager.getToken()
    
    if (token) {
      try {
        const response = await cartApi.removeItem(token, productId)
        if (response.status === 'success' && response.data) {
          dispatch({ type: "LOAD_CART", payload: response.data.cart })
          return { success: true }
        } else {
          return { success: false, message: response.message || 'Failed to remove item' }
        }
      } catch (error: any) {
        return { success: false, message: error.message || 'Failed to remove item' }
      }
    } else {
      // Offline mode - use local storage
      dispatch({ type: "REMOVE_ITEM", payload: productId })
      return { success: true }
    }
  }, [])

  const updateQuantity = useCallback(async (productId: string, quantity: number): Promise<{ success: boolean; message?: string }> => {
    const token = tokenManager.getToken()
    
    if (token) {
      try {
        const response = await cartApi.updateItem(token, productId, quantity)
        if (response.status === 'success' && response.data) {
          dispatch({ type: "LOAD_CART", payload: response.data.cart })
          return { success: true }
        } else {
          return { success: false, message: response.message || 'Failed to update quantity' }
        }
      } catch (error: any) {
        return { success: false, message: error.message || 'Failed to update quantity' }
      }
    } else {
      // Offline mode - use local storage
      dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity } })
      return { success: true }
    }
  }, [])

  const clearCart = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    const token = tokenManager.getToken()
    
    if (token) {
      try {
        const response = await cartApi.clear(token)
        if (response.status === 'success' && response.data) {
          dispatch({ type: "LOAD_CART", payload: response.data.cart })
          return { success: true }
        } else {
          return { success: false, message: response.message || 'Failed to clear cart' }
        }
      } catch (error: any) {
        return { success: false, message: error.message || 'Failed to clear cart' }
      }
    } else {
      // Offline mode - use local storage
      dispatch({ type: "CLEAR_CART" })
      return { success: true }
    }
  }, [])

  const contextValue = useMemo(() => ({
    ...state,
    addItem,
    addItemWithQuantity,
    removeItem,
    updateQuantity,
    clearCart,
    syncWithServer,
    isOpen,
    setIsOpen,
  }), [state, addItem, addItemWithQuantity, removeItem, updateQuantity, clearCart, syncWithServer, isOpen, setIsOpen])

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
