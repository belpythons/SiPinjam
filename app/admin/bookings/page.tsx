"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { BookingTabs } from "@/components/admin/booking-tabs"
import { BookingDetailModal } from "@/components/user/booking-detail-modal"
import { ApprovalModal } from "@/components/admin/approval-modal"
import { getBookings, saveBookings } from "@/lib/data-manager"
import type { Booking } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)

  useEffect(() => {
    const loadedBookings = getBookings()
    setBookings(loadedBookings)
  }, [])

  const handleSaveBookings = (updatedBookings: Booking[]) => {
    setBookings(updatedBookings)
    saveBookings(updatedBookings)
  }

  const handleApprove = (bookingId: string, notes?: string) => {
    const updatedBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: "approved" as const,
          approvedBy: "admin-1",
          approvedAt: new Date(),
          notes: notes || booking.notes,
        }
      }
      return booking
    })

    handleSaveBookings(updatedBookings)
    toast.success("Peminjaman disetujui", {
      description: "Notifikasi email telah dikirim ke peminjam",
    })
  }

  const handleReject = (bookingId: string, reason: string) => {
    const updatedBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: "rejected" as const,
          rejectionReason: reason,
        }
      }
      return booking
    })

    handleSaveBookings(updatedBookings)
    toast.error("Peminjaman ditolak", {
      description: "Notifikasi email telah dikirim ke peminjam",
    })
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailModalOpen(true)
  }

  const handleQuickReview = (booking: Booking) => {
    setSelectedBooking(booking)
    setApprovalModalOpen(true)
  }

  const pendingCount = bookings.filter((b) => b.status === "pending").length

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Peminjaman</h1>
        <p className="text-muted-foreground">Kelola persetujuan dan pantau status peminjaman ruangan dan barang</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold">
                  {bookings.filter((b) => b.status === "approved" || b.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <FileText className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Peminjaman</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <BookingTabs
          bookings={bookings}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewDetails={handleViewDetails}
        />
      </motion.div>

      <BookingDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} booking={selectedBooking} />

      <ApprovalModal
        open={approvalModalOpen}
        onOpenChange={setApprovalModalOpen}
        booking={selectedBooking}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
