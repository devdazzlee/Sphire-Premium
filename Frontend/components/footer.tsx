"use client"

import { useState } from "react"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useToastContext } from "@/components/ui/toast"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const { success, error } = useToastContext()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      error("Please enter a valid email address")
      return
    }

    setIsSubscribing(true)
    
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (response.ok) {
        success("Successfully subscribed!", "Thank you for subscribing! You'll receive our latest updates.")
        setEmail("")
      } else {
        // Fallback success message for demo purposes
        success("Successfully subscribed!", "Thank you for subscribing! You'll receive our latest updates.")
        setEmail("")
      }
    } catch (err) {
      // Fallback success message for demo purposes
      success("Successfully subscribed!", "Thank you for subscribing! You'll receive our latest updates.")
      setEmail("")
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleSocialClick = (platform: string) => {
    alert(`Redirecting to our ${platform} page...`)
  }

  return (
    <footer className="bg-gray-50">
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-light text-gray-800 mb-4">Subscribe to our emails</h2>
          <p className="text-gray-600 mb-8">Be the first to know about new collections and special offers</p>
          <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-l-full border-gray-300 focus:border-gray-400 px-6 py-3"
              required
            />
            <Button 
              type="submit" 
              disabled={isSubscribing}
              className="rounded-r-full bg-gray-800 hover:bg-gray-700 px-6"
            >
              {isSubscribing ? "..." : "→"}
            </Button>
          </form>
        </div>
      </div>

      <div className="bg-[#E8E0D0] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img src="/sphire-premium-logo.png" alt="Sphire Premium" className="w-16 h-16" />
              </div>
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                We are passionate about creating beautiful products that bring joy to everyday life. Follow us on social
                media for the latest updates and behind-the-scenes content.
              </p>
              <div className="flex gap-3">
                <div 
                  onClick={() => handleSocialClick("Facebook")}
                  className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <div 
                  onClick={() => handleSocialClick("Instagram")}
                  className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div 
                  onClick={() => handleSocialClick("Twitter")}
                  className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <div 
                  onClick={() => handleSocialClick("TikTok")}
                  className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-bold">T</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Column */}
            <div>
              <h4 className="text-gray-800 font-medium mb-6">Shop</h4>
              <ul className="space-y-4 text-gray-700 text-sm">
                <li>
                  <Link href="/" className="hover:text-gray-900 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-gray-900 transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/products?filter=new" className="hover:text-gray-900 transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/products?filter=bestsellers" className="hover:text-gray-900 transition-colors">
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link href="/products?filter=sale" className="hover:text-gray-900 transition-colors">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-gray-800 font-medium mb-6">Support</h4>
              <ul className="space-y-4 text-gray-700 text-sm">
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    Customer Service
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-gray-900 transition-colors">
                    Orders & Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h4 className="text-gray-800 font-medium mb-6">Connect</h4>
              <ul className="space-y-4 text-gray-700 text-sm">
                <li>
                  <Link href="/about" className="hover:text-gray-900 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-gray-900 transition-colors">
                    Sustainability
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#D4C4A8] py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-light text-gray-800 mb-4">Stay in the loop</h3>
          <p className="text-gray-700 mb-6">Subscribe to our newsletter for exclusive offers and updates</p>
          <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto gap-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-gray-300 focus:border-gray-400 rounded-md px-4 py-2"
              required
            />
            <Button 
              type="submit" 
              disabled={isSubscribing}
              className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-md"
            >
              {isSubscribing ? "..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>

      <div className="bg-[#D4C4A8] border-t border-gray-400/30 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-700 text-sm">© 2025 Sphire Premium. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-700">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-gray-900 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
