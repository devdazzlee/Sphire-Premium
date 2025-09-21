"use client"
import { useEffect, useState } from "react"

interface StarAnimationProps {
  startPosition: { x: number; y: number }
  endPosition: { x: number; y: number }
  isActive: boolean
  onComplete: () => void
}

export function StarAnimation({ startPosition, endPosition, isActive, onComplete }: StarAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        onComplete()
      }, 800) // Animation duration

      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  if (!isAnimating) return null

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: startPosition.x,
        top: startPosition.y,
      }}
    >
      <div
        className="text-yellow-400 text-2xl animate-pulse"
        style={{
          animation: `fly-to-cart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          transform: `translate(${endPosition.x - startPosition.x}px, ${endPosition.y - startPosition.y}px)`,
        }}
      >
        ⭐
      </div>
      <style jsx>{`
        @keyframes fly-to-cart {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(${(endPosition.x - startPosition.x) * 0.5}px, ${(endPosition.y - startPosition.y) * 0.5}px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translate(${endPosition.x - startPosition.x}px, ${endPosition.y - startPosition.y}px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
