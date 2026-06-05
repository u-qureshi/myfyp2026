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

export default function FacultySignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    departmentId: '',
    departmentName: '',
    designation: ''
  })

  useEffect(() => {
    fetch('/api/admin/departments')
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || data || []))
      .catch(() => toast.error('Failed to load departments'))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.departmentId || !form.designation) {
      toast.error('Please fill all required fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/faculty-signup', {
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
      toast.success('Faculty account created successfully!')
      router.push('/faculty/dashboard')
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
        title="Faculty Registration"
        subtitle="Register as a faculty member to access your timetable portal."
        backHref="/signup"
        backLabel="Back to registration options"
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className={authTheme.label}>Full Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. John Smith"
              required
              className={authTheme.input}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className={authTheme.label}>Institutional Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="faculty@university.edu"
              required
              className={authTheme.input}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation" className={authTheme.label}>Designation</Label>
            <Input
              id="designation"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              placeholder="Assistant Professor"
              required
              className={authTheme.input}
            />
          </div>
          <div className="space-y-2">
            <Label className={authTheme.label}>Department</Label>
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
          <Button type="submit" className={authTheme.primaryBtn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Faculty Account'}
          </Button>
        </form>

        <p className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link href="/login/faculty" className="font-semibold text-[#001a4d] hover:underline">
            Sign in to faculty portal
          </Link>
        </p>
      </AuthShell>
    </>
  )
}
