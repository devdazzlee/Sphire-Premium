"use client"

import { AnimatedHeader } from "@/components/animated-header"
import { ModernHeroBanner } from "@/components/modern-hero-banner"
import { FeaturedCategories } from "@/components/featured-categories"
import { DynamicProductSlider } from "@/components/dynamic-product-slider"
import { AttractiveProductSlider } from "@/components/attractive-product-slider"
import { CircularGallery } from "@/components/circular-gallery"
import { AnimatedCustomerBenefits } from "@/components/animated-customer-benefits"
import { AnimatedReviews } from "@/components/animated-reviews"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f1e8]">
      <AnimatedHeader />
      <ModernHeroBanner />
      <CircularGallery />
      <AttractiveProductSlider 
        title="Trending Products"
        subtitle="Discover our most popular and trending products that everyone is loving right now. Handpicked for their exceptional quality and customer satisfaction."
        badge="🔥 Trending Now"
        apiEndpoint="all"
        limit={8}
        autoPlay={true}
        autoPlaySpeed={4000}
      />
      <FeaturedCategories />
      <DynamicProductSlider 
        title="Customer Favorites"
        subtitle="Discover our most loved products that customers can't get enough of. Each item is carefully selected based on reviews, ratings, and sales performance."
        badge="Customer Favorites"
        apiEndpoint="all"
        limit={6}
      />
      <CircularGallery />
      <AnimatedCustomerBenefits />
      {/* <AnimatedReviews /> */}
      <Footer />
    </main>
  )
}