'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'
import { AdminPortalShell } from '@/components/admin/AdminPortalShell'
import { adminTheme } from '@/components/admin/admin-theme'
import { toast } from 'sonner'

export default function Reports() {
  const router = useRouter()
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
    <AdminPortalShell
      title="Reports & Analytics"
      subtitle="Fall 2025 Semester"
      adminName={adminName}
    >
          {/* Mobile Export Button */}
          <div className="sm:hidden mb-4">
            <Button
              onClick={handleExportAll}
              className={`w-full ${adminTheme.primaryBtn} text-white`}
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
            <Card className="bg-white border-l-4 border-l-[#001a4d]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Efficiency Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-[#001a4d]">92%</div>
                    <p className="text-xs font-semibold text-[#001a4d] mt-1">Excellent</p>
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
                className="text-[#001a4d] border-[#001a4d]/20 hover:bg-[#001a4d]/5"
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
    </AdminPortalShell>
  )
}
