const defaultApiUrl = 'http://localhost:5000/api'
const productionApiUrl = 'https://sphire-premium.vercel.app/api'


export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000, // 10 seconds
}
