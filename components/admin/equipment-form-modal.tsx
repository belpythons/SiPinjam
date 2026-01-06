"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { Equipment } from "@/lib/types"

const equipmentSchema = z.object({
  name: z.string().min(3, "Nama barang minimal 3 karakter"),
  category: z.string().min(1, "Kategori harus diisi"),
  quantity: z.coerce.number().min(1, "Jumlah minimal 1"),
  available: z.coerce.number().min(0, "Ketersediaan tidak boleh negatif"),
  status: z.enum(["available", "booked", "maintenance"]),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
})

type EquipmentFormData = z.infer<typeof equipmentSchema>

interface EquipmentFormModalProps {
  open: boolean
  onClose: () => void
  equipment?: Equipment
  onSave: (equipment: Partial<Equipment>) => void
}

export function EquipmentFormModal({ open, onClose, equipment, onSave }: EquipmentFormModalProps) {
  const [imagePreview, setImagePreview] = useState<string>(equipment?.imageUrl || "")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: equipment
      ? {
          name: equipment.name,
          category: equipment.category,
          quantity: equipment.quantity,
          available: equipment.available,
          status: equipment.status,
          description: equipment.description,
        }
      : {
          name: "",
          category: "",
          quantity: 1,
          available: 1,
          status: "available",
          description: "",
        },
  })

  const status = watch("status")
  const quantity = watch("quantity")
  const available = watch("available")

  useEffect(() => {
    if (open) {
      if (equipment) {
        reset({
          name: equipment.name,
          category: equipment.category,
          quantity: equipment.quantity,
          available: equipment.available,
          status: equipment.status,
          description: equipment.description,
        })
        setImagePreview(equipment.imageUrl)
      } else {
        reset({
          name: "",
          category: "",
          quantity: 1,
          available: 1,
          status: "available",
          description: "",
        })
        setImagePreview("")
      }
    }
  }, [open, equipment, reset])

  useEffect(() => {
    if (available > quantity) {
      setValue("available", quantity)
      toast.error("Ketersediaan tidak boleh lebih dari jumlah total")
    }
  }, [quantity, available, setValue])

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

  const onSubmit = (data: EquipmentFormData) => {
    const equipmentData: Partial<Equipment> = {
      ...data,
      imageUrl: imagePreview,
    }

    if (equipment) {
      equipmentData.id = equipment.id
    }

    onSave(equipmentData)
    reset()
    setImagePreview("")
    onClose()
  }

  const handleClose = () => {
    reset()
    setImagePreview("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipment ? "Edit Barang" : "Tambah Barang Baru"}</DialogTitle>
          <DialogDescription>
            {equipment ? "Perbarui informasi barang" : "Tambahkan barang baru ke sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Foto Barang</Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative h-24 w-24 overflow-hidden rounded-md">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="equipment-image"
                />
                <Label htmlFor="equipment-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    Upload Foto
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Equipment Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Barang *</Label>
            <Input id="name" {...register("name")} placeholder="Contoh: Proyektor HD" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <Input id="category" {...register("category")} placeholder="Contoh: Elektronik, Audio, Video" />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          {/* Quantity & Available */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah Total *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="10"
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="available">Tersedia *</Label>
              <Input
                id="available"
                type="number"
                min="0"
                {...register("available", { valueAsNumber: true })}
                placeholder="7"
              />
              {errors.available && <p className="text-sm text-red-500">{errors.available.message}</p>}
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
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea id="description" {...register("description")} placeholder="Deskripsi barang..." rows={3} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : equipment ? "Update Barang" : "Tambah Barang"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
