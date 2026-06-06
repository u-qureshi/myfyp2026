import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, '.env.local')

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
  if (env.SUPABASE_DB_URL) return env.SUPABASE_DB_URL

  const password = env.SUPABASE_DB_PASSWORD
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  if (!password || !supabaseUrl) return null

  const ref = supabaseUrl.replace(/^https?:\/\//, '').split('.')[0]
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
}

const env = loadEnv(envPath)
const databaseUrl = buildDatabaseUrl(env)

if (!databaseUrl) {
  console.error(`
Missing database connection.

Add ONE of these to .env.local:

  SUPABASE_DB_PASSWORD=your-database-password

or:

  DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
`)
  process.exit(1)
}

const sqlPath = path.join(root, 'lib', 'legacy-store-schema.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  await client.query(sql)
  console.log('✅ Legacy store schema applied successfully (uploaded_data_records, generated_timetables, published_timetables, app_settings)')
} catch (err) {
  console.error('❌ Schema migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
