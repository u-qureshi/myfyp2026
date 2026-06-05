# MongoDB to Supabase Migration Guide - SmartScheduler.AI

## Overview
This project is migrating from MongoDB to Supabase PostgreSQL. Supabase provides better security, built-in authentication, and real-time capabilities.

## What's New

### 1. Environment Variables
Your `.env.local` now includes Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://oridfgzgfmmmjpwedfdz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 2. New Files Created

#### `lib/supabase.js`
- Exports `supabaseClient` (for client-side, uses anon key)
- Exports `supabaseServer` (for API routes, uses service role key)

#### `lib/supabase-helpers.js`
Helper functions for common database operations:
- `createUser()` - Create new user
- `getUserByEmail()` - Query user by email
- `getUserById()` - Query user by ID
- `saveTimetable()` - Create/update timetable
- `getUserTimetables()` - Fetch user's timetables
- `getTimetableById()` - Get single timetable
- `deleteTimetable()` - Delete timetable
- `publishTimetable()` - Publish timetable
- `saveSetting()` - Save user setting
- `getUserSettings()` - Get all user settings
- `logMetric()` - Log analytics event

#### `app/api/auth/signup/route.js`
New signup endpoint - creates user and returns JWT token

#### `app/api/auth/login/route-supabase.js`
Updated login endpoint using Supabase (reference implementation)

### 3. Database Schema
See `SUPABASE_SETUP.md` for table creation SQL and RLS policies.

## Migration Steps

### Step 1: Set Up Supabase Database
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run all queries from `SUPABASE_SETUP.md`
4. Enable Row Level Security (RLS) on all tables

### Step 2: Update API Routes

#### Example: Update `/app/api/auth/login/route.js`

**Old (MongoDB):**
```javascript
import { MongoClient } from 'mongodb'

async function connectToMongo() {
  // MongoDB connection code
}

export async function POST(request) {
  const db = await connectToMongo()
  const admin = await db.collection('admins').findOne({ email })
  // ...
}
```

**New (Supabase):**
```javascript
import { supabaseServer } from '@/lib/supabase'
import { getUserByEmail } from '@/lib/supabase-helpers'

export async function POST(request) {
  const { data: user } = await getUserByEmail(email)
  // ...
}
```

### Step 3: Update Each API Route

For each route in `app/api/`:

1. **Replace MongoDB imports:**
   ```javascript
   // Remove: import { MongoClient } from 'mongodb'
   // Add:
   import { supabaseServer } from '@/lib/supabase'
   import { 
     getUserTimetables, 
     saveTimetable,
     // ... other helpers needed
   } from '@/lib/supabase-helpers'
   ```

2. **Replace database operations:**
   ```javascript
   // OLD: db.collection('timetables').find()
   // NEW:
   const { data: timetables } = await supabaseServer
     .from('timetables')
     .select('*')
     .eq('user_id', userId)
   ```

3. **Handle errors:**
   ```javascript
   const { data, error } = await supabaseServer.from('...').select(...)
   if (error) {
     console.error(error)
     return NextResponse.json({ error: error.message }, { status: 500 })
   }
   ```

### Common Patterns

#### SELECT
```javascript
// Get one record
const { data } = await supabaseServer
  .from('timetables')
  .select('*')
  .eq('id', timetableId)
  .single()

// Get multiple records
const { data: timetables } = await supabaseServer
  .from('timetables')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

#### INSERT
```javascript
const { data, error } = await supabaseServer
  .from('timetables')
  .insert([
    {
      user_id: userId,
      title: 'My Timetable',
      data: timetableData
    }
  ])
  .select()
  .single()
```

#### UPDATE
```javascript
const { data } = await supabaseServer
  .from('timetables')
  .update({ status: 'published' })
  .eq('id', timetableId)
  .select()
  .single()
```

#### DELETE
```javascript
const { error } = await supabaseServer
  .from('timetables')
  .delete()
  .eq('id', timetableId)
```

## API Routes to Migrate

Priority order:
1. ✅ `/api/auth/login` → Use `route-supabase.js` as reference
2. ✅ `/api/auth/signup` → Already created
3. `/api/timetables` - Get/create/update timetables
4. `/api/data` - Get/update timetable data
5. `/api/settings` - Get/update user settings
6. `/api/publish-timetable` - Publish timetable
7. `/api/metrics` - Log analytics
8. `/api/generate-timetable` - Timetable generation
9. `/api/export-pdf` - PDF export
10. `/api/export-excel` - Excel export

## Authentication Flow

### Old Flow (MongoDB + JWT)
```
Client → Login → MongoDB lookup → JWT generated → Stored locally
```

### New Flow (Supabase + JWT)
```
Client → Signup/Login → Supabase lookup → JWT generated → Stored locally
```

Same JWT approach, but with Supabase PostgreSQL backend.

## Testing

After migration:

1. **Test signup:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

2. **Test login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Test with token:**
   ```bash
   curl -X GET http://localhost:3000/api/timetables \
     -H "Authorization: Bearer <TOKEN>"
   ```

## Security Checklist

- [ ] Enable RLS on all tables
- [ ] Set up authentication policies
- [ ] Validate JWT tokens in API routes
- [ ] Add input validation
- [ ] Use prepared statements (Supabase handles this)
- [ ] Rotate secrets in production
- [ ] Never commit `.env.local` to Git

## Rollback Plan

If you need to rollback:
1. Keep MongoDB connection code in separate files
2. Don't delete MongoDB database immediately
3. Use feature flags to switch between implementations

## Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## Next Steps

1. Create Supabase tables (run SQL in `SUPABASE_SETUP.md`)
2. Migrate `/api/auth` routes first
3. Test authentication flow
4. Migrate remaining API routes one by one
5. Test each route thoroughly
6. Remove MongoDB code once all routes migrated
