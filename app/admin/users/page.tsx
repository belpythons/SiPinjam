"use client"

import { useState, useEffect } from "react"
import type { User, UserDeactivation } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"
import { UserTable } from "@/components/admin/user-table"
import { UserFormModal } from "@/components/admin/user-form-modal"
import { DeactivateUserModal } from "@/components/admin/deactivate-user-modal"
import { toast } from "sonner"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    // Load users from localStorage or use mock data
    const savedUsers = localStorage.getItem("sipinjam_users")
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers)
      // Convert date strings back to Date objects
      const usersWithDates = parsed.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
      }))
      setUsers(usersWithDates)
    } else {
      setUsers(mockUsers)
      localStorage.setItem("sipinjam_users", JSON.stringify(mockUsers))
    }
  }, [])

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers)
    localStorage.setItem("sipinjam_users", JSON.stringify(updatedUsers))
  }

  const handleAddNew = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleSave = (data: Partial<User>) => {
    if (selectedUser) {
      // Edit existing user
      const updatedUsers = users.map((u) => (u.id === selectedUser.id ? { ...u, ...data } : u))
      saveUsers(updatedUsers)
    } else {
      // Add new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name!,
        email: data.email!,
        role: data.role!,
        isActive: true,
        createdAt: new Date(),
      }
      saveUsers([...users, newUser])
    }
  }

  const handleDeactivate = (user: User) => {
    setSelectedUser(user)
    setIsDeactivateOpen(true)
  }

  const handleDeactivateConfirm = (reason: string, duration?: number) => {
    if (!selectedUser) return

    // Save deactivation info
    const deactivation: UserDeactivation = {
      userId: selectedUser.id,
      reason,
      deactivatedBy: "admin-1",
      deactivatedAt: new Date(),
      duration,
      reactivateAt: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : undefined,
    }

    const deactivations = JSON.parse(localStorage.getItem("sipinjam_deactivations") || "[]")
    deactivations.push(deactivation)
    localStorage.setItem("sipinjam_deactivations", JSON.stringify(deactivations))

    // Update user status
    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? { ...u, isActive: false } : u))
    saveUsers(updatedUsers)
  }

  const handleActivate = (user: User) => {
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, isActive: true } : u))
    saveUsers(updatedUsers)
    toast.success("User berhasil diaktifkan")
  }

  const handleDelete = (user: User) => {
    // Not implemented - typically would show confirmation dialog
    toast.info("Fitur hapus user belum diimplementasikan")
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kelola User</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manajemen user dan hak akses sistem</p>
        </div>
        <Button onClick={handleAddNew} size="lg" className="w-full sm:w-auto px-6 bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-medium">Total User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-medium">Nonaktif</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      <UserTable
        users={users}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onActivate={handleActivate}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />

      <UserFormModal open={isFormOpen} onClose={() => setIsFormOpen(false)} user={selectedUser} onSave={handleSave} />

      <DeactivateUserModal
        open={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        user={selectedUser}
        onConfirm={handleDeactivateConfirm}
      />
    </div>
  )
}
