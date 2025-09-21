"use client"
import { useRouter } from "next/navigation"
import { User, LogOut, Settings, ShoppingBag, Heart } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

export function AccountDropdown() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated || !user) {
    return (
      <div
        onClick={() => router.push("/login")}
        className="header-item text-sm text-center text-gray-700 hover:text-black transition-colors cursor-pointer group"
      >
        <User className="w-6 h-6 mx-auto mb-1 group-hover:scale-110 transition-transform duration-200 stroke-1" />
        <p className="font-light hidden sm:block tracking-wide relative">
          Account
          <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
        </p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="header-item text-sm text-center text-gray-700 hover:text-black transition-colors cursor-pointer group">
          {user.avatar ? (
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              className="w-6 h-6 mx-auto mb-1 rounded-full group-hover:scale-110 transition-transform duration-200"
            />
          ) : (
            <User className="w-6 h-6 mx-auto mb-1 group-hover:scale-110 transition-transform duration-200 stroke-1" />
          )}
          <p className="font-light hidden sm:block tracking-wide relative">
            {user.name.split(" ")[0]}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 z-[60] bg-white border border-gray-200 shadow-xl" 
        align="end" 
        forceMount
        sideOffset={5}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/account")} className="hover:bg-gray-50 cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/orders")} className="hover:bg-gray-50 cursor-pointer">
          <ShoppingBag className="mr-2 h-4 w-4" />
          <span>Orders</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/wishlist")} className="hover:bg-gray-50 cursor-pointer">
          <Heart className="mr-2 h-4 w-4" />
          <span>Wishlist</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")} className="hover:bg-gray-50 cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-50 cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}