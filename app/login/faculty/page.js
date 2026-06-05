'use client'

import { Toaster } from 'sonner'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'

export default function FacultyLoginPage() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthShell
        title="Faculty Sign In"
        subtitle="Access your timetable, availability settings, and notifications."
        backHref="/login"
      >
        <LoginForm expectedRole="faculty" />
      </AuthShell>
    </>
  )
}
