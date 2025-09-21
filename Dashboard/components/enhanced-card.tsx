"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface EnhancedCardProps {
  title: string
  description?: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  icon?: LucideIcon
  className?: string
  children?: React.ReactNode
}

export function EnhancedCard({
  title,
  description,
  value,
  change,
  icon: Icon,
  className,
  children,
}: EnhancedCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card to-card/80",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        {change && (
          <div
            className={cn(
              "flex items-center text-xs font-medium",
              change.trend === "up" && "text-green-600",
              change.trend === "down" && "text-red-600",
              change.trend === "neutral" && "text-muted-foreground",
            )}
          >
            {change.value}
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {children}
      </CardContent>
    </Card>
  )
}
