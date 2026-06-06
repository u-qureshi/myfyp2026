import { NextResponse } from 'next/server'
import { getGeneratedTimetables } from '@/lib/legacy-store'

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function GET() {
  try {
    const timetables = await getGeneratedTimetables()
    return handleCORS(NextResponse.json(timetables))
  } catch (error) {
    console.error('Timetables retrieval error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to retrieve timetables' }, { status: 500 }))
  }
}
