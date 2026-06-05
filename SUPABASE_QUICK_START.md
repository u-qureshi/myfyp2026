# 📖 SmartScheduler.AI Supabase Integration - Quick Start Checklist

## ✅ What's Done
- [x] Environment variables configured (`.env.local`)
- [x] Supabase client created (`lib/supabase.js`)
- [x] Helper functions created (`lib/supabase-helpers.js`)
- [x] Signup endpoint created (`app/api/auth/signup/route.js`)
- [x] Login reference implementation (`app/api/auth/login/route-supabase.js`)
- [x] Documentation ready (SUPABASE_SETUP.md, MIGRATION_GUIDE.md)

## 📋 Your Supabase Credentials
```
URL: https://oridfgzgfmmmjpwedfdz.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 Next Steps (DO THIS FIRST)

### 1. Create Database Tables
Go to https://app.supabase.com → SQL Editor → Copy & paste these queries:

**Run each query separately:**

```sql
-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Timetables Table
CREATE TABLE timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Settings Table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, key)
);

-- 4. Metrics Table
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  batch VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Faculty Table
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Rooms Table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  capacity INTEGER,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Constraints Table
CREATE TABLE constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  constraint_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Enable Row Level Security
For each table (users, timetables, settings, etc.):
1. Go to Authentication → Policies
2. Click "Enable RLS" for the table
3. Add policy:

```sql
-- For SELECT
CREATE POLICY "Users can select their own data"
ON timetables FOR SELECT
USING (auth.uid() = user_id);

-- For INSERT
CREATE POLICY "Users can insert their own data"
ON timetables FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- For UPDATE
CREATE POLICY "Users can update their own data"
ON timetables FOR UPDATE
USING (auth.uid() = user_id);

-- For DELETE
CREATE POLICY "Users can delete their own data"
ON timetables FOR DELETE
USING (auth.uid() = user_id);
```

### 3. Test the Setup
Start your dev server:
```bash
npm run dev
```

Test signup:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

Should return:
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "uuid...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }
}
```

## 📚 Migration Guide
See `MIGRATION_GUIDE.md` for updating existing API routes from MongoDB to Supabase.

## 🔒 Security Notes
- ✅ Service role key stored in `.env.local` (server-only)
- ✅ Anon key in `NEXT_PUBLIC_*` (client-safe)
- ✅ RLS policies protect data
- ✅ Passwords hashed with bcrypt

**Important:** Never commit `.env.local` to Git!

## 📞 Common Issues

### "Missing Supabase environment variables"
Check that `.env.local` has all three keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### "User already exists"
Different email needed for testing

### "Authentication failed"
Check password is correct in test request

## 🚀 What's Ready to Use

### Available Helper Functions
```javascript
import {
  createUser,
  getUserByEmail,
  getUserById,
  saveTimetable,
  getUserTimetables,
  getTimetableById,
  deleteTimetable,
  publishTimetable,
  saveSetting,
  getUserSettings,
  logMetric
} from '@/lib/supabase-helpers'
```

### Available API Endpoints
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user (needs update from route.js)

### Supabase Clients
```javascript
// In client components:
import { supabaseClient } from '@/lib/supabase'

// In API routes:
import { supabaseServer } from '@/lib/supabase'
```

## 📖 Documentation Files
- `SUPABASE_SETUP.md` - Database table creation
- `MIGRATION_GUIDE.md` - How to migrate existing routes
- `SUPABASE_QUICK_START.md` - This file

---

**Status:** Ready for database setup and migration! 🎉
