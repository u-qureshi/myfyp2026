import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import { listAvailabilityRequests } from '@/lib/faculty-portal-store'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const semester = searchParams.get('semester')

    let requests = await listAvailabilityRequests(status || null)

    if (semester) {
      const sem = parseInt(semester, 10)
      requests = requests.filter((r) => r.semester === sem)
    }

    const enriched = await Promise.all(
      requests.map(async (req) => {
        const { data: userRow } = await supabaseServer
          .from('users')
          .select('name, email, department_id, departments(name)')
          .eq('id', req.userId)
          .maybeSingle()

        return {
          ...req,
          facultyName: userRow?.name || 'Faculty',
          facultyEmail: userRow?.email || null,
          departmentName: req.departmentName || userRow?.departments?.name || null
        }
      })
    )

    return NextResponse.json({ success: true, requests: enriched })
  } catch (error) {
    console.error('GET admin faculty requests error:', error)
    return NextResponse.json({ error: 'Failed to load faculty availability requests' }, { status: 500 })
  }
}
