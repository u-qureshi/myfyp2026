import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth-middleware'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

/**
 * GET - Retrieve data records by type
 * Query params: type (students, faculty, rooms, constraints)
 */
export async function GET(request) {
  try {
    const type = new URL(request.url).searchParams.get('type')

    if (!type) {
      return handleCORS(
        NextResponse.json(
          { error: 'Type parameter is required (students|faculty|rooms|constraints)' },
          { status: 400 }
        )
      )
    }

    // Validate type to prevent injection
    const validTypes = ['students', 'faculty', 'rooms', 'constraints']
    if (!validTypes.includes(type)) {
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid type. Must be one of: ' + validTypes.join(', ') },
          { status: 400 }
        )
      )
    }

    // Verify user is authenticated
    const user = verifyToken(request)
    if (!user) {
      return handleCORS(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }

    console.log(`Retrieving ${type} for user:`, user.id)

    // Query from Supabase
    const { data, error } = await supabaseServer
      .from(type)
      .select('*')
      .eq('user_id', user.id)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(`Retrieved ${data?.length || 0} records of type ${type}`)

    return handleCORS(NextResponse.json(data || []))
  } catch (error) {
    console.error('Data retrieval error:', error)
    return handleCORS(
      NextResponse.json(
        { error: 'Failed to retrieve records' },
        { status: 500 }
      )
    )
  }
}

/**
 * POST - Create new record
 * Body: { type, record: { name, email, etc. } }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { type, record } = body

    if (!type || !record || typeof record !== 'object') {
      return handleCORS(
        NextResponse.json(
          { error: 'type and record are required' },
          { status: 400 }
        )
      )
    }

    // Validate type
    const validTypes = ['students', 'faculty', 'rooms', 'constraints']
    if (!validTypes.includes(type)) {
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        )
      )
    }

    // Verify authentication
    const user = verifyToken(request)
    if (!user) {
      return handleCORS(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }

    // Add user_id to record
    const recordWithUser = {
      ...record,
      user_id: user.id
    }

    console.log(`Creating ${type} record for user:`, user.id)

    // Insert into Supabase
    const { data, error } = await supabaseServer
      .from(type)
      .insert([recordWithUser])
      .select()
      .single()

    if (error) throw error

    return handleCORS(
      NextResponse.json(
        { insertedId: data.id, record: data },
        { status: 201 }
      )
    )
  } catch (error) {
    console.error('Create error:', error)
    return handleCORS(
      NextResponse.json(
        { error: 'Failed to create record' },
        { status: 500 }
      )
    )
  }
}

/**
 * PATCH - Update existing record
 * Body: { type, id, updates: { field: value } }
 */
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { type, id, updates } = body

    if (!type || !id || !updates || typeof updates !== 'object') {
      return handleCORS(
        NextResponse.json(
          { error: 'type, id, and updates are required' },
          { status: 400 }
        )
      )
    }

    // Validate type
    const validTypes = ['students', 'faculty', 'rooms', 'constraints']
    if (!validTypes.includes(type)) {
      return handleCORS(
        NextResponse.json({ error: 'Invalid type' }, { status: 400 })
      )
    }

    // Verify authentication
    const user = verifyToken(request)
    if (!user) {
      return handleCORS(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }

    // Remove protected fields from updates
    const { id: _ignoreId, user_id: _ignoreUserId, ...safeUpdates } = updates

    console.log(`Updating ${type} record:`, id)

    // Update in Supabase
    const { data, error } = await supabaseServer
      .from(type)
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this record
      .select()
      .single()

    if (error) throw error
    if (!data) {
      return handleCORS(
        NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        )
      )
    }

    return handleCORS(
      NextResponse.json({
        modifiedCount: 1,
        record: data
      })
    )
  } catch (error) {
    console.error('Update error:', error)
    return handleCORS(
      NextResponse.json(
        { error: 'Failed to update record' },
        { status: 500 }
      )
    )
  }
}

/**
 * PUT - Reorder records
 * Body: { type, orderedIds: [id1, id2, id3, ...] }
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { type, orderedIds } = body

    if (!type || !Array.isArray(orderedIds)) {
      return handleCORS(
        NextResponse.json(
          { error: 'type and orderedIds array are required' },
          { status: 400 }
        )
      )
    }

    // Validate type
    const validTypes = ['students', 'faculty', 'rooms', 'constraints']
    if (!validTypes.includes(type)) {
      return handleCORS(
        NextResponse.json({ error: 'Invalid type' }, { status: 400 })
      )
    }

    // Verify authentication
    const user = verifyToken(request)
    if (!user) {
      return handleCORS(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }

    console.log(`Reordering ${type} records for user:`, user.id)

    // Update order for each record
    if (orderedIds.length > 0) {
      // Use rpc or batch updates
      for (let index = 0; index < orderedIds.length; index++) {
        const id = orderedIds[index]
        const { error } = await supabaseServer
          .from(type)
          .update({
            order: index,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
      }
    }

    return handleCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Reorder error:', error)
    return handleCORS(
      NextResponse.json(
        { error: 'Failed to reorder records' },
        { status: 500 }
      )
    )
  }
}

/**
 * DELETE - Delete a record
 * Query params: type, id
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return handleCORS(
        NextResponse.json(
          { error: 'type and id are required' },
          { status: 400 }
        )
      )
    }

    // Validate type
    const validTypes = ['students', 'faculty', 'rooms', 'constraints']
    if (!validTypes.includes(type)) {
      return handleCORS(
        NextResponse.json({ error: 'Invalid type' }, { status: 400 })
      )
    }

    // Verify authentication
    const user = verifyToken(request)
    if (!user) {
      return handleCORS(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }

    console.log(`Deleting ${type} record:`, id)

    // Delete from Supabase
    const { error } = await supabaseServer
      .from(type)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this record

    if (error) throw error

    return handleCORS(NextResponse.json({ deletedCount: 1 }))
  } catch (error) {
    console.error('Delete error:', error)
    return handleCORS(
      NextResponse.json(
        { error: 'Failed to delete record' },
        { status: 500 }
      )
    )
  }
}
