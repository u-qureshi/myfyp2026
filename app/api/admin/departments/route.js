import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

// GET - Fetch all departments with counts
export async function GET(request) {
  try {
    // Fetch all departments
    const { data: departments, error: deptError } = await supabaseServer
      .from('departments')
      .select('*')
      .order('name', { ascending: true })

    if (deptError) throw deptError

    // Enrich departments with counts
    const enrichedDepts = await Promise.all(
      (departments || []).map(async (dept) => {
        // Get faculty count for this department
        const { count: facultyCount } = await supabaseServer
          .from('users')
          .select('id', { count: 'exact' })
          .eq('department_id', dept.id)
          .eq('role', 'faculty')

        // Get sections count
        const { count: sectionCount } = await supabaseServer
          .from('sections')
          .select('id', { count: 'exact' })
          .eq('department_id', dept.id)

        // Get programs count (unique subject programs)
        const { count: programCount } = await supabaseServer
          .from('subjects')
          .select('id', { count: 'exact' })
          .eq('department_id', dept.id)

        return {
          ...dept,
          facultyCount: facultyCount || 0,
          sections: sectionCount || 0,
          programs: programCount || 0
        }
      })
    )

    // Calculate totals
    const totalSections = enrichedDepts.reduce((sum, d) => sum + (d.sections || 0), 0)
    const totalPrograms = enrichedDepts.reduce((sum, d) => sum + (d.programs || 0), 0)

    return NextResponse.json({
      departments: enrichedDepts,
      sectionCount: totalSections,
      programCount: totalPrograms,
      message: 'Departments fetched successfully'
    })
  } catch (error) {
    console.error('GET departments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

// POST - Create new department
export async function POST(request) {
  try {
    const { name, code } = await request.json()

    // Validate inputs
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      )
    }

    if (typeof code !== 'string' || code.length > 10) {
      return NextResponse.json(
        { error: 'Code must be a string with max 10 characters' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const { data: existing, error: checkError } = await supabaseServer
      .from('departments')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Department code already exists' },
        { status: 409 }
      )
    }

    // Insert new department
    const { data, error } = await supabaseServer
      .from('departments')
      .insert([
        {
          name: name.trim(),
          code: code.toUpperCase()
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      {
        department: data,
        message: 'Department created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST department error:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}

// PUT - Update department
export async function PUT(request) {
  try {
    const { id, name, code } = await request.json()

    // Validate inputs
    if (!id || !name || !code) {
      return NextResponse.json(
        { error: 'ID, name, and code are required' },
        { status: 400 }
      )
    }

    if (typeof code !== 'string' || code.length > 10) {
      return NextResponse.json(
        { error: 'Code must be a string with max 10 characters' },
        { status: 400 }
      )
    }

    // Check if new code conflicts with existing (excluding current)
    const { data: existing, error: checkError } = await supabaseServer
      .from('departments')
      .select('id')
      .eq('code', code.toUpperCase())
      .neq('id', id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Department code already exists' },
        { status: 409 }
      )
    }

    // Update department
    const { data, error } = await supabaseServer
      .from('departments')
      .update({
        name: name.trim(),
        code: code.toUpperCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        department: data,
        message: 'Department updated successfully'
      }
    )
  } catch (error) {
    console.error('PUT department error:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    )
  }
}

// DELETE - Delete department
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      )
    }

    // Check if department has associated data
    const { count: sectionCount } = await supabaseServer
      .from('sections')
      .select('id', { count: 'exact' })
      .eq('department_id', id)

    const { count: subjectCount } = await supabaseServer
      .from('subjects')
      .select('id', { count: 'exact' })
      .eq('department_id', id)

    const { count: facultyCount } = await supabaseServer
      .from('users')
      .select('id', { count: 'exact' })
      .eq('department_id', id)

    if (sectionCount > 0 || subjectCount > 0 || facultyCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete department with associated sections, subjects, or faculty'
        },
        { status: 409 }
      )
    }

    // Delete department
    const { error } = await supabaseServer
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Department deleted successfully' }
    )
  } catch (error) {
    console.error('DELETE department error:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}
