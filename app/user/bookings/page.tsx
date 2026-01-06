"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Calendar, Clock, TrendingUp, Grid3x3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingCardGrid } from "@/components/user/booking-card-grid"
import { BookingTable } from "@/components/user/booking-table"
import { NewBookingModal } from "@/components/user/new-booking-modal"
import { BookingDetailModal } from "@/components/user/booking-detail-modal"
import { generateBookingPDF } from "@/lib/pdf-generator"
import { getRooms, getEquipment, getBookings, saveBookings } from "@/lib/data-manager"
import { toast } from "sonner"
import type { Booking, BookingFormData } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  useEffect(() => {
    const loadedBookings = getBookings()
    setBookings(loadedBookings)
  }, [])

  const handleSaveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings)
    saveBookings(newBookings)
  }

  const handleNewBooking = (data: BookingFormData) => {
    const authData = localStorage.getItem("sipinjam_auth")
    if (!authData) {
      toast.error("Sesi tidak valid, silakan login kembali")
      return
    }

    const user = JSON.parse(authData)
    const items = data.type === "room" ? getRooms() : getEquipment()
    const item = items.find((i) => i.id === data.itemId)

    if (!item) {
      toast.error("Item tidak ditemukan")
      return
    }

    const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate)
    const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error("Tanggal tidak valid")
      return
    }

    if (endDate <= startDate) {
      toast.error("Tanggal selesai harus setelah tanggal mulai")
      return
    }

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: data.type,
      itemId: data.itemId,
      itemName: item.name,
      startDate: startDate,
      endDate: endDate,
      purpose: data.purpose,
      notes: data.notes,
      status: "pending",
      createdAt: new Date(),
    }

    handleSaveBookings([newBooking, ...bookings])
    setIsNewBookingOpen(false)
    toast.success("Peminjaman berhasil diajukan!", {
      description: "Menunggu persetujuan dari admin",
    })
  }

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const handleDownloadPDF = (booking: Booking) => {
    const items = booking.type === "room" ? getRooms() : getEquipment()
    const item = items.find((i) => i.id === booking.itemId)

    if (item) {
      generateBookingPDF({ booking, item })
      toast.success("PDF berhasil diunduh!")
    } else {
      toast.error("Item tidak ditemukan")
    }
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved" || b.status === "active").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Riwayat Peminjaman</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola dan lihat riwayat peminjaman Anda</p>
        </div>
        <Button
          onClick={() => setIsNewBookingOpen(true)}
          size="lg"
          className="w-full sm:w-auto px-6 shadow-lg hover:shadow-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Peminjaman Baru
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4"
      >
        <Card className="hover:shadow-lg transition-shadow border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Peminjaman</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Disetujui</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Selesai</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="border-2">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg sm:text-xl">Daftar Peminjaman</CardTitle>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "table")}>
                <TabsList>
                  <TabsTrigger value="grid" className="gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-2">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Tabel</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "grid" ? (
              <BookingCardGrid bookings={bookings} onViewDetail={handleViewDetail} onDownloadPDF={handleDownloadPDF} />
            ) : (
              <BookingTable bookings={bookings} onViewDetail={handleViewDetail} onDownloadPDF={handleDownloadPDF} />
            )}
          </CardContent>
        </Card>
      </motion.div>

      <NewBookingModal open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen} onSubmit={handleNewBooking} />

      <BookingDetailModal open={isDetailOpen} onOpenChange={setIsDetailOpen} booking={selectedBooking} />
    </div>
  )
}
