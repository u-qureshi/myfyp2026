'use client'

import { useEffect, useState } from 'react'

export function useStudentSession() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/check-session', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        window.location.href = '/login'
      })
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return { user, loading, logout }
}
