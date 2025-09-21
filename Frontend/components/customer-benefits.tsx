"use client"

import { Star, Shield, Truck, HeadphonesIcon } from "lucide-react"

const benefits = [
  {
    icon: Star,
    title: "Premium Quality",
    description: "Our customers love the exceptional quality and durability of our products",
    stat: "4.8/5 Rating",
    image: "/happy-customer-with-quality-product.png",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and reliable shipping that gets your orders to you when you need them",
    stat: "2-Day Shipping",
    image: "/fast-delivery-truck.png",
  },
  {
    icon: Shield,
    title: "Secure Shopping",
    description: "Safe and secure transactions with our trusted payment protection",
    stat: "100% Secure",
    image: "/secure-online-shopping.png",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Round-the-clock customer service to help you with any questions",
    stat: "Always Available",
    image: "/customer-support-representative.png",
  },
]

export function CustomerBenefits() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How We're Helping Our Customers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover why millions of customers trust us for their shopping needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <img
                    src={benefit.image || "/placeholder.svg"}
                    alt={benefit.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 mb-3">{benefit.description}</p>
                  <div className="text-blue-600 font-semibold">{benefit.stat}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
