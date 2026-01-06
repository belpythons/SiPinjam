"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Booking } from "@/lib/types"
import { Calendar, Clock, MapPin, Package, Eye, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { safeFormatDate } from "@/lib/utils"

interface BookingCardGridProps {
  bookings: Booking[]
  onViewDetail: (booking: Booking) => void
  onDownloadPDF: (booking: Booking) => void
}

const statusConfig = {
  pending: {
    label: "Menunggu",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
    iconColor: "text-yellow-600",
  },
  approved: {
    label: "Disetujui",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
    iconColor: "text-green-600",
  },
  rejected: {
    label: "Ditolak",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    iconColor: "text-red-600",
  },
  active: {
    label: "Aktif",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle2,
    iconColor: "text-blue-600",
  },
  completed: {
    label: "Selesai",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: CheckCircle2,
    iconColor: "text-gray-600",
  },
}

export function BookingCardGrid({ bookings, onViewDetail, onDownloadPDF }: BookingCardGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">Belum Ada Peminjaman</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Mulai ajukan peminjaman ruangan atau barang</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
    >
      {bookings.map((booking) => {
        const status = statusConfig[booking.status]
        const StatusIcon = status.icon

        return (
          <motion.div key={booking.id} variants={cardVariants}>
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden border-2">
              {/* Header with gradient based on type */}
              <div
                className={`p-4 sm:p-5 ${
                  booking.type === "room"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                    : "bg-gradient-to-r from-green-500 to-green-600"
                } text-white`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {booking.type === "room" ? (
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    <span className="text-xs sm:text-sm font-medium opacity-90">
                      {booking.type === "room" ? "Ruangan" : "Barang"}
                    </span>
                  </div>
                  <Badge className={`${status.color} border text-xs`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <h3 className="mt-2 text-lg sm:text-xl font-bold line-clamp-1">{booking.itemName}</h3>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground text-xs">Tanggal</p>
                      <p className="font-medium truncate">{safeFormatDate(booking.startDate, "dd MMM yyyy")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground text-xs">Durasi</p>
                      <p className="font-medium truncate">
                        {safeFormatDate(booking.startDate, "HH:mm")} - {safeFormatDate(booking.endDate, "HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground line-clamp-2">{booking.purpose}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => onViewDetail(booking)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Detail
                  </Button>
                  <Button
                    onClick={() => onDownloadPDF(booking)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs sm:text-sm"
                    disabled={booking.status !== "approved"}
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
