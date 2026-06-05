'use client'

import { Toaster } from 'sonner'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'

export default function StudentLoginPage() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthShell
        title="Student Sign In"
        subtitle="View your timetable, submit constraints, and manage your profile."
        backHref="/login"
      >
        <LoginForm expectedRole="student" />
      </AuthShell>
    </>
  )
}
