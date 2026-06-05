import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for browser-side requests (uses anon key)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Server client for API routes (uses service role key)
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey
)

export { supabaseUrl }
