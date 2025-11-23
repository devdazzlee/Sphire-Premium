"use client"

import { useEffect, useState } from "react"

interface FacebookLoginButtonProps {
  onSuccess: (accessToken: string, userInfo: { name: string; email: string; picture: any }) => void
  onError: (error: string) => void
}

export function FacebookLoginButton({ onSuccess, onError }: FacebookLoginButtonProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''

    if (!appId) {
      console.warn('Facebook App ID not configured')
      setIsLoading(false)
      return
    }

    // Check if SDK already loaded
    if (window.FB) {
      setIsSDKLoaded(true)
      setIsLoading(false)
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="connect.facebook.net"]')
    if (existingScript) {
      // Wait for SDK to load
      const checkSDK = setInterval(() => {
        if (window.FB) {
          clearInterval(checkSDK)
          setIsSDKLoaded(true)
          setIsLoading(false)
        }
      }, 100)
      return () => clearInterval(checkSDK)
    }

    // Load Facebook SDK
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.FB) {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        })
        setIsSDKLoaded(true)
      }
      setIsLoading(false)
    }
    script.onerror = () => {
      setIsLoading(false)
      onError('Failed to load Facebook SDK')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
    }
  }, [onSuccess, onError])

  const handleFacebookLogin = () => {
    if (!isSDKLoaded || !window.FB) {
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''
      if (!appId) {
        onError('Facebook OAuth is not configured. Please add NEXT_PUBLIC_FACEBOOK_APP_ID to your environment variables.')
      } else {
        onError('Facebook SDK is still loading. Please try again in a moment.')
      }
      return
    }

    try {
      window.FB.login((response: any) => {
        if (response.authResponse) {
          window.FB.api('/me', { fields: 'name,email,picture' }, (userInfo: any) => {
            if (userInfo.error) {
              onError(userInfo.error.message || 'Failed to get Facebook user info')
            } else {
              onSuccess(response.authResponse.accessToken, {
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
              })
            }
          })
        } else {
          onError('Facebook login cancelled or failed')
        }
      }, { scope: 'email,public_profile' })
    } catch (error: any) {
      onError(error.message || 'Failed to initiate Facebook login')
    }
  }

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      Facebook
    </button>
  )
}

