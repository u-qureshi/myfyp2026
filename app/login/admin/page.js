'use client'

import { Toaster } from 'sonner'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'

export default function AdminLoginPage() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthShell
        title="Administrator Sign In"
        subtitle="Access the admin dashboard to manage schedules and resources."
        backHref="/login"
      >
        <LoginForm expectedRole="admin" />
      </AuthShell>
    </>
  )
}
