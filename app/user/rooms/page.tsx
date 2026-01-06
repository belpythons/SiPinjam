"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridListToggle } from "@/components/ui/grid-list-toggle"
import { RoomCard } from "@/components/user/room-card"
import { NewBookingModal } from "@/components/user/new-booking-modal"
import { getRooms, getBookings, saveBookings, initializeLocalStorage } from "@/lib/data-manager"
import type { BookingFormData, Room } from "@/lib/types"
import { toast } from "sonner"

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [buildingFilter, setBuildingFilter] = useState<string>("all")
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  useEffect(() => {
    initializeLocalStorage()
    loadRooms()
  }, [bookingModalOpen])

  const loadRooms = () => {
    const loadedRooms = getRooms()
    setRooms(loadedRooms)
  }

  const buildings = Array.from(new Set(rooms.map((r) => r.building)))

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    const matchesBuilding = buildingFilter === "all" || room.building === buildingFilter
    return matchesSearch && matchesStatus && matchesBuilding
  })

  const handleBook = (roomId: string) => {
    setSelectedRoomId(roomId)
    setBookingModalOpen(true)
  }

  const handleBookingSubmit = (data: BookingFormData) => {
    const authData = localStorage.getItem("sipinjam_auth")
    if (!authData) {
      toast.error("Sesi tidak valid, silakan login kembali")
      return
    }

    const user = JSON.parse(authData)
    const existingBookings = getBookings()

    const newBooking = {
      id: `booking-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: "room" as const,
      itemId: selectedRoomId!,
      itemName: rooms.find((r) => r.id === selectedRoomId)?.name || "",
      startDate: data.startDate,
      endDate: data.endDate,
      purpose: data.purpose,
      notes: data.notes,
      status: "pending" as const,
      createdAt: new Date(),
    }

    existingBookings.push(newBooking)
    saveBookings(existingBookings)

    toast.success("Peminjaman berhasil diajukan!", {
      description: "Admin akan meninjau permintaan Anda dalam 2x24 jam",
    })
    setBookingModalOpen(false)
    setSelectedRoomId(null)
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daftar Ruangan</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Pilih ruangan yang ingin Anda pinjam</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari ruangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="available">Tersedia</SelectItem>
              <SelectItem value="booked">Booking</SelectItem>
              <SelectItem value="in-use">Digunakan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Gedung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Gedung</SelectItem>
              {buildings.map((building) => (
                <SelectItem key={building} value={building}>
                  {building}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <GridListToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground px-1">
        Menampilkan {filteredRooms.length} dari {rooms.length} ruangan
      </div>

      {/* Rooms Grid/List */}
      {filteredRooms.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-base sm:text-lg font-semibold">Tidak ada ruangan ditemukan</p>
            <p className="text-sm text-muted-foreground">Coba ubah filter pencarian Anda</p>
          </div>
        </div>
      ) : (
        <div
          className={view === "grid" ? "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}
        >
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} view={view} onBook={handleBook} />
          ))}
        </div>
      )}

      <NewBookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        onSubmit={handleBookingSubmit}
        preselectedType="room"
        preselectedItemId={selectedRoomId}
      />
    </div>
  )
}
