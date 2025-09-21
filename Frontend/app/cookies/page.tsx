"use client"

import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CookiesPage() {
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
            <h1 className="text-4xl font-light text-gray-800 mb-4">Cookie Policy</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-3">What Are Cookies</h3>
                <p>
                  Cookies are small text files that are placed on your computer or mobile device when you visit 
                  our website. They help us provide you with a better experience by remembering your preferences 
                  and understanding how you use our site.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Types of Cookies We Use</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">Essential Cookies</h4>
                    <p>
                      These cookies are necessary for the website to function properly. They enable basic functions 
                      like page navigation and access to secure areas of the website.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg">Performance Cookies</h4>
                    <p>
                      These cookies collect information about how visitors use our website, such as which pages 
                      are visited most often. This helps us improve how our website works.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg">Functional Cookies</h4>
                    <p>
                      These cookies remember choices you make to improve your experience, such as your language 
                      preference or region.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg">Shopping Cart Cookies</h4>
                    <p>
                      These cookies remember items you add to your shopping cart so they remain there when you 
                      navigate to different pages or return to our site later.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Managing Cookies</h3>
                <p className="mb-4">
                  You can control and/or delete cookies as you wish. You can delete all cookies that are already 
                  on your computer and you can set most browsers to prevent them from being placed.
                </p>
                <p>
                  However, if you do this, you may have to manually adjust some preferences every time you visit 
                  our site and some services and functionalities may not work.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Third-Party Cookies</h3>
                <p>
                  We may also use third-party cookies from trusted partners to help us analyze how our website 
                  is used and to provide you with relevant advertisements.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Updates to This Policy</h3>
                <p>
                  We may update this Cookie Policy from time to time. We will notify you of any changes by 
                  posting the new Cookie Policy on this page.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
                <p>
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <p className="mt-2">
                  Email: privacy@sphirepremium.com<br />
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
