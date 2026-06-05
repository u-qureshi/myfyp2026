'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Menu, X, LogOut, TrendingUp, TrendingDown, Download } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function Reports() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState('Administrator')

  const facultyData = [
    {
      id: 'F001',
      name: 'Dr. Ahmed Khan',
      department: 'CS',
      hoursPerWeek: 18,
      utilization: 90,
      status: 'Optimal'
    },
    {
      id: 'F002',
      name: 'Dr. Sarah Ali',
      department: 'SE',
      hoursPerWeek: 15,
      utilization: 75,
      status: 'Moderate'
    },
    {
      id: 'F003',
      name: 'Prof. Hassan Raza',
      department: 'DS',
      hoursPerWeek: 12,
      utilization: 60,
      status: 'Moderate'
    },
    {
      id: 'F004',
      name: 'Dr. Fatima Noor',
      department: 'CYS',
      hoursPerWeek: 16,
      utilization: 80,
      status: 'Optimal'
    },
    {
      id: 'F005',
      name: 'Mr. Ali Hassan',
      department: 'AI',
      hoursPerWeek: 10,
      utilization: 50,
      status: 'Low'
    }
  ]

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const handleExportAll = () => {
    toast.success('Report exported successfully!')
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Optimal':
        return 'bg-green-100 text-green-800'
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return 'text-green-600'
    if (utilization >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getTrendColor = (trend) => {
    return trend > 0 ? 'text-green-600' : 'text-red-600'
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
            variant="secondary"
            className="w-full justify-start"
            onClick={() => setSidebarOpen(false)}
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
              <div>
                <h1 className="text-2xl font-bold text-purple-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-600">Fall 2025 Semester</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleExportAll}
                className="bg-purple-600 hover:bg-purple-700 text-white hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Reports
              </Button>
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
          {/* Mobile Export Button */}
          <div className="sm:hidden mb-4">
            <Button
              onClick={handleExportAll}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Reports
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Avg Faculty Utilization */}
            <Card className="bg-white border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Faculty Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600">75%</div>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(12)}
                      <span className={`text-sm font-semibold ${getTrendColor(12)}`}>+12%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Room Utilization */}
            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Room Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">73%</div>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(8)}
                      <span className={`text-sm font-semibold ${getTrendColor(8)}`}>+8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Idle Time Gaps */}
            <Card className="bg-white border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Idle Time Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-yellow-600">8%</div>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(-6)}
                      <span className={`text-sm font-semibold ${getTrendColor(-6)}`}>-6%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Score */}
            <Card className="bg-white border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Efficiency Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">92%</div>
                    <p className="text-xs font-semibold text-purple-600 mt-1">Excellent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Faculty Workload Analysis Table */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Faculty Workload Analysis</CardTitle>
                <CardDescription>Current semester workload distribution</CardDescription>
              </div>
              <Button
                onClick={handleExportAll}
                variant="outline"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Faculty Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Hours/Week</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilization</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyData.map((faculty) => (
                      <tr key={faculty.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{faculty.name}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {faculty.department}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{faculty.hoursPerWeek} hrs</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${getUtilizationColor(faculty.utilization)}`}>
                            {faculty.utilization}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(faculty.status)}`}>
                            {faculty.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Faculty</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{facultyData.length}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Avg Hours/Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {(facultyData.reduce((sum, f) => sum + f.hoursPerWeek, 0) / facultyData.length).toFixed(1)} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Avg Utilization</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {(facultyData.reduce((sum, f) => sum + f.utilization, 0) / facultyData.length).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
