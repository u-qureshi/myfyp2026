import { supabaseServer } from '@/lib/supabase'

export async function notifyUser(userId, { title, message }) {
  try {
    await supabaseServer.from('notifications').insert([
      {
        user_id: userId,
        title,
        message,
        is_read: false
      }
    ])
  } catch {
    /* notifications table optional */
  }
}
