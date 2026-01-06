"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Package, DoorOpen } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getRooms, getEquipment } from "@/lib/data-manager"
import type { BookingFormData, Room, Equipment } from "@/lib/types"
import { cn } from "@/lib/utils"

const step1Schema = z.object({
  type: z.enum(["room", "equipment"]),
  itemId: z.string().min(1, "Pilih ruangan atau barang"),
})

const step2Schema = z.object({
  startDate: z.date({
    required_error: "Tanggal mulai wajib diisi",
  }),
  startTime: z.string().min(1, "Waktu mulai wajib diisi"),
  endDate: z.date({
    required_error: "Tanggal selesai wajib diisi",
  }),
  endTime: z.string().min(1, "Waktu selesai wajib diisi"),
})

const step3Schema = z.object({
  purpose: z.string().min(10, "Tujuan minimal 10 karakter"),
  notes: z.string().optional(),
})

const bookingSchema = z.object({
  type: z.enum(["room", "equipment"]),
  itemId: z.string().min(1, "Pilih ruangan atau barang"),
  startDate: z.date({
    required_error: "Tanggal mulai wajib diisi",
  }),
  startTime: z.string().min(1, "Waktu mulai wajib diisi"),
  endDate: z.date({
    required_error: "Tanggal selesai wajib diisi",
  }),
  endTime: z.string().min(1, "Waktu selesai wajib diisi"),
  purpose: z.string().min(10, "Tujuan minimal 10 karakter"),
  notes: z.string().optional(),
})

interface NewBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BookingFormData) => void
  preselectedType?: "room" | "equipment"
  preselectedItemId?: string | null
}

export function NewBookingModal({
  open,
  onOpenChange,
  onSubmit,
  preselectedType,
  preselectedItemId,
}: NewBookingModalProps) {
  const [step, setStep] = useState(1)
  const [rooms, setRooms] = useState<Room[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    mode: "onSubmit",
    defaultValues: {
      type: preselectedType || "room",
      itemId: preselectedItemId || "",
      purpose: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      const loadedRooms = getRooms()
      const loadedEquipment = getEquipment()
      setRooms(loadedRooms)
      setEquipment(loadedEquipment)

      if (preselectedType) {
        form.setValue("type", preselectedType)
      }
      if (preselectedItemId) {
        form.setValue("itemId", preselectedItemId)
      }
    }
  }, [open, preselectedType, preselectedItemId, form])

  const watchType = form.watch("type")
  const watchItemId = form.watch("itemId")

  const items = watchType === "room" ? rooms : equipment
  const selectedItem = items.find((item) => item.id === watchItemId)

  const handleSubmit = (values: z.infer<typeof bookingSchema>) => {
    const startDateTime = new Date(values.startDate)
    const [startHour, startMinute] = values.startTime.split(":").map(Number)
    startDateTime.setHours(startHour, startMinute)

    const endDateTime = new Date(values.endDate)
    const [endHour, endMinute] = values.endTime.split(":").map(Number)
    endDateTime.setHours(endHour, endMinute)

    const selectedItem = items.find((item) => item.id === values.itemId)

    onSubmit({
      type: values.type,
      itemId: values.itemId,
      startDate: startDateTime,
      endDate: endDateTime,
      purpose: values.purpose,
      notes: values.notes,
    })

    form.reset()
    setStep(1)
  }

  const nextStep = async () => {
    const values = form.getValues()
    let isValid = false

    try {
      if (step === 1) {
        step1Schema.parse({ type: values.type, itemId: values.itemId })
        isValid = true
      } else if (step === 2) {
        step2Schema.parse({
          startDate: values.startDate,
          startTime: values.startTime,
          endDate: values.endDate,
          endTime: values.endTime,
        })
        isValid = true
      }

      if (isValid) {
        setStep(step + 1)
      }
    } catch (error) {
      // Trigger validation to show error messages
      if (step === 1) {
        await form.trigger(["type", "itemId"])
      } else if (step === 2) {
        await form.trigger(["startDate", "startTime", "endDate", "endTime"])
      }
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajukan Peminjaman Baru</DialogTitle>
          <DialogDescription>Lengkapi form berikut untuk mengajukan peminjaman</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {s}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step 1: Pilih Item */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Peminjaman</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="room">
                            <div className="flex items-center gap-2">
                              <DoorOpen className="h-4 w-4" />
                              Ruangan
                            </div>
                          </SelectItem>
                          <SelectItem value="equipment">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Barang
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih {watchType === "room" ? "Ruangan" : "Barang"}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                              {"capacity" in item && ` (${item.capacity} orang)`}
                              {"available" in item && ` (${item.available}/${item.quantity} tersedia)`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedItem && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold">Detail Item</h4>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {"capacity" in selectedItem && <p>Kapasitas: {selectedItem.capacity} orang</p>}
                      {"building" in selectedItem && (
                        <p>
                          Lokasi: {selectedItem.building}, Lantai {selectedItem.floor}
                        </p>
                      )}
                      {"category" in selectedItem && <p>Kategori: {selectedItem.category}</p>}
                      {"available" in selectedItem && (
                        <p>
                          Tersedia: {selectedItem.available}/{selectedItem.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Waktu */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Mulai</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? (
                                  format(field.value, "dd MMM yyyy", {
                                    locale: localeId,
                                  })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date > new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waktu Mulai</FormLabel>
                        <Input
                          type="time"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Selesai</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? (
                                  format(field.value, "dd MMM yyyy", {
                                    locale: localeId,
                                  })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date > new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waktu Selesai</FormLabel>
                        <Input
                          type="time"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Detail */}
            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tujuan Peminjaman</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Jelaskan tujuan peminjaman..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tambahkan catatan jika diperlukan..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Sebelumnya
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="ml-auto">
                  Selanjutnya
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="ml-auto">
                  Ajukan Peminjaman
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
