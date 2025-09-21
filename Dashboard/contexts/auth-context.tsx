"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, adminApi, tokenManager, type User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.login(email, password)
      
      if (response.status === 'success' && response.data) {
        const { user: userData, token } = response.data
        
        // Check if user is admin
        if (userData.role !== 'admin') {
          return {
            success: false,
            message: 'Access denied. Admin privileges required.'
          }
        }
        
        tokenManager.setToken(token)
        tokenManager.setUser(userData)
        setUser(userData)
        
        return { success: true }
      } else {
        return {
          success: false,
          message: response.message || 'Login failed'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Network error. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    tokenManager.removeToken()
    tokenManager.removeUser()
    setUser(null)
    router.push('/login')
  }

  const refreshUser = async () => {
    const token = tokenManager.getToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await authApi.getMe(token)
      if (response.status === 'success' && response.data) {
        const userData = response.data.user
        
        if (userData.role !== 'admin') {
          logout()
          return
        }
        
        tokenManager.setUser(userData)
        setUser(userData)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = tokenManager.getToken()
    const storedUser = tokenManager.getUser()
    
    if (token && storedUser) {
      setUser(storedUser)
      // Verify token is still valid
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}