"use client"

import { Bell, Search, User, Sun, Globe, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function DashboardHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card/50 backdrop-blur-sm border-b border-border/50 shadow-sm">
      {/* Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products, orders, customers..."
            className="pl-10 bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 h-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Quick Actions */}
        <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2 hover:bg-muted/50">
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm">Help</span>
        </Button>

        <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2 hover:bg-muted/50">
          <Globe className="w-4 h-4" />
          <span className="text-sm">EN</span>
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="sm" className="hover:bg-muted/50">
          <Sun className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative hover:bg-muted/50">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-primary to-secondary border-0">
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-muted/50 px-3 py-2 h-10">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 shadow-xl border-border/50">
            <DropdownMenuLabel className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'admin@luxurybeauty.com'}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2">
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive py-2 focus:text-destructive focus:bg-destructive/10"
              onClick={handleLogout}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
