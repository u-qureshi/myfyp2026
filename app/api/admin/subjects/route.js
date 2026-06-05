import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

// GET - Fetch all subjects with department information
export async function GET(request) {
  try {
    // Fetch all subjects
    const { data: subjectsData, error: subjectsError } = await supabaseServer
      .from('subjects')
      .select(`
        id,
        name,
        code,
        credit_hours,
        department_id,
        created_at
      `)
      .order('name', { ascending: true })

    if (subjectsError) throw subjectsError

    // Enrich subjects data with department names
    const enrichedSubjects = await Promise.all(
      (subjectsData || []).map(async (subject) => {
        let department_name = null

        if (subject.department_id) {
          const { data: deptData } = await supabaseServer
            .from('departments')
            .select('name')
            .eq('id', subject.department_id)
            .single()

          if (deptData) {
            department_name = deptData.name
          }
        }

        return {
          ...subject,
          department_name
        }
      })
    )

    return NextResponse.json({
      subjects: enrichedSubjects,
      message: 'Subjects fetched successfully'
    })
  } catch (error) {
    console.error('GET subjects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

// POST - Create new subject
export async function POST(request) {
  try {
    const { name, code, credit_hours, department_id } = await request.json()

    // Validate inputs
    if (!name || !code || !credit_hours || !department_id) {
      return NextResponse.json(
        { error: 'Name, code, credit_hours, and department are required' },
        { status: 400 }
      )
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subject name is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate code
    if (typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subject code is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate credit hours
    const creditsNum = Number(credit_hours)
    if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 6) {
      return NextResponse.json(
        { error: 'Credit hours must be between 1 and 6' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const { data: existing, error: checkError } = await supabaseServer
      .from('subjects')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Subject code already exists' },
        { status: 409 }
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

    // Insert new subject
    const { data, error } = await supabaseServer
      .from('subjects')
      .insert([
        {
          name: name.trim(),
          code: code.toUpperCase(),
          credit_hours: creditsNum,
          department_id
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      {
        subject: data,
        message: 'Subject created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST subject error:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}

// PUT - Update subject
export async function PUT(request) {
  try {
    const { id, name, code, credit_hours, department_id } = await request.json()

    // Validate inputs
    if (!id || !name || !code || !credit_hours || !department_id) {
      return NextResponse.json(
        { error: 'ID, name, code, credit_hours, and department are required' },
        { status: 400 }
      )
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subject name is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate code
    if (typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subject code is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate credit hours
    const creditsNum = Number(credit_hours)
    if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 6) {
      return NextResponse.json(
        { error: 'Credit hours must be between 1 and 6' },
        { status: 400 }
      )
    }

    // Check if new code conflicts with existing (excluding current)
    const { data: existing, error: checkError } = await supabaseServer
      .from('subjects')
      .select('id')
      .eq('code', code.toUpperCase())
      .neq('id', id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Subject code already exists' },
        { status: 409 }
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

    // Update subject
    const { data, error } = await supabaseServer
      .from('subjects')
      .update({
        name: name.trim(),
        code: code.toUpperCase(),
        credit_hours: creditsNum,
        department_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        subject: data,
        message: 'Subject updated successfully'
      }
    )
  } catch (error) {
    console.error('PUT subject error:', error)
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    )
  }
}

// DELETE - Delete subject
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      )
    }

    // Check if subject has associated data
    const { count: sectionCount } = await supabaseServer
      .from('section_subjects')
      .select('id', { count: 'exact' })
      .eq('subject_id', id)

    const { count: slotCount } = await supabaseServer
      .from('timetable_slots')
      .select('id', { count: 'exact' })
      .eq('subject_id', id)

    if (sectionCount > 0 || slotCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete subject with assigned sections or timetable slots'
        },
        { status: 409 }
      )
    }

    // Delete subject
    const { error } = await supabaseServer
      .from('subjects')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Subject deleted successfully' }
    )
  } catch (error) {
    console.error('DELETE subject error:', error)
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    )
  }
}
