"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBookings, getUsers, getRooms, getEquipment } from "@/lib/data-manager"
import { useRouter } from "next/navigation"
import { Users, Calendar, Package, DoorOpen, TrendingUp, ArrowRight, Clock, CheckCircle2, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const bookingTrendData = [
  { month: "Jan", bookings: 45 },
  { month: "Feb", bookings: 52 },
  { month: "Mar", bookings: 48 },
  { month: "Apr", bookings: 61 },
  { month: "Mei", bookings: 55 },
  { month: "Jun", bookings: 67 },
]

const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"]

export default function AdminDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    totalRooms: 0,
    totalEquipment: 0,
    availableRooms: 0,
    availableEquipment: 0,
  })
  const [greeting, setGreeting] = useState("")
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([])

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
    const users = getUsers()
    const rooms = getRooms()
    const equipment = getEquipment()

    const pending = bookings.filter((b) => b.status === "pending").length
    const approved = bookings.filter((b) => b.status === "approved").length
    const rejected = bookings.filter((b) => b.status === "rejected").length

    setStats({
      totalUsers: users.length,
      totalBookings: bookings.length,
      pendingBookings: pending,
      approvedBookings: approved,
      rejectedBookings: rejected,
      totalRooms: rooms.length,
      totalEquipment: equipment.length,
      availableRooms: rooms.filter((r) => r.status === "available").length,
      availableEquipment: equipment.filter((e) => e.status === "available").length,
    })

    setStatusData([
      { name: "Pending", value: pending },
      { name: "Disetujui", value: approved },
      { name: "Ditolak", value: rejected },
      { name: "Selesai", value: bookings.filter((b) => b.status === "completed").length },
    ])
  }, [])

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
      {/* Hero Admin Greeting */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {greeting}, Admin {userName}!
                  </h1>
                </div>
                <p className="text-orange-100 text-base sm:text-lg">{currentDate}</p>
                <p className="text-white/90 max-w-2xl mt-2 sm:mt-4 text-sm sm:text-base">
                  Kelola sistem peminjaman dengan efisien. {stats.pendingBookings} peminjaman menunggu persetujuan Anda.
                </p>
              </div>
              <Button
                onClick={() => router.push("/admin/bookings")}
                size="lg"
                className="w-full lg:w-auto bg-white text-orange-600 hover:bg-orange-50"
              >
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Kelola Peminjaman
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
          <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total User</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Peminjaman</p>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-100 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedBookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Chart Card - Booking Trends */}
        <motion.div variants={itemVariants} className="lg:col-span-3 lg:row-span-2">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Tren Peminjaman</h3>
                <p className="text-sm text-muted-foreground">6 bulan terakhir</p>
              </div>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={bookingTrendData}>
                <defs>
                  <linearGradient id="colorBookingsAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBookingsAdmin)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={itemVariants} className="lg:row-span-2">
          <Card className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">Status Peminjaman</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                onClick={() => router.push("/admin/users")}
                variant="outline"
                size="lg"
                className="h-24 flex-col gap-2 hover:bg-orange-50 hover:border-orange-500 hover:scale-105 transition-all"
              >
                <Users className="h-8 w-8 text-orange-600" />
                <span>Kelola User</span>
              </Button>
              <Button
                onClick={() => router.push("/admin/rooms")}
                variant="outline"
                size="lg"
                className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-500 hover:scale-105 transition-all"
              >
                <DoorOpen className="h-8 w-8 text-blue-600" />
                <span>Kelola Ruangan</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Resources Overview */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sumber Daya</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <DoorOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Ruangan</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.availableRooms} / {stats.totalRooms} tersedia
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Barang</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.availableEquipment} / {stats.totalEquipment} tersedia
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
