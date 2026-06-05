import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { createUser } from '@/lib/supabase-helpers'

// GET - Fetch all faculty with department information
export async function GET(request) {
  try {
    // Fetch all faculty users
    const { data: facultyData, error: facultyError } = await supabaseServer
      .from('users')
      .select(`
        id,
        name,
        email,
        department_id,
        role,
        created_at
      `)
      .eq('role', 'faculty')
      .order('name', { ascending: true })

    if (facultyError) throw facultyError

    // Enrich faculty data with department names
    const enrichedFaculty = await Promise.all(
      (facultyData || []).map(async (fac) => {
        let department_name = null

        if (fac.department_id) {
          const { data: deptData } = await supabaseServer
            .from('departments')
            .select('name')
            .eq('id', fac.department_id)
            .single()

          if (deptData) {
            department_name = deptData.name
          }
        }

        return {
          ...fac,
          department_name,
          availability_status: 'available' // Default status
        }
      })
    )

    return NextResponse.json({
      faculty: enrichedFaculty,
      message: 'Faculty fetched successfully'
    })
  } catch (error) {
    console.error('GET faculty error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty' },
      { status: 500 }
    )
  }
}

// POST - Create new faculty user
export async function POST(request) {
  try {
    const { name, email, password, department_id } = await request.json()

    // Validate inputs
    if (!name || !email || !password || !department_id) {
      return NextResponse.json(
        { error: 'Name, email, password, and department are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
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

    // Create user with hashed password using helper function
    const { success, data: newUser, error } = await createUser(
      email,
      password,
      name,
      'faculty'
    )

    if (!success) {
      throw error
    }

    // Update user with department_id
    const { data: updatedUser, error: updateError } = await supabaseServer
      .from('users')
      .update({ department_id })
      .eq('id', newUser.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(
      {
        faculty: updatedUser,
        message: 'Faculty member created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST faculty error:', error)
    return NextResponse.json(
      { error: 'Failed to create faculty member' },
      { status: 500 }
    )
  }
}

// PUT - Update faculty information
export async function PUT(request) {
  try {
    const { id, name, email, department_id } = await request.json()

    // Validate inputs
    if (!id || !name || !email || !department_id) {
      return NextResponse.json(
        { error: 'ID, name, email, and department are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email is already in use by another user
    const { data: existingUser, error: checkError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
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

    // Update faculty
    const { data, error } = await supabaseServer
      .from('users')
      .update({
        name: name.trim(),
        email: email.trim(),
        department_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('role', 'faculty')
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Faculty member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        faculty: data,
        message: 'Faculty member updated successfully'
      }
    )
  } catch (error) {
    console.error('PUT faculty error:', error)
    return NextResponse.json(
      { error: 'Failed to update faculty member' },
      { status: 500 }
    )
  }
}

// DELETE - Delete faculty member
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Faculty ID is required' },
        { status: 400 }
      )
    }

    // Verify faculty exists
    const { data: facultyData, error: fetchError } = await supabaseServer
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single()

    if (!facultyData || facultyData.role !== 'faculty') {
      return NextResponse.json(
        { error: 'Faculty member not found' },
        { status: 404 }
      )
    }

    // Check if faculty has timetable slots
    const { count: slotCount, error: slotError } = await supabaseServer
      .from('timetable_slots')
      .select('id', { count: 'exact' })
      .eq('faculty_id', id)

    if (slotCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete faculty member with assigned timetable slots'
        },
        { status: 409 }
      )
    }

    // Delete faculty
    const { error } = await supabaseServer
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Faculty member deleted successfully' }
    )
  } catch (error) {
    console.error('DELETE faculty error:', error)
    return NextResponse.json(
      { error: 'Failed to delete faculty member' },
      { status: 500 }
    )
  }
}
