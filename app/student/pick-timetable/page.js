'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, Calendar, Trophy } from 'lucide-react'
import {
  describeStudentConstraints,
  getScheduleForSection,
  getSectionsFromTimetableData,
  STANDARD_TIMETABLE_TIME_SLOTS
} from '@/lib/timetable-helpers'
import { StudentPortalShell } from '@/components/student/StudentPortalShell'
import { studentTheme } from '@/components/student/student-theme'

export default function PickTimetablePage() {
  const router = useRouter()
  const [options, setOptions] = useState([])
  const [request, setRequest] = useState(null)
  const [selected, setSelected] = useState(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/student/timetable-options', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setOptions(data.options || [])
        setRequest(data.request)
        setSelected(data.selected)
      })
      .catch(() => toast.error('Failed to load options'))
  }, [])

  const handleSelect = async (index) => {
    setSaving(true)
    try {
      const res = await fetch('/api/student/timetable-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ optionIndex: index })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save selection')
        return
      }
      toast.success('Your timetable has been saved!')
      setSelected(data.selected)
      router.push('/student/dashboard')
    } catch {
      toast.error('Failed to save selection')
    } finally {
      setSaving(false)
    }
  }

  const preview = options[previewIndex]
  const constraintSummary = request?.constraints
    ? describeStudentConstraints(request.constraints)
    : options[0]?.constraintSummary || options[0]?.description || null
  const timetableData = preview?.timetable
  const sections = getSectionsFromTimetableData(timetableData)
  const sectionId = sections[0]?.id
  const schedule = sectionId ? getScheduleForSection(timetableData, sectionId) : timetableData?.schedule

  if (selected) {
    return (
      <StudentPortalShell
        activeNav="pick"
        title="Timetable Selected"
        subtitle="Your schedule has been confirmed"
        breadcrumbs={['Home', 'Pick Timetable']}
      >
        <Card className={`${studentTheme.card} max-w-lg mx-auto text-center`}>
          <CardContent className="pt-10 pb-10">
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-semibold text-[#0c1f3f]">Timetable Confirmed</h2>
            <p className="text-slate-500 mt-2">Your selection has been saved to your student record.</p>
            <Button className={`mt-6 ${studentTheme.primaryBtn}`} onClick={() => router.push('/student/dashboard')}>
              View My Timetable
            </Button>
          </CardContent>
        </Card>
      </StudentPortalShell>
    )
  }

  if (!options.length) {
    return (
      <StudentPortalShell
        activeNav="pick"
        title="Pick Timetable"
        subtitle="Select your preferred schedule from admin-generated options"
        breadcrumbs={['Home', 'Pick Timetable']}
      >
        <Card className={`${studentTheme.card} max-w-lg mx-auto`}>
          <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
            <Calendar className="h-14 w-14 mx-auto mb-4 text-[#0c1f3f]/30" />
            <p className="font-medium text-[#0c1f3f]">No timetable options yet</p>
            <p className="text-sm mt-2">
              Submit your constraints first — admin will approve and generate top 5 options.
            </p>
            <Button className={`mt-6 ${studentTheme.primaryBtn}`} onClick={() => router.push('/student/constraints')}>
              Set Constraints
            </Button>
          </CardContent>
        </Card>
      </StudentPortalShell>
    )
  }

  return (
    <StudentPortalShell
      activeNav="pick"
      title="Pick Your Timetable"
      subtitle="Choose one of five schedules built from your constraint preferences"
      breadcrumbs={['Home', 'Pick Timetable']}
      maxWidth="max-w-6xl"
    >
      {constraintSummary && (
        <Card className={`${studentTheme.card} mb-6 border-[#c9a227]/30 bg-[#c9a227]/5`}>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8a6d12]">Your constraints</p>
            <p className="text-sm text-[#0c1f3f] mt-2 leading-relaxed">{constraintSummary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {options.map((opt, i) => (
          <Card
            key={opt.scenarioId || i}
            className={`${studentTheme.card} cursor-pointer transition-all ${
              previewIndex === i ? 'ring-2 ring-[#c9a227] shadow-md' : 'hover:shadow-md'
            }`}
            onClick={() => setPreviewIndex(i)}
          >
            <CardHeader className="pb-2">
              <Badge className={studentTheme.badgeGold}>Option #{opt.rank || i + 1}</Badge>
              <CardTitle className="text-sm font-serif text-[#0c1f3f]">{opt.scenarioName}</CardTitle>
              <CardDescription className="text-xs">{opt.shortLabel}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-1.5 text-slate-600">
              <p className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-[#c9a227]" />
                Score: {opt.score ?? 0}%
              </p>
              <p>Classes: {opt.timetable?.summary?.totalSlots ?? 0}</p>
              <p>Hard rules: {(opt.hardViolationCount ?? 0) === 0 ? 'Passed' : opt.hardViolationCount}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {preview && schedule && (
        <Card className={`${studentTheme.card} mb-6`}>
          <CardHeader className={studentTheme.cardHeader}>
            <CardTitle className="font-serif text-[#0c1f3f]">Preview — {preview.scenarioName}</CardTitle>
            <CardDescription>Score {preview.score ?? 0}% · Same constraints as above</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0c1f3f] text-white">
                  <th className="border border-[#1a3a6b] p-2.5 text-left font-medium">Time</th>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
                    <th key={d} className="border border-[#1a3a6b] p-2.5 font-medium">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STANDARD_TIMETABLE_TIME_SLOTS.map((slot) => (
                  <tr key={slot.label} className="even:bg-slate-50">
                    <td className="border border-slate-200 p-2 font-medium whitespace-nowrap bg-slate-100 text-[#0c1f3f]">
                      {slot.label}
                    </td>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                      const entry = schedule?.[day]?.[slot.label]?.[0]
                      return (
                        <td key={day} className="border border-slate-200 p-1.5 align-top min-w-[110px]">
                          {entry && (
                            <div className="rounded-md border border-[#c9a227]/20 bg-[#c9a227]/10 p-2">
                              <p className="font-semibold text-[#0c1f3f]">{entry.courseName}</p>
                              <p className="text-slate-600 mt-0.5">{entry.faculty}</p>
                              <p className="text-slate-400">{entry.room}</p>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Button
        size="lg"
        className={`w-full py-6 text-base ${studentTheme.accentBtn}`}
        disabled={saving}
        onClick={() => handleSelect(previewIndex)}
      >
        {saving ? 'Saving selection...' : `Confirm Option #${previewIndex + 1} as My Timetable`}
      </Button>
    </StudentPortalShell>
  )
}
