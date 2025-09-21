"use client"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface CartIconProps {
  onClick: () => void
  className?: string
}

export function CartIcon({ onClick, className = "" }: CartIconProps) {
  const { itemCount, total } = useCart()

  return (
    <div
      onClick={onClick}
      className={`relative text-gray-700 hover:text-black transition-colors cursor-pointer group flex flex-col items-center ${className}`}
    >
      <div className="cart-icon relative">
        <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform duration-200 stroke-1" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </div>
      <p className="text-sm mt-1 font-light tracking-wide hidden sm:block relative text-center w-20">
        PKR {total.toFixed(2)}
        <span className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
      </p>
    </div>
  )
}