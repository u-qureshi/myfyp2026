import { supabaseServer } from '@/lib/supabase'

function mapRequest(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    departmentId: row.department_id,
    departmentName: row.department_name,
    semester: row.semester,
    availability: row.availability || {},
    status: row.status,
    requestedBy: row.requested_by,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at
  }
}

export async function getLatestAvailabilityRequest(userId) {
  const { data, error } = await supabaseServer
    .from('faculty_availability_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return mapRequest(data)
}

export async function listAvailabilityRequests(status = null) {
  let query = supabaseServer
    .from('faculty_availability_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return (data || []).map(mapRequest)
}

export async function submitFacultyAvailability(userId, { availability, requestId = null }) {
  const now = new Date().toISOString()

  let existing = null
  if (requestId) {
    const { data } = await supabaseServer
      .from('faculty_availability_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', userId)
      .maybeSingle()
    existing = data
  } else {
    const latest = await getLatestAvailabilityRequest(userId)
    if (latest && ['requested', 'submitted'].includes(latest.status)) {
      existing = { id: latest.id, ...latest }
    }
  }

  if (existing) {
    const { data, error } = await supabaseServer
      .from('faculty_availability_requests')
      .update({
        availability,
        status: 'submitted',
        submitted_at: now,
        updated_at: now
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) throw error
    return mapRequest(data)
  }

  const { data: userRow } = await supabaseServer
    .from('users')
    .select('department_id, departments(name)')
    .eq('id', userId)
    .maybeSingle()

  const { data, error } = await supabaseServer
    .from('faculty_availability_requests')
    .insert([
      {
        user_id: userId,
        department_id: userRow?.department_id || null,
        department_name: userRow?.departments?.name || null,
        semester: 1,
        availability,
        status: 'submitted',
        submitted_at: now,
        created_at: now,
        updated_at: now
      }
    ])
    .select('*')
    .single()

  if (error) throw error
  return mapRequest(data)
}

export async function requestAvailabilityFromFaculty({
  semester,
  departmentId = null,
  requestedBy = null,
  notes = null
}) {
  const sem = parseInt(semester, 10)
  let facultyQuery = supabaseServer
    .from('users')
    .select('id, name, email, department_id, departments(name)')
    .eq('role', 'faculty')

  if (departmentId) {
    facultyQuery = facultyQuery.eq('department_id', departmentId)
  }

  const { data: facultyList, error: facultyError } = await facultyQuery
  if (facultyError) throw facultyError
  if (!facultyList?.length) {
    return { created: 0, faculty: [] }
  }

  const now = new Date().toISOString()
  const created = []

  for (const faculty of facultyList) {
    const { data: existing } = await supabaseServer
      .from('faculty_availability_requests')
      .select('id, status')
      .eq('user_id', faculty.id)
      .eq('semester', sem)
      .in('status', ['requested', 'submitted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing?.status === 'submitted') {
      created.push({ facultyId: faculty.id, facultyName: faculty.name, skipped: true, reason: 'already_submitted' })
      continue
    }

    if (existing?.status === 'requested') {
      created.push({ facultyId: faculty.id, facultyName: faculty.name, skipped: true, reason: 'already_requested' })
      continue
    }

    const { data: row, error } = await supabaseServer
      .from('faculty_availability_requests')
      .insert([
        {
          user_id: faculty.id,
          department_id: faculty.department_id,
          department_name: faculty.departments?.name || null,
          semester: sem,
          availability: {},
          status: 'requested',
          requested_by: requestedBy,
          notes,
          created_at: now,
          updated_at: now
        }
      ])
      .select('*')
      .single()

    if (error) throw error

    try {
      await supabaseServer.from('notifications').insert([
        {
          user_id: faculty.id,
          title: 'Availability request',
          message: `Admin has requested your teaching availability for semester ${sem}. Please submit your weekly schedule.`,
          is_read: false
        }
      ])
    } catch {
      /* notifications table optional */
    }

    created.push({ facultyId: faculty.id, facultyName: faculty.name, requestId: row.id, status: 'requested' })
  }

  return { created, count: created.filter((c) => !c.skipped).length }
}

export async function getSubmittedAvailabilityMap(departmentId, semester) {
  let query = supabaseServer
    .from('faculty_availability_requests')
    .select('user_id, availability, status')
    .eq('semester', parseInt(semester, 10))
    .eq('status', 'submitted')

  if (departmentId) {
    query = query.eq('department_id', departmentId)
  }

  const { data, error } = await query
  if (error) throw error

  const map = {}
  ;(data || []).forEach((row) => {
    if (row.availability && Object.keys(row.availability).length) {
      map[row.user_id] = row.availability
    }
  })
  return map
}

export async function getFacultyAvailabilityReadiness(departmentId, semester) {
  const sem = parseInt(semester, 10)

  const { data: faculty, error: fErr } = await supabaseServer
    .from('users')
    .select('id, name')
    .eq('role', 'faculty')
    .eq('department_id', departmentId)

  if (fErr) throw fErr

  const { data: requests, error: rErr } = await supabaseServer
    .from('faculty_availability_requests')
    .select('user_id, status, submitted_at')
    .eq('department_id', departmentId)
    .eq('semester', sem)
    .order('created_at', { ascending: false })

  if (rErr) throw rErr

  const latestByUser = {}
  ;(requests || []).forEach((r) => {
    if (!latestByUser[r.user_id]) latestByUser[r.user_id] = r
  })

  const total = faculty?.length || 0
  const submitted = (faculty || []).filter((f) => latestByUser[f.id]?.status === 'submitted').length
  const pending = (faculty || []).filter(
    (f) => !latestByUser[f.id] || latestByUser[f.id].status === 'requested'
  )

  return {
    total,
    submitted,
    pendingCount: total - submitted,
    ready: total > 0 && submitted === total,
    pendingFaculty: pending.map((f) => f.name)
  }
}
