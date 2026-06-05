import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  createConstraintRequest,
  getLatestConstraintRequest,
  getStudentProfile
} from '@/lib/student-portal-store'
import { normalizeStudentConstraints } from '@/lib/timetable-helpers'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const request = await getLatestConstraintRequest(user.id)
    const profile = await getStudentProfile(user.id)

    return NextResponse.json({ success: true, request, profile })
  } catch (error) {
    console.error('GET student constraints error:', error)
    return NextResponse.json({ error: 'Failed to load constraint request' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const constraints = normalizeStudentConstraints(body.constraints || body)

    let profile = await getStudentProfile(user.id)
    if (!profile?.profileComplete) {
      return NextResponse.json(
        { error: 'Complete your profile (department & semester) first' },
        { status: 400 }
      )
    }

    const record = await createConstraintRequest(user.id, {
      departmentId: profile.departmentId,
      departmentName: profile.departmentName,
      semester: profile.semester,
      constraints
    })

    return NextResponse.json({
      success: true,
      message: 'Constraints submitted. Admin will review and generate your timetable options.',
      request: record
    })
  } catch (error) {
    console.error('POST student constraints error:', error)
    return NextResponse.json({ error: 'Failed to save constraints' }, { status: 500 })
  }
}
