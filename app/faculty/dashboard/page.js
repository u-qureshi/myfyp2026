'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast, Toaster } from 'sonner'
import { BrandLogo, BrandLoadingScreen } from '@/components/BrandLogo'
import { FacultySidebar } from '@/components/faculty/FacultySidebar'
import { facultyTheme } from '@/components/faculty/faculty-theme'
import { DEFAULT_FACULTY_WEEKLY_AVAILABILITY, FACULTY_WEEK_DAYS } from '@/lib/timetable-helpers'
import {
  LogOut, Menu,
  Download, CheckCircle, AlertCircle, Zap, Info
} from 'lucide-react'

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

export default function FacultyDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState({ ...DEFAULT_FACULTY_WEEKLY_AVAILABILITY })
  const [availabilityRequest, setAvailabilityRequest] = useState(null)
  const [submittingAvailability, setSubmittingAvailability] = useState(false)
  const [phone, setPhone] = useState('')

  // Sample timetable data
  const timetableData = [
    { day: 'Monday', time: '09:00-10:00', subject: 'Data Structures', room: '101', section: 'A' },
    { day: 'Monday', time: '10:00-11:00', subject: 'Data Structures', room: '101', section: 'B' },
    { day: 'Tuesday', time: '09:00-10:00', subject: 'AI & ML', room: '401', section: 'A' },
    { day: 'Thursday', time: '10:00-11:00', subject: 'Database Systems', room: '205', section: 'C' }
  ]

  // Sample notifications
  const notifications = [
    { id: 1, title: 'Timetable Generated Successfully', message: 'Your timetable has been generated for Fall 2025', time: '2 hours ago', type: 'success' },
    { id: 2, title: 'Room Change Alert', message: 'Database Systems moved to Lab 201', time: '5 hours ago', type: 'warning' },
    { id: 3, title: 'Faculty Availability Updated', message: 'Your availability settings have been updated', time: '1 day ago', type: 'info' },
    { id: 4, title: 'Emergency Update Required', message: 'Please update your faculty profile', time: '1 day ago', type: 'alert' }
  ]

  // Fetch user session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/check-session', {
          credentials: 'include'
        })

        if (!response.ok) {
          window.location.href = '/login'
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Session check error:', error)
        window.location.href = '/login'
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  useEffect(() => {
    if (!user) return
    fetch('/api/faculty/availability', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setAvailabilityRequest(data.request)
        if (data.request?.availability && Object.keys(data.request.availability).length) {
          setAvailability({ ...DEFAULT_FACULTY_WEEKLY_AVAILABILITY, ...data.request.availability })
        }
      })
      .catch(() => {})
  }, [user])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleUpdateAvailability = async () => {
    setSubmittingAvailability(true)
    try {
      const res = await fetch('/api/faculty/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          availability,
          requestId: availabilityRequest?.id || null,
          forceUpdate: true
        })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit availability')
        return
      }
      toast.success('Availability submitted to admin')
      setAvailabilityRequest(data.request)
    } catch {
      toast.error('Failed to submit availability')
    } finally {
      setSubmittingAvailability(false)
    }
  }

  const handleSaveProfile = () => {
    toast.success('Profile updated')
  }

  const handleDownloadTimetable = () => {
    toast.info('Feature coming soon')
  }

  if (loading) {
    return <BrandLoadingScreen message="Loading faculty portal..." />
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Toaster />
      <div className={facultyTheme.shell}>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <FacultySidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          facultyName={user.name}
          designation={user.designation || user.department_name || 'Faculty Member'}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={facultyTheme.header}>
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <BrandLogo size={40} className="hidden md:block shrink-0" />
                <div className="min-w-0">
                  <h1 className={facultyTheme.pageTitle}>Faculty Portal</h1>
                  <p className={facultyTheme.pageSubtitle}>
                    {user.department_name || 'Department'} · Fall 2025
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-3 sm:flex shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#001a4d]">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.designation || user.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <Card className={facultyTheme.welcomeCard}>
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome, {user.name}! 👋</CardTitle>
                  <CardDescription>
                    {user.department_name || 'Faculty Department'} • {user.designation || 'Faculty Member'} • Fall 2025
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Courses Assigned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`${facultyTheme.statValue}`}>3</div>
                    <p className="text-xs text-gray-500 mt-1">Active courses</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Classes This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#002d6b]">12</div>
                    <p className="text-xs text-gray-500 mt-1">Scheduled classes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Classes Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">2</div>
                    <p className="text-xs text-gray-500 mt-1">Upcoming today</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Next Class</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">9:00 AM</div>
                    <p className="text-xs text-gray-500 mt-1">Data Structures</p>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Timetable Preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Weekly Timetable</CardTitle>
                    <CardDescription>Your teaching schedule</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadTimetable}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Time</th>
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Monday</th>
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Tuesday</th>
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Wednesday</th>
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Thursday</th>
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Friday</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'].map((time) => (
                          <tr key={time} className="border-b border-gray-200">
                            <td className="py-3 px-4 font-medium text-gray-700">{time}</td>
                            <td className="py-3 px-4">
                              {time === '09:00-10:00' && (
                                <div className={facultyTheme.timetableCell}>
                                  <div className={facultyTheme.timetableCellTitle}>Data Structures</div>
                                  <div className={facultyTheme.timetableCellSub}>Room 101</div>
                                </div>
                              )}
                              {time === '10:00-11:00' && (
                                <div className={facultyTheme.timetableCell}>
                                  <div className={facultyTheme.timetableCellTitle}>Data Structures</div>
                                  <div className={facultyTheme.timetableCellSub}>Room 101</div>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {time === '09:00-10:00' && (
                                <div className="bg-blue-100 p-2 rounded text-xs">
                                  <div className="font-semibold text-blue-900">AI & ML</div>
                                  <div className="text-blue-700">Room 401</div>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4"></td>
                            <td className="py-3 px-4">
                              {time === '10:00-11:00' && (
                                <div className="bg-green-100 p-2 rounded text-xs">
                                  <div className="font-semibold text-green-900">Database Systems</div>
                                  <div className="text-green-700">Room 205</div>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === 'timetable' && (
            <div className="space-y-6">
              <div>
                <h2 className={facultyTheme.pageTitle}>My Timetable</h2>
                <p className="text-gray-500">Your complete weekly schedule</p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Day</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Room</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Section</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timetableData.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-700">{item.day}</td>
                            <td className="py-3 px-4 text-gray-600">{item.time}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">{item.subject}</td>
                            <td className="py-3 px-4 text-gray-600">{item.room}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{item.section}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === 'availability' && (
            <div className="space-y-6">
              <div>
                <h2 className={facultyTheme.pageTitle}>My Availability</h2>
                <p className="text-gray-500">Tell admin which days and hours you can teach</p>
              </div>

              {availabilityRequest?.status === 'requested' && (
                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
                  <CardContent className="pt-5 flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">Admin requested your availability</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        Semester {availabilityRequest.semester} — submit your weekly hours below so timetables can be generated.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {availabilityRequest?.status === 'submitted' && (
                <Card className="border-l-4 border-l-green-500 bg-green-50">
                  <CardContent className="pt-5 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-700" />
                    <p className="text-sm text-green-800 font-medium">
                      Availability submitted — admin will use this when generating timetables. You can update and resubmit anytime.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Availability</CardTitle>
                  <CardDescription>
                    For each day, enable teaching and set from–to times. Hard constraints (no double-booking) always apply during generation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {FACULTY_WEEK_DAYS.map((day) => (
                    <div key={day} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{day}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${availability[day]?.enabled ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                            {availability[day]?.enabled ? 'Available' : 'Off'}
                          </span>
                          <Switch
                            checked={!!availability[day]?.enabled}
                            onCheckedChange={(v) => handleAvailabilityChange(day, 'enabled', v)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                      </div>
                      {availability[day]?.enabled && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500">From</Label>
                            <select
                              className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                              value={availability[day]?.from || '09:00'}
                              onChange={(e) => handleAvailabilityChange(day, 'from', e.target.value)}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">To</Label>
                            <select
                              className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                              value={availability[day]?.to || '16:00'}
                              onChange={(e) => handleAvailabilityChange(day, 'to', e.target.value)}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    onClick={handleUpdateAvailability}
                    disabled={submittingAvailability}
                    className={`w-full mt-6 ${facultyTheme.primaryBtn}`}
                  >
                    {submittingAvailability ? 'Submitting...' : availabilityRequest?.status === 'submitted' ? 'Update & Resubmit to Admin' : 'Submit Availability to Admin'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className={facultyTheme.pageTitle}>Notifications</h2>
                <p className="text-gray-500">Stay updated with your schedule</p>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Card key={notif.id} className="border-l-4" style={{
                    borderLeftColor: notif.type === 'success' ? '#10b981' : 
                                    notif.type === 'warning' ? '#f59e0b' : 
                                    notif.type === 'alert' ? '#ef4444' : '#001a4d'
                  }}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {notif.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {notif.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                            {notif.type === 'alert' && <Zap className="h-5 w-5 text-red-600" />}
                            <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Mark as read
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className={facultyTheme.pageTitle}>My Profile</h2>
                <p className="text-gray-500">Manage your faculty information</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Faculty Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={user.name}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={user.department_name || 'Faculty Department'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={user.designation || 'Faculty Member'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 "
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    className={`w-full ${facultyTheme.primaryBtn}`}
                  >
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          </main>
        </div>
      </div>
    </>
  )
}
