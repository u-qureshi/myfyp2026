'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, AlertTriangle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { BrandLoadingScreen } from '@/components/BrandLogo'
import { AdminPortalShell } from '@/components/admin/AdminPortalShell'
import { adminTheme } from '@/components/admin/admin-theme'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  selected: 'bg-teal-100 text-teal-800',
  error: 'bg-red-100 text-red-800',
  rejected: 'bg-rose-100 text-rose-800'
}

function canApproveRequest(req) {
  return (
    req.status === 'pending' ||
    req.status === 'error' ||
    (req.status === 'approved' && req.error)
  )
}

function canRejectRequest(req) {
  return req.status === 'pending' || req.status === 'error'
}

export default function AdminStudentRequestsPage() {
  const [adminName, setAdminName] = useState('Administrator')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvingAll, setApprovingAll] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

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
    fetch('/api/auth/check-session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.name) setAdminName(data.user.name)
      })
      .catch(() => {})

    loadRequests()
  }, [])

  const handleApproveOne = async (req) => {
    if (req.facultyReadiness && !req.facultyReadiness.canGenerate) {
      toast.error(
        `Faculty availability missing for ${req.departmentName} (Sem ${req.semester}).`,
        { duration: 6000 }
      )
      return
    }

    setActionId(req.id)
    try {
      const res = await fetch(`/api/admin/student-requests/${req.id}/approve`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Approval failed')
        return
      }
      if (data.result?.status === 'ready') {
        toast.success(data.message || 'Approved and timetables generated')
      } else {
        toast.error(data.result?.error || data.message || 'Generation failed')
      }
      await loadRequests()
    } catch {
      toast.error('Approval failed')
    } finally {
      setActionId(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return
    setRejecting(true)
    try {
      const res = await fetch(`/api/admin/student-requests/${rejectTarget.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Reject failed')
        return
      }
      toast.success(data.message || 'Request rejected')
      setRejectTarget(null)
      setRejectReason('')
      await loadRequests()
    } catch {
      toast.error('Reject failed')
    } finally {
      setRejecting(false)
    }
  }

  const handleApproveAll = async () => {
    const processable = requests.filter(canApproveRequest)
    if (!processable.length) {
      toast.info('No pending requests to approve')
      return
    }

    const blocked = processable.filter((r) => r.facultyReadiness && !r.facultyReadiness.canGenerate)
    if (blocked.length) {
      toast.error(
        `Faculty availability missing for ${blocked[0].departmentName} (Sem ${blocked[0].semester}). Complete Faculty Availability first.`,
        { duration: 6000 }
      )
      return
    }

    setApprovingAll(true)
    toast.info(`Generating top 5 timetables for ${processable.length} student(s)...`)
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
      setApprovingAll(false)
    }
  }

  const processableCount = requests.filter(canApproveRequest).length
  const blockedByFaculty = requests.filter(
    (r) => canApproveRequest(r) && r.facultyReadiness && !r.facultyReadiness.canGenerate
  )
  const blockedDeptSemesters = Array.from(
    new Map(
      blockedByFaculty.map((req) => [
        `${req.departmentId}-${req.semester}`,
        {
          key: `${req.departmentId}-${req.semester}`,
          departmentName: req.departmentName,
          semester: req.semester,
          readiness: req.facultyReadiness
        }
      ])
    ).values()
  )

  return (
    <AdminPortalShell
      title="Student Requests"
      subtitle="Approve or reject student constraint requests and generate timetable options"
      adminName={adminName}
      maxWidth="max-w-5xl mx-auto"
    >
      <div className="space-y-6">
        {blockedDeptSemesters.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-amber-900">Faculty availability required before approval</p>
                  <p className="text-amber-800">
                    Student timetables need faculty teaching hours. For each department/semester below, send
                    availability requests and wait for faculty to submit.
                  </p>
                  <ul className="text-amber-800 space-y-1">
                    {blockedDeptSemesters.map((item) => (
                      <li key={item.key}>
                        {item.departmentName} · Sem {item.semester}:{' '}
                        {item.readiness?.submitted ?? 0}/{item.readiness?.total ?? 0} faculty submitted
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/admin/faculty-requests"
                    className="inline-block font-medium text-amber-900 underline underline-offset-2"
                  >
                    Open Faculty Availability →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleApproveAll}
            disabled={approvingAll || processableCount === 0 || blockedDeptSemesters.length > 0}
            className={adminTheme.primaryBtn}
          >
            {approvingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve All ({processableCount})
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
            {requests.map((req) => {
              const isProcessing = actionId === req.id
              const facultyBlocked = req.facultyReadiness && !req.facultyReadiness.canGenerate
              const showApprove = canApproveRequest(req)
              const showReject = canRejectRequest(req)

              return (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-lg">{req.studentName || 'Student'}</CardTitle>
                      <Badge className={STATUS_COLORS[req.status] || ''}>{req.status}</Badge>
                    </div>
                    <CardDescription>
                      {req.departmentName} · Semester {req.semester}
                      {req.studentEmail && ` · ${req.studentEmail}`}
                      {req.facultyReadiness && showApprove && (
                        <>
                          {' · '}
                          Faculty: {req.facultyReadiness.submitted}/{req.facultyReadiness.total} submitted
                          {req.facultyReadiness.canGenerate ? ' ✓' : ' — availability needed'}
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Soft: MW {req.constraints?.minimizeWalking ? '✓' : '✗'} · BW{' '}
                      {req.constraints?.balancedWorkload ? '✓' : '✗'} · Gaps{' '}
                      {req.constraints?.minimizeGaps ? '✓' : '✗'}
                    </p>
                      {req.error && <p className="text-red-600 mt-1">Error: {req.error}</p>}
                      {req.rejectionReason && (
                        <p className="text-rose-600 mt-1">Rejection reason: {req.rejectionReason}</p>
                      )}
                    </div>

                    {(showApprove || showReject) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {showApprove && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveOne(req)}
                            disabled={isProcessing || rejecting || facultyBlocked}
                            className={adminTheme.primaryBtn}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Approve
                              </>
                            )}
                          </Button>
                        )}
                        {showReject && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectTarget(req)
                              setRejectReason('')
                            }}
                            disabled={isProcessing || rejecting}
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Reject
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject request</DialogTitle>
            <DialogDescription>
              {rejectTarget?.studentName || 'Student'} — {rejectTarget?.departmentName} · Sem{' '}
              {rejectTarget?.semester}. The student will be notified on their dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Constraints not feasible for this semester"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={rejecting}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={rejecting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {rejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Confirm Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPortalShell>
  )
}
