import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

// GET - Fetch all sections with department information
export async function GET(request) {
  try {
    // Fetch all sections
    const { data: sectionsData, error: sectionsError } = await supabaseServer
      .from('sections')
      .select(`
        id,
        name,
        semester,
        department_id,
        student_count,
        created_at
      `)
      .order('semester', { ascending: true })
      .order('name', { ascending: true })

    if (sectionsError) throw sectionsError

    // Enrich sections data with department names
    const enrichedSections = await Promise.all(
      (sectionsData || []).map(async (section) => {
        let department_name = null

        if (section.department_id) {
          const { data: deptData } = await supabaseServer
            .from('departments')
            .select('name')
            .eq('id', section.department_id)
            .single()

          if (deptData) {
            department_name = deptData.name
          }
        }

        return {
          ...section,
          department_name
        }
      })
    )

    return NextResponse.json({
      sections: enrichedSections,
      message: 'Sections fetched successfully'
    })
  } catch (error) {
    console.error('GET sections error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}

// POST - Create new section
export async function POST(request) {
  try {
    const { name, semester, department_id, student_count } = await request.json()

    // Validate inputs
    if (!name || !semester || !department_id || student_count === undefined) {
      return NextResponse.json(
        { error: 'Name, semester, department, and student count are required' },
        { status: 400 }
      )
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Section name is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate semester
    const semesterNum = Number(semester)
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      return NextResponse.json(
        { error: 'Semester must be between 1 and 8' },
        { status: 400 }
      )
    }

    // Validate student count
    const studentCountNum = Number(student_count)
    if (isNaN(studentCountNum) || studentCountNum < 1 || studentCountNum > 100) {
      return NextResponse.json(
        { error: 'Student count must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Verify department exists
    const { data: deptData, error: deptError } = await supabaseServer
      .from('departments')
      .select('id')
      .eq('id', department_id)
      .single()

    if (!deptData || deptError) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Insert new section
    const { data, error } = await supabaseServer
      .from('sections')
      .insert([
        {
          name: name.trim(),
          semester: semesterNum,
          department_id,
          student_count: studentCountNum
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      {
        section: data,
        message: 'Section created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST section error:', error)
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    )
  }
}

// PUT - Update section
export async function PUT(request) {
  try {
    const { id, name, semester, department_id, student_count } = await request.json()

    // Validate inputs
    if (!id || !name || !semester || !department_id || student_count === undefined) {
      return NextResponse.json(
        { error: 'ID, name, semester, department, and student count are required' },
        { status: 400 }
      )
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Section name is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate semester
    const semesterNum = Number(semester)
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      return NextResponse.json(
        { error: 'Semester must be between 1 and 8' },
        { status: 400 }
      )
    }

    // Validate student count
    const studentCountNum = Number(student_count)
    if (isNaN(studentCountNum) || studentCountNum < 1 || studentCountNum > 100) {
      return NextResponse.json(
        { error: 'Student count must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Verify department exists
    const { data: deptData, error: deptError } = await supabaseServer
      .from('departments')
      .select('id')
      .eq('id', department_id)
      .single()

    if (!deptData || deptError) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Update section
    const { data, error } = await supabaseServer
      .from('sections')
      .update({
        name: name.trim(),
        semester: semesterNum,
        department_id,
        student_count: studentCountNum,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        section: data,
        message: 'Section updated successfully'
      }
    )
  } catch (error) {
    console.error('PUT section error:', error)
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    )
  }
}

// DELETE - Delete section
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Section ID is required' },
        { status: 400 }
      )
    }

    // Check if section has associated data
    const { count: subjectCount } = await supabaseServer
      .from('section_subjects')
      .select('id', { count: 'exact' })
      .eq('section_id', id)

    const { count: slotCount } = await supabaseServer
      .from('timetable_slots')
      .select('id', { count: 'exact' })
      .eq('section_id', id)

    if (subjectCount > 0 || slotCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete section with assigned subjects or timetable slots'
        },
        { status: 409 }
      )
    }

    // Delete section
    const { error } = await supabaseServer
      .from('sections')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Section deleted successfully' }
    )
  } catch (error) {
    console.error('DELETE section error:', error)
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    )
  }
}
