'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Menu, X, LogOut, Plus, Pencil, Trash2, Search, Users, Loader2 } from 'lucide-react'
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

export default function SectionManagement() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState('Administrator')
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [formData, setFormData] = useState({ name: '', semester: '1', department_id: '', student_count: '30' })
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState({ total: 0, totalStudents: 0, departments: 0 })
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

  // Fetch sections
  const fetchSections = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sections')
      const data = await res.json()

      if (res.ok) {
        setSections(data.sections || [])
        
        // Calculate stats
        const totalSections = data.sections?.length || 0
        const totalStudents = data.sections?.reduce((sum, s) => sum + (s.student_count || 0), 0) || 0
        const uniqueDepts = new Set(data.sections?.map(s => s.department_id).filter(Boolean))

        setStats({
          total: totalSections,
          totalStudents,
          departments: uniqueDepts.size
        })
      } else {
        toast.error('Failed to fetch sections')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load sections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchSections()
  }, [])

  const handleAddSection = async () => {
    if (!formData.name.trim() || !formData.semester || !formData.department_id || !formData.student_count) {
      toast.error('Please fill all fields')
      return
    }

    const semesterNum = Number(formData.semester)
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      toast.error('Semester must be between 1 and 8')
      return
    }

    const studentCountNum = Number(formData.student_count)
    if (isNaN(studentCountNum) || studentCountNum < 1 || studentCountNum > 100) {
      toast.error('Student count must be between 1 and 100')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          semester: semesterNum,
          department_id: formData.department_id,
          student_count: studentCountNum
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Section added successfully')
        setFormData({ name: '', semester: '1', department_id: '', student_count: '30' })
        setShowAddModal(false)
        await fetchSections()
      } else {
        toast.error(data.error || 'Failed to add section')
      }
    } catch (error) {
      console.error('Add error:', error)
      toast.error('Failed to add section')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSection = async () => {
    if (!formData.name.trim() || !formData.semester || !formData.department_id || !formData.student_count) {
      toast.error('Please fill all fields')
      return
    }

    const semesterNum = Number(formData.semester)
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      toast.error('Semester must be between 1 and 8')
      return
    }

    const studentCountNum = Number(formData.student_count)
    if (isNaN(studentCountNum) || studentCountNum < 1 || studentCountNum > 100) {
      toast.error('Student count must be between 1 and 100')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSection.id,
          name: formData.name,
          semester: semesterNum,
          department_id: formData.department_id,
          student_count: studentCountNum
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Section updated successfully')
        setFormData({ name: '', semester: '1', department_id: '', student_count: '30' })
        setShowEditModal(false)
        setEditingSection(null)
        await fetchSections()
      } else {
        toast.error(data.error || 'Failed to update section')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Failed to update section')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (section) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      semester: String(section.semester),
      department_id: section.department_id || '',
      student_count: String(section.student_count)
    })
    setShowEditModal(true)
  }

  const handleDeleteSection = (section) => {
    if (confirm(`Are you sure you want to delete "${section.name}"? This action cannot be undone.`)) {
      deleteSection(section.id)
    }
  }

  const deleteSection = async (id) => {
    try {
      const res = await fetch(`/api/admin/sections?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Section deleted successfully')
        await fetchSections()
      } else {
        toast.error(data.error || 'Failed to delete section')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete section')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const openAddModal = () => {
    setFormData({ name: '', semester: '1', department_id: '', student_count: '30' })
    setEditingSection(null)
    setShowAddModal(true)
  }

  const filteredSections = sections.filter(section => {
    const matchesSearch = 
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (section.department_name && section.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = semesterFilter === 'all' || String(section.semester) === semesterFilter

    return matchesSearch && matchesFilter
  })

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
            variant="secondary"
            className="w-full justify-start"
            onClick={() => setSidebarOpen(false)}
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
                title="Section Management"
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
                <CardTitle className="text-sm font-medium text-gray-600">Total Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">{stats.departments}</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Card */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Sections</CardTitle>
                <CardDescription>Manage all sections in your institution</CardDescription>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={openAddModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search sections..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={String(sem)}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Loading sections...</span>
                </div>
              ) : filteredSections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {sections.length === 0
                      ? 'No sections yet. Create one to get started.'
                      : 'No sections match your search or filter.'}
                  </p>
                </div>
              ) : (
                /* Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Section Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Semester</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Count</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSections.map((section) => (
                        <tr key={section.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">{section.name}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                              Sem {section.semester}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{section.department_name || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                {section.student_count}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(section)}
                                className="border-blue-200 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSection(section)}
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

      {/* Add Section Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Create a new section. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="section-name">Section Name</Label>
              <Input
                id="section-name"
                placeholder="e.g., BSCS-7A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section-semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={String(sem)}>
                        {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section-students">Student Count</Label>
                <Input
                  id="section-students"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.student_count}
                  onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="section-department">Department</Label>
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
              onClick={handleAddSection}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Section'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-section-name">Section Name</Label>
              <Input
                id="edit-section-name"
                placeholder="e.g., BSCS-7A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-section-semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={String(sem)}>
                        {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-section-students">Student Count</Label>
                <Input
                  id="edit-section-students"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.student_count}
                  onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-section-department">Department</Label>
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
              onClick={handleEditSection}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Section'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
