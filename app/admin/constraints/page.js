'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { AdminPortalShell } from '@/components/admin/AdminPortalShell'
import { adminTheme } from '@/components/admin/admin-theme'
import { toast } from 'sonner'
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


  const enabledSoftCount = softConstraints.filter(c => c.enabled).length
  const totalSoftCount = softConstraints.length

  return (
    <AdminPortalShell
      title="Constraints Management"
      subtitle="Configure hard and soft constraints for intelligent timetable generation"
      adminName={adminName}
    >
          {/* Info Banner */}
          <Card className="mb-6 bg-gradient-to-r from-[#001a4d] to-[#002d6b] border-0 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Constraint Status</p>
                  <p className="text-slate-200 text-sm mt-1">5 Hard Constraints | {enabledSoftCount} of {totalSoftCount} Soft Constraints Enabled</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{5 + enabledSoftCount}</p>
                  <p className="text-slate-200 text-sm">Active Constraints</p>
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
                          <span className="text-sm font-bold text-[#001a4d]">{constraint.weight}%</span>
                        </div>
                        <Slider
                          value={[constraint.weight]}
                          onValueChange={(value) => handleSoftConstraintWeightChange(constraint.id, value)}
                          min={0}
                          max={100}
                          step={5}
                          className="[[&>span]:bg-purple-600 [&>span]:border-purple-600>span]:bg-[#001a4d] [[&>span]:bg-purple-600 [&>span]:border-purple-600>span]:border-[#001a4d]"
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
              className={`flex-1 ${adminTheme.primaryBtn} text-white font-semibold h-12`}
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
    </AdminPortalShell>
  )
}
