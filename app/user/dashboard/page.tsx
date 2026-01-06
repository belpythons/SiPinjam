"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NewBookingModal } from "@/components/user/new-booking-modal"
import { createBooking, getBookings } from "@/lib/data-manager"
import type { BookingFormData } from "@/lib/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Package,
  DoorOpen,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for charts
const bookingTrendData = [
  { month: "Jan", bookings: 12 },
  { month: "Feb", bookings: 19 },
  { month: "Mar", bookings: 15 },
  { month: "Apr", bookings: 25 },
  { month: "Mei", bookings: 22 },
  { month: "Jun", bookings: 30 },
]

export default function UserDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"room" | "equipment" | undefined>()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
  })
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("sipinjam_auth") || "{}")
    if (user.name) {
      setUserName(user.name)
    }

    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Selamat Pagi")
    else if (hour < 15) setGreeting("Selamat Siang")
    else if (hour < 18) setGreeting("Selamat Sore")
    else setGreeting("Selamat Malam")

    const bookings = getBookings()
    const userBookings = bookings.filter((b) => b.userId === user.id)

    setStats({
      totalBookings: userBookings.length,
      activeBookings: userBookings.filter((b) => b.status === "approved").length,
      completedBookings: userBookings.filter((b) => b.status === "completed").length,
      pendingBookings: userBookings.filter((b) => b.status === "pending").length,
    })
  }, [])

  const handleOpenBooking = (type?: "room" | "equipment", itemId?: string) => {
    if (type && itemId) {
      setSelectedType(type)
      setSelectedItemId(itemId)
    }
    setIsBookingModalOpen(true)
  }

  const handleBookingSubmit = (data: BookingFormData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("sipinjam_auth") || "{}")

      if (!currentUser.id) {
        toast.error("Silakan login terlebih dahulu")
        router.push("/login")
        return
      }

      createBooking({
        ...data,
        userId: currentUser.id,
        userName: currentUser.name,
      })

      toast.success("Peminjaman berhasil diajukan!")
      setIsBookingModalOpen(false)
      setSelectedType(undefined)
      setSelectedItemId(null)
      router.push("/user/bookings")
    } catch (error) {
      toast.error("Gagal mengajukan peminjaman")
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const currentDate = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Hero Greeting Banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {greeting}, {userName}!
                  </h1>
                </div>
                <p className="text-blue-100 text-base sm:text-lg">{currentDate}</p>
                <p className="text-white/90 max-w-2xl mt-2 sm:mt-4 text-sm sm:text-base">
                  Selamat datang di SIPINJAM. Kelola peminjaman ruangan dan barang dengan mudah dan efisien.
                </p>
              </div>
              <Button
                onClick={() => handleOpenBooking()}
                size="lg"
                className="w-full lg:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
              >
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Ajukan Peminjaman
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Bento Grid Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:gap-6 lg:grid-cols-4"
      >
        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Peminjaman</p>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sedang Dipinjam</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeBookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-100 group-hover:scale-110 transition-transform">
                <CalendarCheck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-3xl font-bold text-gray-600">{stats.completedBookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-100 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Chart Card - Spans 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 lg:row-span-2">
          <Card className="p-4 sm:p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Tren Peminjaman</h3>
                <p className="text-sm text-muted-foreground">6 bulan terakhir</p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={bookingTrendData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Quick Actions - Spans 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                onClick={() => router.push("/user/rooms")}
                variant="outline"
                size="lg"
                className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-500 hover:scale-105 transition-all"
              >
                <DoorOpen className="h-8 w-8 text-blue-600" />
                <span>Lihat Ruangan</span>
              </Button>
              <Button
                onClick={() => router.push("/user/equipment")}
                variant="outline"
                size="lg"
                className="h-24 flex-col gap-2 hover:bg-green-50 hover:border-green-500 hover:scale-105 transition-all"
              >
                <Package className="h-8 w-8 text-green-600" />
                <span>Lihat Barang</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
              <Button
                onClick={() => router.push("/user/bookings")}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {stats.pendingBookings > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Menunggu Persetujuan</p>
                    <p className="text-xs text-muted-foreground">{stats.pendingBookings} peminjaman</p>
                  </div>
                </div>
              )}
              {stats.activeBookings > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sedang Dipinjam</p>
                    <p className="text-xs text-muted-foreground">{stats.activeBookings} item aktif</p>
                  </div>
                </div>
              )}
              {stats.totalBookings === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada peminjaman</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <NewBookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        onSubmit={handleBookingSubmit}
        preselectedType={selectedType}
        preselectedItemId={selectedItemId}
      />
    </div>
  )
}
