import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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
    // Clear the user_session cookie
    const cookieStore = await cookies()
    cookieStore.delete('user_session')

    console.log('User logged out successfully')

    return handleCORS(
      NextResponse.json({
        message: 'Logged out successfully'
      })
    )
  } catch (error) {
    console.error('Logout error:', error)

    return handleCORS(
      NextResponse.json(
        { error: 'Logout failed' },
        { status: 500 }
      )
    )
  }
}
