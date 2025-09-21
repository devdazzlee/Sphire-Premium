"use client"

import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatedHeader />
      
      <main className="container mx-auto px-4 py-12 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-800 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-3">Acceptance of Terms</h3>
                <p>
                  By accessing and using Sphire Premium's website and services, you accept and agree to be bound 
                  by the terms and provision of this agreement.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Use License</h3>
                <p className="mb-4">
                  Permission is granted to temporarily download one copy of the materials on Sphire Premium's 
                  website for personal, non-commercial transitory viewing only.
                </p>
                <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to reverse engineer any software</li>
                  <li>Remove any copyright or proprietary notations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Product Information</h3>
                <p>
                  We strive to provide accurate product information, but we do not warrant that product 
                  descriptions or other content is accurate, complete, reliable, or error-free.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Pricing and Payment</h3>
                <p className="mb-4">
                  All prices are subject to change without notice. Payment must be received before order processing.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We accept cash on delivery</li>
                  <li>All prices are in PKR</li>
                  <li>Taxes are included in the displayed price</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Returns and Refunds</h3>
                <p>
                  We offer returns within 30 days of purchase. Items must be in original condition with tags attached. 
                  Contact our customer service for return authorization.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Limitation of Liability</h3>
                <p>
                  In no event shall Sphire Premium or its suppliers be liable for any damages arising out of the 
                  use or inability to use the materials on our website.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="mt-2">
                  Email: legal@sphirepremium.com<br />
                  Phone: +92 300 123 4567
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
