/**
 * Seed submitted faculty availability for testing.
 * Usage: node scripts/seed-faculty-availability.mjs [semester]
 * Default semester: 8
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
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
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

const env = { ...loadEnv(path.join(root, '.env')), ...loadEnv(path.join(root, '.env.local')) }
const databaseUrl = buildDatabaseUrl(env)
const semesterArg = process.argv[2] || '8'
const semesters =
  semesterArg === 'all'
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [parseInt(semesterArg, 10)]

const DEFAULT_AVAILABILITY = {
  Monday: { enabled: true, from: '09:00', to: '16:00' },
  Tuesday: { enabled: true, from: '09:00', to: '16:00' },
  Wednesday: { enabled: true, from: '09:00', to: '16:00' },
  Thursday: { enabled: true, from: '09:00', to: '16:00' },
  Friday: { enabled: true, from: '09:00', to: '16:00' },
  Saturday: { enabled: false, from: '09:00', to: '16:00' },
  Sunday: { enabled: false, from: '09:00', to: '16:00' }
}

if (!databaseUrl) {
  console.error('Missing DATABASE_URL or SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
await client.connect()

const now = new Date().toISOString()
const availabilityJson = JSON.stringify(DEFAULT_AVAILABILITY)

const facultyRes = await client.query(
  `SELECT u.id, u.name, u.department_id, d.name AS department_name
   FROM users u
   LEFT JOIN departments d ON d.id = u.department_id
   WHERE u.role = 'faculty'`
)

let updated = 0
let inserted = 0

for (const semester of semesters) {
  console.log(`\n--- Semester ${semester} ---`)

for (const member of facultyRes.rows) {
  const existing = await client.query(
    `SELECT id FROM faculty_availability_requests
     WHERE user_id = $1 AND semester = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [member.id, semester]
  )

  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE faculty_availability_requests
       SET availability = $1::jsonb,
           status = 'submitted',
           submitted_at = $2,
           updated_at = $2,
           department_id = $3,
           department_name = $4
       WHERE id = $5`,
      [availabilityJson, now, member.department_id, member.department_name, existing.rows[0].id]
    )
    updated++
    console.log(`  Updated: ${member.name} (sem ${semester})`)
  } else {
    await client.query(
      `INSERT INTO faculty_availability_requests (
         user_id, department_id, department_name, semester,
         availability, status, submitted_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5::jsonb, 'submitted', $6, $6, $6)`,
      [
        member.id,
        member.department_id,
        member.department_name,
        semester,
        availabilityJson,
        now
      ]
    )
    inserted++
    console.log(`  Inserted: ${member.name} (sem ${semester})`)
  }
}
}

await client.end()

console.log(
  `\nDone — ${semesters.length} semester(s): ${inserted} inserted, ${updated} updated (${facultyRes.rows.length} faculty each)`
)
