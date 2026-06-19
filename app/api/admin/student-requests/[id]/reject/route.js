import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  getConstraintRequestById,
  getStudentProfile,
  rejectConstraintRequest
} from '@/lib/student-portal-store'
import { notifyUser } from '@/lib/notify-user'

const REJECTABLE_STATUSES = new Set(['pending', 'error'])

export async function POST(request, { params }) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const reason =
      typeof body.reason === 'string' && body.reason.trim()
        ? body.reason.trim()
        : 'Your constraint request was rejected by admin. You may update and resubmit.'

    const constraintRequest = await getConstraintRequestById(id)

    if (!constraintRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (!REJECTABLE_STATUSES.has(constraintRequest.status)) {
      return NextResponse.json(
        { error: `Cannot reject request with status "${constraintRequest.status}"` },
        { status: 400 }
      )
    }

    const updated = await rejectConstraintRequest(id, { reason })
    const profile = await getStudentProfile(constraintRequest.userId).catch(() => null)

    await notifyUser(constraintRequest.userId, {
      title: 'Constraint request rejected',
      message: reason
    })

    return NextResponse.json({
      success: true,
      message: `Rejected request for ${profile?.name || 'student'}`,
      request: updated
    })
  } catch (error) {
    console.error('POST reject student request error:', error)
    return NextResponse.json({ error: 'Failed to reject request' }, { status: 500 })
  }
}
