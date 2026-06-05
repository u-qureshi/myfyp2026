import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

// GET - Fetch all rooms
export async function GET(request) {
  try {
    // Fetch all rooms
    const { data: rooms, error: roomError } = await supabaseServer
      .from('rooms')
      .select('*')
      .order('building', { ascending: true })
      .order('name', { ascending: true })

    if (roomError) throw roomError

    return NextResponse.json({
      rooms: rooms || [],
      message: 'Rooms fetched successfully'
    })
  } catch (error) {
    console.error('GET rooms error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST - Create new room
export async function POST(request) {
  try {
    const { name, type, capacity, building, availability_status } = await request.json()

    // Validate inputs
    if (!name || !type || !capacity || !building) {
      return NextResponse.json(
        { error: 'Name, type, capacity, and building are required' },
        { status: 400 }
      )
    }

    // Validate capacity
    const capacityNum = parseInt(capacity)
    if (isNaN(capacityNum) || capacityNum < 1) {
      return NextResponse.json(
        { error: 'Capacity must be a positive number' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['classroom', 'lab', 'seminar_hall', 'lecture_hall']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid room type' },
        { status: 400 }
      )
    }

    // Insert new room
    const { data, error } = await supabaseServer
      .from('rooms')
      .insert([
        {
          name: name.trim(),
          type,
          capacity: capacityNum,
          building: building.trim(),
          availability_status: availability_status || 'available'
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      {
        room: data,
        message: 'Room created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST room error:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

// PUT - Update room
export async function PUT(request) {
  try {
    const { id, name, type, capacity, building, availability_status } = await request.json()

    // Validate inputs
    if (!id || !name || !type || !capacity || !building) {
      return NextResponse.json(
        { error: 'ID, name, type, capacity, and building are required' },
        { status: 400 }
      )
    }

    // Validate capacity
    const capacityNum = parseInt(capacity)
    if (isNaN(capacityNum) || capacityNum < 1) {
      return NextResponse.json(
        { error: 'Capacity must be a positive number' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['classroom', 'lab', 'seminar_hall', 'lecture_hall']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid room type' },
        { status: 400 }
      )
    }

    // Update room
    const { data, error } = await supabaseServer
      .from('rooms')
      .update({
        name: name.trim(),
        type,
        capacity: capacityNum,
        building: building.trim(),
        availability_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        room: data,
        message: 'Room updated successfully'
      }
    )
  } catch (error) {
    console.error('PUT room error:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// DELETE - Delete room
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Check if room has timetable slots
    const { count: slotCount, error: slotError } = await supabaseServer
      .from('timetable_slots')
      .select('id', { count: 'exact' })
      .eq('room_id', id)

    if (slotCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete room with assigned timetable slots'
        },
        { status: 409 }
      )
    }

    // Delete room
    const { error } = await supabaseServer
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Room deleted successfully' }
    )
  } catch (error) {
    console.error('DELETE room error:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
