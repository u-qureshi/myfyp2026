# 🚀 Supabase Integration - Complete Setup - SmartScheduler.AI

## مختصر میں (In Short / في الملخص):

آپ کا ڈیٹا بیس منتقل کرنے کے لیے ہر چیز تیار ہے! **MongoDB سے Supabase (PostgreSQL) کو SmartScheduler.AI میں** صرف **دو مراحل** میں:

1. **Supabase میں ڈیٹا بیس ٹیبلز بنائیں** (SQL کاپی پیسٹ کریں)
2. **API روٹس اپڈیٹ کریں** (MongoDB کو Supabase سے بدلیں)

---

## ✅ What's Ready for You

### 📦 New Files Created (11 files)

#### Core Library (3 files)
```
lib/
├── supabase.js                 # Supabase client setup
├── supabase-helpers.js         # Database helper functions
└── auth-middleware.js          # JWT and authentication
```

#### API Endpoints (3 files)
```
app/api/
├── auth/signup/route.js        # NEW signup endpoint
├── auth/login/route-supabase.js # Reference implementation
└── data/route-supabase.js      # Reference implementation
```

#### Documentation (5 files)
```
📖 SUPABASE_SETUP.md             # SQL queries to create tables
📖 SUPABASE_QUICK_START.md       # Step-by-step checklist
📖 MIGRATION_GUIDE.md            # How to migrate existing routes
📖 HOW_TO_MIGRATE.md             # Detailed migration examples
📖 INTEGRATION_SUMMARY.md        # Complete overview
```

#### Configuration (1 file)
```
✅ .env.local                    # Your Supabase credentials
```

---

## 🎯 Quick Start (30 minutes)

### Step 1: Create Database Tables (10 minutes)

1. Go to **https://app.supabase.com**
2. Click **"SQL Editor"**
3. Create a **"New Query"**
4. Copy this SQL (run one at a time):

```sql
-- Run each query separately (1-8)

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

✅ All 8 tables created!

### Step 2: Enable Security (5 minutes)

For each table (users, timetables, students, etc.), run in SQL Editor:

```sql
-- Enable Row Level Security for each table
-- Run for: users, timetables, settings, metrics, students, faculty, rooms, constraints

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;
```

### Step 3: Test the Setup (15 minutes)

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

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }
}
```

✅ Setup working!

---

## 📋 Next: Migrate Your API Routes

Your two reference implementations are ready:
- **`app/api/auth/login/route-supabase.js`** - Updated login
- **`app/api/data/route-supabase.js`** - Updated data CRUD

For each route you need to migrate:

**Before (MongoDB):**
```javascript
import { MongoClient } from 'mongodb'
const db = await connectToMongo()
await db.collection('timetables').find()
```

**After (Supabase):**
```javascript
import { supabaseServer } from '@/lib/supabase'
const { data } = await supabaseServer
  .from('timetables')
  .select('*')
```

See **`MIGRATION_GUIDE.md`** for complete examples!

---

## 🔐 Your Supabase Credentials

```
✅ Already configured in .env.local

URL: https://oridfgzgfmmmjpwedfdz.supabase.co
Project: oridfgzgfmmmjpwedfdz
```

**Keys are safe** because:
- 🔒 Secret keys only in `.env.local` (never in Git)
- 🌐 Public keys only readable by your app
- 🛡️ Row Level Security policies protect data
- ✅ Passwords hashed with bcrypt

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **SUPABASE_QUICK_START.md** | Copy-paste SQL setup guide |
| **SUPABASE_SETUP.md** | Detailed table schemas |
| **MIGRATION_GUIDE.md** | How to migrate routes |
| **HOW_TO_MIGRATE.md** | Step-by-step examples |
| **INTEGRATION_SUMMARY.md** | Complete overview |
| **README_SUPABASE.md** | This file |

---

## 🛠️ Available Helper Functions

Ready to use in your code:

```javascript
// User management
import { createUser, getUserByEmail, getUserById } from '@/lib/supabase-helpers'

// Timetables
import { saveTimetable, getUserTimetables, publishTimetable } from '@/lib/supabase-helpers'

// Settings & metrics
import { saveSetting, getUserSettings, logMetric } from '@/lib/supabase-helpers'

// Authentication
import { verifyToken, getUserIdFromRequest, createToken } from '@/lib/auth-middleware'
```

---

## ✨ API Endpoints Ready

| Endpoint | Status | Method |
|----------|--------|--------|
| `/api/auth/signup` | ✅ Ready | POST |
| `/api/auth/login` | ⚠️ Need to update | POST |
| `/api/data` | ⚠️ Need to update | GET, POST, PATCH, DELETE |
| Other routes | ⚠️ Need to migrate | Various |

---

## 🚨 Important Reminders

✅ **DO:**
- Keep `.env.local` out of Git (already in .gitignore)
- Test each route after migration
- Check Supabase dashboard for data

❌ **DON'T:**
- Commit `.env.local` to repository
- Expose service role key to client
- Skip error handling in API routes

---

## 📞 Troubleshooting

**"Connection refused"**
- Check Supabase URL in `.env.local`
- Restart dev server after updating `.env.local`

**"User already exists"**
- Use different email for testing
- Or delete from Supabase dashboard

**"Unauthorized"**
- Include `Authorization: Bearer <TOKEN>` header
- Token must be valid JWT

**"Record not found"**
- Check you own the record (user_id matches)
- Verify table name is correct

---

## 🎯 Implementation Timeline

| Phase | Time | Tasks |
|-------|------|-------|
| **Setup** | 30 min | Create tables, enable RLS, test |
| **Auth Migration** | 1 hour | Update login, test signup/login |
| **Core Features** | 2 hours | Migrate timetables, data routes |
| **Remaining Routes** | 2 hours | Migrate other endpoints |
| **Testing** | 1 hour | Full test suite |
| **Total** | ~6 hours | Complete migration |

---

## 🚀 Deploy When Ready

When all routes are migrated:

1. **Update production variables:**
   ```bash
   # In your hosting platform (Vercel, Heroku, etc.)
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. **Remove MongoDB variables:**
   - Remove `MONGO_URL`
   - Remove `DB_NAME`

3. **Deploy:**
   ```bash
   git push
   ```

---

## 🎉 You're All Set!

Everything is configured and ready to go. Start with Step 1 above, and you'll have a working Supabase integration in less than an hour!

If you get stuck, check the relevant documentation file. Good luck! 🚀

---

**Last Updated:** June 4, 2024
**Status:** ✅ Ready for Implementation
