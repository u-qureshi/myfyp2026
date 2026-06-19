/**
 * Add timetable expiry columns and expired status.
 * Usage: node scripts/add-timetable-expiry.mjs
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
  console.error('Missing database URL')
  process.exit(1)
}

const sql = fs.readFileSync(
  path.join(root, 'lib/migrations/add-timetable-expiry-full.sql'),
  'utf8'
)

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
await client.connect()
await client.query(sql)
await client.end()
console.log('Timetable expiry migration applied.')
