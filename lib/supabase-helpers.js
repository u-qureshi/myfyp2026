import { supabaseServer } from './supabase'
import bcrypt from 'bcryptjs'

/**
 * Create a new user in Supabase
 */
export async function createUser(email, password, name = '', role = 'user') {
  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    const { data, error } = await supabaseServer
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
          role
        }
      ])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error }
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting user:', error)
    return { success: false, error }
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting user:', error)
    return { success: false, error }
  }
}

/**
 * Create or update timetable
 */
export async function saveTimetable(userId, title, data, metadata = {}) {
  try {
    // Check if timetable exists
    const { data: existing } = await supabaseServer
      .from('timetables')
      .select('id')
      .eq('user_id', userId)
      .eq('title', title)
      .single()

    let result
    if (existing) {
      // Update existing
      result = await supabaseServer
        .from('timetables')
        .update({
          data,
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Create new
      result = await supabaseServer
        .from('timetables')
        .insert([
          {
            user_id: userId,
            title,
            data,
            metadata,
            status: 'draft'
          }
        ])
        .select()
        .single()
    }

    if (result.error) throw result.error
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Error saving timetable:', error)
    return { success: false, error }
  }
}

/**
 * Get timetables for user
 */
export async function getUserTimetables(userId) {
  try {
    const { data, error } = await supabaseServer
      .from('timetables')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting timetables:', error)
    return { success: false, error }
  }
}

/**
 * Get single timetable by ID
 */
export async function getTimetableById(timetableId, userId) {
  try {
    const { data, error } = await supabaseServer
      .from('timetables')
      .select('*')
      .eq('id', timetableId)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting timetable:', error)
    return { success: false, error }
  }
}

/**
 * Delete timetable
 */
export async function deleteTimetable(timetableId, userId) {
  try {
    const { error } = await supabaseServer
      .from('timetables')
      .delete()
      .eq('id', timetableId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting timetable:', error)
    return { success: false, error }
  }
}

/**
 * Publish timetable
 */
export async function publishTimetable(timetableId, userId) {
  try {
    const { data, error } = await supabaseServer
      .from('timetables')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', timetableId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error publishing timetable:', error)
    return { success: false, error }
  }
}

/**
 * Save user settings
 */
export async function saveSetting(userId, key, value) {
  try {
    const { data: existing } = await supabaseServer
      .from('settings')
      .select('id')
      .eq('user_id', userId)
      .eq('key', key)
      .single()

    let result
    if (existing) {
      result = await supabaseServer
        .from('settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabaseServer
        .from('settings')
        .insert([{ user_id: userId, key, value }])
        .select()
        .single()
    }

    if (result.error) throw result.error
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Error saving setting:', error)
    return { success: false, error }
  }
}

/**
 * Get user settings
 */
export async function getUserSettings(userId) {
  try {
    const { data, error } = await supabaseServer
      .from('settings')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    // Convert to object format
    const settings = {}
    data?.forEach(setting => {
      settings[setting.key] = setting.value
    })

    return { success: true, data: settings }
  } catch (error) {
    console.error('Error getting settings:', error)
    return { success: false, error }
  }
}

/**
 * Log metric event
 */
export async function logMetric(userId, eventType, eventData = {}) {
  try {
    const { error } = await supabaseServer
      .from('metrics')
      .insert([
        {
          user_id: userId,
          event_type: eventType,
          data: eventData
        }
      ])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error logging metric:', error)
    return { success: false, error }
  }
}
