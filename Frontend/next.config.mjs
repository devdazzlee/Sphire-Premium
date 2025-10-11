/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds, not during development
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
