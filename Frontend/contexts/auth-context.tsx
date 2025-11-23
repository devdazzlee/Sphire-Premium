"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { authApi, tokenManager, type User } from "@/lib/api"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_ERROR" }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }
    case "LOGIN_ERROR":
      return { ...state, isLoading: false, isAuthenticated: false, user: null }
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false, isLoading: false }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>
  loginWithFacebook: () => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Check for existing session on mount
    const token = tokenManager.getToken()
    const savedUser = tokenManager.getUser()
    
    if (token && savedUser) {
      // Verify token is still valid
      authApi.getMe(token)
        .then(response => {
          if (response.status === 'success' && response.data) {
            dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user })
          } else {
            // Token is invalid, clear storage
            tokenManager.removeToken()
            tokenManager.removeUser()
          }
        })
        .catch(() => {
          // Token is invalid, clear storage
          tokenManager.removeToken()
          tokenManager.removeUser()
        })
        .finally(() => {
          dispatch({ type: "SET_LOADING", payload: false })
        })
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    dispatch({ type: "LOGIN_START" })

    try {
      const response = await authApi.login(email, password)
      
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data
        tokenManager.setToken(token)
        tokenManager.setUser(user)
        dispatch({ type: "LOGIN_SUCCESS", payload: user })
        return { success: true }
      } else {
        dispatch({ type: "LOGIN_ERROR" })
        return { success: false, message: response.message || 'Login failed' }
      }
    } catch (error: any) {
      dispatch({ type: "LOGIN_ERROR" })
      return { success: false, message: error.message || 'Login failed' }
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    dispatch({ type: "LOGIN_START" })

    try {
      const response = await authApi.register(name, email, password)
      
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data
        tokenManager.setToken(token)
        tokenManager.setUser(user)
        dispatch({ type: "LOGIN_SUCCESS", payload: user })
        return { success: true }
      } else {
        dispatch({ type: "LOGIN_ERROR" })
        return { success: false, message: response.message || 'Registration failed' }
      }
    } catch (error: any) {
      dispatch({ type: "LOGIN_ERROR" })
      return { success: false, message: error.message || 'Registration failed' }
    }
  }

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    dispatch({ type: "LOGIN_START" })

    try {
      const { signInWithPopup } = await import('firebase/auth')
      const { auth, googleProvider } = await import('@/lib/firebase')
      
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const idToken = await user.getIdToken()

      // Get user info from Firebase
      const userInfo = {
        name: user.displayName || 'User',
        email: user.email || '',
        picture: user.photoURL || '',
        uid: user.uid
      }

      // Call backend API with Firebase token
      const apiResponse = await authApi.loginWithGoogle(idToken, userInfo.name, userInfo.email, userInfo.picture)

      if (apiResponse.status === 'success' && apiResponse.data) {
        const { user: backendUser, token } = apiResponse.data
        tokenManager.setToken(token)
        tokenManager.setUser(backendUser)
        dispatch({ type: "LOGIN_SUCCESS", payload: backendUser })
        return { success: true }
      } else {
        dispatch({ type: "LOGIN_ERROR" })
        return { success: false, message: apiResponse.message || 'Google login failed' }
      }
    } catch (error: any) {
      dispatch({ type: "LOGIN_ERROR" })
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Login cancelled' }
      }
      return { success: false, message: error.message || 'Google login failed' }
    }
  }

  const loginWithFacebook = async (): Promise<{ success: boolean; message?: string }> => {
    dispatch({ type: "LOGIN_START" })

    try {
      const { signInWithPopup } = await import('firebase/auth')
      const { auth, facebookProvider } = await import('@/lib/firebase')
      
      const result = await signInWithPopup(auth, facebookProvider)
      const user = result.user
      const idToken = await user.getIdToken()

      // Get user info from Firebase
      const userInfo = {
        name: user.displayName || 'User',
        email: user.email || '',
        picture: user.photoURL || '',
        uid: user.uid
      }

      // Call backend API with Firebase token
      const apiResponse = await authApi.loginWithFacebook(idToken, userInfo.name, userInfo.email, userInfo.picture)

      if (apiResponse.status === 'success' && apiResponse.data) {
        const { user: backendUser, token } = apiResponse.data
        tokenManager.setToken(token)
        tokenManager.setUser(backendUser)
        dispatch({ type: "LOGIN_SUCCESS", payload: backendUser })
        return { success: true }
      } else {
        dispatch({ type: "LOGIN_ERROR" })
        return { success: false, message: apiResponse.message || 'Facebook login failed' }
      }
    } catch (error: any) {
      dispatch({ type: "LOGIN_ERROR" })
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Login cancelled' }
      }
      return { success: false, message: error.message || 'Facebook login failed' }
    }
  }

  const logout = () => {
    tokenManager.removeToken()
    tokenManager.removeUser()
    dispatch({ type: "LOGOUT" })
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        loginWithGoogle,
        loginWithFacebook,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
