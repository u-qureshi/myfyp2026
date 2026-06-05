'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast, Toaster } from 'sonner'
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const demoCredentials = [
    {
      role: 'Admin',
      email: 'admin@smartscheduler.com',
      password: 'admin123'
    },
    {
      role: 'Faculty',
      email: 'faculty@smartscheduler.com',
      password: 'faculty123'
    },
    {
      role: 'Student',
      email: 'student@smartscheduler.com',
      password: 'student123'
    }
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Sending login request for:', email)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()
      console.log('API Response:', { status: response.status, data })

      if (!response.ok) {
        const errorMsg = data.error || 'Login failed'
        setError(errorMsg)
        toast.error(errorMsg)
        setLoading(false)
        return
      }

      // Check if we have user data with role
      if (!data.user || !data.user.role) {
        console.error('Invalid response format:', data)
        setError('Invalid response from server')
        toast.error('Invalid response from server')
        setLoading(false)
        return
      }

      const userRole = data.user.role
      console.log('Login successful! User role:', userRole)
      toast.success('Login successful! Redirecting...')

      // Determine redirect path based on role
      let redirectPath = '/'
      if (userRole === 'admin') {
        redirectPath = '/admin/dashboard'
      } else if (userRole === 'faculty') {
        redirectPath = '/faculty/dashboard'
      } else if (userRole === 'student') {
        redirectPath = '/student/dashboard'
      }

      console.log('Redirecting to:', redirectPath)

      // Wait a bit for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 300))

      // Use hard redirect with window.location.replace
      setTimeout(() => {
        if (userRole === 'admin') window.location.replace('/admin/dashboard')
        else if (userRole === 'faculty') window.location.replace('/faculty/dashboard')
        else if (userRole === 'student') window.location.replace('/student/dashboard')
      }, 500)
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg = err.message || 'An error occurred during login'
      setError(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  const fillDemoCredentials = (credentials) => {
    setEmail(credentials.email)
    setPassword(credentials.password)
    setError('')
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <Card className="border-2 border-purple-200 shadow-2xl">
            <CardHeader className="text-center pb-2">
              {/* Logo and Title */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
                </div>
                <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  SmartScheduler
                </span>
              </div>

              <CardTitle className="text-2xl font-bold text-gray-800">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      required
                      className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-semibold">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError('')
                      }}
                      required
                      className="pl-10 pr-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg transition-all shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillDemoCredentials(cred)}
                    className="w-full p-3 border-2 border-gray-200 hover:border-purple-300 rounded-lg transition-all hover:bg-purple-50 text-left"
                    disabled={loading}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-700">{cred.role}</p>
                        <p className="text-xs text-gray-500">{cred.email}</p>
                      </div>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {cred.password}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  © 2025 SmartScheduler.AI • All rights reserved
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🎓',
                title: 'For Educators',
                desc: 'Manage schedules efficiently'
              },
              {
                icon: '👨‍💼',
                title: 'For Faculty',
                desc: 'View your availability'
              },
              {
                icon: '👨‍🎓',
                title: 'For Students',
                desc: 'Check your timetable'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 text-center border border-purple-100 hover:border-purple-300 transition-all hover:shadow-md"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-gray-700 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// Badge component (simple fallback if not in UI components)
function Badge({ children, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`} {...props}>
      {children}
    </span>
  )
}
