'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { StudentPortalShell } from '@/components/student/StudentPortalShell'
import { studentTheme } from '@/components/student/student-theme'
import {
  ConstraintGuideIntro,
  MinBreakConstraint,
  SoftConstraintField,
  SOFT_CONSTRAINTS
} from '@/components/student/ConstraintHelp'

const DEFAULT_CONSTRAINTS = {
  minBreakTime: 10,
  balanceWorkload: true,
  minimizeWalking: true,
  walkingWeight: 80,
  balancedWorkload: true,
  workloadWeight: 90,
  preferredSlots: true,
  slotsWeight: 70,
  minimizeGaps: true,
  gapsWeight: 75
}

export default function StudentConstraintsPage() {
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS)
  const [request, setRequest] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/student/constraints', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.request?.constraints) setConstraints({ ...DEFAULT_CONSTRAINTS, ...data.request.constraints })
        setRequest(data.request)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/student/constraints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ constraints })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit')
        return
      }
      toast.success('Constraints saved! Admin will review your request.')
      setRequest(data.request)
    } catch {
      toast.error('Failed to submit constraints')
    } finally {
      setSubmitting(false)
    }
  }

  const statusLabel = {
    pending: 'Waiting for admin approval',
    approved: 'Approved — timetables generating',
    ready: 'Top 5 timetables ready — go pick one!',
    selected: 'Timetable selected'
  }

  return (
    <StudentPortalShell
      activeNav="constraints"
      title="Scheduling Preferences"
      subtitle="Configure how your personal timetable should be generated"
      breadcrumbs={['Home', 'Constraints']}
    >
      {request && (
        <Card className={`${studentTheme.card} mb-6 border-[#c9a227]/40 bg-[#c9a227]/5`}>
          <CardContent className="pt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#0c1f3f]">
              Request status:{' '}
              <span className="font-semibold capitalize">{statusLabel[request.status] || request.status}</span>
            </p>
            {request.status === 'ready' && (
              <Link href="/student/pick-timetable">
                <Button size="sm" className={studentTheme.accentBtn}>
                  Pick Timetable →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <Card className={studentTheme.card}>
        <CardHeader className={studentTheme.cardHeader}>
          <CardTitle className="font-serif text-xl text-[#0c1f3f]">Soft Constraints</CardTitle>
          <CardDescription>
            Hard constraints (no clashes, room capacity) are always enforced by the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <ConstraintGuideIntro />

          <MinBreakConstraint
            value={constraints.minBreakTime}
            onChange={(minBreakTime) => setConstraints((p) => ({ ...p, minBreakTime }))}
          />

          {SOFT_CONSTRAINTS.map((config) => (
            <SoftConstraintField
              key={config.key}
              config={config}
              constraints={constraints}
              onChange={setConstraints}
            />
          ))}

          <Button
            className={`w-full py-6 text-base ${studentTheme.primaryBtn}`}
            onClick={handleSubmit}
            disabled={submitting || request?.status === 'selected'}
          >
            {submitting ? 'Submitting...' : request ? 'Update & Resubmit to Admin' : 'Submit Constraints to Admin'}
          </Button>
        </CardContent>
      </Card>
    </StudentPortalShell>
  )
}
