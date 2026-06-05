'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast, Toaster } from 'sonner'
import { SidebarBrandMark, BrandLoadingScreen, PortalHeaderBrand, BRAND_NAME } from '@/components/BrandLogo'
import { 
  LogOut, Calendar, Clock, BookOpen, Bell, User, Menu, X, 
  Download, CheckCircle, AlertCircle, Zap
} from 'lucide-react'

export default function FacultyDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true
  })
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const handleAvailabilityChange = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
  }

  const handleUpdateAvailability = () => {
    toast.success('Availability updated successfully')
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
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-purple-600 to-purple-700 text-white p-4 z-50 transition-transform duration-300 w-64 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
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
              variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${currentPage === 'dashboard' ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('dashboard')
                setSidebarOpen(false)
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentPage === 'timetable' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${currentPage === 'timetable' ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('timetable')
                setSidebarOpen(false)
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              My Timetable
            </Button>
            <Button
              variant={currentPage === 'availability' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${currentPage === 'availability' ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('availability')
                setSidebarOpen(false)
              }}
            >
              <Clock className="h-4 w-4 mr-2" />
              My Availability
            </Button>
            <Button
              variant={currentPage === 'notifications' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${currentPage === 'notifications' ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('notifications')
                setSidebarOpen(false)
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button
              variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${currentPage === 'profile' ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('profile')
                setSidebarOpen(false)
              }}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </nav>

          <div className="mt-8 pt-4 border-t border-purple-400">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          {/* Top Navbar */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between p-4 max-w-full">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <PortalHeaderBrand
                  title="Faculty Portal"
                  subtitle={BRAND_NAME}
                  titleClassName="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.designation || user.email}</p>
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
          </div>

          {/* Dashboard Page */}
          {currentPage === 'dashboard' && (
            <div className="p-6 space-y-6">
              {/* Welcome Card */}
              <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-l-purple-600">
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
                    <div className="text-3xl font-bold text-purple-600">3</div>
                    <p className="text-xs text-gray-500 mt-1">Active courses</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Classes This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">12</div>
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
                                <div className="bg-purple-100 p-2 rounded text-xs">
                                  <div className="font-semibold text-purple-900">Data Structures</div>
                                  <div className="text-purple-700">Room 101</div>
                                </div>
                              )}
                              {time === '10:00-11:00' && (
                                <div className="bg-purple-100 p-2 rounded text-xs">
                                  <div className="font-semibold text-purple-900">Data Structures</div>
                                  <div className="text-purple-700">Room 101</div>
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

          {/* My Timetable Page */}
          {currentPage === 'timetable' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Timetable</h2>
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

          {/* My Availability Page */}
          {currentPage === 'availability' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Availability</h2>
                <p className="text-gray-500">Set your availability for the week</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Availability</CardTitle>
                  <CardDescription>Toggle your availability for each day</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(availability).map((day) => (
                    <div key={day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="font-medium text-gray-700">{day}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm ${availability[day] ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>
                          {availability[day] ? 'Available' : 'Not Available'}
                        </span>
                        <Switch
                          checked={availability[day]}
                          onCheckedChange={() => handleAvailabilityChange(day)}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={handleUpdateAvailability}
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                  >
                    Update Availability
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Page */}
          {currentPage === 'notifications' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                <p className="text-gray-500">Stay updated with your schedule</p>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Card key={notif.id} className="border-l-4" style={{
                    borderLeftColor: notif.type === 'success' ? '#10b981' : 
                                    notif.type === 'warning' ? '#f59e0b' : 
                                    notif.type === 'alert' ? '#ef4444' : '#6366f1'
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

          {/* Profile Page */}
          {currentPage === 'profile' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
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
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
