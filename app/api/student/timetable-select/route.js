import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  getLatestTimetableOptions,
  saveSelectedTimetable
} from '@/lib/student-portal-store'

export async function POST(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { optionIndex } = await request.json()
    if (optionIndex == null || optionIndex < 0) {
      return NextResponse.json({ error: 'optionIndex is required' }, { status: 400 })
    }

    const optionsRecord = await getLatestTimetableOptions(user.id)
    if (!optionsRecord?.options?.length) {
      return NextResponse.json({ error: 'No timetable options available yet' }, { status: 404 })
    }

    const chosen = optionsRecord.options[optionIndex]
    if (!chosen) {
      return NextResponse.json({ error: 'Invalid option selected' }, { status: 400 })
    }

    const saved = await saveSelectedTimetable(user.id, {
      requestId: optionsRecord.requestId,
      optionsId: optionsRecord.id,
      optionIndex,
      timetable: chosen.timetable,
      summary: chosen.timetable?.summary || {
        scenarioName: chosen.scenarioName,
        score: chosen.score
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Your timetable has been saved',
      selected: saved
    })
  } catch (error) {
    console.error('POST student timetable select error:', error)
    return NextResponse.json({ error: 'Failed to save selected timetable' }, { status: 500 })
  }
}
