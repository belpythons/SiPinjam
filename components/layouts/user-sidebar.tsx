"use client"

import { Home, Calendar, Package, DoorOpen, BookOpen, Menu, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getUserSession, clearUserSession } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useSidebarStore } from "@/lib/sidebar-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings } from "lucide-react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  { name: "Riwayat Peminjaman", href: "/user/bookings", icon: Calendar },
  { name: "Ruangan", href: "/user/rooms", icon: DoorOpen },
  { name: "Barang", href: "/user/equipment", icon: Package },
  { name: "Tata Tertib", href: "/user/rules", icon: BookOpen },
]

export function UserSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const { isCollapsed, toggleSidebar } = useSidebarStore()

  useEffect(() => {
    const user = getUserSession()
    if (user) {
      setUserName(user.name)
      setUserEmail(user.email)
    }
  }, [])

  const handleLogout = () => {
    clearUserSession()
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    })
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[var(--user-primary)] text-white p-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-[var(--user-primary-dark)] to-[var(--user-primary)] text-white transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="User navigation sidebar"
      >
        <div className="flex h-16 items-center justify-center border-b border-white/10 flex-shrink-0 px-4">
          {isCollapsed ? (
            <Image src="/sipinjam-logo.png" alt="SIPINJAM Logo" width={32} height={32} className="object-contain" />
          ) : (
            <div className="flex items-center gap-3">
              <Image src="/sipinjam-logo.png" alt="SIPINJAM Logo" width={40} height={40} className="object-contain" />
              <h1 className="text-2xl font-bold">SIPINJAM</h1>
            </div>
          )}
        </div>

        <div className="border-b border-white/10 p-4 flex-shrink-0">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-full flex items-center justify-center">
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/10 transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">{userName}</p>
                    <p className="text-xs text-white/70 truncate">{userEmail}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/user/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
          <TooltipProvider>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isCollapsed ? "justify-center" : "",
                    isActive
                      ? "bg-white/20 text-white shadow-lg scale-105"
                      : "text-white/80 hover:bg-white/10 hover:text-white hover:scale-105",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!isCollapsed && item.name}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </TooltipProvider>
        </nav>

        <div className="border-t border-white/10 flex-shrink-0">
          {/* Desktop collapse toggle */}
          <div className="hidden lg:block p-4 border-b border-white/10">
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              className="w-full justify-center text-white hover:bg-white/10 hover:text-white"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          <div className="p-4">
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-center text-white hover:bg-white/10 hover:text-white"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Keluar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Keluar
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
