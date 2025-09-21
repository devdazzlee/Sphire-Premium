"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AccountPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to profile page if user is authenticated
        router.push('/profile')
      } else {
        // Redirect to login page if user is not authenticated
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking authentication
  return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
