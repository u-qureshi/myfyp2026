'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast, Toaster } from 'sonner'
import {
  LogOut, Calendar, Bell, User, Menu, X, Download, Clock,
  MapPin, Users, BookOpen, AlertCircle, CheckCircle, Info, Zap,
  ArrowRight, Star
} from 'lucide-react'

export default function StudentDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(2)
  const [notificationsState, setNotificationsState] = useState({
    email: true,
    timetable: true,
    alerts: true
  })
  const [phone, setPhone] = useState('')
  const [notificationsData, setNotificationsData] = useState([
    { id: 1, title: 'Timetable Generated Successfully', message: 'BSCS Semester 7 timetable with zero conflicts', time: '2 hours ago', unread: true, type: 'success' },
    { id: 2, title: 'Room Change Alert', message: 'Database Systems moved from Room 101 to Lab 201', time: '5 hours ago', unread: true, type: 'warning' },
    { id: 3, title: 'Faculty Availability Updated', message: 'Dr. Ahmed Khan updated availability', time: '1 day ago', unread: false, type: 'info' },
    { id: 4, title: 'Emergency Update', message: 'Dr. Sarah Ali unavailable tomorrow, reschedule required', time: '1 day ago', unread: false, type: 'alert' },
    { id: 5, title: 'Timetable Published', message: 'Fall 2025 timetable published to all students', time: '2 days ago', unread: false, type: 'success' }
  ])

  // Sample timetable data
  const timetableData = [
    { day: 'Monday', time: '09:00-10:00', subject: 'Data Structures', room: 'Room 101', teacher: 'Dr. Ahmed', block: 'A' },
    { day: 'Monday', time: '10:00-11:00', subject: 'Data Structures', room: 'Room 101', teacher: 'Dr. Ahmed', block: 'A' },
    { day: 'Tuesday', time: '09:00-10:00', subject: 'AI & ML', room: 'Room 401', teacher: 'Dr. Shah', block: 'C' },
    { day: 'Thursday', time: '10:00-11:00', subject: 'Database Systems', room: 'Room 205', teacher: 'Ms. Ali', block: 'B' },
    { day: 'Friday', time: '11:00-12:00', subject: 'Software Engineering', room: 'Room 102', teacher: 'Mr. Ahmed', block: 'A' }
  ]

  // Sample announcements
  const announcements = [
    { id: 1, title: 'Timetable Updated', message: 'Room change for Database Systems - Now in Lab 201', time: '2 hours ago', type: 'warning' },
    { id: 2, title: 'Class Rescheduled', message: 'AI & ML class moved to 2:00 PM', time: '1 day ago', type: 'info' }
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

  const handleDownloadTimetable = () => {
    toast.success('Timetable downloaded')
  }

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully')
  }

  const handleMarkAsRead = (id) => {
    setNotificationsData(notificationsData.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ))
    setUnreadCount(Math.max(0, unreadCount - 1))
    toast.success('Marked as read')
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'alert':
        return <Zap className="h-5 w-5 text-red-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-600 to-purple-600 mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold">SS</span>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
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
        <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-teal-600 via-purple-600 to-purple-700 text-white p-6 z-50 transition-transform duration-300 w-64 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-teal-600 font-bold">SS</span>
              </div>
              <div>
                <span className="font-bold text-sm block">SmartScheduler</span>
                <span className="text-xs text-teal-100">Student</span>
              </div>
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
              variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
              className={`w-full justify-start font-medium ${currentPage === 'dashboard' ? 'bg-white text-teal-600 shadow-md' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('dashboard')
                setSidebarOpen(false)
              }}
            >
              <Calendar className="h-4 w-4 mr-3" />
              Dashboard
            </Button>
            <Button
              variant={currentPage === 'timetable' ? 'secondary' : 'ghost'}
              className={`w-full justify-start font-medium ${currentPage === 'timetable' ? 'bg-white text-teal-600 shadow-md' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('timetable')
                setSidebarOpen(false)
              }}
            >
              <Calendar className="h-4 w-4 mr-3" />
              My Timetable
            </Button>
            <Button
              variant={currentPage === 'notifications' ? 'secondary' : 'ghost'}
              className={`w-full justify-start font-medium ${currentPage === 'notifications' ? 'bg-white text-teal-600 shadow-md' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('notifications')
                setSidebarOpen(false)
              }}
            >
              <Bell className="h-4 w-4 mr-3" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
              className={`w-full justify-start font-medium ${currentPage === 'profile' ? 'bg-white text-teal-600 shadow-md' : 'text-white hover:bg-purple-500'}`}
              onClick={() => {
                setCurrentPage('profile')
                setSidebarOpen(false)
              }}
            >
              <User className="h-4 w-4 mr-3" />
              Profile
            </Button>
          </nav>

          <div className="mt-auto pt-8 border-t border-purple-400">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          {/* Top Navbar */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">Student Portal</h1>
                  <p className="text-sm text-gray-500">SmartScheduler</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
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
            <div className="p-4 md:p-6 space-y-6">
              {/* Welcome Card */}
              <Card className="border-0 shadow-md bg-gradient-to-r from-teal-50 via-purple-50 to-purple-100 border-l-4 border-l-teal-600 overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900">Welcome, {user.name}! 👋</CardTitle>
                      <CardDescription className="text-base mt-2">BSCS Semester 7 - Section A • Fall 2025</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">7</div>
                    <p className="text-xs text-gray-500 mt-1">This semester</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Classes This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">28</div>
                    <p className="text-xs text-gray-500 mt-1">Total classes</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Classes Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">6</div>
                    <p className="text-xs text-gray-500 mt-1">Upcoming</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">3</div>
                    <p className="text-xs text-gray-500 mt-1">Unread</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Timetable */}
                <div className="lg:col-span-2">
                  <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-teal-50 to-purple-50 border-b">
                      <div>
                        <CardTitle>My Timetable</CardTitle>
                        <CardDescription>Your weekly schedule</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={handleDownloadTimetable}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {timetableData.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-teal-100 text-teal-800 font-medium">{item.day}</Badge>
                                <span className="text-sm font-medium text-gray-900">{item.time}</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 mt-1">{item.subject}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-teal-600" /> {item.room}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-purple-600" /> {item.teacher}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Announcements */}
                <div>
                  <Card className="shadow-md">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                      <CardTitle className="text-lg">Announcements</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {announcements.length > 0 ? announcements.map((ann) => (
                        <div key={ann.id} className="p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded hover:bg-yellow-100 transition">
                          <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{ann.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{ann.time}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500 text-center py-4">No announcements</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* My Timetable Page */}
          {currentPage === 'timetable' && (
            <div className="p-4 md:p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Timetable</h2>
                <p className="text-gray-500">Your complete weekly schedule</p>
              </div>

              {/* Next Class */}
              <Card className="border-l-4 border-l-teal-600 bg-gradient-to-r from-teal-50 to-purple-50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Next Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">Object Oriented Programming</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-white rounded-lg border border-teal-200">
                        <p className="text-gray-500 text-xs font-medium">Time</p>
                        <p className="font-bold text-gray-900 mt-1 flex items-center gap-1">
                          <Clock className="h-4 w-4 text-teal-600" /> 8:00 - 9:00 AM
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-teal-200">
                        <p className="text-gray-500 text-xs font-medium">Room</p>
                        <p className="font-bold text-gray-900 mt-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-teal-600" /> R301, Block A
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-teal-200">
                        <p className="text-gray-500 text-xs font-medium">Teacher</p>
                        <p className="font-bold text-gray-900 mt-1 flex items-center gap-1">
                          <Users className="h-4 w-4 text-teal-600" /> Dr. Muhammad Khan
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Download Button */}
              <Button
                onClick={handleDownloadTimetable}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Full Timetable
              </Button>

              {/* Weekly Schedule */}
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-purple-50 border-b">
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>All your classes for the week</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {timetableData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-teal-50 hover:border-teal-300 transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-medium">
                              {item.day}
                            </Badge>
                            <span className="font-semibold text-gray-900">{item.time}</span>
                            <span className="text-gray-600">-</span>
                            <span className="font-semibold text-gray-900">{item.subject}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 ml-0 md:ml-24">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {item.room}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {item.teacher}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Page */}
          {currentPage === 'notifications' && (
            <div className="p-4 md:p-6 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                <p className="text-gray-500">Stay updated with important announcements</p>
              </div>

              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-purple-50 border-b">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full justify-start bg-white">
                      <TabsTrigger value="all" className="font-medium">All</TabsTrigger>
                      <TabsTrigger value="unread" className="font-medium">
                        Unread
                        {unreadCount > 0 && (
                          <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="important" className="font-medium">Important</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-3 mt-4">
                      {notificationsData.length > 0 ? notificationsData.map((notif) => (
                        <div key={notif.id} className="p-4 border-l-4 bg-gray-50 rounded-lg hover:shadow-md transition flex items-start justify-between" style={{
                          borderLeftColor: notif.type === 'success' ? '#10b981' : 
                                          notif.type === 'warning' ? '#f59e0b' : 
                                          notif.type === 'alert' ? '#ef4444' : '#3b82f6'
                        }}>
                          <div className="flex items-start gap-3 flex-1">
                            {getNotificationIcon(notif.type)}
                            <div>
                              <p className="font-semibold text-gray-900">{notif.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <p className="text-xs text-gray-400">{notif.time}</p>
                                {notif.unread && <Badge className="bg-red-100 text-red-800 text-xs font-medium">Unread</Badge>}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notif.id)} className="ml-2 whitespace-nowrap">
                            {notif.unread ? 'Mark as read' : 'Read'}
                          </Button>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-8">No notifications</p>
                      )}
                    </TabsContent>

                    <TabsContent value="unread" className="space-y-3 mt-4">
                      {notificationsData.filter(n => n.unread).length > 0 ? notificationsData.filter(n => n.unread).map((notif) => (
                        <div key={notif.id} className="p-4 border-l-4 bg-gray-50 rounded-lg hover:shadow-md transition flex items-start justify-between" style={{
                          borderLeftColor: notif.type === 'success' ? '#10b981' : 
                                          notif.type === 'warning' ? '#f59e0b' : 
                                          notif.type === 'alert' ? '#ef4444' : '#3b82f6'
                        }}>
                          <div className="flex items-start gap-3 flex-1">
                            {getNotificationIcon(notif.type)}
                            <div>
                              <p className="font-semibold text-gray-900">{notif.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notif.id)} className="ml-2 whitespace-nowrap">
                            Mark as read
                          </Button>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-8">No unread notifications</p>
                      )}
                    </TabsContent>

                    <TabsContent value="important" className="space-y-3 mt-4">
                      {notificationsData.filter(n => ['warning', 'alert'].includes(n.type)).length > 0 ? notificationsData.filter(n => ['warning', 'alert'].includes(n.type)).map((notif) => (
                        <div key={notif.id} className="p-4 border-l-4 bg-gray-50 rounded-lg hover:shadow-md transition flex items-start justify-between" style={{
                          borderLeftColor: notif.type === 'warning' ? '#f59e0b' : '#ef4444'
                        }}>
                          <div className="flex items-start gap-3 flex-1">
                            {getNotificationIcon(notif.type)}
                            <div>
                              <p className="font-semibold text-gray-900">{notif.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notif.id)} className="ml-2 whitespace-nowrap">
                            Mark as read
                          </Button>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-8">No important notifications</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Profile Page */}
          {currentPage === 'profile' && (
            <div className="p-4 md:p-6 space-y-6 max-w-2xl">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
                <p className="text-gray-500">Manage your student information and preferences</p>
              </div>

              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-purple-50 border-b">
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-semibold">Full Name</Label>
                      <Input id="name" value={user.name} disabled className="bg-gray-50 border-gray-300" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-semibold">Email Address</Label>
                      <Input id="email" value={user.email} disabled className="bg-gray-50 border-gray-300" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="font-semibold">Student ID</Label>
                      <Input id="studentId" value="STD-2024-CS-142" disabled className="bg-gray-50 border-gray-300" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="font-semibold">Department</Label>
                      <Input id="department" value="Computer Science" disabled className="bg-gray-50 border-gray-300" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester" className="font-semibold">Semester</Label>
                      <Input id="semester" value="BSCS Semester 7" disabled className="bg-gray-50 border-gray-300" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="section" className="font-semibold">Section</Label>
                      <Input id="section" value="A" disabled className="bg-gray-50 border-gray-300" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+92 "
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 border-b">
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <span className="font-semibold text-gray-700">Email Notifications</span>
                      <p className="text-xs text-gray-500 mt-1">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notificationsState.email}
                      onCheckedChange={(val) => setNotificationsState({...notificationsState, email: val})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <span className="font-semibold text-gray-700">Timetable Updates</span>
                      <p className="text-xs text-gray-500 mt-1">Get notified about schedule changes</p>
                    </div>
                    <Switch
                      checked={notificationsState.timetable}
                      onCheckedChange={(val) => setNotificationsState({...notificationsState, timetable: val})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <span className="font-semibold text-gray-700">System Alerts</span>
                      <p className="text-xs text-gray-500 mt-1">Important system notifications</p>
                    </div>
                    <Switch
                      checked={notificationsState.alerts}
                      onCheckedChange={(val) => setNotificationsState({...notificationsState, alerts: val})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSaveProfile}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-6"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
