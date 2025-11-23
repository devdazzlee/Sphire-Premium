"use client"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { Search, X, ChevronDown, Heart } from "lucide-react"
import { CartIcon } from "@/components/cart-icon"
import { CartDrawer } from "@/components/cart-drawer"
import { AccountDropdown } from "@/components/account-dropdown"
import { useWishlist } from "@/contexts/wishlist-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function AnimatedHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const { itemCount } = useWishlist()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMenuAnimating, setIsMenuAnimating] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  const hiddenPages = ['/cart', '/account', '/checkout', '/login', '/register']
  const shouldShowHeader = !hiddenPages.some(page => pathname.startsWith(page))

  useEffect(() => {
    if (!shouldShowHeader) return

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY > 10
          setIsScrolled(scrolled)
          ticking = false
        })
        ticking = true
      }
    }

    const handleOpenCartDrawer = () => {
      setIsCartOpen(true)
    }

    window.addEventListener('openCartDrawer', handleOpenCartDrawer)

    const handleResize = () => {
      // Close mobile menu if screen becomes desktop size
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false)
        // Only reset overflow for mobile menu, not padding
        if (document.body.style.overflow === 'hidden') {
          document.body.style.overflow = ''
          document.body.style.position = ''
          document.body.style.width = ''
          document.body.style.top = ''
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener('openCartDrawer', handleOpenCartDrawer)
      // Only clean up overflow if it was set by this component
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
      }
    }
  }, [shouldShowHeader, isMenuOpen])

  useEffect(() => {
    if (!shouldShowHeader) return

    // Simple header animation without GSAP
    const headerContainer = document.querySelector('.header-container')
    if (headerContainer) {
      headerContainer.classList.add('animate-in', 'slide-in-from-top', 'duration-700')
    }
    
    const headerItems = document.querySelectorAll('.header-item')
    headerItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('animate-in', 'slide-in-from-top', 'duration-500')
      }, index * 100 + 300)
    })
  }, [shouldShowHeader])

  if (!shouldShowHeader) {
    return null
  }

  const toggleMenu = () => {
    // Only allow menu toggle on mobile devices
    if (window.innerWidth >= 768) {
      return
    }
    
    const newMenuState = !isMenuOpen
    
    if (newMenuState) {
      // Opening menu - show menu first, then animate in
      setIsMenuOpen(true)
      setIsMenuAnimating(true)
      // Only set overflow for mobile menu, not padding
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      
      // Trigger slide-in animation after menu is rendered
      setTimeout(() => {
        setIsMenuAnimating(false)
      }, 50)
    } else {
      // Closing menu - animate out first, then hide
      setIsMenuAnimating(true)
      
      // Hide menu after animation completes
      setTimeout(() => {
        setIsMenuOpen(false)
        setIsMenuAnimating(false)
        const scrollY = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }, 300)
    }
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu)
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
    if (!isCartOpen && isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      <header
        ref={ref}
        className={`border-b border-gray-200/50 shadow-lg relative font-light sticky top-0 left-0 right-0 w-full transition-all duration-500 ease-out z-[100] ${
          isScrolled 
            ? "backdrop-blur-xl shadow-2xl border-gray-300/60" 
            : "backdrop-blur-md"
        }`}
        style={{
          transformOrigin: "center top",
          backdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "blur(12px) saturate(180%)",
          WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "blur(12px) saturate(180%)",
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.85)",
        }}
      >
        <div
          className={`text-white text-center py-2 text-sm font-light tracking-wide transition-all duration-300 ${
            isScrolled ? "py-1 text-xs" : "py-2"
          }`}
          style={{
            background: "linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)",
            backdropFilter: "blur(10px) saturate(180%)",
            WebkitBackdropFilter: "blur(10px) saturate(180%)",
          }}
        >
          Shop our latest arrivals!
        </div>
        <div className="header-container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center space-x-2 md:hidden flex-1 lg:hidden">
              <button
                onClick={toggleMenu}
                className={`header-item p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group hamburger-button ${
                  isMenuOpen ? 'menu-open' : ''
                }`}
                aria-label="Toggle mobile menu"
              >
                <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
                  <div className={`hamburger-line w-5 h-0.5 bg-gray-700 group-hover:bg-gray-900 transition-all duration-300 ease-out ${
                    isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}></div>
                  <div className={`hamburger-line w-5 h-0.5 bg-gray-700 group-hover:bg-gray-900 transition-all duration-300 ease-out ${
                    isMenuOpen ? 'opacity-0 scale-0' : ''
                  }`}></div>
                  <div className={`hamburger-line w-5 h-0.5 bg-gray-700 group-hover:bg-gray-900 transition-all duration-300 ease-out ${
                    isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}></div>
                </div>
              </button>
              <button
                onClick={toggleSearch}
                className="header-item p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105 group"
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors duration-200 stroke-1" />
              </button>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="header-item text-gray-700 hover:text-gray-900 transition-all duration-300 font-light text-lg tracking-wide relative group hover:-translate-y-0.5"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/products"
                className="header-item text-gray-700 hover:text-gray-900 transition-all duration-300 font-light text-lg tracking-wide relative group hover:-translate-y-0.5"
              >
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/about"
                className="header-item text-gray-700 hover:text-gray-900 transition-all duration-300 font-light text-lg tracking-wide relative group hover:-translate-y-0.5"
              >
                About us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/contact"
                className="header-item text-gray-700 hover:text-gray-900 transition-all duration-300 font-light text-lg tracking-wide relative group hover:-translate-y-0.5"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            <Link
              href="/"
              className="flex-1 flex justify-center md:absolute md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:z-10"
            >
              <div className="logo-container cursor-pointer transition-all duration-300 mx-4 md:mx-0 hover:scale-105 hover:rotate-1">
                <img
                  src="/sphire-premium-logo.png"
                  alt="Sphire Premium Logo"
                  className="w-20 h-20 md:w-20 md:h-20 object-contain transition-all duration-300"
                />
              </div>
            </Link>

            <div className="flex items-center space-x-4 md:space-x-4 flex-1 justify-end">
              <button
                onClick={toggleSearch}
                className="header-item p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105 group hidden md:block"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-700 group-hover:text-gray-900 transition-colors duration-200 stroke-1" />
              </button>
              <div className="header-item">
                <AccountDropdown />
              </div>
              <div className="header-item">
                <Link href="/wishlist" className="relative group flex flex-col items-center gap-1 md:gap-2">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 text-gray-700 group-hover:text-red-500 group-hover:fill-red-500 transition-all duration-200 stroke-1" />
                  <span className="text-xs md:text-sm text-gray-700 group-hover:text-red-500 transition-colors duration-200 font-light hidden sm:block">
                    Favourite
                  </span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
              <div className="header-item">
                <CartIcon onClick={toggleCart} />
              </div>
            </div>
          </div>
        </div>
        {isSearchOpen && (
          <div
            className={`absolute top-full left-0 right-0 border-t border-gray-200/50 shadow-lg p-4 z-50 transition-all duration-300 ${
              isScrolled ? "backdrop-blur-xl" : "backdrop-blur-md"
            }`}
            style={{
              zIndex: 150,
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for skincare, makeup, wellness products..."
                  className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSearchQuery("skincare")
                    router.push("/products?search=skincare")
                    setIsSearchOpen(false)
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  Skincare
                </button>
                <button
                  onClick={() => {
                    setSearchQuery("makeup")
                    router.push("/products?search=makeup")
                    setIsSearchOpen(false)
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  Makeup
                </button>
                <button
                  onClick={() => {
                    setSearchQuery("wellness")
                    router.push("/products?search=wellness")
                    setIsSearchOpen(false)
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  Wellness
                </button>
              </div>
            </div>
          </div>
        )}
        {isMenuOpen && (
          <>
            <div
              className="menu-backdrop fixed inset-0 bg-black/80 z-[9998] transition-opacity duration-300 ease-out"
              onClick={toggleMenu}
              style={{ 
                zIndex: 9998,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'auto',
                opacity: isMenuAnimating ? 0 : 1,
                transition: 'opacity 300ms ease-out'
              }}
            />
            <div
              className="mobile-menu fixed left-0 top-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-[9999] overflow-y-auto border-r border-gray-200 transform transition-transform duration-300 ease-out"
              style={{ 
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: '320px',
                transform: isMenuAnimating ? 'translateX(-100%)' : 'translateX(0)',
                transition: 'transform 300ms ease-out'
              }}
            >
              <div className="p-4 sm:p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <img src="/sphire-premium-logo.png" alt="Sphire Premium" className="menu-logo w-16 h-16 sm:w-18 sm:h-18" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-light text-gray-800 tracking-wider">
                        Sphire
                      </h2>
                      <p className="text-sm text-gray-600 font-light tracking-wide">Premium Collection</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleMenu}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105 group"
                  >
                    <X className="w-5 h-5 text-gray-700 group-hover:text-black stroke-1" />
                  </button>
                </div>
                <nav className="space-y-2">
                  <div className="transition-all duration-300 ease-out">
                    <Link
                      href="/"
                      className="flex items-center px-4 py-3 text-gray-800 rounded-xl transition-all duration-200 font-medium text-base hover:bg-gray-100 hover:text-gray-900"
                      onClick={toggleMenu}
                    >
                      <span className="mr-3">🏠</span>
                      Home
                    </Link>
                  </div>
                  <div className="transition-all duration-300 ease-out">
                    <button
                      onClick={() => toggleSubmenu("products")}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-800 rounded-xl transition-all duration-200 font-medium text-base hover:bg-gray-100 hover:text-gray-900"
                    >
                      <div className="flex items-center">
                        <span className="mr-3">🛍️</span>
                        Products
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 text-gray-500 stroke-1 ${openSubmenu === "products" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openSubmenu === "products" && (
                      <div className="ml-8 mt-2 space-y-1 overflow-hidden">
                        <Link
                          href="/products"
                          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          onClick={toggleMenu}
                        >
                          <span className="mr-2">✨</span>
                          All Products
                        </Link>
                        <Link
                          href="/products?category=cosmetics"
                          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          onClick={toggleMenu}
                        >
                          <span className="mr-2">💄</span>
                          Cosmetics
                        </Link>
                        <Link
                          href="/products?category=wellness"
                          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          onClick={toggleMenu}
                        >
                          <span className="mr-2">🌿</span>
                          Wellness
                        </Link>
                        <Link
                          href="/products?filter=new"
                          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          onClick={toggleMenu}
                        >
                          <span className="mr-2">🆕</span>
                          New Arrivals
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="transition-all duration-300 ease-out">
                    <button
                      onClick={() => toggleSubmenu("categories")}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-800 rounded-xl transition-all duration-200 font-medium text-base hover:bg-gray-100 hover:text-gray-900"
                    >
                      <div className="flex items-center">
                        <span className="mr-3">📂</span>
                        Categories
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 text-gray-500 stroke-1 ${openSubmenu === "categories" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openSubmenu === "categories" && (
                      <div className="ml-8 mt-2 space-y-1 overflow-hidden">
                        <Link
                          href="/products?category=face-care"
                          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          onClick={toggleMenu}
                        >
                          <span className="mr-2">😊</span>
                          Face Care
                        </Link>
                        <Link
                          href="/products?category=body-care"
                          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          onClick={toggleMenu}
                        >
                          <span className="mr-2">🚿</span>
                          Body Care
                        </Link>
                        <Link
                          href="/products?category=hair-care"
                          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          onClick={toggleMenu}
                        >
                          <span className="mr-2">💇</span>
                          Hair Care
                        </Link>
                        <Link
                          href="/products?category=makeup"
                          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          onClick={toggleMenu}
                        >
                          <span className="mr-2">💋</span>
                          Makeup
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="transition-all duration-300 ease-out">
                    <Link
                      href="/about"
                      className="flex items-center px-4 py-3 text-gray-800 rounded-xl transition-all duration-200 font-medium text-base hover:bg-gray-100 hover:text-gray-900"
                      onClick={toggleMenu}
                    >
                      <span className="mr-3">👥</span>
                      About Us
                    </Link>
                  </div>
                  <div className="transition-all duration-300 ease-out">
                    <Link
                      href="/contact"
                      className="flex items-center px-4 py-3 text-gray-800 rounded-xl transition-all duration-200 font-medium text-base hover:bg-gray-100 hover:text-gray-900"
                      onClick={toggleMenu}
                    >
                      <span className="mr-3">📞</span>
                      Contact
                    </Link>
                  </div>
                  <div className="transition-all duration-300 ease-out">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        setIsCartOpen(true)
                      }}
                      className="w-full flex items-center px-4 py-3 text-gray-800 rounded-xl transition-all duration-200 font-medium text-base hover:bg-gray-100 hover:text-gray-900"
                    >
                      <span className="mr-3">🛒</span>
                      Shopping Cart
                    </button>
                  </div>
                </nav>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-center shadow-lg">
                    <h3 className="text-white font-bold text-base mb-2">Special Offer</h3>
                    <p className="text-blue-100 text-sm mb-3">Get 20% off your first order</p>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false)
                        router.push('/products?discount=20off')
                      }}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-all duration-200 w-full shadow-md hover:shadow-lg"
                    >
                      Claim Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
