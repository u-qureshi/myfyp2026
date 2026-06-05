import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import { getStudentProfile, upsertStudentProfile } from '@/lib/student-portal-store'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let profile = await getStudentProfile(user.id)

    if (!profile && user.department_id) {
      const { data: dept } = await supabaseServer
        .from('departments')
        .select('name, code')
        .eq('id', user.department_id)
        .maybeSingle()
      profile = {
        userId: user.id,
        departmentId: user.department_id,
        departmentName: dept?.name || user.department_name,
        semester: user.semester || null,
        profileComplete: !!(user.department_id && user.semester)
      }
    }

    return NextResponse.json({
      success: true,
      profile: profile || { userId: user.id, profileComplete: false },
      user
    })
  } catch (error) {
    console.error('GET student profile error:', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { departmentId, departmentName, semester } = await request.json()
    if (!departmentId || !semester) {
      return NextResponse.json({ error: 'Department and semester are required' }, { status: 400 })
    }

    await supabaseServer
      .from('users')
      .update({ department_id: departmentId, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    const profile = await upsertStudentProfile(user.id, {
      email: user.email,
      name: user.name,
      departmentId,
      departmentName,
      semester: parseInt(semester, 10),
      profileComplete: true
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('PATCH student profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
