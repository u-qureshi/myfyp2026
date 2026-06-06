'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { AdminPortalShell } from '@/components/admin/AdminPortalShell'
import { adminTheme } from '@/components/admin/admin-theme'
import { toast } from 'sonner'
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

export default function SubjectManagement() {
  const router = useRouter()
  const [adminName, setAdminName] = useState('Administrator')
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [formData, setFormData] = useState({ name: '', code: '', credit_hours: 3, department_id: '' })
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState({ total: 0, totalCredits: 0, departments: 0 })
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

  // Fetch subjects
  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/subjects')
      const data = await res.json()

      if (res.ok) {
        setSubjects(data.subjects || [])
        
        // Calculate stats
        const totalSubjects = data.subjects?.length || 0
        const totalCredits = data.subjects?.reduce((sum, s) => sum + (s.credit_hours || 0), 0) || 0
        const uniqueDepts = new Set(data.subjects?.map(s => s.department_id).filter(Boolean))

        setStats({
          total: totalSubjects,
          totalCredits,
          departments: uniqueDepts.size
        })
      } else {
        toast.error('Failed to fetch subjects')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchSubjects()
  }, [])

  const handleAddSubject = async () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.department_id) {
      toast.error('Please fill all fields')
      return
    }

    const creditsNum = Number(formData.credit_hours)
    if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 6) {
      toast.error('Credit hours must be between 1 and 6')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase(),
          credit_hours: creditsNum,
          department_id: formData.department_id
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Subject added successfully')
        setFormData({ name: '', code: '', credit_hours: 3, department_id: '' })
        setShowAddModal(false)
        await fetchSubjects()
      } else {
        toast.error(data.error || 'Failed to add subject')
      }
    } catch (error) {
      console.error('Add error:', error)
      toast.error('Failed to add subject')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubject = async () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.department_id) {
      toast.error('Please fill all fields')
      return
    }

    const creditsNum = Number(formData.credit_hours)
    if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 6) {
      toast.error('Credit hours must be between 1 and 6')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSubject.id,
          name: formData.name,
          code: formData.code.toUpperCase(),
          credit_hours: creditsNum,
          department_id: formData.department_id
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Subject updated successfully')
        setFormData({ name: '', code: '', credit_hours: 3, department_id: '' })
        setShowEditModal(false)
        setEditingSubject(null)
        await fetchSubjects()
      } else {
        toast.error(data.error || 'Failed to update subject')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Failed to update subject')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      credit_hours: subject.credit_hours,
      department_id: subject.department_id || ''
    })
    setShowEditModal(true)
  }

  const handleDeleteSubject = (subject) => {
    if (confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      deleteSubject(subject.id)
    }
  }

  const deleteSubject = async (id) => {
    try {
      const res = await fetch(`/api/admin/subjects?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Subject deleted successfully')
        await fetchSubjects()
      } else {
        toast.error(data.error || 'Failed to delete subject')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete subject')
    }
  }


  const openAddModal = () => {
    setFormData({ name: '', code: '', credit_hours: 3, department_id: '' })
    setEditingSubject(null)
    setShowAddModal(true)
  }

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = departmentFilter === 'all' || subject.department_id === departmentFilter

    return matchesSearch && matchesFilter
  })

  return (
    <AdminPortalShell
      title="Subject Management"
      subtitle="Manage courses and subject catalog"
      adminName={adminName}
    >
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white border-l-4 border-l-[#001a4d]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#001a4d]">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Credit Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalCredits}</div>
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
                <CardTitle>Subjects</CardTitle>
                <CardDescription>Manage all subjects in your institution</CardDescription>
              </div>
              <Button
                className={adminTheme.primaryBtn}
                onClick={openAddModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search subjects..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#001a4d]" />
                  <span className="ml-2 text-gray-600">Loading subjects...</span>
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {subjects.length === 0
                      ? 'No subjects yet. Create one to get started.'
                      : 'No subjects match your search or filter.'}
                  </p>
                </div>
              ) : (
                /* Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Credit Hours</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubjects.map((subject) => (
                        <tr key={subject.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">{subject.name}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                              {subject.code}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {subject.credit_hours}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{subject.department_name || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(subject)}
                                className="border-blue-200 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubject(subject)}
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

      {/* Add Subject Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
            <DialogDescription>
              Create a new subject. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                placeholder="e.g., Data Structures"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input
                id="subject-code"
                placeholder="e.g., CS301"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Will be uppercase automatically</p>
            </div>

            <div>
              <Label htmlFor="subject-credits">Credit Hours</Label>
              <Input
                id="subject-credits"
                type="number"
                min="1"
                max="6"
                value={formData.credit_hours}
                onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Between 1 and 6</p>
            </div>

            <div>
              <Label htmlFor="subject-department">Department</Label>
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
              className={adminTheme.primaryBtn}
              onClick={handleAddSubject}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Subject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update subject details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-subject-name">Subject Name</Label>
              <Input
                id="edit-subject-name"
                placeholder="e.g., Data Structures"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-subject-code">Subject Code</Label>
              <Input
                id="edit-subject-code"
                placeholder="e.g., CS301"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Will be uppercase automatically</p>
            </div>

            <div>
              <Label htmlFor="edit-subject-credits">Credit Hours</Label>
              <Input
                id="edit-subject-credits"
                type="number"
                min="1"
                max="6"
                value={formData.credit_hours}
                onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Between 1 and 6</p>
            </div>

            <div>
              <Label htmlFor="edit-subject-department">Department</Label>
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
              className={adminTheme.primaryBtn}
              onClick={handleEditSubject}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Subject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPortalShell>
  )
}
