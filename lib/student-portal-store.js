import { supabaseServer } from '@/lib/supabase'
import { computeTimetableExpiry, isExpiredRow } from '@/lib/student-timetable-expiry'
import { notifyUser } from '@/lib/notify-user'

function mapProfile(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    departmentId: row.department_id,
    departmentName: row.department_name,
    departmentCode: row.department_code,
    semester: row.semester,
    profileComplete: row.profile_complete,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapRequest(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    departmentId: row.department_id,
    departmentName: row.department_name,
    semester: row.semester,
    constraints: row.constraints,
    status: row.status,
    error: row.error,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    readyAt: row.ready_at,
    rejectedAt: row.rejected_at
  }
}

function mapOptions(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    requestId: row.request_id,
    options: row.options,
    createdAt: row.created_at,
    expiresAt: row.expires_at || computeTimetableExpiry(row.created_at)
  }
}

function mapSelected(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    requestId: row.request_id,
    optionsId: row.options_id,
    optionIndex: row.option_index,
    timetable: row.timetable,
    summary: row.summary,
    selectedAt: row.selected_at,
    expiresAt: row.expires_at
  }
}

export async function getStudentProfile(userId) {
  const { data, error } = await supabaseServer
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return mapProfile(data)
}

export async function upsertStudentProfile(userId, payload) {
  const now = new Date().toISOString()
  const profileComplete = !!(payload.departmentId && payload.semester)

  let departmentCode = payload.departmentCode ?? null
  if (payload.departmentId && !departmentCode) {
    const { data: dept } = await supabaseServer
      .from('departments')
      .select('code, name')
      .eq('id', payload.departmentId)
      .maybeSingle()
    departmentCode = dept?.code ?? null
    if (!payload.departmentName && dept?.name) {
      payload = { ...payload, departmentName: dept.name }
    }
  }

  const row = {
    user_id: userId,
    email: payload.email ?? null,
    name: payload.name ?? null,
    department_id: payload.departmentId ?? null,
    department_name: payload.departmentName ?? null,
    department_code: departmentCode,
    semester: payload.semester != null ? parseInt(payload.semester, 10) : null,
    profile_complete: profileComplete,
    updated_at: now
  }

  const { data: existing } = await supabaseServer
    .from('student_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabaseServer
      .from('student_profiles')
      .update(row)
      .eq('user_id', userId)
      .select('*')
      .single()
    if (error) throw error
    return mapProfile(data)
  }

  const { data, error } = await supabaseServer
    .from('student_profiles')
    .insert([{ ...row, created_at: now }])
    .select('*')
    .single()

  if (error) throw error
  return mapProfile(data)
}

export async function createConstraintRequest(userId, { departmentId, departmentName, semester, constraints }) {
  const now = new Date().toISOString()
  const { data, error } = await supabaseServer
    .from('student_constraint_requests')
    .insert([
      {
        user_id: userId,
        department_id: departmentId,
        department_name: departmentName,
        semester: parseInt(semester, 10),
        constraints,
        status: 'pending',
        created_at: now,
        updated_at: now
      }
    ])
    .select('*')
    .single()

  if (error) throw error
  return mapRequest(data)
}

export async function getLatestConstraintRequest(userId) {
  const { data, error } = await supabaseServer
    .from('student_constraint_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return mapRequest(data)
}

export async function listConstraintRequests(status = null) {
  let query = supabaseServer
    .from('student_constraint_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return (data || []).map(mapRequest)
}

export async function updateConstraintRequest(id, updates) {
  const dbUpdates = { updated_at: new Date().toISOString() }
  if (updates.status != null) dbUpdates.status = updates.status
  if (updates.error != null) dbUpdates.error = updates.error
  if (updates.approvedAt != null) dbUpdates.approved_at = updates.approvedAt
  if (updates.readyAt != null) dbUpdates.ready_at = updates.readyAt
  if (updates.rejectedAt != null) dbUpdates.rejected_at = updates.rejectedAt
  if (updates.rejectionReason != null) dbUpdates.rejection_reason = updates.rejectionReason
  if (updates.clearError) dbUpdates.error = null

  const { data, error } = await supabaseServer
    .from('student_constraint_requests')
    .update(dbUpdates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return mapRequest(data)
}

export async function getConstraintRequestById(id) {
  const { data, error } = await supabaseServer
    .from('student_constraint_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return mapRequest(data)
}

export async function markRequestApproved(id) {
  const now = new Date().toISOString()
  return updateConstraintRequest(id, {
    status: 'approved',
    approvedAt: now,
    clearError: true
  })
}

export async function rejectConstraintRequest(id, { reason = null } = {}) {
  const now = new Date().toISOString()
  return updateConstraintRequest(id, {
    status: 'rejected',
    rejectedAt: now,
    rejectionReason: reason || 'Your constraint request was rejected by admin.',
    clearError: true
  })
}

export async function approveAllPendingRequests() {
  const { data: rows, error: fetchError } = await supabaseServer
    .from('student_constraint_requests')
    .select('*')
    .in('status', ['pending', 'error', 'approved'])
    .order('created_at', { ascending: false })

  if (fetchError) throw fetchError

  const pending = (rows || []).filter(
    (r) => r.status === 'pending' || r.status === 'error' || (r.status === 'approved' && r.error)
  )
  if (!pending.length) return []

  const now = new Date().toISOString()
  const ids = pending.map((r) => r.id)

  const { error: updateError } = await supabaseServer
    .from('student_constraint_requests')
    .update({ status: 'approved', approved_at: now, updated_at: now })
    .in('id', ids)

  if (updateError) throw updateError

  return pending.map((row) =>
    mapRequest({ ...row, status: 'approved', approved_at: now, updated_at: now })
  )
}

export async function cleanupExpiredStudentTimetables(userId, { notify = false } = {}) {
  const [{ data: selectedRows }, { data: optionRows }] = await Promise.all([
    supabaseServer.from('student_selected_timetables').select('*').eq('user_id', userId),
    supabaseServer.from('student_timetable_options').select('*').eq('user_id', userId)
  ])

  const expiredSelected = (selectedRows || []).filter((row) =>
    isExpiredRow(row, { expiresField: 'expires_at', fallbackDateField: 'selected_at' })
  )
  const expiredOptions = (optionRows || []).filter((row) =>
    isExpiredRow(row, { expiresField: 'expires_at', fallbackDateField: 'created_at' })
  )

  if (expiredSelected.length) {
    await supabaseServer
      .from('student_selected_timetables')
      .delete()
      .in(
        'id',
        expiredSelected.map((r) => r.id)
      )
  }

  if (expiredOptions.length) {
    await supabaseServer
      .from('student_timetable_options')
      .delete()
      .in(
        'id',
        expiredOptions.map((r) => r.id)
      )
  }

  const requestIds = [
    ...new Set(
      [...expiredSelected, ...expiredOptions].map((r) => r.request_id).filter(Boolean)
    )
  ]

  let requestsExpired = 0
  for (const requestId of requestIds) {
    const request = await getConstraintRequestById(requestId)
    if (request && ['ready', 'selected'].includes(request.status)) {
      await updateConstraintRequest(requestId, {
        status: 'expired',
        clearError: true
      })
      requestsExpired += 1
    }
  }

  if (notify && (expiredSelected.length || expiredOptions.length)) {
    await notifyUser(userId, {
      title: 'Timetable expired',
      message:
        'Your timetable validity period (4 months) has ended. It has been removed — submit new constraints to request a fresh timetable.'
    })
  }

  return {
    removedSelected: expiredSelected.length,
    removedOptions: expiredOptions.length,
    requestsExpired
  }
}

export async function saveTimetableOptions(userId, requestId, options) {
  const expiresAt = computeTimetableExpiry()
  const { data, error } = await supabaseServer
    .from('student_timetable_options')
    .insert([
      {
        user_id: userId,
        request_id: requestId,
        options,
        expires_at: expiresAt
      }
    ])
    .select('*')
    .single()

  if (error) throw error

  await updateConstraintRequest(requestId, { status: 'ready', readyAt: new Date().toISOString() })
  return mapOptions(data)
}

export async function getLatestTimetableOptions(userId) {
  await cleanupExpiredStudentTimetables(userId)

  const { data, error } = await supabaseServer
    .from('student_timetable_options')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const valid = (data || []).find(
    (row) => !isExpiredRow(row, { expiresField: 'expires_at', fallbackDateField: 'created_at' })
  )
  return mapOptions(valid || null)
}

export async function saveSelectedTimetable(userId, { requestId, optionsId, optionIndex, timetable, summary }) {
  const expiresAt = computeTimetableExpiry()

  const { data, error } = await supabaseServer
    .from('student_selected_timetables')
    .insert([
      {
        user_id: userId,
        request_id: requestId,
        options_id: optionsId,
        option_index: optionIndex,
        timetable,
        summary,
        expires_at: expiresAt
      }
    ])
    .select('*')
    .single()

  if (error) throw error

  if (requestId) {
    await updateConstraintRequest(requestId, { status: 'selected' })
  }

  return mapSelected(data)
}

export async function getSelectedTimetable(userId) {
  await cleanupExpiredStudentTimetables(userId)

  const { data, error } = await supabaseServer
    .from('student_selected_timetables')
    .select('*')
    .eq('user_id', userId)
    .order('selected_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  if (isExpiredRow(data, { expiresField: 'expires_at', fallbackDateField: 'selected_at' })) {
    await supabaseServer.from('student_selected_timetables').delete().eq('id', data.id)
    return null
  }

  return mapSelected(data)
}
