import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  approveAllPendingRequests,
  getStudentProfile,
  saveTimetableOptions,
  updateConstraintRequest
} from '@/lib/student-portal-store'
import { generateTopScenarios, prepareTimetableInput } from '@/lib/generate-top-scenarios'

export async function POST() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const approved = await approveAllPendingRequests()
    const results = []

    for (const request of approved) {
      try {
        const profile = await getStudentProfile(request.userId)
        const input = await prepareTimetableInput(
          request.departmentId,
          request.semester,
          profile?.departmentCode || null
        )

        const topOptions = generateTopScenarios(input, request.constraints, 5)

        await saveTimetableOptions(request.userId, request.id, topOptions)

        results.push({
          requestId: request.id,
          userId: request.userId,
          studentName: profile?.name || 'Student',
          status: 'ready',
          optionCount: topOptions.length
        })
      } catch (err) {
        console.error(`Failed for request ${request.id}:`, err)
        await updateConstraintRequest(request.id, { status: 'approved', error: err.message })
        results.push({
          requestId: request.id,
          userId: request.userId,
          status: 'error',
          error: err.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} student constraint request(s)`,
      results
    })
  } catch (error) {
    console.error('POST approve student requests error:', error)
    return NextResponse.json({ error: 'Failed to approve and generate timetables' }, { status: 500 })
  }
}
