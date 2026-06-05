'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Menu, X, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const HARD_CONSTRAINTS = [
  {
    id: 'no-clashes',
    title: 'No Time Slot Clashes',
    description: 'A teacher or section cannot be in two places at the same time',
    enabled: true,
    disableable: false
  },
  {
    id: 'room-capacity',
    title: 'Room Capacity',
    description: 'Section enrollment must not exceed room capacity',
    enabled: true,
    disableable: false
  },
  {
    id: 'teacher-availability',
    title: 'Teacher Availability',
    description: 'Teachers can only be assigned during their available hours',
    enabled: true,
    disableable: false
  },
  {
    id: 'room-availability',
    title: 'Room Availability',
    description: 'Rooms must be available and not under maintenance',
    enabled: true,
    disableable: false
  },
  {
    id: 'no-double-booking',
    title: 'No Double Booking',
    description: 'Same room cannot be assigned to two sections at the same time',
    enabled: true,
    disableable: false
  }
]

const SOFT_CONSTRAINTS = [
  {
    id: 'minimize-distance',
    title: 'Minimize Walking Distance',
    description: 'Prefer consecutive classes in nearby buildings',
    enabled: true,
    weight: 80
  },
  {
    id: 'preferred-slots',
    title: 'Preferred Time Slots',
    description: 'Assign popular subjects to preferred time slots',
    enabled: true,
    weight: 70
  },
  {
    id: 'balanced-workload',
    title: 'Balanced Daily Workload',
    description: 'Distribute classes evenly throughout the week',
    enabled: true,
    weight: 90
  },
  {
    id: 'teacher-preferences',
    title: 'Teacher Preferences',
    description: 'Consider teacher time slot preferences',
    enabled: true,
    weight: 60
  },
  {
    id: 'avoid-morning-labs',
    title: 'Avoid Morning Labs',
    description: 'Schedule labs in afternoon when possible',
    enabled: false,
    weight: 50
  },
  {
    id: 'minimize-gaps',
    title: 'Minimize Gaps',
    description: 'Reduce idle gaps between classes for students',
    enabled: true,
    weight: 75
  }
]

export default function ConstraintsManagement() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState('Administrator')
  const [hardConstraints, setHardConstraints] = useState(HARD_CONSTRAINTS)
  const [softConstraints, setSoftConstraints] = useState(SOFT_CONSTRAINTS)
  const [saving, setSaving] = useState(false)

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

  // Load constraints from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('constraints')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.hard) setHardConstraints(parsed.hard)
        if (parsed.soft) setSoftConstraints(parsed.soft)
      }
    } catch (error) {
      console.error('Error loading constraints:', error)
    }
  }, [])

  const handleHardConstraintToggle = (id) => {
    // Hard constraints cannot be disabled, so this is a no-op
    // But we keep the handler for consistency
  }

  const handleSoftConstraintToggle = (id) => {
    setSoftConstraints(prev =>
      prev.map(constraint =>
        constraint.id === id
          ? { ...constraint, enabled: !constraint.enabled }
          : constraint
      )
    )
  }

  const handleSoftConstraintWeightChange = (id, value) => {
    setSoftConstraints(prev =>
      prev.map(constraint =>
        constraint.id === id
          ? { ...constraint, weight: value[0] }
          : constraint
      )
    )
  }

  const handleSaveConstraints = async () => {
    setSaving(true)
    try {
      // Save to localStorage
      const constraintsData = {
        hard: hardConstraints,
        soft: softConstraints,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('constraints', JSON.stringify(constraintsData))
      
      toast.success('Constraints saved successfully!')
    } catch (error) {
      console.error('Error saving constraints:', error)
      toast.error('Failed to save constraints')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const enabledSoftCount = softConstraints.filter(c => c.enabled).length
  const totalSoftCount = softConstraints.length

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
            variant="secondary"
            className="w-full justify-start"
            onClick={() => setSidebarOpen(false)}
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
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-purple-900">Constraints Management</h1>
                <p className="text-sm text-gray-600">Configure hard and soft constraints for intelligent timetable generation</p>
              </div>
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
          {/* Info Banner */}
          <Card className="mb-6 bg-gradient-to-r from-purple-500 to-purple-600 border-0 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Constraint Status</p>
                  <p className="text-purple-100 text-sm mt-1">5 Hard Constraints | {enabledSoftCount} of {totalSoftCount} Soft Constraints Enabled</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{5 + enabledSoftCount}</p>
                  <p className="text-purple-100 text-sm">Active Constraints</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hard Constraints Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">Hard Constraints</h2>
              <span className="text-xs font-semibold text-gray-500 ml-auto">Must be satisfied, cannot be violated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hardConstraints.map((constraint) => (
                <Card key={constraint.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{constraint.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{constraint.description}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="ml-2">
                              <Switch
                                checked={true}
                                disabled={true}
                                className="cursor-not-allowed"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Hard constraints cannot be disabled</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Soft Constraints Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">Soft Constraints</h2>
              <span className="text-xs font-semibold text-gray-500 ml-auto">Optimized based on priority weights (0-100)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {softConstraints.map((constraint) => (
                <Card key={constraint.id} className={`transition-all ${
                  constraint.enabled
                    ? 'bg-white hover:shadow-md'
                    : 'bg-gray-50 opacity-75'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      {constraint.enabled ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold ${constraint.enabled ? 'text-gray-900' : 'text-gray-600'}`}>
                          {constraint.title}
                        </h3>
                        <p className={`text-sm mt-1 ${constraint.enabled ? 'text-gray-600' : 'text-gray-500'}`}>
                          {constraint.description}
                        </p>
                      </div>
                      <Switch
                        checked={constraint.enabled}
                        onCheckedChange={() => handleSoftConstraintToggle(constraint.id)}
                        className="ml-2"
                      />
                    </div>

                    {constraint.enabled && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-gray-700">Priority Weight</label>
                          <span className="text-sm font-bold text-purple-600">{constraint.weight}%</span>
                        </div>
                        <Slider
                          value={[constraint.weight]}
                          onValueChange={(value) => handleSoftConstraintWeightChange(constraint.id, value)}
                          min={0}
                          max={100}
                          step={5}
                          className="[&>span]:bg-purple-600 [&>span]:border-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSaveConstraints}
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold h-12"
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                'Save Constraints'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
