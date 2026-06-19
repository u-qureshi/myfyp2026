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
const client = new pg.Client({
  connectionString: buildDatabaseUrl(env),
  ssl: { rejectUnauthorized: false }
})
await client.connect()

const sems = [3, 5]
for (const sem of sems) {
  console.log(`\n=== Semester ${sem} ===`)
  const depts = await client.query(
    `SELECT DISTINCT department_id, department_name FROM student_constraint_requests WHERE semester = $1`,
    [sem]
  )
  for (const d of depts.rows) {
    const facultyCount = await client.query(
      `SELECT COUNT(*)::int AS c FROM users WHERE role = 'faculty' AND department_id = $1`,
      [d.department_id]
    )
    const submitted = await client.query(
      `SELECT COUNT(DISTINCT user_id)::int AS c FROM faculty_availability_requests
       WHERE semester = $1 AND department_id = $2 AND status = 'submitted'`,
      [sem, d.department_id]
    )
    const submittedAnyDept = await client.query(
      `SELECT COUNT(DISTINCT far.user_id)::int AS c
       FROM faculty_availability_requests far
       JOIN users u ON u.id = far.user_id
       WHERE far.semester = $1 AND u.department_id = $2 AND far.status = 'submitted'`,
      [sem, d.department_id]
    )
    console.log({
      dept: d.department_name,
      deptId: d.department_id,
      facultyInDept: facultyCount.rows[0].c,
      submittedMatchingRequestDept: submitted.rows[0].c,
      submittedViaUserDept: submittedAnyDept.rows[0].c
    })
  }
}

await client.end()
