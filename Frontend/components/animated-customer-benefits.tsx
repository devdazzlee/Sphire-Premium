"use client"
import { useEffect, useRef } from "react"
import { Shield, Truck, Headphones, Award } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function AnimatedCustomerBenefits() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    // Ensure ScrollTrigger is registered
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ".benefits-section",
        start: "top 75%",
        onEnter: () => {
          // Main title animation
          gsap.fromTo(
            ".benefits-title",
            { opacity: 0, y: 60, rotationX: 45 },
            { opacity: 1, y: 0, rotationX: 0, duration: 1, ease: "power3.out" },
          )
          // Stats counter animation
          gsap.fromTo(
            ".stat-number",
            { textContent: 0 },
            {
              textContent: (i, target) => target.getAttribute("data-value"),
              duration: 2,
              delay: 0.5,
              ease: "power2.out",
              snap: { textContent: 1 },
              stagger: 0.2,
            },
          )
          // Benefits cards stagger animation
          gsap.fromTo(
            ".benefit-card",
            {
              opacity: 0,
              y: 80,
              scale: 0.8,
              rotationY: 45,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotationY: 0,
              duration: 0.8,
              stagger: 0.2,
              delay: 0.8,
              ease: "back.out(1.7)",
            },
          )
          // Images float animation
          gsap.fromTo(
            ".benefit-image",
            { opacity: 0, scale: 0.5, rotation: -180 },
            {
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 1,
              stagger: 0.15,
              delay: 1.2,
              ease: "elastic.out(1, 0.5)",
            },
          )
        },
      })
      // Continuous floating animation for cards
      gsap.to(".benefit-card", {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        stagger: 0.5,
      })
      // Icon rotation on hover
      const cards = gsap.utils.toArray(".benefit-card")
      cards.forEach((card: any) => {
        const icon = card.querySelector(".benefit-icon")
        const image = card.querySelector(".benefit-image")
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            y: -15,
            duration: 0.3,
            ease: "power2.out",
          })
          gsap.to(icon, {
            rotation: 360,
            scale: 1.2,
            duration: 0.6,
            ease: "power2.out",
          })
          gsap.to(image, {
            scale: 1.1,
            duration: 0.4,
            ease: "power2.out",
          })
        })
        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          })
          gsap.to(icon, {
            rotation: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          })
          gsap.to(image, {
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          })
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  const benefits = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Top-rated products with guaranteed satisfaction",
      image: "/happy-customer-with-quality-product.png",
      color: "from-red-600 to-pink-700",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Free delivery on orders over PKR 2,000",
      image: "/fast-delivery-truck.png",
      color: "from-red-600 to-pink-700",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Shopping",
      description: "Your data is protected with advanced encryption",
      image: "/secure-online-shopping.png",
      color: "from-red-600 to-pink-700",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Expert customer service whenever you need help",
      image: "/customer-support-representative.png",
      color: "from-red-600 to-pink-700",
    },
  ]

  return (
    <section ref={ref} className="benefits-section py-20 bg-gradient-to-br from-[#f5f1e8] via-[#f0ebe0] to-[#ede7d9]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="benefits-title text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How We Help Our Customers
          </h2>
          <div className="flex justify-center space-x-12 mb-8">
            <div className="text-center">
              <div className="stat-number text-3xl font-bold text-pink-500" data-value="5000">
                0
              </div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="stat-number text-3xl font-bold text-pink-500" data-value="99">
                0
              </div>
              <p className="text-gray-600">% Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <div className="stat-number text-3xl font-bold text-pink-500" data-value="24">
                0
              </div>
              <p className="text-gray-600">Hour Support</p>
            </div>
          </div>
        </div>
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="benefit-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-5`}></div>
              <div className="relative z-10">
                <div
                  className={`benefit-icon inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${benefit.color} text-white rounded-2xl mb-6`}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-6">{benefit.description}</p>
                <div className="benefit-image w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={benefit.image || "/placeholder.svg"}
                    alt={benefit.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}