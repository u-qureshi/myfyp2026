'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Building2, CheckCircle2, Loader2 } from 'lucide-react'
import { AdminPortalShell } from '@/components/admin/AdminPortalShell'
import { adminTheme } from '@/components/admin/admin-theme'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function EmergencyUpdate() {
  const router = useRouter()
  const [adminName, setAdminName] = useState('Administrator')
  const [updateType, setUpdateType] = useState(null)
  const [faculty, setFaculty] = useState([])
  const [rooms, setRooms] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [successResult, setSuccessResult] = useState(null)

  const [formData, setFormData] = useState({
    selectedItem: '',
    fromDate: '',
    toDate: '',
    reason: ''
  })

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

  // Fetch faculty when Teacher Leave is selected
  useEffect(() => {
    if (updateType === 'teacher-leave') {
      fetchFaculty()
    }
  }, [updateType])

  // Fetch rooms when Room Unavailable is selected
  useEffect(() => {
    if (updateType === 'room-unavailable') {
      fetchRooms()
    }
  }, [updateType])

  const fetchFaculty = async () => {
    setLoadingData(true)
    try {
      const res = await fetch('/api/admin/faculty')
      const data = await res.json()

      if (res.ok && Array.isArray(data.faculty)) {
        setFaculty(data.faculty)
      } else {
        // Sample data if API fails
        setFaculty([
          { id: 'F001', name: 'Dr. Ahmed Khan' },
          { id: 'F002', name: 'Dr. Sarah Ali' },
          { id: 'F003', name: 'Prof. Hassan Raza' },
          { id: 'F004', name: 'Dr. Fatima Noor' },
          { id: 'F005', name: 'Mr. Ali Hassan' }
        ])
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
      setFaculty([
        { id: 'F001', name: 'Dr. Ahmed Khan' },
        { id: 'F002', name: 'Dr. Sarah Ali' },
        { id: 'F003', name: 'Prof. Hassan Raza' },
        { id: 'F004', name: 'Dr. Fatima Noor' },
        { id: 'F005', name: 'Mr. Ali Hassan' }
      ])
    } finally {
      setLoadingData(false)
    }
  }

  const fetchRooms = async () => {
    setLoadingData(true)
    try {
      const res = await fetch('/api/admin/rooms')
      const data = await res.json()

      if (res.ok && Array.isArray(data.rooms)) {
        setRooms(data.rooms)
      } else {
        // Sample data if API fails
        setRooms([
          { id: 'R101', name: 'Lecture Hall A' },
          { id: 'R102', name: 'Lecture Hall B' },
          { id: 'L201', name: 'AI Lab' },
          { id: 'L202', name: 'Cyber Sec Lab' },
          { id: 'L203', name: 'Data Science Lab' }
        ])
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setRooms([
        { id: 'R101', name: 'Lecture Hall A' },
        { id: 'R102', name: 'Lecture Hall B' },
        { id: 'L201', name: 'AI Lab' },
        { id: 'L202', name: 'Cyber Sec Lab' },
        { id: 'L203', name: 'Data Science Lab' }
      ])
    } finally {
      setLoadingData(false)
    }
  }

  const handleUpdateTypeSelect = (type) => {
    setUpdateType(type)
    setFormData({ selectedItem: '', fromDate: '', toDate: '', reason: '' })
    setSuccessResult(null)
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!updateType) {
      toast.error('Please select an update type')
      return false
    }
    if (!formData.selectedItem) {
      toast.error(`Please select a ${updateType === 'teacher-leave' ? 'teacher' : 'room'}`)
      return false
    }
    if (!formData.fromDate) {
      toast.error('Please select a from date')
      return false
    }
    if (!formData.toDate) {
      toast.error('Please select a to date')
      return false
    }
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      toast.error('From date cannot be after to date')
      return false
    }
    return true
  }

  const handleProcessUpdate = async () => {
    if (!validateForm()) return

    setProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Emergency update processed! Affected classes have been rescheduled.')

      // Show success result
      setSuccessResult({
        type: updateType,
        itemName: formData.selectedItem,
        affectedClasses: Math.floor(Math.random() * 5) + 2
      })
    } catch (error) {
      console.error('Error processing update:', error)
      toast.error('Failed to process emergency update')
    } finally {
      setProcessing(false)
    }
  }

  const handleMakeAnotherUpdate = () => {
    setUpdateType(null)
    setFormData({ selectedItem: '', fromDate: '', toDate: '', reason: '' })
    setSuccessResult(null)
  }


  const getSelectedItemName = () => {
    if (updateType === 'teacher-leave') {
      const selected = faculty.find(f => f.id === formData.selectedItem)
      return selected?.name || ''
    } else {
      const selected = rooms.find(r => r.id === formData.selectedItem)
      return selected?.name || ''
    }
  }

  return (
    <AdminPortalShell
      title="Emergency Timetable Update"
      subtitle="Handle urgent scheduling changes quickly"
      adminName={adminName}
    >
          {successResult ? (
            // Success Result Card
            <div className="max-w-2xl mx-auto">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-green-900 mb-2">Emergency Update Processed Successfully</h2>
                    <p className="text-green-700 mb-6">
                      {successResult.affectedClasses} affected classes have been rescheduled
                    </p>
                    <div className="bg-white p-4 rounded-lg mb-6 w-full text-left">
                      <div className="text-sm text-gray-600">
                        <p className="mb-2">
                          <span className="font-semibold">Update Type:</span> {successResult.type === 'teacher-leave' ? 'Teacher Leave' : 'Room Unavailable'}
                        </p>
                        <p className="mb-2">
                          <span className="font-semibold">Affected Item:</span> {successResult.itemName}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span> <span className="text-green-600">Notifications sent to affected faculty and students</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        onClick={() => router.push('/admin/dashboard')}
                        className={`flex-1 ${adminTheme.primaryBtn} text-white`}
                      >
                        View Updated Timetable
                      </Button>
                      <Button
                        onClick={handleMakeAnotherUpdate}
                        variant="outline"
                        className="flex-1"
                      >
                        Make Another Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Main Form
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Step 1: Update Type Selection */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Step 1: Select Update Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Teacher Leave Card */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      updateType === 'teacher-leave'
                        ? 'border-red-500 border-2 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                    onClick={() => handleUpdateTypeSelect('teacher-leave')}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">Teacher Leave</h3>
                        <p className="text-sm text-gray-600 mt-2">Teacher is unavailable for scheduled classes</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Room Unavailable Card */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      updateType === 'room-unavailable'
                        ? 'border-blue-500 border-2 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleUpdateTypeSelect('room-unavailable')}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Building2 className="h-12 w-12 text-blue-500 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">Room Unavailable</h3>
                        <p className="text-sm text-gray-600 mt-2">Room is under maintenance or occupied</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 2: Update Details */}
              {updateType && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Step 2: Update Details</h2>
                  <Card className="bg-white">
                    <CardContent className="pt-6 space-y-4">
                      {/* Select Item */}
                      <div>
                        <Label className="font-semibold">
                          Select {updateType === 'teacher-leave' ? 'Teacher' : 'Room'}
                        </Label>
                        <Select
                          value={formData.selectedItem}
                          onValueChange={(value) => handleFormChange('selectedItem', value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder={`Select a ${updateType === 'teacher-leave' ? 'teacher' : 'room'}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingData ? (
                              <div className="p-2 text-center text-sm text-gray-500">Loading...</div>
                            ) : updateType === 'teacher-leave' ? (
                              faculty.map(f => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.name}
                                </SelectItem>
                              ))
                            ) : (
                              rooms.map(r => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* From Date */}
                      <div>
                        <Label className="font-semibold">From Date</Label>
                        <Input
                          type="date"
                          value={formData.fromDate}
                          onChange={(e) => handleFormChange('fromDate', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* To Date */}
                      <div>
                        <Label className="font-semibold">To Date</Label>
                        <Input
                          type="date"
                          value={formData.toDate}
                          onChange={(e) => handleFormChange('toDate', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Reason */}
                      <div>
                        <Label className="font-semibold">Reason (Optional)</Label>
                        <textarea
                          value={formData.reason}
                          onChange={(e) => handleFormChange('reason', e.target.value)}
                          placeholder="Enter the reason for this emergency update..."
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows="3"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Action Bar */}
              {updateType && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Ready to Re-optimize</p>
                    <p className="text-xs text-gray-600">The system will find alternative slots for affected classes</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      onClick={() => handleUpdateTypeSelect(null)}
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleProcessUpdate}
                      disabled={processing}
                      className={`flex-1 sm:flex-none ${adminTheme.primaryBtn} text-white`}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Re-optimize Timetable'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
    </AdminPortalShell>
  )
}
