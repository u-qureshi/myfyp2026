import { supabaseServer } from '@/lib/supabase'

const VALID_DATA_TYPES = ['students', 'faculty', 'rooms']

export function isValidDataType(type) {
  return VALID_DATA_TYPES.includes(type)
}

function rowToRecord(row) {
  const payload = row.payload || {}
  return {
    ...payload,
    id: row.record_id,
    type: row.data_type,
    uploadedAt: row.uploaded_at,
    order: row.sort_order ?? 0
  }
}

// ─── Uploaded data (Excel uploads) ───────────────────────────────────────────

export async function getUploadedDataByType(dataType) {
  const { data, error } = await supabaseServer
    .from('uploaded_data_records')
    .select('*')
    .eq('data_type', dataType)
    .order('sort_order', { ascending: true })
    .order('uploaded_at', { ascending: true })

  if (error) throw error
  return (data || []).map(rowToRecord)
}

export async function replaceUploadedData(dataType, records) {
  const { error: deleteError } = await supabaseServer
    .from('uploaded_data_records')
    .delete()
    .eq('data_type', dataType)

  if (deleteError) throw deleteError
  if (!records.length) return []

  const rows = records.map((record, index) => {
    const { id, type, uploadedAt, order, ...rest } = record
    return {
      record_id: String(id),
      data_type: dataType,
      payload: rest,
      sort_order: order ?? index,
      uploaded_at: uploadedAt || new Date().toISOString()
    }
  })

  const { data, error } = await supabaseServer
    .from('uploaded_data_records')
    .insert(rows)
    .select()

  if (error) throw error
  return (data || []).map(rowToRecord)
}

export async function insertUploadedRecord(dataType, record) {
  const { id, type, uploadedAt, order, ...rest } = record
  const { data, error } = await supabaseServer
    .from('uploaded_data_records')
    .insert({
      record_id: String(id),
      data_type: dataType,
      payload: rest,
      sort_order: order ?? 0,
      uploaded_at: uploadedAt || new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return rowToRecord(data)
}

export async function updateUploadedRecord(dataType, recordId, updates) {
  const { id: _id, type: _type, uploadedAt: _ua, order: _order, ...safeUpdates } = updates

  const { data: existing, error: fetchError } = await supabaseServer
    .from('uploaded_data_records')
    .select('*')
    .eq('data_type', dataType)
    .eq('record_id', String(recordId))
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!existing) return null

  const { data, error } = await supabaseServer
    .from('uploaded_data_records')
    .update({
      payload: { ...existing.payload, ...safeUpdates },
      updated_at: new Date().toISOString()
    })
    .eq('data_type', dataType)
    .eq('record_id', String(recordId))
    .select()
    .single()

  if (error) throw error
  return rowToRecord(data)
}

export async function deleteUploadedRecord(dataType, recordId) {
  const { error } = await supabaseServer
    .from('uploaded_data_records')
    .delete()
    .eq('data_type', dataType)
    .eq('record_id', String(recordId))

  if (error) throw error
  return 1
}

export async function reorderUploadedData(dataType, orderedIds) {
  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabaseServer
      .from('uploaded_data_records')
      .update({ sort_order: index, updated_at: new Date().toISOString() })
      .eq('data_type', dataType)
      .eq('record_id', String(orderedIds[index]))

    if (error) throw error
  }
}

export async function countUploadedDataByType(dataType) {
  const { count, error } = await supabaseServer
    .from('uploaded_data_records')
    .select('*', { count: 'exact', head: true })
    .eq('data_type', dataType)

  if (error) throw error
  return count || 0
}

// ─── App settings ────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  profile: {
    name: 'Administrator',
    email: 'admin@example.com',
    phone: '',
    avatarUrl: ''
  },
  notifications: {
    email: true,
    inApp: true,
    frequency: 'daily'
  },
  security: {
    twoFactorEnabled: false
  }
}

export async function getAppSettings(scope = 'admin') {
  const { data, error } = await supabaseServer
    .from('app_settings')
    .select('data')
    .eq('scope', scope)
    .maybeSingle()

  if (error) throw error
  return data?.data || DEFAULT_SETTINGS
}

export async function saveAppSettings(settings, scope = 'admin') {
  const { error } = await supabaseServer
    .from('app_settings')
    .upsert(
      { scope, data: settings, updated_at: new Date().toISOString() },
      { onConflict: 'scope' }
    )

  if (error) throw error
}

export async function patchAppSettings(updates, scope = 'admin') {
  const current = await getAppSettings(scope)
  const next = {
    ...current,
    ...updates,
    profile: { ...current.profile, ...updates.profile },
    notifications: { ...current.notifications, ...updates.notifications },
    security: { ...current.security, ...updates.security }
  }
  await saveAppSettings(next, scope)
  return next
}

// ─── Generated timetables ────────────────────────────────────────────────────

function generatedRowToMongoShape(row) {
  return {
    id: row.batch_id,
    mode: row.mode,
    timetable: row.timetable_data,
    scenarios: row.scenarios,
    bestScenarioId: row.best_scenario_id,
    constraints: row.constraints,
    metadata: row.metadata,
    generatedAt: row.generated_at,
    semester: row.semester,
    department: row.department,
    program: row.program
  }
}

export async function saveGeneratedTimetable(record) {
  const row = {
    batch_id: record.id,
    mode: record.mode || 'single',
    timetable_data: record.timetable || record.timetable_data || null,
    scenarios: record.scenarios || null,
    best_scenario_id: record.bestScenarioId || null,
    constraints: record.constraints || {},
    metadata: record.metadata || {},
    semester: record.semester || null,
    department: record.department || null,
    program: record.program || null,
    generated_at: record.generatedAt || new Date().toISOString()
  }

  const { data, error } = await supabaseServer
    .from('generated_timetables')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return generatedRowToMongoShape(data)
}

export async function getGeneratedTimetables() {
  const { data, error } = await supabaseServer
    .from('generated_timetables')
    .select('*')
    .order('generated_at', { ascending: false })

  if (error) throw error
  return (data || []).map(generatedRowToMongoShape)
}

export async function getGeneratedTimetableById(batchId) {
  const { data, error } = await supabaseServer
    .from('generated_timetables')
    .select('*')
    .eq('batch_id', batchId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return generatedRowToMongoShape(data)
}

// ─── Published timetables ────────────────────────────────────────────────────

function publishedRowToMongoShape(row) {
  return {
    id: row.publish_id,
    timetableData: row.timetable_data,
    metadata: row.metadata,
    status: row.status,
    publishedAt: row.published_at,
    publishedBy: row.published_by,
    semester: row.semester,
    program: row.program,
    year: row.year,
    isActive: row.is_active,
    deactivatedAt: row.deactivated_at,
    deactivatedReason: row.deactivated_reason,
    accessCount: row.access_count,
    lastAccessed: row.last_accessed,
    version: row.version
  }
}

export async function deactivatePublishedTimetable(semester, program, year) {
  const { error } = await supabaseServer
    .from('published_timetables')
    .update({
      is_active: false,
      deactivated_at: new Date().toISOString(),
      deactivated_reason: 'Replaced by newer version'
    })
    .eq('semester', semester)
    .eq('program', program)
    .eq('year', year)
    .eq('is_active', true)

  if (error) throw error
}

export async function savePublishedTimetable(record) {
  const row = {
    publish_id: record.id,
    timetable_data: record.timetableData,
    metadata: record.metadata || {},
    status: record.status || 'published',
    semester: record.semester || null,
    program: record.program || null,
    year: record.year || null,
    published_by: record.publishedBy || null,
    published_at: record.publishedAt || new Date().toISOString(),
    is_active: record.isActive !== false,
    access_count: record.accessCount || 0,
    version: record.version || 1
  }

  const { data, error } = await supabaseServer
    .from('published_timetables')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return publishedRowToMongoShape(data)
}

export async function getPublishedTimetables(filters = {}) {
  let query = supabaseServer.from('published_timetables').select('*')

  if (filters.semester) query = query.eq('semester', filters.semester)
  if (filters.program) query = query.eq('program', filters.program)
  if (filters.year) query = query.eq('year', filters.year)
  if (filters.active !== undefined && filters.active !== null) {
    query = query.eq('is_active', filters.active === true || filters.active === 'true')
  }

  const { data, error } = await query
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data || []).map(publishedRowToMongoShape)
}

export async function findActivePublishedTimetable(semester, program, year) {
  const { data, error } = await supabaseServer
    .from('published_timetables')
    .select('*')
    .eq('semester', semester)
    .eq('program', program)
    .eq('year', year)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return publishedRowToMongoShape(data)
}
