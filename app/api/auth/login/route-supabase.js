import { supabaseServer } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const JWT_SECRET = process.env.JWT_SECRET || 'timetable-ai-secret-key'

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

    // Query user from Supabase
    const { data: user, error: selectError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        // User not found - this is expected for new users
        return handleCORS(
          NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          )
        )
      }
      throw selectError
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('Login successful for:', user.email)

    return handleCORS(
      NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    )
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
