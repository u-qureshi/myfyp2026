import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import { requestAvailabilityFromFaculty } from '@/lib/faculty-portal-store'

export async function POST(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const semester = parseInt(body.semester, 10)
    if (!semester || Number.isNaN(semester)) {
      return NextResponse.json({ error: 'Semester is required' }, { status: 400 })
    }

    const result = await requestAvailabilityFromFaculty({
      semester,
      departmentId: body.departmentId || null,
      requestedBy: user.id,
      notes: body.notes || null
    })

    return NextResponse.json({
      success: true,
      message: `Availability request sent to ${result.count} faculty member(s)`,
      ...result
    })
  } catch (error) {
    console.error('POST admin faculty request error:', error)
    return NextResponse.json({ error: 'Failed to send availability requests' }, { status: 500 })
  }
}
