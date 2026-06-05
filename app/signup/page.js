'use client'

import { Toaster } from 'sonner'
import { RoleSelectScreen } from '@/components/auth/RoleSelectScreen'

export default function SignupPage() {
  return (
    <>
      <Toaster position="top-right" />
      <RoleSelectScreen
        mode="signup"
        roles={['student', 'faculty']}
        footerLink={{
          prompt: 'Already have an account?',
          href: '/login',
          label: 'Sign in'
        }}
      />
    </>
  )
}
