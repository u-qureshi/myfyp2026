# How to Migrate Your API Routes to Supabase - SmartScheduler.AI

## Step-by-Step Example: Migrating the Login Route

### Current Situation
You have API routes using MongoDB. We need to migrate them to Supabase.

### Migration Example: `/app/api/auth/login/route.js`

#### BEFORE (MongoDB):
```javascript
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

export async function POST(request) {
  const db = await connectToMongo()
  const { email, password } = await request.json()
  
  // Find user in MongoDB
  let admin = await db.collection('admins').findOne({ email })
  if (!admin) {
    admin = { /* default admin */ }
    await db.collection('admins').insertOne(admin)
  }
  
  // Generate token
  const token = jwt.sign({ id: admin.id }, JWT_SECRET)
  return NextResponse.json({ token, user: admin })
}
```

#### AFTER (Supabase):
```javascript
import { supabaseServer } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  const { email, password } = await request.json()
  
  // Find user in Supabase
  const { data: user, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Generate token
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET)
  return NextResponse.json({ token, user })
}
```

## Key Changes

### 1. Import Changes
```javascript
// Remove MongoDB
// import { MongoClient } from 'mongodb'

// Add Supabase
import { supabaseServer } from '@/lib/supabase'
```

### 2. Remove Connection Code
```javascript
// DELETE THIS:
let client
let db
async function connectToMongo() { /* ... */ }
```

### 3. Replace Database Queries

#### Find One Document
```javascript
// OLD - MongoDB
const user = await db.collection('users').findOne({ email })

// NEW - Supabase
const { data: user } = await supabaseServer
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
```

#### Find Multiple Documents
```javascript
// OLD - MongoDB
const users = await db.collection('users').find({ role: 'admin' }).toArray()

// NEW - Supabase
const { data: users } = await supabaseServer
  .from('users')
  .select('*')
  .eq('role', 'admin')
```

#### Insert Document
```javascript
// OLD - MongoDB
await db.collection('users').insertOne({ email, password_hash })

// NEW - Supabase
const { data } = await supabaseServer
  .from('users')
  .insert([{ email, password_hash }])
  .select()
```

#### Update Document
```javascript
// OLD - MongoDB
await db.collection('users').updateOne({ id }, { $set: { name: 'John' } })

// NEW - Supabase
const { data } = await supabaseServer
  .from('users')
  .update({ name: 'John' })
  .eq('id', id)
```

#### Delete Document
```javascript
// OLD - MongoDB
await db.collection('users').deleteOne({ id })

// NEW - Supabase
const { error } = await supabaseServer
  .from('users')
  .delete()
  .eq('id', id)
```

## Error Handling

### Supabase Pattern:
```javascript
const { data, error } = await supabaseServer.from('table').select()

if (error) {
  console.error('Error:', error.message)
  // Handle error
  return NextResponse.json({ error: error.message }, { status: 500 })
}

// Use data
console.log(data)
```

## Common Patterns

### Get Current User (from JWT token)
```javascript
import { getUserIdFromRequest } from '@/lib/auth-middleware'

export async function GET(request) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: user } = await supabaseServer
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return NextResponse.json(user)
}
```

### Ensure User Owns Data
```javascript
export async function PATCH(request) {
  const userId = getUserIdFromRequest(request)
  const body = await request.json()
  const { timetableId, updates } = body

  const { data, error } = await supabaseServer
    .from('timetables')
    .update(updates)
    .eq('id', timetableId)
    .eq('user_id', userId)  // ← Security: only own data
    .select()
    .single()

  return NextResponse.json(data)
}
```

### Paginated Results
```javascript
export async function GET(request) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = 10

  const { data, count } = await supabaseServer
    .from('timetables')
    .select('*', { count: 'exact' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return NextResponse.json({
    data,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  })
}
```

### Sorting & Filtering
```javascript
export async function GET(request) {
  const url = new URL(request.url)
  const sortBy = url.searchParams.get('sort') || 'created_at'
  const order = url.searchParams.get('order') || 'desc'
  const status = url.searchParams.get('status')

  let query = supabaseServer.from('timetables').select()

  if (status) {
    query = query.eq('status', status)
  }

  query = query.order(sortBy, { ascending: order === 'asc' })

  const { data } = await query

  return NextResponse.json(data)
}
```

## Migration Checklist for Each Route

For each route you migrate, ensure you:

- [ ] Replace imports (remove MongoDB, add Supabase)
- [ ] Remove connection code
- [ ] Update all database queries
- [ ] Add error handling
- [ ] Add user authentication check (if needed)
- [ ] Ensure user_id ownership checks (if applicable)
- [ ] Test with curl/Postman
- [ ] Verify data persists in Supabase dashboard

## Helper Functions to Use

Instead of writing custom queries, use helpers:

```javascript
import { 
  createUser,
  getUserByEmail,
  saveTimetable,
  getUserTimetables,
  getTimetableById,
  publishTimetable,
  getUserSettings,
  logMetric
} from '@/lib/supabase-helpers'

// Usage examples:
const user = await createUser(email, password, name)
const existing = await getUserByEmail(email)
const result = await saveTimetable(userId, title, data)
const timetables = await getUserTimetables(userId)
```

## Which Routes to Migrate First

### Priority 1 (Core Auth - needed immediately)
1. `/api/auth/login` - Use `route-supabase.js` as reference
2. `/api/auth/signup` - Already created ✅

### Priority 2 (Main Features - needed soon)
3. `/api/timetables` - CRUD timetables
4. `/api/data` - Use `route-supabase.js` as reference

### Priority 3 (Supporting Features)
5. `/api/settings`
6. `/api/publish-timetable`
7. `/api/metrics`

### Priority 4 (Generators & Exports)
8. `/api/generate-timetable`
9. `/api/export-pdf`
10. `/api/export-excel`

## Testing Each Migration

### 1. Unit Test (curl)
```bash
# For signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test"}'

# For protected route
curl -X GET http://localhost:3000/api/timetables \
  -H "Authorization: Bearer <your-token-here>"
```

### 2. Check Supabase Dashboard
Go to https://app.supabase.com → Your Project → Tables
Verify data appears in the correct table

### 3. Test Edge Cases
- Missing required fields
- Unauthorized access
- Non-existent records
- Duplicate entries

## Common Mistakes to Avoid

❌ **Don't:**
- Forget to handle `error` from Supabase
- Expose user data without checking ownership
- Use `.single()` when there might be multiple results
- Forget to add `user_id` to queries
- Use hardcoded table/field names

✅ **Do:**
- Always check for errors
- Verify `user_id` matches in updates/deletes
- Use `.single()` only for single record queries
- Include `user_id` in all where clauses
- Use helper functions when available

## Getting Help

If you get stuck:
1. Check the reference implementations:
   - `app/api/auth/login/route-supabase.js`
   - `app/api/data/route-supabase.js`
2. Read error messages carefully
3. Check Supabase documentation
4. Verify data in Supabase dashboard
5. Test with simple curl commands first

---

You've got this! Start with Priority 1 routes and work your way through. Each migration follows the same pattern. 🚀
