"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { Room } from "@/lib/types"

const roomSchema = z.object({
  name: z.string().min(3, "Nama ruangan minimal 3 karakter"),
  capacity: z.coerce.number().min(1, "Kapasitas minimal 1 orang"),
  building: z.string().min(1, "Gedung harus diisi"),
  floor: z.coerce.number().min(1, "Lantai minimal 1").optional(),
  status: z.enum(["available", "booked", "in-use"]),
})

type RoomFormData = z.infer<typeof roomSchema>

interface RoomFormModalProps {
  open: boolean
  onClose: () => void
  room?: Room
  onSave: (room: Partial<Room>) => void
}

export function RoomFormModal({ open, onClose, room, onSave }: RoomFormModalProps) {
  const [facilities, setFacilities] = useState<string[]>(room?.facilities || [])
  const [facilityInput, setFacilityInput] = useState("")
  const [imagePreview, setImagePreview] = useState<string>(room?.imageUrl || "")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: room
      ? {
          name: room.name,
          capacity: room.capacity,
          building: room.building,
          floor: room.floor,
          status: room.status,
        }
      : {
          capacity: 1,
          floor: 1,
          status: "available",
        },
  })

  const status = watch("status")

  useEffect(() => {
    if (room) {
      setFacilities(room.facilities)
      setImagePreview(room.imageUrl)
    } else {
      setFacilities([])
      setImagePreview("")
    }
  }, [room, open])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addFacility = () => {
    if (facilityInput.trim() && !facilities.includes(facilityInput.trim())) {
      setFacilities([...facilities, facilityInput.trim()])
      setFacilityInput("")
    }
  }

  const removeFacility = (facility: string) => {
    setFacilities(facilities.filter((f) => f !== facility))
  }

  const onSubmit = (data: RoomFormData) => {
    if (facilities.length === 0) {
      toast.error("Tambahkan minimal 1 fasilitas")
      return
    }

    const roomData: Partial<Room> = {
      ...data,
      facilities,
      imageUrl: imagePreview,
    }

    if (room) {
      roomData.id = room.id
    }

    onSave(roomData)
    reset()
    setFacilities([])
    setImagePreview("")
    onClose()
  }

  const handleClose = () => {
    reset()
    setFacilities([])
    setImagePreview("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? "Edit Ruangan" : "Tambah Ruangan Baru"}</DialogTitle>
          <DialogDescription>
            {room ? "Perbarui informasi ruangan" : "Tambahkan ruangan baru ke sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Foto Ruangan</Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative h-24 w-24 overflow-hidden rounded-md">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="room-image" />
                <Label htmlFor="room-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    Upload Foto
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Ruangan *</Label>
            <Input id="name" {...register("name")} placeholder="Contoh: Ruang Kuliah 301" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Building & Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building">Gedung *</Label>
              <Input id="building" {...register("building")} placeholder="Contoh: Gedung A" />
              {errors.building && <p className="text-sm text-red-500">{errors.building.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Lantai</Label>
              <Input id="floor" type="number" {...register("floor")} placeholder="1" min="1" />
              {errors.floor && <p className="text-sm text-red-500">{errors.floor.message}</p>}
            </div>
          </div>

          {/* Capacity & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasitas *</Label>
              <Input id="capacity" type="number" {...register("capacity")} placeholder="50" min="1" />
              {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="booked">Booking</SelectItem>
                  <SelectItem value="in-use">Digunakan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Facilities */}
          <div className="space-y-2">
            <Label>Fasilitas *</Label>
            <div className="flex gap-2">
              <Input
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                placeholder="Tambah fasilitas"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addFacility()
                  }
                }}
              />
              <Button type="button" onClick={addFacility} variant="secondary">
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility) => (
                <Badge key={facility} variant="secondary" className="gap-1">
                  {facility}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeFacility(facility)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : room ? "Update Ruangan" : "Tambah Ruangan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
