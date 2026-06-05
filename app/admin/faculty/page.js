'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Menu, X, LogOut, Plus, Calendar, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
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

export default function FacultyManagement() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState('Administrator')
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department_id: '' })
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState({ total: 0, available: 0, onLeave: 0 })
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

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()

      if (res.ok && data.departments) {
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  // Fetch faculty
  const fetchFaculty = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/faculty')
      const data = await res.json()

      if (res.ok) {
        setFaculty(data.faculty || [])
        setStats({
          total: data.faculty?.length || 0,
          available: data.faculty?.filter(f => f.availability_status === 'available').length || 0,
          onLeave: 0 // Hardcoded per requirement
        })
      } else {
        toast.error('Failed to fetch faculty')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load faculty')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchFaculty()
  }, [])

  const handleAddFaculty = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.department_id) {
      toast.error('Please fill all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department_id: formData.department_id
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Faculty member added successfully')
        setFormData({ name: '', email: '', password: '', department_id: '' })
        setShowAddModal(false)
        await fetchFaculty()
      } else {
        toast.error(data.error || 'Failed to add faculty')
      }
    } catch (error) {
      console.error('Add error:', error)
      toast.error('Failed to add faculty')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditFaculty = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.department_id) {
      toast.error('Please fill all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFaculty.id,
          name: formData.name,
          email: formData.email,
          department_id: formData.department_id
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Faculty member updated successfully')
        setFormData({ name: '', email: '', password: '', department_id: '' })
        setShowEditModal(false)
        setEditingFaculty(null)
        await fetchFaculty()
      } else {
        toast.error(data.error || 'Failed to update faculty')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Failed to update faculty')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (fac) => {
    setEditingFaculty(fac)
    setFormData({ 
      name: fac.name, 
      email: fac.email, 
      password: '',
      department_id: fac.department_id || ''
    })
    setShowEditModal(true)
  }

  const handleDeleteFaculty = (fac) => {
    if (confirm(`Are you sure you want to delete "${fac.name}"? This action cannot be undone.`)) {
      deleteFaculty(fac.id)
    }
  }

  const deleteFaculty = async (id) => {
    try {
      const res = await fetch(`/api/admin/faculty?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Faculty member deleted successfully')
        await fetchFaculty()
      } else {
        toast.error(data.error || 'Failed to delete faculty')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete faculty')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const openAddModal = () => {
    setFormData({ name: '', email: '', password: 'faculty123', department_id: '' })
    setEditingFaculty(null)
    setShowAddModal(true)
  }

  const filteredFaculty = faculty.filter(fac =>
    fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fac.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fac.department_name && fac.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getAvailabilityBadge = (status) => {
    if (status === 'available') {
      return <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Available</span>
    }
    return <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">Limited</span>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-purple-200">SmartScheduler</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-purple-500"
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
            variant="secondary"
            className="w-full justify-start"
            onClick={() => setSidebarOpen(false)}
          >
            Faculty
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-purple-500"
            onClick={() => router.push('/admin/rooms')}
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
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-purple-900">Faculty Management</h1>
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
                <CardTitle className="text-sm font-medium text-gray-600">Total Faculty</CardTitle>
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

            <Card className="bg-white border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">On Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.onLeave}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">16h</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Card */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Faculty Members</CardTitle>
                <CardDescription>Manage all faculty in your institution</CardDescription>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={openAddModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Faculty
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search faculty members..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Loading faculty...</span>
                </div>
              ) : filteredFaculty.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {faculty.length === 0
                      ? 'No faculty members yet. Create one to get started.'
                      : 'No faculty match your search.'}
                  </p>
                </div>
              ) : (
                /* Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Workload (hrs/week)</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Availability</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFaculty.map((fac) => (
                        <tr key={fac.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">{fac.name}</td>
                          <td className="py-3 px-4 text-gray-600">{fac.department_name || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-600">{fac.email}</td>
                          <td className="py-3 px-4 text-gray-600">16</td>
                          <td className="py-3 px-4">
                            {getAvailabilityBadge(fac.availability_status || 'available')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-200 hover:bg-blue-50"
                              >
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(fac)}
                                className="border-blue-200 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteFaculty(fac)}
                                className="border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Faculty Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Faculty Member</DialogTitle>
            <DialogDescription>
              Create a new faculty account. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="faculty-name">Full Name</Label>
              <Input
                id="faculty-name"
                placeholder="e.g., Dr. John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="faculty-email">Email</Label>
              <Input
                id="faculty-email"
                type="email"
                placeholder="e.g., john.smith@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="faculty-password">Password</Label>
              <Input
                id="faculty-password"
                type="password"
                placeholder="Default: faculty123"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Default password is "faculty123"</p>
            </div>

            <div>
              <Label htmlFor="faculty-department">Department</Label>
              <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
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
              onClick={handleAddFaculty}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Faculty'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Faculty Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Faculty Member</DialogTitle>
            <DialogDescription>
              Update faculty details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-faculty-name">Full Name</Label>
              <Input
                id="edit-faculty-name"
                placeholder="e.g., Dr. John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-faculty-email">Email</Label>
              <Input
                id="edit-faculty-email"
                type="email"
                placeholder="e.g., john.smith@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-faculty-department">Department</Label>
              <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
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
              onClick={handleEditFaculty}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Faculty'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
