import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import { listConstraintRequests, getStudentProfile } from '@/lib/student-portal-store'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const requests = await listConstraintRequests(status || null)
    const enriched = await Promise.all(
      requests.map(async (req) => {
        const profile = await getStudentProfile(req.userId).catch(() => null)
        let studentName = profile?.name
        let studentEmail = profile?.email

        if (!studentName || !studentEmail) {
          const { data: userRow } = await supabaseServer
            .from('users')
            .select('name, email')
            .eq('id', req.userId)
            .maybeSingle()
          studentName = studentName || userRow?.name || 'Student'
          studentEmail = studentEmail || userRow?.email || null
        }

        return {
          ...req,
          studentName,
          studentEmail
        }
      })
    )

    return NextResponse.json({ success: true, requests: enriched })
  } catch (error) {
    console.error('GET admin student requests error:', error)
    return NextResponse.json({ error: 'Failed to load student requests' }, { status: 500 })
  }
}
