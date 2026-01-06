"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/layouts/admin-sidebar"
import { UserAvatarDropdown } from "@/components/layouts/user-avatar-dropdown"
import { Footer } from "@/components/layouts/footer"
import { ThemeProvider } from "@/components/providers/theme-provider"
import type { User } from "@/lib/types"
import { useSidebarStore } from "@/lib/sidebar-store"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isCollapsed } = useSidebarStore()

  useEffect(() => {
    const authData = localStorage.getItem("sipinjam_auth")
    if (!authData) {
      router.push("/login")
      return
    }

    try {
      const parsed = JSON.parse(authData)
      if (parsed.role !== "admin") {
        router.push("/login")
        return
      }
      setUser(parsed)
    } catch (error) {
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--admin-primary)] border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat portal admin...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />

        <div className={`flex flex-1 flex-col transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
            <div className="ml-12 lg:ml-0">
              <h2 className="text-xl font-semibold">Admin Portal</h2>
            </div>
            <UserAvatarDropdown user={user} />
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>

          <Footer />
        </div>
      </div>
    </ThemeProvider>
  )
}
