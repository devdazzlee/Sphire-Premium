"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGSAP } from "@/hooks/use-gsap"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Instagram, Facebook, Twitter, Youtube } from "lucide-react"

export default function ContactPage() {
  const { ref, gsap } = useGSAP()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(".contact-header", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

      // Form animation
      gsap.fromTo(
        ".contact-form",
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.3, ease: "power2.out" },
      )

      // Contact info animation
      gsap.fromTo(
        ".contact-info",
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.5, ease: "power2.out" },
      )

      // Social links animation
      gsap.fromTo(
        ".social-link",
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.8, ease: "back.out(1.4)" },
      )
    }, ref)

    return () => ctx.revert()
  }, [gsap])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      subject: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSubmitMessage("Thank you for your message! We'll get back to you within 24 hours.")
    setFormData({ name: "", email: "", subject: "", message: "" })
    setIsSubmitting(false)

    // Clear success message after 5 seconds
    setTimeout(() => setSubmitMessage(""), 5000)
  }

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      content: "hello@sphirepremium.com",
      description: "We respond within 24 hours",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "+1 (555) 123-4567",
      description: "Mon-Fri, 9AM-6PM EST",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      content: "123 Beauty Lane, New York, NY 10001",
      description: "Our flagship store",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Store Hours",
      content: "Mon-Sat: 10AM-8PM, Sun: 12PM-6PM",
      description: "Extended holiday hours",
    },
  ]

  const socialLinks = [
    { name: "Instagram", url: "#", color: "hover:text-pink-500", icon: Instagram },
    { name: "Facebook", url: "#", color: "hover:text-blue-500", icon: Facebook },
    { name: "Twitter", url: "#", color: "hover:text-blue-400", icon: Twitter },
    { name: "YouTube", url: "#", color: "hover:text-red-500", icon: Youtube },
  ]

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <AnimatedHeader />

      {/* Header Section */}
      <section className="py-16 px-4 text-center contact-header pt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <Card className="contact-form px-4 py-4 border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center mx-auto">
                  <MessageCircle className="w-6 h-6 mr-2 text-accent" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border-border focus:border-accent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-border focus:border-accent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <Select value={formData.subject} onValueChange={handleSelectChange} required>
                      <SelectTrigger className="border-border focus:border-accent">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="product">Product Question</SelectItem>
                        <SelectItem value="order">Order Support</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="border-border focus:border-accent min-h-32"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  {submitMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                      {submitMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
              <div className="mx-auto" >
                <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={index}
                        href={social.url}
                        className={`social-link text-muted-foreground ${social.color} transition-colors p-2 rounded-full hover:bg-secondary`}
                      >
                        <span className="sr-only">{social.name}</span>
                        <Icon className="w-6 h-6" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <div className="contact-info space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Contact Information</h2>
                <p className="text-lg text-card-foreground mb-8 leading-relaxed">
                  We're here to help and answer any questions you might have. We look forward to hearing from you.
                </p>
              </div>

              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-accent mt-1">{info.icon}</div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                          <p className="text-card-foreground font-medium mb-1">{info.content}</p>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Media Links */}
            
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {/* <section className="py-16 px-4 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Find Our Store</h2>
            <p className="text-lg text-secondary-foreground">
              Visit us in person for a personalized beauty consultation.
            </p>
          </div>
          <div className="bg-card rounded-lg overflow-hidden shadow-lg h-96 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg">Interactive map would be embedded here</p>
              <p className="text-sm">123 Beauty Lane, New York, NY 10001</p>
            </div>
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  )
}
