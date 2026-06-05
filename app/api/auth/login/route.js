import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseServer } from '@/lib/supabase'
import {
  findFacultyByLoginIdentifier,
  getFacultyMetadata,
  normalizeName
} from '@/lib/faculty-data'

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

async function findUserByIdentifier(identifier) {
  const trimmed = String(identifier || '').trim()
  if (!trimmed) return null

  const selectQuery = '*, departments(name, code)'

  if (trimmed.includes('@')) {
    const { data, error } = await supabaseServer
      .from('users')
      .select(selectQuery)
      .eq('email', trimmed)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }

  const facultyMeta = findFacultyByLoginIdentifier(trimmed)
  if (facultyMeta?.email) {
    const { data, error } = await supabaseServer
      .from('users')
      .select(selectQuery)
      .eq('email', facultyMeta.email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (data) return data
  }

  const { data: candidates, error: searchError } = await supabaseServer
    .from('users')
    .select(selectQuery)
    .eq('role', 'faculty')
    .ilike('name', `%${trimmed}%`)

  if (searchError) throw searchError
  if (!candidates?.length) return null

  const normalizedInput = normalizeName(trimmed)
  const exactMatch = candidates.find(
    (user) => normalizeName(user.name) === normalizedInput
  )
  if (exactMatch) return exactMatch

  return candidates.length === 1 ? candidates[0] : null
}

function buildSessionUser(user) {
  const metadata = getFacultyMetadata({ email: user.email, name: user.name })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department_id: user.department_id,
    department_name:
      metadata?.department_name || user.departments?.name || 'Faculty Department',
    department_code: metadata?.dept || user.departments?.code || null,
    designation: metadata?.designation || 'Faculty Member'
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return handleCORS(
        NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      )
    }

    const { email, password } = body
    const identifier = String(email || '').trim()

    if (!identifier || !password) {
      return handleCORS(
        NextResponse.json(
          { error: 'Email/name and password are required' },
          { status: 400 }
        )
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(identifier) && identifier.includes(' ')) {
      console.log('Name-based login attempt for faculty')
    }

    console.log('Login attempt for:', identifier)

    const user = await findUserByIdentifier(identifier)

    if (!user) {
      console.log('User not found:', identifier)
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid email/name or password' },
          { status: 401 }
        )
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      console.log('Password mismatch for:', user.email)
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid email/name or password' },
          { status: 401 }
        )
      )
    }

    const sessionUser = buildSessionUser(user)
    console.log('Login successful for:', sessionUser.email, 'role:', sessionUser.role)

    const response = NextResponse.json({
      success: true,
      user: sessionUser
    })

    response.cookies.set('user_session', JSON.stringify(sessionUser), {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    })

    return handleCORS(response)
  } catch (error) {
    console.error('Login error:', error)

    return handleCORS(
      NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    )
  }
}
