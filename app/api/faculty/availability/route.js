import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  getLatestAvailabilityRequest,
  submitFacultyAvailability
} from '@/lib/faculty-portal-store'
import { normalizeFacultyWeeklyAvailability } from '@/lib/timetable-helpers'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const request = await getLatestAvailabilityRequest(user.id)
    return NextResponse.json({ success: true, request, user })
  } catch (error) {
    console.error('GET faculty availability error:', error)
    return NextResponse.json({ error: 'Failed to load availability request' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const availability = normalizeFacultyWeeklyAvailability(body.availability || body)
    const requestId = body.requestId || null

    const latest = await getLatestAvailabilityRequest(user.id)
    if (latest?.status === 'submitted' && !body.forceUpdate) {
      // Allow update/resubmit
    }

    const record = await submitFacultyAvailability(user.id, { availability, requestId })

    return NextResponse.json({
      success: true,
      message: 'Availability submitted. Admin will use this when generating timetables.',
      request: record
    })
  } catch (error) {
    console.error('POST faculty availability error:', error)
    return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 })
  }
}
