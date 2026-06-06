import { NextResponse } from 'next/server'
import {
  deleteUploadedRecord,
  getUploadedDataByType,
  insertUploadedRecord,
  isValidDataType,
  reorderUploadedData,
  updateUploadedRecord
} from '@/lib/legacy-store'

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

export async function GET(request) {
  try {
    const type = new URL(request.url).searchParams.get('type')

    if (!type) {
      return handleCORS(NextResponse.json({ error: 'Type parameter is required' }, { status: 400 }))
    }

    if (!isValidDataType(type)) {
      return handleCORS(NextResponse.json({ error: 'Invalid type' }, { status: 400 }))
    }

    const data = await getUploadedDataByType(type)
    return handleCORS(NextResponse.json(data))
  } catch (error) {
    console.error('Data retrieval error:', error)
    return handleCORS(NextResponse.json([]))
  }
}

export async function PATCH(request) {
  try {
    const { type, id, updates } = await request.json()

    if (!type || !id || !updates || typeof updates !== 'object') {
      return handleCORS(
        NextResponse.json({ error: 'type, id and updates are required' }, { status: 400 })
      )
    }

    if (!isValidDataType(type)) {
      return handleCORS(NextResponse.json({ error: 'Invalid type' }, { status: 400 }))
    }

    const record = await updateUploadedRecord(type, id, updates)
    if (!record) {
      return handleCORS(NextResponse.json({ matchedCount: 0, modifiedCount: 0 }))
    }

    return handleCORS(NextResponse.json({ matchedCount: 1, modifiedCount: 1 }))
  } catch (error) {
    console.error('Data update error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to update record' }, { status: 500 }))
  }
}

export async function PUT(request) {
  try {
    const { type, orderedIds } = await request.json()

    if (!type || !Array.isArray(orderedIds)) {
      return handleCORS(
        NextResponse.json({ error: 'type and orderedIds array are required' }, { status: 400 })
      )
    }

    if (!isValidDataType(type)) {
      return handleCORS(NextResponse.json({ error: 'Invalid type' }, { status: 400 }))
    }

    await reorderUploadedData(type, orderedIds)
    return handleCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Reorder error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to reorder records' }, { status: 500 }))
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return handleCORS(NextResponse.json({ error: 'type and id are required' }, { status: 400 }))
    }

    if (!isValidDataType(type)) {
      return handleCORS(NextResponse.json({ error: 'Invalid type' }, { status: 400 }))
    }

    const deletedCount = await deleteUploadedRecord(type, id)
    return handleCORS(NextResponse.json({ deletedCount }))
  } catch (error) {
    console.error('Delete error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to delete record' }, { status: 500 }))
  }
}

export async function POST(request) {
  try {
    const { type, record } = await request.json()

    if (!type || !record || typeof record !== 'object') {
      return handleCORS(NextResponse.json({ error: 'type and record are required' }, { status: 400 }))
    }

    if (!isValidDataType(type)) {
      return handleCORS(NextResponse.json({ error: 'Invalid type' }, { status: 400 }))
    }

    const inserted = await insertUploadedRecord(type, record)
    return handleCORS(NextResponse.json({ insertedId: inserted.id, record: inserted }))
  } catch (error) {
    console.error('Create error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to create record' }, { status: 500 }))
  }
}
