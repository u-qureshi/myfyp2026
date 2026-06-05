import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  getLatestConstraintRequest,
  getLatestTimetableOptions,
  getSelectedTimetable
} from '@/lib/student-portal-store'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [request, options, selected] = await Promise.all([
      getLatestConstraintRequest(user.id),
      getLatestTimetableOptions(user.id),
      getSelectedTimetable(user.id)
    ])

    return NextResponse.json({
      success: true,
      request,
      options: options?.options || [],
      optionsId: options?.id || null,
      selected
    })
  } catch (error) {
    console.error('GET student timetable options error:', error)
    return NextResponse.json({ error: 'Failed to load timetable options' }, { status: 500 })
  }
}
