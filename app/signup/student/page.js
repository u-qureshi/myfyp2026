'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast, Toaster } from 'sonner'
import { AuthShell } from '@/components/auth/AuthShell'
import { authTheme } from '@/components/auth/auth-theme'

export default function StudentSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    departmentId: '',
    departmentName: '',
    semester: ''
  })

  useEffect(() => {
    fetch('/api/admin/departments')
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || data || []))
      .catch(() => toast.error('Failed to load departments'))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1) {
      if (!form.name || !form.email || !form.password) {
        toast.error('Please fill all account fields')
        return
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      setStep(2)
      return
    }

    if (!form.departmentId || !form.semester) {
      toast.error('Please select department and semester')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Signup failed')
        return
      }
      toast.success('Account created! Welcome to the portal.')
      router.push('/student/dashboard')
    } catch {
      toast.error('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <AuthShell
        title="Student Registration"
        subtitle={step === 1 ? 'Create your university account' : 'Tell us about your academic program'}
        backHref="/signup"
        backLabel="Back to registration options"
        wide
        step={step}
        totalSteps={2}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className={authTheme.label}>Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="As on university record"
                  required
                  className={authTheme.input}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={authTheme.label}>University Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="student@university.edu"
                  required
                  className={authTheme.input}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className={authTheme.label}>Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                  className={authTheme.input}
                />
              </div>
              <Button type="submit" className={authTheme.primaryBtn}>
                Continue to Academic Info →
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className={authTheme.label}>Department / Program</Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(id) => {
                    const dept = departments.find((d) => d.id === id)
                    setForm({ ...form, departmentId: id, departmentName: dept?.name || '' })
                  }}
                >
                  <SelectTrigger className={authTheme.input}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={authTheme.label}>Current Semester</Label>
                <Select value={form.semester} onValueChange={(sem) => setForm({ ...form, semester: sem })}>
                  <SelectTrigger className={authTheme.input}>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={String(sem)}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className={`flex-1 ${authTheme.accentBtn}`} disabled={loading}>
                  {loading ? 'Creating account...' : 'Complete Registration'}
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link href="/login/student" className="font-semibold text-[#001a4d] hover:underline">
            Sign in to student portal
          </Link>
        </p>
      </AuthShell>
    </>
  )
}
