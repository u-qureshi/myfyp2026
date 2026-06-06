import { NextResponse } from 'next/server'
import { countUploadedDataByType } from '@/lib/legacy-store'
import { supabaseServer } from '@/lib/supabase'

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
    const [uploadedStudents, uploadedFaculty, uploadedRooms, sectionsRes, facultyRes, roomsRes] =
      await Promise.all([
        countUploadedDataByType('students'),
        countUploadedDataByType('faculty'),
        countUploadedDataByType('rooms'),
        supabaseServer.from('sections').select('*', { count: 'exact', head: true }),
        supabaseServer.from('users').select('*', { count: 'exact', head: true }).eq('role', 'faculty'),
        supabaseServer.from('rooms').select('*', { count: 'exact', head: true })
      ])

    const students = uploadedStudents || sectionsRes.count || 0
    const faculty = uploadedFaculty || facultyRes.count || 0
    const rooms = uploadedRooms || roomsRes.count || 0

    return handleCORS(NextResponse.json({ students, faculty, rooms }))
  } catch (error) {
    console.error('Metrics error:', error)
    return handleCORS(
      NextResponse.json({ error: 'Database not available', students: null, faculty: null, rooms: null })
    )
  }
}
