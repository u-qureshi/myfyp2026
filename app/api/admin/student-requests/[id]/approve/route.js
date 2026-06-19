import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  getConstraintRequestById,
  getStudentProfile,
  markRequestApproved
} from '@/lib/student-portal-store'
import { getFacultyAvailabilityReadiness } from '@/lib/faculty-portal-store'
import { processStudentRequestApproval } from '@/lib/process-student-request'
import { notifyUser } from '@/lib/notify-user'

const APPROVABLE_STATUSES = new Set(['pending', 'error'])

function canApproveRequest(req) {
  return APPROVABLE_STATUSES.has(req.status) || (req.status === 'approved' && req.error)
}

export async function POST(_request, { params }) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const constraintRequest = await getConstraintRequestById(id)

    if (!constraintRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (!canApproveRequest(constraintRequest)) {
      return NextResponse.json(
        { error: `Cannot approve request with status "${constraintRequest.status}"` },
        { status: 400 }
      )
    }

    const readiness = await getFacultyAvailabilityReadiness(
      constraintRequest.departmentId,
      constraintRequest.semester
    )
    if (!readiness.canGenerate) {
      return NextResponse.json(
        {
          error: `Faculty availability missing for ${constraintRequest.departmentName} (Sem ${constraintRequest.semester}). Complete Faculty Availability first.`
        },
        { status: 400 }
      )
    }

    if (constraintRequest.status !== 'approved' || constraintRequest.error) {
      await markRequestApproved(id)
    }

    const result = await processStudentRequestApproval({
      ...constraintRequest,
      status: 'approved',
      error: null
    })

    const profile = await getStudentProfile(constraintRequest.userId).catch(() => null)

    if (result.status === 'ready') {
      await notifyUser(constraintRequest.userId, {
        title: 'Timetable options ready',
        message: `Admin approved your constraints. ${result.optionCount} timetable options are ready — pick your favourite.`
      })
    }

    return NextResponse.json({
      success: result.status === 'ready',
      message:
        result.status === 'ready'
          ? `Generated ${result.optionCount} options for ${profile?.name || 'student'}`
          : result.error || 'Approval failed',
      result
    })
  } catch (error) {
    console.error('POST approve single student request error:', error)
    return NextResponse.json({ error: 'Failed to approve request' }, { status: 500 })
  }
}
