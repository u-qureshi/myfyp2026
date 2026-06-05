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

export async function GET(request) {
  try {
    // Demo users to seed
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@smartscheduler.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Dr. Ahmed Khan',
        email: 'faculty@smartscheduler.com',
        password: 'faculty123',
        role: 'faculty'
      },
      {
        name: 'Student User',
        email: 'student@smartscheduler.com',
        password: 'student123',
        role: 'student'
      }
    ]

    const createdUsers = []

    // Insert users
    for (const user of demoUsers) {
      try {
        // Hash password
        const password_hash = await bcrypt.hash(user.password, 10)

        // Check if user already exists
        const { data: existingUser } = await supabaseServer
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single()

        if (existingUser) {
          console.log(`User ${user.email} already exists, skipping...`)
          createdUsers.push({
            email: user.email,
            status: 'already_exists',
            message: 'User already exists in database'
          })
          continue
        }

        // Insert user
        const { data: insertedUser, error: insertError } = await supabaseServer
          .from('users')
          .insert([
            {
              name: user.name,
              email: user.email,
              password_hash,
              role: user.role,
              created_at: new Date().toISOString()
            }
          ])
          .select('id, name, email, role')
          .single()

        if (insertError) {
          console.error(`Error creating user ${user.email}:`, insertError)
          createdUsers.push({
            email: user.email,
            status: 'error',
            message: insertError.message
          })
          continue
        }

        console.log(`Created user: ${user.email}`)
        createdUsers.push({
          id: insertedUser.id,
          name: insertedUser.name,
          email: insertedUser.email,
          role: insertedUser.role,
          status: 'created',
          message: 'User created successfully'
        })
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error)
        createdUsers.push({
          email: user.email,
          status: 'error',
          message: error.message
        })
      }
    }

    // Return results
    return handleCORS(
      NextResponse.json({
        message: 'Database seeding completed',
        totalUsers: demoUsers.length,
        results: createdUsers,
        successCount: createdUsers.filter(u => u.status === 'created').length,
        existingCount: createdUsers.filter(u => u.status === 'already_exists').length,
        errorCount: createdUsers.filter(u => u.status === 'error').length
      })
    )
  } catch (error) {
    console.error('Seeding error:', error)

    return handleCORS(
      NextResponse.json(
        {
          error: 'Seeding failed',
          message: error.message
        },
        { status: 500 }
      )
    )
  }
}
