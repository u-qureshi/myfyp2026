'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { AUTH_ROLES, authTheme } from '@/components/auth/auth-theme'

export function LoginForm({ expectedRole }) {
  const role = AUTH_ROLES[expectedRole]
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const emailPlaceholder =
    expectedRole === 'faculty'
      ? 'Full name or faculty email'
      : expectedRole === 'admin'
        ? 'admin@institution.edu'
        : 'student@university.edu'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Login failed'
        setError(errorMsg)
        toast.error(errorMsg)
        setLoading(false)
        return
      }

      if (!data.user?.role) {
        setError('Invalid response from server')
        toast.error('Invalid response from server')
        setLoading(false)
        return
      }

      if (data.user.role !== expectedRole) {
        const msg = `This account is registered as ${data.user.role}. Please use the correct portal.`
        setError(msg)
        toast.error(msg)
        setLoading(false)
        return
      }

      toast.success('Login successful! Redirecting...')
      await new Promise((r) => setTimeout(r, 400))
      window.location.replace(role.dashboardPath)
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during login'
      setError(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className={authTheme.label}>
            {expectedRole === 'faculty' ? 'Name or Email' : 'Email Address'}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="text"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              required
              disabled={loading}
              className={`pl-10 ${authTheme.input}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className={authTheme.label}>
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              required
              disabled={loading}
              className={`pl-10 pr-10 ${authTheme.input}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              disabled={loading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className={authTheme.primaryBtn} disabled={loading}>
          {loading ? 'Signing in...' : `Sign In as ${role.shortTitle}`}
        </Button>
      </form>

      {role.signupPath && (
        <p className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href={role.signupPath} className="font-semibold text-[#001a4d] hover:underline">
            Create {role.shortTitle.toLowerCase()} account
          </Link>
        </p>
      )}
    </>
  )
}
