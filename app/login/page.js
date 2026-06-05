'use client'

import { Toaster } from 'sonner'
import { RoleSelectScreen } from '@/components/auth/RoleSelectScreen'

export default function LoginPage() {
  return (
    <>
      <Toaster position="top-right" />
      <RoleSelectScreen
        mode="login"
        roles={['admin', 'student', 'faculty']}
        footerLink={{
          prompt: 'New to the portal?',
          href: '/signup',
          label: 'Create an account'
        }}
      />
    </>
  )
}
