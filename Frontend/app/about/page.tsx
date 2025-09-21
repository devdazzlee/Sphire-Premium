"use client"

import { useEffect, Suspense } from "react"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGSAP } from "@/hooks/use-gsap"
import Link from "next/link"
import { Award, Heart, Leaf, Star, Sparkles } from "lucide-react"

function AboutPageContent() {
  const { ref, gsap } = useGSAP()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.fromTo(".hero-content", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })

      // Stagger animation for value cards
      gsap.fromTo(
        ".value-card",
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.2, delay: 0.5, ease: "power2.out" },
      )

      // Story section animation
      gsap.fromTo(
        ".story-content",
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.8, ease: "power2.out" },
      )

      // Testimonials animation
      gsap.fromTo(
        ".testimonial",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.3, delay: 1.2, ease: "power2.out" },
      )
    }, ref)

    return () => ctx.revert()
  }, [gsap])

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description:
        "We source only the finest ingredients and maintain the highest standards in every product we create.",
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Natural & Sustainable",
      description:
        "Our commitment to nature drives us to create eco-friendly products that are kind to your skin and the planet.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Made with Love",
      description:
        "Every product is crafted with care and attention to detail, ensuring the best experience for our customers.",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Innovation",
      description:
        "We continuously research and develop new formulations to bring you the latest in beauty and skincare technology.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      text: "Sphire Premium has transformed my skincare routine. The quality is unmatched and my skin has never looked better.",
      rating: 5,
    },
    {
      name: "Emily Chen",
      text: "I love how natural and effective these products are. Finally found a brand I can trust completely.",
      rating: 5,
    },
    {
      name: "Maria Rodriguez",
      text: "The attention to detail and customer service is exceptional. These products are worth every penny.",
      rating: 5,
    },
  ]

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <AnimatedHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-4 pt-32">
        <div
          className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70"
          style={{
            backgroundImage: `url('/luxury-beauty-products-arranged-elegantly-on-marbl.png')`,
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center hero-content">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">Discover Sphire Premium</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Where luxury meets nature. We craft premium beauty and skincare products that celebrate your natural
            radiance while respecting the environment.
          </p>
          <Link href="/products">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg">
              Explore Our Range
            </Button>
          </Link>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="story-content">
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-lg text-card-foreground mb-6 leading-relaxed">
                Founded with a passion for natural beauty and sustainable practices, Sphire Premium began as a vision to
                create luxury skincare products that honor both your skin and the environment.
              </p>
              <p className="text-lg text-card-foreground mb-6 leading-relaxed">
                Our journey started in a small laboratory where we spent countless hours perfecting formulations that
                combine the best of nature with cutting-edge science. Today, we're proud to offer a collection that
                represents the pinnacle of beauty innovation.
              </p>
              <p className="text-lg text-card-foreground leading-relaxed">
                Every product tells a story of dedication, quality, and love for the craft of beauty. We believe that
                true luxury lies not just in the final product, but in every step of the journey from conception to your
                skincare routine.
              </p>
            </div>
            <div className="relative">
              <img src="/elegant-beauty-laboratory-with-natural-ingredients.png" alt="Our Story" className="rounded-lg shadow-lg w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-card-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from product development to customer service.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="value-card border-border hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-accent mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-card-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground">
              Real experiences from real customers who trust Sphire Premium.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="testimonial border-border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-card-foreground mb-4 italic leading-relaxed">"{testimonial.text}"</p>
                  <p className="font-semibold text-foreground">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Experience Luxury?</h2>
          <p className="text-lg text-secondary-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have made Sphire Premium their trusted beauty partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3">Shop Now</Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-background px-8 py-3 bg-transparent"
              >
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function AboutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutPageContent />
    </Suspense>
  )
}