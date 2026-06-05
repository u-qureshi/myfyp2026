import { supabaseServer } from '@/lib/supabase'

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    readyAt: row.ready_at
  }
}

function mapOptions(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    requestId: row.request_id,
    options: row.options,
    createdAt: row.created_at
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
    selectedAt: row.selected_at
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

  const { data, error } = await supabaseServer
    .from('student_constraint_requests')
    .update(dbUpdates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return mapRequest(data)
}

export async function approveAllPendingRequests() {
  const { data: pending, error: fetchError } = await supabaseServer
    .from('student_constraint_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (fetchError) throw fetchError
  if (!pending?.length) return []

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

export async function saveTimetableOptions(userId, requestId, options) {
  const { data, error } = await supabaseServer
    .from('student_timetable_options')
    .insert([
      {
        user_id: userId,
        request_id: requestId,
        options
      }
    ])
    .select('*')
    .single()

  if (error) throw error

  await updateConstraintRequest(requestId, { status: 'ready', readyAt: new Date().toISOString() })
  return mapOptions(data)
}

export async function getLatestTimetableOptions(userId) {
  const { data, error } = await supabaseServer
    .from('student_timetable_options')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return mapOptions(data)
}

export async function saveSelectedTimetable(userId, { requestId, optionsId, optionIndex, timetable, summary }) {
  const { data, error } = await supabaseServer
    .from('student_selected_timetables')
    .insert([
      {
        user_id: userId,
        request_id: requestId,
        options_id: optionsId,
        option_index: optionIndex,
        timetable,
        summary
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
  const { data, error } = await supabaseServer
    .from('student_selected_timetables')
    .select('*')
    .eq('user_id', userId)
    .order('selected_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return mapSelected(data)
}
