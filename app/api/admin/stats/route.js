import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    // Count departments
    const { count: deptCount } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true })

    // Count faculty
    const { count: facultyCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'faculty')

    // Count rooms
    const { count: roomCount } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })

    // Count sections
    const { count: sectionCount } = await supabase
      .from('sections')
      .select('*', { count: 'exact', head: true })

    // Count timetable slots
    const { count: timetableCount } = await supabase
      .from('timetable_slots')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      departments: deptCount || 0,
      faculty: facultyCount || 0,
      rooms: roomCount || 0,
      sections: sectionCount || 0,
      timetables: timetableCount || 0
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
