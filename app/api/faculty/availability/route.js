import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  getAvailabilityRequestForSemester,
  listFacultyAvailabilityRequests,
  pickDefaultAvailabilityRequest,
  submitFacultyAvailability
} from '@/lib/faculty-portal-store'
import { normalizeFacultyWeeklyAvailability } from '@/lib/timetable-helpers'

export async function GET(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const semesterParam = searchParams.get('semester')

    const requests = await listFacultyAvailabilityRequests(user.id)

    let activeRequest = null
    if (semesterParam) {
      activeRequest =
        requests.find((r) => r.semester === parseInt(semesterParam, 10)) ||
        (await getAvailabilityRequestForSemester(user.id, semesterParam))
    } else {
      activeRequest = pickDefaultAvailabilityRequest(requests)
    }

    return NextResponse.json({
      success: true,
      requests,
      request: activeRequest,
      user
    })
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
    const semester = body.semester != null ? parseInt(body.semester, 10) : null

    const record = await submitFacultyAvailability(user.id, {
      availability,
      requestId,
      semester
    })

    return NextResponse.json({
      success: true,
      message: `Availability submitted for semester ${record.semester}. Admin will use this when generating timetables.`,
      request: record
    })
  } catch (error) {
    console.error('POST faculty availability error:', error)
    const message =
      error?.message?.includes('No availability request')
        ? error.message
        : 'Failed to save availability'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
