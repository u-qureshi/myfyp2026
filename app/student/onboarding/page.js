'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { StudentAuthShell } from '@/components/student/StudentPortalShell'
import { studentTheme } from '@/components/student/student-theme'

export default function StudentOnboardingPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [semester, setSemester] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/departments')
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || data || []))
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    if (!departmentId || !semester) {
      toast.error('Select department and semester')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ departmentId, departmentName, semester })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save profile')
        return
      }
      toast.success('Profile complete!')
      router.push('/student/constraints')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <StudentAuthShell
      title="Complete Your Profile"
      subtitle="Tell us your department and semester to personalize your portal"
      step={1}
      totalSteps={1}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Department / Program</Label>
          <Select
            value={departmentId}
            onValueChange={(id) => {
              const dept = departments.find((d) => d.id === id)
              setDepartmentId(id)
              setDepartmentName(dept?.name || '')
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Current Semester</Label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className={`w-full h-11 ${studentTheme.primaryBtn}`} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Continue to Constraints →'}
        </Button>
      </div>
    </StudentAuthShell>
  )
}
