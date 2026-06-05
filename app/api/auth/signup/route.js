import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail } from '@/lib/supabase-helpers'

const JWT_SECRET = process.env.JWT_SECRET || 'timetable-ai-secret-key'

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

    if (!body || typeof body !== 'object') {
      return handleCORS(
        NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      )
    }

    const { email, password, name } = body

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

    // Validate password strength
    if (password.length < 6) {
      return handleCORS(
        NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      )
    }

    // Check if user already exists
    const { data: existingUser } = await getUserByEmail(email)
    if (existingUser) {
      return handleCORS(
        NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        )
      )
    }

    // Create new user
    const { success, data: newUser, error } = await createUser(
      email,
      password,
      name || email.split('@')[0],
      'user'
    )

    if (!success) {
      throw error
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('User created successfully:', email)

    return handleCORS(
      NextResponse.json(
        {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }
        },
        { status: 201 }
      )
    )
  } catch (error) {
    console.error('Signup error:', error)

    return handleCORS(
      NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    )
  }
}
