import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseServer } from '@/lib/supabase'
import { upsertStudentProfile } from '@/lib/student-portal-store'

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, name, departmentId, departmentName, semester } = body

    if (!email || !password || !name) {
      return handleCORS(NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 }))
    }
    if (!departmentId || !semester) {
      return handleCORS(NextResponse.json({ error: 'Department and semester are required' }, { status: 400 }))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return handleCORS(NextResponse.json({ error: 'Invalid email format' }, { status: 400 }))
    }
    if (password.length < 6) {
      return handleCORS(NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 }))
    }

    const { data: existing } = await supabaseServer.from('users').select('id').eq('email', email).maybeSingle()
    if (existing) {
      return handleCORS(NextResponse.json({ error: 'Email already registered' }, { status: 409 }))
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const { data: newUser, error } = await supabaseServer
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
          role: 'student',
          department_id: departmentId
        }
      ])
      .select('*, departments(name, code)')
      .single()

    if (error) throw error

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'student',
      department_id: departmentId,
      department_name: departmentName || newUser.departments?.name || null,
      department_code: newUser.departments?.code || null,
      semester: parseInt(semester, 10),
      profileComplete: true
    }

    try {
      await upsertStudentProfile(newUser.id, {
        email: newUser.email,
        name: newUser.name,
        departmentId,
        departmentName: sessionUser.department_name,
        departmentCode: sessionUser.department_code,
        semester: parseInt(semester, 10),
        profileComplete: true
      })
    } catch (profileErr) {
      console.error('Profile save failed:', profileErr?.message)
      return handleCORS(
        NextResponse.json(
          { error: 'Account created but profile save failed. Run lib/student-portal-schema.sql in Supabase.' },
          { status: 500 }
        )
      )
    }

    const response = NextResponse.json({ success: true, user: sessionUser })
    response.cookies.set('user_session', JSON.stringify(sessionUser), {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    })

    return handleCORS(response)
  } catch (error) {
    console.error('Student signup error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to create student account' }, { status: 500 }))
  }
}
