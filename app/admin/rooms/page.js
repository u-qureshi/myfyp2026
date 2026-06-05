'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Menu, X, LogOut, Plus, Pencil, Trash2, Search, Loader2, Filter } from 'lucide-react'
import { SidebarBrandMark, PortalHeaderBrand } from '@/components/BrandLogo'
import { toast, Toaster } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function RoomManagement() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState('Administrator')
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [buildings, setBuildings] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    type: 'classroom',
    capacity: '',
    availability_status: 'available'
  })
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    buildings: 0,
    capacity: 0
  })
  const [submitting, setSubmitting] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check-session')
        const data = await res.json()

        if (!res.ok || data.user?.role !== 'admin') {
          router.push('/login')
          return
        }

        setAdminName(data.user?.name || 'Administrator')
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Fetch rooms
  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/rooms')
      const data = await res.json()

      if (res.ok) {
        setRooms(data.rooms || [])

        // Extract unique buildings
        const uniqueBuildings = [...new Set((data.rooms || []).map(r => r.building))].sort()
        setBuildings(uniqueBuildings)

        // Calculate stats
        const availableCount = (data.rooms || []).filter(r => r.availability_status === 'available').length
        const totalCapacity = (data.rooms || []).reduce((sum, r) => sum + (r.capacity || 0), 0)

        setStats({
          total: data.rooms?.length || 0,
          available: availableCount,
          buildings: uniqueBuildings.length,
          capacity: totalCapacity
        })
      } else {
        toast.error('Failed to fetch rooms')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const handleAddRoom = async () => {
    if (!formData.name.trim() || !formData.building.trim() || !formData.capacity) {
      toast.error('Please fill all required fields')
      return
    }

    const capacity = parseInt(formData.capacity)
    if (isNaN(capacity) || capacity < 1) {
      toast.error('Capacity must be a positive number')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          building: formData.building.trim(),
          type: formData.type,
          capacity: capacity,
          availability_status: formData.availability_status
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Room added successfully')
        setFormData({
          name: '',
          building: '',
          type: 'classroom',
          capacity: '',
          availability_status: 'available'
        })
        setShowAddModal(false)
        await fetchRooms()
      } else {
        toast.error(data.error || 'Failed to add room')
      }
    } catch (error) {
      console.error('Add error:', error)
      toast.error('Failed to add room')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditRoom = async () => {
    if (!formData.name.trim() || !formData.building.trim() || !formData.capacity) {
      toast.error('Please fill all required fields')
      return
    }

    const capacity = parseInt(formData.capacity)
    if (isNaN(capacity) || capacity < 1) {
      toast.error('Capacity must be a positive number')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRoom.id,
          name: formData.name.trim(),
          building: formData.building.trim(),
          type: formData.type,
          capacity: capacity,
          availability_status: formData.availability_status
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Room updated successfully')
        setFormData({
          name: '',
          building: '',
          type: 'classroom',
          capacity: '',
          availability_status: 'available'
        })
        setShowEditModal(false)
        setEditingRoom(null)
        await fetchRooms()
      } else {
        toast.error(data.error || 'Failed to update room')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Failed to update room')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      building: room.building,
      type: room.type,
      capacity: room.capacity.toString(),
      availability_status: room.availability_status
    })
    setShowEditModal(true)
  }

  const handleDeleteRoom = (room) => {
    if (confirm(`Are you sure you want to delete "${room.name}"? This action cannot be undone.`)) {
      deleteRoom(room.id)
    }
  }

  const deleteRoom = async (id) => {
    try {
      const res = await fetch(`/api/admin/rooms?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Room deleted successfully')
        await fetchRooms()
      } else {
        toast.error(data.error || 'Failed to delete room')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete room')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const openAddModal = () => {
    setFormData({
      name: '',
      building: '',
      type: 'classroom',
      capacity: '',
      availability_status: 'available'
    })
    setEditingRoom(null)
    setShowAddModal(true)
  }

  // Filter rooms
  let filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (buildingFilter !== 'all') {
    filteredRooms = filteredRooms.filter(room => room.building === buildingFilter)
  }

  const getRoomTypeBadge = (type) => {
    const typeMap = {
      'classroom': 'Classroom',
      'lab': 'Computer Lab',
      'seminar_hall': 'Seminar Hall',
      'lecture_hall': 'Lecture Hall'
    }
    return typeMap[type] || type
  }

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Available</span>
      case 'occupied':
        return <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Occupied</span>
      case 'maintenance':
        return <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">Maintenance</span>
      default:
        return <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">Unknown</span>
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'classroom':
        return 'bg-blue-100 text-blue-800'
      case 'lab':
        return 'bg-purple-100 text-purple-800'
      case 'seminar_hall':
        return 'bg-green-100 text-green-800'
      case 'lecture_hall':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Toaster />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-purple-600 to-purple-700 text-white p-4 z-50 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        <div className="relative mb-8 flex justify-center pt-1">
          <SidebarBrandMark size={72} priority />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-0 top-0 lg:hidden text-white hover:bg-purple-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/departments')}
          >
            Departments
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/faculty')}
          >
            Faculty
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={() => setSidebarOpen(false)}
          >
            Rooms
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/subjects')}
          >
            Subjects
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/sections')}
          >
            Sections
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/constraints')}
          >
            Constraints
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/generate-timetable')}
          >
            Generate Timetable
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/reports')}
          >
            Reports
          </Button>
        </nav>

        <div className="mt-8 border-t border-purple-400 pt-4">
          <div className="mb-2 text-xs text-purple-100 uppercase font-semibold tracking-wide">Account</div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-purple-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <PortalHeaderBrand
                title="Room & Building Management"
                titleClassName="text-2xl font-bold text-purple-900"
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{adminName}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 lg:hidden"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.available}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Buildings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.buildings}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">{stats.capacity}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Room & Building Management</CardTitle>
                <CardDescription>Manage all rooms in your institution</CardDescription>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={openAddModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search rooms by name or building..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Buildings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {buildings.map((building) => (
                      <SelectItem key={building} value={building}>
                        {building}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Loading rooms...</span>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {rooms.length === 0
                      ? 'No rooms yet. Create one to get started.'
                      : 'No rooms match your search.'}
                  </p>
                </div>
              ) : (
                /* Rooms Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-4">
                        {/* Room Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                            <p className="text-sm text-gray-600">{room.building}</p>
                          </div>
                        </div>

                        {/* Type and Availability Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeColor(room.type)}`}>
                            {getRoomTypeBadge(room.type)}
                          </span>
                          {getAvailabilityBadge(room.availability_status)}
                        </div>

                        {/* Capacity */}
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Capacity</p>
                          <p className="text-xl font-bold text-purple-600">{room.capacity} seats</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(room)}
                            className="flex-1 border-blue-200 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4 text-blue-600 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRoom(room)}
                            className="flex-1 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Room Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Room</DialogTitle>
            <DialogDescription>
              Create a new room. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="e.g., Room 101"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="room-building">Building</Label>
              <Input
                id="room-building"
                placeholder="e.g., Main Block"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="room-type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classroom">Classroom</SelectItem>
                  <SelectItem value="lab">Computer Lab</SelectItem>
                  <SelectItem value="seminar_hall">Seminar Hall</SelectItem>
                  <SelectItem value="lecture_hall">Lecture Hall</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="room-capacity">Capacity (seats)</Label>
              <Input
                id="room-capacity"
                type="number"
                min="1"
                placeholder="e.g., 30"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="room-status">Availability Status</Label>
              <Select value={formData.availability_status} onValueChange={(value) => setFormData({ ...formData, availability_status: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleAddRoom}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Room'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-room-name">Room Name</Label>
              <Input
                id="edit-room-name"
                placeholder="e.g., Room 101"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-room-building">Building</Label>
              <Input
                id="edit-room-building"
                placeholder="e.g., Main Block"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-room-type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classroom">Classroom</SelectItem>
                  <SelectItem value="lab">Computer Lab</SelectItem>
                  <SelectItem value="seminar_hall">Seminar Hall</SelectItem>
                  <SelectItem value="lecture_hall">Lecture Hall</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-room-capacity">Capacity (seats)</Label>
              <Input
                id="edit-room-capacity"
                type="number"
                min="1"
                placeholder="e.g., 30"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-room-status">Availability Status</Label>
              <Select value={formData.availability_status} onValueChange={(value) => setFormData({ ...formData, availability_status: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleEditRoom}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Room'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
