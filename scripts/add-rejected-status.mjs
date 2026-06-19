/**
 * Add 'rejected' status + rejection columns for student constraint requests.
 * Usage: node scripts/add-rejected-status.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const lines = fs.readFileSync(filePath, 'utf8').split('\n')
  const env = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

function buildDatabaseUrl(env) {
  if (env.DATABASE_URL) return env.DATABASE_URL
  const password = env.SUPABASE_DB_PASSWORD
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  if (!password || !supabaseUrl) return null
  const ref = supabaseUrl.replace(/^https?:\/\//, '').split('.')[0]
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
}

const env = { ...loadEnv(path.join(root, '.env')), ...loadEnv(path.join(root, '.env.local')) }
const databaseUrl = buildDatabaseUrl(env)

if (!databaseUrl) {
  console.error('Missing database URL in .env.local')
  process.exit(1)
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
await client.connect()

await client.query(`
  DO $$ BEGIN
    ALTER TYPE constraint_request_status ADD VALUE IF NOT EXISTS 'rejected';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$;
`)

await client.query(`
  ALTER TABLE student_constraint_requests
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
`)

await client.end()
console.log('Added rejected status and rejection columns.')
