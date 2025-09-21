"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  X,
  Home,
  Shield,
  Percent,
  FileText,
  Zap,
  MessageSquare,
  MapPin,
  Activity,
  FolderTree,
  MapPinIcon,
  UserCheck,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    description: "Overview & metrics",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Reports & insights",
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
    description: "Catalog management",
  },
  {
    name: "Categories",
    href: "/categories",
    icon: FolderTree,
    description: "Category management",
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    description: "Order management",
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
    description: "Customer database",
  },
  {
    name: "Users",
    href: "/users",
    icon: UserCheck,
    description: "User management",
  },
  {
    name: "Addresses",
    href: "/addresses",
    icon: MapPinIcon,
    description: "Address management",
  },
  {
    name: "Reviews",
    href: "/reviews",
    icon: MessageSquare,
    description: "Reviews & comments",
  },
  {
    name: "Discounts",
    href: "/discounts",
    icon: Percent,
    description: "Coupons & promotions",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
  },
]

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-lg",
        isCollapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border bg-gradient-to-r from-primary/5 to-secondary/5">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-sidebar-foreground">EcomAdmin</span>
              <p className="text-xs text-muted-foreground">Superadmin Portal</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                isActive
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-muted-foreground",
                )}
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.name}</span>
                  <span className={cn("text-xs truncate block", isActive ? "text-white/80" : "text-muted-foreground")}>
                    {item.description}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border bg-gradient-to-r from-muted/20 to-muted/10">
        <div
          className={cn(
            "flex items-center space-x-3 px-3 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20",
            isCollapsed && "justify-center",
          )}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Super Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@ecommerce.com</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 p-0 h-auto mt-1"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
