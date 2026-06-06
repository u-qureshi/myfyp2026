import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import {
  deactivatePublishedTimetable,
  findActivePublishedTimetable,
  getPublishedTimetables,
  savePublishedTimetable
} from '@/lib/legacy-store'
import { supabaseServer } from '@/lib/supabase'

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    const { timetableData, metadata } = await request.json()

    if (!timetableData) {
      return handleCORS(NextResponse.json({ error: 'No timetable data provided' }, { status: 400 }))
    }

    const publishedTimetable = {
      id: uuidv4(),
      timetableData,
      metadata,
      status: 'published',
      publishedAt: new Date().toISOString(),
      publishedBy: metadata?.publishedBy || 'Administrator',
      semester: metadata?.semester || 'Fall 2025',
      program: metadata?.program || 'B.Ed + FYUP',
      year: metadata?.year || new Date().getFullYear(),
      isActive: true,
      version: 1,
      accessCount: 0
    }

    const existing = await findActivePublishedTimetable(
      publishedTimetable.semester,
      publishedTimetable.program,
      publishedTimetable.year
    )

    if (existing) {
      await deactivatePublishedTimetable(
        publishedTimetable.semester,
        publishedTimetable.program,
        publishedTimetable.year
      )
    }

    await savePublishedTimetable(publishedTimetable)

    const notificationId = uuidv4()
    const { data: users } = await supabaseServer
      .from('users')
      .select('id')
      .in('role', ['faculty', 'student'])

    if (users?.length) {
      const notifications = users.map((user) => ({
        user_id: user.id,
        title: 'New Timetable Published',
        message: `The ${publishedTimetable.semester} timetable for ${publishedTimetable.program} has been published and is now available.`,
        is_read: false
      }))

      await supabaseServer.from('notifications').insert(notifications)
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/public/timetable/${publishedTimetable.id}`

    return handleCORS(
      NextResponse.json({
        success: true,
        message: 'Timetable published successfully',
        publishedTimetable: {
          id: publishedTimetable.id,
          status: 'published',
          publishedAt: publishedTimetable.publishedAt,
          semester: publishedTimetable.semester,
          program: publishedTimetable.program,
          year: publishedTimetable.year,
          publicUrl,
          sharingLinks: {
            view: publicUrl,
            pdf: `${publicUrl}/export/pdf`,
            excel: `${publicUrl}/export/excel`,
            embed: `${publicUrl}/embed`
          }
        },
        notification: {
          message: 'Students and faculty have been notified about the new timetable',
          recipients: ['faculty', 'students'],
          notificationId
        }
      })
    )
  } catch (error) {
    console.error('Timetable publishing error:', error)
    return handleCORS(
      NextResponse.json({ error: `Failed to publish timetable: ${error.message}` }, { status: 500 })
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      semester: searchParams.get('semester') || undefined,
      program: searchParams.get('program') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year'), 10) : undefined,
      active: searchParams.has('active') ? searchParams.get('active') : undefined
    }

    const publishedTimetables = await getPublishedTimetables(filters)

    return handleCORS(
      NextResponse.json({
        success: true,
        timetables: publishedTimetables.map((tt) => ({
          id: tt.id,
          semester: tt.semester,
          program: tt.program,
          year: tt.year,
          publishedAt: tt.publishedAt,
          publishedBy: tt.publishedBy,
          isActive: tt.isActive,
          accessCount: tt.accessCount,
          lastAccessed: tt.lastAccessed
        }))
      })
    )
  } catch (error) {
    console.error('Error retrieving published timetables:', error)
    return handleCORS(
      NextResponse.json({ error: `Failed to retrieve published timetables: ${error.message}` }, { status: 500 })
    )
  }
}
