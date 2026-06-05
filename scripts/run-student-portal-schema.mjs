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

Add ONE of these to .env.local (Supabase → Settings → Database):

  SUPABASE_DB_PASSWORD=your-database-password

or full URI:

  DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

Then run: npm run db:student-portal
`)
  process.exit(1)
}

const sqlPath = path.join(root, 'lib/student-portal-schema.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
})

try {
  console.log('Connecting to Supabase PostgreSQL...')
  await client.connect()
  console.log('Running lib/student-portal-schema.sql...')
  await client.query(sql)
  console.log('Done. Student portal tables created.')

  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'student_profiles',
        'student_constraint_requests',
        'student_timetable_options',
        'student_selected_timetables'
      )
    ORDER BY table_name
  `)
  console.log('Tables:', rows.map((r) => r.table_name).join(', ') || '(none found)')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
