import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseServer } from '@/lib/supabase'

// Helper function to handle CORS
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

    // Validate request body
    if (!body || typeof body !== 'object') {
      return handleCORS(
        NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      )
    }

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return handleCORS(
        NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return handleCORS(
        NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      )
    }

    console.log('Login attempt for:', email)

    // Query Supabase for user
    const { data: users, error: queryError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('Database query error:', queryError)
      return handleCORS(
        NextResponse.json(
          { error: 'Database error occurred' },
          { status: 500 }
        )
      )
    }

    // User not found
    if (!users) {
      console.log('User not found:', email)
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, users.password_hash)

    if (!passwordMatch) {
      console.log('Password mismatch for:', email)
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      )
    }

    console.log('Login successful for:', users.email, 'role:', users.role)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      }
    })

    // Set session cookie (non-httpOnly so middleware can access it)
    response.cookies.set('user_session', JSON.stringify({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    }), {
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