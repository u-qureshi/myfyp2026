import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  approveAllPendingRequests
} from '@/lib/student-portal-store'
import { processStudentRequestApproval } from '@/lib/process-student-request'

export async function POST() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const approved = await approveAllPendingRequests()
    const results = []

    for (const request of approved) {
      const result = await processStudentRequestApproval(request)
      results.push(result)
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
