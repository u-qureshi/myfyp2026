/**
 * Supabase Database Helper Functions
 * Provides convenient methods for common database operations
 */

import { supabaseClient, supabaseServer } from './supabase'

// ============================================================================
// DEPARTMENTS
// ============================================================================

export async function getDepartments(useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('departments').select('*')
  if (error) throw error
  return data
}

export async function getDepartmentById(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('departments').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createDepartment(department, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('departments').insert([department]).select()
  if (error) throw error
  return data[0]
}

export async function updateDepartment(id, updates, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('departments').update(updates).eq('id', id).select()
  if (error) throw error
  return data[0]
}

export async function deleteDepartment(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client.from('departments').delete().eq('id', id)
  if (error) throw error
}

// ============================================================================
// USERS
// ============================================================================

export async function getUsers(useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('users').select('*')
  if (error) throw error
  return data
}

export async function getUserById(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('users').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function getUserByEmail(email, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('users').select('*').eq('email', email).single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || null
}

export async function createUser(user, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('users').insert([user]).select()
  if (error) throw error
  return data[0]
}

export async function updateUser(id, updates, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('users').update(updates).eq('id', id).select()
  if (error) throw error
  return data[0]
}

export async function deleteUser(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client.from('users').delete().eq('id', id)
  if (error) throw error
}

// ============================================================================
// ROOMS
// ============================================================================

export async function getRooms(useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('rooms').select('*')
  if (error) throw error
  return data
}

export async function getRoomById(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('rooms').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createRoom(room, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('rooms').insert([room]).select()
  if (error) throw error
  return data[0]
}

export async function updateRoom(id, updates, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('rooms').update(updates).eq('id', id).select()
  if (error) throw error
  return data[0]
}

export async function deleteRoom(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client.from('rooms').delete().eq('id', id)
  if (error) throw error
}

// ============================================================================
// SUBJECTS
// ============================================================================

export async function getSubjects(useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('subjects').select('*')
  if (error) throw error
  return data
}

export async function getSubjectById(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('subjects').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createSubject(subject, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('subjects').insert([subject]).select()
  if (error) throw error
  return data[0]
}

export async function updateSubject(id, updates, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('subjects').update(updates).eq('id', id).select()
  if (error) throw error
  return data[0]
}

export async function deleteSubject(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client.from('subjects').delete().eq('id', id)
  if (error) throw error
}

// ============================================================================
// SECTIONS
// ============================================================================

export async function getSections(useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('sections').select('*')
  if (error) throw error
  return data
}

export async function getSectionById(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('sections').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createSection(section, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('sections').insert([section]).select()
  if (error) throw error
  return data[0]
}

export async function updateSection(id, updates, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('sections').update(updates).eq('id', id).select()
  if (error) throw error
  return data[0]
}

export async function deleteSection(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client.from('sections').delete().eq('id', id)
  if (error) throw error
}

// ============================================================================
// FACULTY AVAILABILITY
// ============================================================================

export async function getFacultyAvailability(facultyId, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client
    .from('faculty_availability')
    .select('*')
    .eq('faculty_id', facultyId)
  if (error) throw error
  return data
}

export async function createFacultyAvailability(availability, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('faculty_availability').insert([availability]).select()
  if (error) throw error
  return data[0]
}

export async function updateFacultyAvailability(id, updates, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client
    .from('faculty_availability')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

// ============================================================================
// TIMETABLE SLOTS
// ============================================================================

export async function getTimetableSlots(filters = {}, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  let query = client.from('timetable_slots').select('*')

  if (filters.section_id) query = query.eq('section_id', filters.section_id)
  if (filters.faculty_id) query = query.eq('faculty_id', filters.faculty_id)
  if (filters.room_id) query = query.eq('room_id', filters.room_id)
  if (filters.semester) query = query.eq('semester', filters.semester)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getTimetableSlotById(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client
    .from('timetable_slots')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createTimetableSlot(slot, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('timetable_slots').insert([slot]).select()
  if (error) throw error
  return data[0]
}

export async function updateTimetableSlot(id, updates, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client
    .from('timetable_slots')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export async function deleteTimetableSlot(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client.from('timetable_slots').delete().eq('id', id)
  if (error) throw error
}

export async function deleteTimetableSlotsForSection(sectionId, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client.from('timetable_slots').delete().eq('section_id', sectionId)
  if (error) throw error
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getNotifications(userId, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getUnreadNotifications(userId, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createNotification(notification, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client.from('notifications').insert([notification]).select()
  if (error) throw error
  return data[0]
}

export async function markNotificationAsRead(notificationId, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { data, error } = await client
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
  if (error) throw error
  return data[0]
}

export async function markAllNotificationsAsRead(userId, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
  if (error) throw error
}

export async function deleteNotification(id, useServer = false) {
  const client = useServer ? supabaseServer : supabaseClient
  const { error } = await client.from('notifications').delete().eq('id', id)
  if (error) throw error
}
