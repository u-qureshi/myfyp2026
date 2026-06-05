'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  flattenSectionSchedule,
  getScheduleForSection,
  getSectionsFromTimetableData,
  STANDARD_TIMETABLE_TIME_SLOTS
} from '@/lib/timetable-helpers'
import { StudentPortalShell } from '@/components/student/StudentPortalShell'
import { studentTheme } from '@/components/student/student-theme'
import { BrandLoadingScreen } from '@/components/BrandLogo'
import {
  Calendar, Bell, Download, Clock,
  MapPin, Users, AlertCircle, CheckCircle, Info, Zap,
  Star, Settings2
} from 'lucide-react'

const PAGE_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Academic overview & quick actions', crumbs: ['Home', 'Dashboard'] },
  timetable: { title: 'My Timetable', subtitle: 'Weekly class schedule', crumbs: ['Home', 'Timetable'] },
  notifications: { title: 'Notifications', subtitle: 'Updates and announcements', crumbs: ['Home', 'Notifications'] },
  profile: { title: 'My Profile', subtitle: 'Student record & preferences', crumbs: ['Home', 'Profile'] }
}

export default function StudentDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsState, setNotificationsState] = useState({
    email: true,
    timetable: true,
    alerts: true
  })
  const [phone, setPhone] = useState('')
  const [portalRequest, setPortalRequest] = useState(null)
  const [portalProfile, setPortalProfile] = useState(null)
  const [publishedPayload, setPublishedPayload] = useState(null)
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [notificationsData, setNotificationsData] = useState([])
  const [hasSelectedTimetable, setHasSelectedTimetable] = useState(false)

  const availableSections = useMemo(
    () => getSectionsFromTimetableData(publishedPayload?.timetableData || publishedPayload),
    [publishedPayload]
  )

  const mySectionSchedule = useMemo(() => {
    const timetableData = publishedPayload?.timetableData || publishedPayload
    if (!timetableData || !selectedSectionId) return null
    return getScheduleForSection(timetableData, selectedSectionId)
  }, [publishedPayload, selectedSectionId])

  const myClasses = useMemo(
    () => flattenSectionSchedule(mySectionSchedule),
    [mySectionSchedule]
  )

  const selectedSection = availableSections.find(
    (section) => String(section.id) === String(selectedSectionId)
  )

  const nextClass = myClasses[0] || null

  const uniqueCourses = useMemo(
    () => new Set(myClasses.map((item) => item.courseName).filter(Boolean)).size,
    [myClasses]
  )

  const todayName = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    []
  )

  const classesToday = useMemo(
    () => myClasses.filter((item) => item.day === todayName),
    [myClasses, todayName]
  )

  const portalAnnouncements = useMemo(
    () => notificationsData.filter((n) => n.unread).slice(0, 3),
    [notificationsData]
  )

  const loadPortalData = () => {
    fetch('/api/student/profile', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setPortalProfile(data.profile)
        if (!data.profile?.profileComplete) {
          window.location.href = '/student/onboarding'
        }
      })
      .catch(() => {})

    fetch('/api/student/timetable-options', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setPortalRequest(data.request)
        if (data.selected?.timetable) {
          setHasSelectedTimetable(true)
          setPublishedPayload({ timetableData: data.selected.timetable })
        } else {
          setHasSelectedTimetable(false)
          setPublishedPayload(null)
        }
      })
      .catch(() => {})

    fetch('/api/student/notifications', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotificationsData(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (!user) return
    loadPortalData()
  }, [user])

  useEffect(() => {
    if (!availableSections.length) return

    const savedSectionId = localStorage.getItem('studentSectionId')
    if (savedSectionId && availableSections.some((section) => String(section.id) === savedSectionId)) {
      setSelectedSectionId(savedSectionId)
      return
    }

    const matchedByName = user?.name
      ? availableSections.find((section) =>
          String(section.name).toLowerCase().includes(String(user.name).toLowerCase())
        )
      : null

    setSelectedSectionId(matchedByName?.id || availableSections[0].id)
  }, [availableSections, user])

  useEffect(() => {
    if (selectedSectionId) {
      localStorage.setItem('studentSectionId', String(selectedSectionId))
    }
  }, [selectedSectionId])

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (['timetable', 'notifications', 'profile'].includes(hash)) {
        setCurrentPage(hash)
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  const goToPage = (page) => {
    setCurrentPage(page)
    if (page === 'dashboard') {
      window.history.replaceState(null, '', '/student/dashboard')
    } else {
      window.location.hash = page
    }
  }

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

  const handleMarkAsRead = async (id) => {
    setNotificationsData(
      notificationsData.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
    setUnreadCount(Math.max(0, unreadCount - 1))

    try {
      await fetch('/api/student/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
    } catch {
      /* portal-only notifications need no server update */
    }
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
      <BrandLoadingScreen
        message="Loading your portal..."
        className={`min-h-screen ${studentTheme.page}`}
      />
    )
  }

  if (!user) return null

  const meta = PAGE_META[currentPage] || PAGE_META.dashboard

  return (
    <StudentPortalShell
      user={user}
      loading={false}
      activeNav={currentPage}
      unreadCount={unreadCount}
      onLogout={handleLogout}
      title={meta.title}
      subtitle={meta.subtitle}
      breadcrumbs={meta.crumbs}
    >
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <Card className={`${studentTheme.card} border-l-4 border-l-[#c9a227] overflow-hidden`}>
                <CardHeader className="bg-gradient-to-r from-[#0c1f3f] to-[#1a3a6b] text-white">
                  <CardTitle className="font-serif text-2xl md:text-3xl font-semibold">
                    Welcome, {user.name}
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-base mt-2">
                    {portalProfile?.departmentName || user.department_name || 'Department'} · Semester{' '}
                    {portalProfile?.semester || user.semester || '—'}
                  </CardDescription>
                </CardHeader>
              </Card>

              {!portalRequest && (
                <Card className="border-[#c9a227]/30 bg-[#c9a227]/5">
                  <CardContent className="pt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#0c1f3f]">
                      Abhi tak constraints submit nahi ki. Pehle apni preferences choose karein.
                    </p>
                    <Button size="sm" className="bg-[#0c1f3f]" onClick={() => (window.location.href = '/student/constraints')}>
                      Set Constraints →
                    </Button>
                  </CardContent>
                </Card>
              )}

              {portalRequest && (
                <Card className="border-[#0c1f3f]/20">
                  <CardContent className="pt-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm">
                      Timetable request: <strong>{portalRequest.status}</strong>
                    </p>
                    {portalRequest.status === 'pending' && (
                      <p className="text-xs text-muted-foreground">Waiting for admin approval</p>
                    )}
                    {portalRequest.status === 'ready' && (
                      <Button size="sm" className="bg-[#0c1f3f]" onClick={() => (window.location.href = '/student/pick-timetable')}>
                        Pick Your Timetable →
                      </Button>
                    )}
                    {portalRequest.status === 'selected' && (
                      <Button size="sm" variant="outline" onClick={() => goToPage('timetable')}>
                        View Saved Timetable
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className={`${studentTheme.card} hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={studentTheme.statValue}>
                      {hasSelectedTimetable ? uniqueCourses : '—'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {hasSelectedTimetable ? 'This semester' : 'Timetable not selected yet'}
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${studentTheme.card} hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Classes This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={studentTheme.statValue}>
                      {hasSelectedTimetable ? myClasses.length : '—'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total classes</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Classes Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                      {hasSelectedTimetable ? classesToday.length : '—'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{todayName}</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                      {unreadCount}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Unread</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Timetable */}
                <div className="lg:col-span-2">
                  <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0c1f3f]/5 to-[#c9a227]/5 border-b">
                      <div>
                        <CardTitle>My Timetable</CardTitle>
                        <CardDescription>Your weekly schedule</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#0c1f3f] hover:bg-[#152d57] text-white"
                        onClick={handleDownloadTimetable}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {myClasses.length > 0 ? myClasses.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-[#c9a227]/40 hover:shadow-md transition">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-[#c9a227]/15 text-[#0c1f3f] border-[#c9a227]/30 font-medium">{item.day}</Badge>
                                <span className="text-sm font-medium text-gray-900">{item.timeSlot}</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 mt-1">{item.courseName}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-[#0c1f3f]" /> {item.room}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-purple-600" /> {item.faculty}
                                </span>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 space-y-3">
                            <p className="text-sm text-gray-500">
                              {!portalRequest
                                ? 'Pehle constraints submit karein, phir admin approve karega.'
                                : portalRequest.status === 'pending'
                                  ? 'Admin approval ka wait ho raha hai.'
                                  : portalRequest.status === 'ready'
                                    ? 'Top 5 options ready hain — ab timetable choose karein.'
                                    : 'Abhi koi timetable save nahi hui.'}
                            </p>
                            {!portalRequest && (
                              <Button size="sm" variant="outline" onClick={() => (window.location.href = '/student/constraints')}>
                                Go to Constraints
                              </Button>
                            )}
                            {portalRequest?.status === 'ready' && (
                              <Button size="sm" className="bg-[#0c1f3f]" onClick={() => (window.location.href = '/student/pick-timetable')}>
                                Pick Timetable
                              </Button>
                            )}
                          </div>
                        )}
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
                      {portalAnnouncements.length > 0 ? portalAnnouncements.map((ann) => (
                        <div key={ann.id} className="p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded hover:bg-yellow-100 transition">
                          <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{ann.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{ann.time}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500 text-center py-4">No new updates</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* My Timetable Page */}
          {currentPage === 'timetable' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-sm text-slate-500">
                  {selectedSection
                    ? `${selectedSection.name} · ${myClasses.length} classes this week`
                    : 'Your complete weekly schedule'}
                </p>
                {availableSections.length > 1 && (
                  <Select value={String(selectedSectionId || '')} onValueChange={setSelectedSectionId}>
                    <SelectTrigger className="w-full md:w-56">
                      <SelectValue placeholder="Select your section" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((section) => (
                        <SelectItem key={section.id} value={String(section.id)}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {!hasSelectedTimetable && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="py-4 text-sm text-yellow-900 space-y-3">
                    <p>
                      {!portalRequest
                        ? 'Abhi koi timetable nahi. Pehle constraints submit karein.'
                        : portalRequest.status === 'pending'
                          ? 'Admin ne abhi approve nahi kiya. Options generate hone ka wait karein.'
                          : portalRequest.status === 'ready'
                            ? 'Admin ne options generate kar di hain. Ab apni pasand ki timetable choose karein.'
                            : 'Aapki saved timetable yahan show hogi jab admin process complete ho jaye.'}
                    </p>
                    {portalRequest?.status === 'ready' && (
                      <Button size="sm" className="bg-[#0c1f3f]" onClick={() => (window.location.href = '/student/pick-timetable')}>
                        Pick Timetable
                      </Button>
                    )}
                    {!portalRequest && (
                      <Button size="sm" variant="outline" onClick={() => (window.location.href = '/student/constraints')}>
                        Set Constraints
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {hasSelectedTimetable && nextClass && (
              <Card className="border-l-4 border-l-teal-600 bg-gradient-to-r from-[#0c1f3f]/5 to-[#c9a227]/5 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Upcoming Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{nextClass.courseName}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-white rounded-lg border border-[#0c1f3f]/20">
                        <p className="text-gray-500 text-xs font-medium">Time</p>
                        <p className="font-bold text-gray-900 mt-1 flex items-center gap-1">
                          <Clock className="h-4 w-4 text-[#0c1f3f]" /> {nextClass.day} · {nextClass.timeSlot}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#0c1f3f]/20">
                        <p className="text-gray-500 text-xs font-medium">Room</p>
                        <p className="font-bold text-gray-900 mt-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-[#0c1f3f]" /> {nextClass.room}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#0c1f3f]/20">
                        <p className="text-gray-500 text-xs font-medium">Teacher</p>
                        <p className="font-bold text-gray-900 mt-1 flex items-center gap-1">
                          <Users className="h-4 w-4 text-[#0c1f3f]" /> {nextClass.faculty}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

              <Button
                onClick={handleDownloadTimetable}
                className="bg-[#0c1f3f] hover:bg-[#152d57] text-white font-medium w-full sm:w-auto"
                disabled={!myClasses.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Full Timetable
              </Button>

              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#0c1f3f]/5 to-[#c9a227]/5 border-b">
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>Sirf aapki section ki classes</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {mySectionSchedule ? (
                    <>
                      <div className="grid grid-cols-6 border-b bg-gray-50">
                        <div className="p-3 font-medium text-sm">Time</div>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                          <div key={day} className="p-3 font-medium text-sm border-l">{day.slice(0, 3)}</div>
                        ))}
                      </div>
                      {STANDARD_TIMETABLE_TIME_SLOTS.map((timeSlot) => (
                        <div key={timeSlot.label} className="grid grid-cols-6 border-b">
                          <div className="p-3 text-xs font-medium bg-gray-50">{timeSlot.label}</div>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                            const entry = mySectionSchedule?.[day]?.[timeSlot.label]?.[0]
                            return (
                              <div key={day} className="p-2 border-l min-h-16">
                                {entry && (
                                  <div className="p-2 rounded text-xs bg-[#c9a227]/10 border border-[#c9a227]/20">
                                    <p className="font-semibold text-[#0c1f3f]">{entry.courseName}</p>
                                    <p className="mt-1">{entry.faculty}</p>
                                    <p className="text-muted-foreground">{entry.room}</p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No classes found for your section yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              {myClasses.length > 0 && (
              <Card className="shadow-md">
                <CardHeader className="border-b">
                  <CardTitle>Class List</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {myClasses.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#c9a227]/5 hover:border-[#c9a227]/40 transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="bg-[#c9a227]/10 text-[#0c1f3f] border-[#c9a227]/30 font-medium">
                              {item.day}
                            </Badge>
                            <span className="font-semibold text-gray-900">{item.timeSlot}</span>
                            <span className="text-gray-600">-</span>
                            <span className="font-semibold text-gray-900">{item.courseName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 ml-0 md:ml-24">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {item.room}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {item.faculty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )}
            </div>
          )}

          {/* Notifications Page */}
          {currentPage === 'notifications' && (
            <div className="space-y-6">
              <Card className={`${studentTheme.card} shadow-md`}>
                <CardHeader className="bg-gradient-to-r from-[#0c1f3f]/5 to-[#c9a227]/5 border-b">
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
            <div className="space-y-6 max-w-2xl">
              <Card className={studentTheme.card}>
                <CardHeader className="bg-gradient-to-r from-[#0c1f3f]/5 to-[#c9a227]/5 border-b">
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
                      <Input
                        id="studentId"
                        value={user.id ? user.id.slice(0, 8).toUpperCase() : '—'}
                        disabled
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="font-semibold">Department</Label>
                      <Input
                        id="department"
                        value={portalProfile?.departmentName || user.department_name || '—'}
                        disabled
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester" className="font-semibold">Semester</Label>
                      <Input
                        id="semester"
                        value={portalProfile?.semester ? `Semester ${portalProfile.semester}` : '—'}
                        disabled
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="section" className="font-semibold">Section</Label>
                      <Input
                        id="section"
                        value={selectedSection?.name || '—'}
                        disabled
                        className="bg-gray-50 border-gray-300"
                      />
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
              <Card className={studentTheme.card}>
                <CardHeader className={`${studentTheme.cardHeader}`}>
                  <CardTitle className="font-serif text-[#0c1f3f]">Notification Preferences</CardTitle>
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
                className={`w-full py-6 font-semibold ${studentTheme.primaryBtn}`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          )}
    </StudentPortalShell>
  )
}
