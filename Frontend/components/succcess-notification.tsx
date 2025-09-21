"use client"
import { useEffect } from "react"
import { CheckCircle } from "lucide-react"

interface SuccessNotificationProps {
  message: string
  isVisible: boolean
  onHide: () => void
}

export function SuccessNotification({ message, isVisible, onHide }: SuccessNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide()
      }, 3000) // Show for 3 seconds

      return () => clearTimeout(timer)
    }
  }, [isVisible, onHide])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
}
