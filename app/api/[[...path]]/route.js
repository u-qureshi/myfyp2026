import { NextResponse } from 'next/server'

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
  const path = request.nextUrl.pathname.replace('/api/', '')
  return handleCORS(
    NextResponse.json(
      {
        error: 'Legacy MongoDB API removed. Use dedicated Supabase routes instead.',
        path,
        docs: 'See /api/auth, /api/admin, /api/student, /api/faculty, /api/data, /api/generate-timetable'
      },
      { status: 410 }
    )
  )
}

export async function POST(request) {
  return GET(request)
}
