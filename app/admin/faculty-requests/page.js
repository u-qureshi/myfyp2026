'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { BrandLoadingScreen } from '@/components/BrandLogo'
import { AdminPortalShell } from '@/components/admin/AdminPortalShell'
import { adminTheme } from '@/components/admin/admin-theme'

const STATUS_COLORS = {
  requested: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-green-100 text-green-800',
  approved: 'bg-blue-100 text-blue-800'
}

function formatAvailabilitySummary(availability) {
  if (!availability || !Object.keys(availability).length) return 'Not submitted yet'
  const days = Object.entries(availability)
    .filter(([, cfg]) => cfg?.enabled)
    .map(([day, cfg]) => `${day.slice(0, 3)} ${cfg.from}–${cfg.to}`)
  return days.length ? days.join(' · ') : 'No days enabled'
}

export default function AdminFacultyRequestsPage() {
  const [adminName, setAdminName] = useState('Administrator')
  const [requests, setRequests] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [semester, setSemester] = useState('1')
  const [departmentId, setDepartmentId] = useState('all')

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/faculty-requests', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setRequests(data.requests || [])
    } catch {
      toast.error('Failed to load faculty requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/auth/check-session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.name) setAdminName(data.user.name)
      })
      .catch(() => {})

    loadRequests()
    fetch('/api/admin/departments', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []))
      .catch(() => {})
  }, [])

  const handleSendRequests = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/admin/faculty-requests/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          semester: parseInt(semester, 10),
          departmentId: departmentId === 'all' ? null : departmentId
        })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to send requests')
        return
      }
      toast.success(data.message || 'Requests sent')
      await loadRequests()
    } catch {
      toast.error('Failed to send requests')
    } finally {
      setSending(false)
    }
  }

  const requestedCount = requests.filter((r) => r.status === 'requested').length
  const submittedCount = requests.filter((r) => r.status === 'submitted').length

  return (
    <AdminPortalShell
      title="Faculty Availability"
      subtitle="Request availability from faculty before generating timetables"
      adminName={adminName}
      maxWidth="max-w-5xl mx-auto"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Send availability request</CardTitle>
            <CardDescription>
              Faculty will be notified to submit which days and hours they are available to teach
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSendRequests} disabled={sending} className={adminTheme.primaryBtn}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Request from Faculty
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4 text-sm">
          <Badge variant="outline" className="text-yellow-800 border-yellow-300">
            Waiting: {requestedCount}
          </Badge>
          <Badge variant="outline" className="text-green-800 border-green-300">
            Submitted: {submittedCount}
          </Badge>
        </div>

        {loading ? (
          <BrandLoadingScreen message="Loading faculty requests..." className="py-16" />
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center text-muted-foreground">
              No faculty availability requests yet. Send a request above.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg">{req.facultyName || 'Faculty'}</CardTitle>
                    <Badge className={STATUS_COLORS[req.status] || ''}>{req.status}</Badge>
                  </div>
                  <CardDescription>
                    {req.departmentName} · Semester {req.semester}
                    {req.facultyEmail && ` · ${req.facultyEmail}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>{formatAvailabilitySummary(req.availability)}</p>
                  {req.submittedAt && (
                    <p className="text-xs mt-1">Submitted: {new Date(req.submittedAt).toLocaleString()}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminPortalShell>
  )
}
