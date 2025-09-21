// app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/contexts/auth-context'
import { CartProvider } from '@/contexts/cart-context'
import { WishlistProvider } from '@/contexts/wishlist-context'
import { LoadingProvider } from '@/contexts/loading-context'
import { ToastProvider } from '@/components/ui/toast'
import ClientWrapper from '@/components/client-wrapper' // ✅ Fixed import path
import './globals.css'

export const metadata: Metadata = {
  title: 'Sphire Premium',
  description: 'Discover premium products with exceptional quality at Sphere Premium',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style> */}
      </head>
      <body>
        <LoadingProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <ClientWrapper>
                    {children}
                  </ClientWrapper>
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}