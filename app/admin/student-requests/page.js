'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast, Toaster } from 'sonner'
import { ArrowLeft, CheckCircle2, Users, Loader2 } from 'lucide-react'
import { BrandLogo, BrandLoadingScreen, PortalHeaderBrand } from '@/components/BrandLogo'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  selected: 'bg-teal-100 text-teal-800',
  error: 'bg-red-100 text-red-800'
}

export default function AdminStudentRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/student-requests', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setRequests(data.requests || [])
    } catch {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleApproveAll = async () => {
    const pending = requests.filter((r) => r.status === 'pending')
    if (!pending.length) {
      toast.info('No pending requests to approve')
      return
    }

    setApproving(true)
    toast.info(`Generating top 5 timetables for ${pending.length} student(s)...`)
    try {
      const res = await fetch('/api/admin/student-requests/approve', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Approval failed')
        return
      }
      toast.success(data.message || 'Done!')
      await loadRequests()
    } catch {
      toast.error('Approval failed')
    } finally {
      setApproving(false)
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Toaster />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <BrandLogo size={72} priority />
            <div>
              <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mb-1">
                <ArrowLeft className="h-4 w-4" /> Admin Dashboard
              </Link>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                Student Constraint Requests
              </h1>
              <p className="text-muted-foreground mt-1">
                Approve requests → system generates top 5 timetables per student → student picks one
              </p>
            </div>
          </div>
          <Button
            onClick={handleApproveAll}
            disabled={approving || pendingCount === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {approving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve All ({pendingCount})
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <BrandLoadingScreen message="Loading requests..." className="py-16" />
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center text-muted-foreground">
              No student constraint requests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg">{req.studentName || 'Student'}</CardTitle>
                    <Badge className={STATUS_COLORS[req.status] || ''}>{req.status}</Badge>
                  </div>
                  <CardDescription>
                    {req.departmentName} · Semester {req.semester}
                    {req.studentEmail && ` · ${req.studentEmail}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Min break: {req.constraints?.minBreakTime ?? 10} min</p>
                  <p>
                    Soft: MW {req.constraints?.minimizeWalking ? '✓' : '✗'} · BW{' '}
                    {req.constraints?.balancedWorkload ? '✓' : '✗'} · Gaps{' '}
                    {req.constraints?.minimizeGaps ? '✓' : '✗'}
                  </p>
                  {req.error && <p className="text-red-600 mt-1">Error: {req.error}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
