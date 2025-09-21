// Token utility functions
export const isTokenValid = (token: string): boolean => {
  try {
    if (!token) return false
    
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) return false
    
    const payload = JSON.parse(atob(tokenParts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

export const getTokenPayload = (token: string) => {
  try {
    if (!token) return null
    
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) return null
    
    return JSON.parse(atob(tokenParts[1]))
  } catch (error) {
    console.error('Token decode error:', error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const payload = getTokenPayload(token)
  if (!payload || !payload.exp) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}
