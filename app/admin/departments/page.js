'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Menu, X, LogOut, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
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

export default function DepartmentManagement() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState('Administrator')
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [formData, setFormData] = useState({ name: '', code: '' })
  const [stats, setStats] = useState({ departments: 0, programs: 0, sections: 0 })
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

  // Fetch departments
  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()
      
      if (res.ok) {
        setDepartments(data.departments || [])
        setStats({
          departments: data.departments?.length || 0,
          programs: data.programCount || 0,
          sections: data.sectionCount || 0
        })
      } else {
        toast.error('Failed to fetch departments')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleAddDepartment = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Please fill all fields')
      return
    }

    if (formData.code.length > 10) {
      toast.error('Department code must be 10 characters or less')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase()
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Department added successfully')
        setFormData({ name: '', code: '' })
        setShowAddModal(false)
        await fetchDepartments()
      } else {
        toast.error(data.error || 'Failed to add department')
      }
    } catch (error) {
      console.error('Add error:', error)
      toast.error('Failed to add department')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditDepartment = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Please fill all fields')
      return
    }

    if (formData.code.length > 10) {
      toast.error('Department code must be 10 characters or less')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDept.id,
          name: formData.name,
          code: formData.code.toUpperCase()
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Department updated successfully')
        setFormData({ name: '', code: '' })
        setShowEditModal(false)
        setEditingDept(null)
        await fetchDepartments()
      } else {
        toast.error(data.error || 'Failed to update department')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Failed to update department')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (dept) => {
    setEditingDept(dept)
    setFormData({ name: dept.name, code: dept.code })
    setShowEditModal(true)
  }

  const handleDeleteDepartment = (dept) => {
    if (confirm(`Are you sure you want to delete "${dept.name}"? This action cannot be undone.`)) {
      deleteDepartment(dept.id)
    }
  }

  const deleteDepartment = async (id) => {
    try {
      const res = await fetch(`/api/admin/departments?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Department deleted successfully')
        await fetchDepartments()
      } else {
        toast.error(data.error || 'Failed to delete department')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete department')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const openAddModal = () => {
    setFormData({ name: '', code: '' })
    setEditingDept(null)
    setShowAddModal(true)
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            variant="secondary"
            className="w-full justify-start"
            onClick={() => setSidebarOpen(false)}
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
            onClick={() => router.push('/admin/dashboard')}
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
                title="Department Management"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.departments}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.programs}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">{stats.sections}</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Card */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage all departments in your institution</CardDescription>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={openAddModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search departments..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Loading departments...</span>
                </div>
              ) : filteredDepartments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {departments.length === 0
                      ? 'No departments yet. Create one to get started.'
                      : 'No departments match your search.'}
                  </p>
                </div>
              ) : (
                /* Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Department Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Programs</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Sections</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Faculty</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartments.map((dept) => (
                        <tr key={dept.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">{dept.name}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                              {dept.code}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{dept.programs || 0}</td>
                          <td className="py-3 px-4 text-gray-600">{dept.sections || 0}</td>
                          <td className="py-3 px-4 text-gray-600">{dept.facultyCount || 0}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(dept)}
                                className="border-blue-200 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDepartment(dept)}
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

      {/* Add Department Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Create a new department. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                placeholder="e.g., Computer Science"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="dept-code">Department Code</Label>
              <Input
                id="dept-code"
                placeholder="e.g., CS"
                maxLength={10}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Max 10 characters. Will be uppercase.</p>
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
              onClick={handleAddDepartment}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Department'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-dept-name">Department Name</Label>
              <Input
                id="edit-dept-name"
                placeholder="e.g., Computer Science"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-dept-code">Department Code</Label>
              <Input
                id="edit-dept-code"
                placeholder="e.g., CS"
                maxLength={10}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Max 10 characters. Will be uppercase.</p>
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
              onClick={handleEditDepartment}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Department'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
