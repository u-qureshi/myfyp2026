import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import {
  getLatestConstraintRequest,
  getLatestTimetableOptions,
  getSelectedTimetable,
  getStudentProfile
} from '@/lib/student-portal-store'
import { supabaseServer } from '@/lib/supabase'

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function mapDbNotification(row) {
  const isReject = /reject/i.test(row.title || '')
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    time: formatRelativeTime(row.created_at),
    unread: !row.is_read,
    type: isReject ? 'alert' : 'info',
    source: 'db'
  }
}

function buildPortalNotifications({ profile, request, options, selected }) {
  const items = []

  if (profile?.profileComplete && !request) {
    items.push({
      id: 'portal-submit-constraints',
      title: 'Complete your timetable request',
      message: 'Choose your scheduling constraints so admin can generate your options.',
      time: 'Action needed',
      unread: true,
      type: 'info',
      source: 'portal'
    })
  }

  if (request?.status === 'pending') {
    items.push({
      id: 'portal-pending',
      title: 'Constraints submitted',
      message: 'Your request is waiting for admin approval.',
      time: formatRelativeTime(request.createdAt),
      unread: true,
      type: 'info',
      source: 'portal'
    })
  }

  if (request?.status === 'rejected') {
    items.push({
      id: 'portal-rejected',
      title: 'Request rejected',
      message: request.rejectionReason || 'Your constraint request was rejected. You can update and resubmit.',
      time: formatRelativeTime(request.rejectedAt || request.updatedAt),
      unread: true,
      type: 'alert',
      source: 'portal',
      href: '/student/constraints'
    })
  }

  if (request?.status === 'expired') {
    items.push({
      id: 'portal-expired',
      title: 'Timetable expired',
      message:
        'Your timetable validity (4 months) has ended and was removed. Submit new constraints to request a fresh timetable.',
      time: formatRelativeTime(request.updatedAt),
      unread: true,
      type: 'alert',
      source: 'portal',
      href: '/student/constraints'
    })
  }

  if (request?.status === 'approved') {
    items.push({
      id: 'portal-approved',
      title: 'Request approved',
      message: 'Admin approved your constraints. Timetable options are being generated.',
      time: formatRelativeTime(request.approvedAt || request.updatedAt),
      unread: true,
      type: 'success',
      source: 'portal'
    })
  }

  if (request?.status === 'ready' && options?.options?.length) {
    items.push({
      id: 'portal-ready',
      title: 'Pick your timetable',
      message: `${options.options.length} timetable options are ready for you.`,
      time: formatRelativeTime(request.readyAt || options.createdAt),
      unread: true,
      type: 'success',
      source: 'portal',
      href: '/student/pick-timetable'
    })
  }

  if (selected?.timetable) {
    items.push({
      id: 'portal-selected',
      title: 'Timetable saved',
      message: 'Your selected timetable is now available in My Timetable.',
      time: formatRelativeTime(selected.selectedAt),
      unread: false,
      type: 'success',
      source: 'portal'
    })
  }

  return items
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [profile, request, options, selected] = await Promise.all([
      getStudentProfile(user.id).catch(() => null),
      getLatestConstraintRequest(user.id).catch(() => null),
      getLatestTimetableOptions(user.id).catch(() => null),
      getSelectedTimetable(user.id).catch(() => null)
    ])

    const portalItems = buildPortalNotifications({ profile, request, options, selected })

    let dbItems = []
    try {
      const { data, error } = await supabaseServer
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data?.length) {
        dbItems = data.map(mapDbNotification)
      }
    } catch {
      /* notifications table optional */
    }

    const notifications = [...portalItems, ...dbItems]
    const unreadCount = notifications.filter((n) => n.unread).length

    return NextResponse.json({ success: true, notifications, unreadCount })
  } catch (error) {
    console.error('GET student notifications error:', error)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id || String(id).startsWith('portal-')) {
      return NextResponse.json({ success: true })
    }

    const { error } = await supabaseServer
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH student notifications error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
