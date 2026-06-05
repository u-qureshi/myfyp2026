# ✅ Supabase Integration Setup Checklist - SmartScheduler.AI

## Phase 1: Database Setup (Required First)

### Step 1.1: Create Tables in Supabase
- [ ] Go to https://app.supabase.com
- [ ] Open SQL Editor
- [ ] Run all 8 SQL queries from this section (one at a time)
  - [ ] CREATE TABLE users
  - [ ] CREATE TABLE timetables
  - [ ] CREATE TABLE settings
  - [ ] CREATE TABLE metrics
  - [ ] CREATE TABLE students
  - [ ] CREATE TABLE faculty
  - [ ] CREATE TABLE rooms
  - [ ] CREATE TABLE constraints

### Step 1.2: Enable Row Level Security
- [ ] ALTER TABLE users ENABLE ROW LEVEL SECURITY
- [ ] ALTER TABLE timetables ENABLE ROW LEVEL SECURITY
- [ ] ALTER TABLE settings ENABLE ROW LEVEL SECURITY
- [ ] ALTER TABLE metrics ENABLE ROW LEVEL SECURITY
- [ ] ALTER TABLE students ENABLE ROW LEVEL SECURITY
- [ ] ALTER TABLE faculty ENABLE ROW LEVEL SECURITY
- [ ] ALTER TABLE rooms ENABLE ROW LEVEL SECURITY
- [ ] ALTER TABLE constraints ENABLE ROW LEVEL SECURITY

### Step 1.3: Verify Tables Exist
- [ ] Go to Supabase Dashboard → Tables
- [ ] Confirm all 8 tables are listed
- [ ] Check each table has correct columns

**Estimated Time:** 15-20 minutes
**Status:** ⏳ Not Started

---

## Phase 2: Project Setup (Ready - Already Done!)

### Step 2.1: Environment Variables
- [x] `.env.local` created with Supabase credentials
- [x] `NEXT_PUBLIC_SUPABASE_URL` configured
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
- [x] `SUPABASE_SERVICE_ROLE_KEY` configured

### Step 2.2: Library Files
- [x] `lib/supabase.js` - Supabase client
- [x] `lib/supabase-helpers.js` - Helper functions
- [x] `lib/auth-middleware.js` - JWT utilities

### Step 2.3: API Endpoints
- [x] `app/api/auth/signup/route.js` - New signup
- [x] `app/api/auth/login/route-supabase.js` - Reference
- [x] `app/api/data/route-supabase.js` - Reference

**Status:** ✅ Complete

---

## Phase 3: Testing Setup (Do This Now)

### Step 3.1: Start Development Server
- [ ] Terminal: `npm run dev`
- [ ] Verify: http://localhost:3000 loads
- [ ] Check console for errors

### Step 3.2: Test Signup Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```
- [ ] Returns token and user info
- [ ] User appears in Supabase dashboard

### Step 3.3: Test Database Connection
```bash
node test-supabase.js
```
- [ ] Connection successful
- [ ] No error messages

**Estimated Time:** 10-15 minutes
**Status:** ⏳ Not Started

---

## Phase 4: API Route Migration (Do This Next)

### Priority 1: Authentication Routes

#### Step 4.1: Update Login Route
- [ ] Open `app/api/auth/login/route.js`
- [ ] Compare with `app/api/auth/login/route-supabase.js`
- [ ] Replace MongoDB code with Supabase
- [ ] Test login endpoint
- [ ] Verify in Supabase dashboard

**How to test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

- [ ] Returns token
- [ ] Token is valid JWT

#### Step 4.2: Verify Signup Still Works
- [ ] Test with new email
- [ ] Confirm user created in Supabase

**Estimated Time:** 30-45 minutes
**Status:** ⏳ Not Started

### Priority 2: Core Data Routes

#### Step 4.3: Update Data Route
- [ ] Open `app/api/data/route.js`
- [ ] Compare with `app/api/data/route-supabase.js`
- [ ] Replace MongoDB code with Supabase
- [ ] Test all operations (GET, POST, PATCH, DELETE)

**Test GET:**
```bash
curl -X GET http://localhost:3000/api/data?type=students \
  -H "Authorization: Bearer <TOKEN>"
```

- [ ] Returns list of records

**Test POST:**
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"type":"students","record":{"name":"Alice","batch":"2024"}}'
```

- [ ] Returns created record
- [ ] Record appears in Supabase

**Estimated Time:** 1-2 hours
**Status:** ⏳ Not Started

### Priority 3: Supporting Routes

Migrate in order:
- [ ] `/api/timetables`
- [ ] `/api/settings`
- [ ] `/api/publish-timetable`
- [ ] `/api/metrics`

For each route:
- [ ] Identify similar reference implementation
- [ ] Update MongoDB → Supabase
- [ ] Test with curl
- [ ] Check Supabase dashboard

**Estimated Time:** 2-3 hours
**Status:** ⏳ Not Started

### Priority 4: Generation & Export Routes

- [ ] `/api/generate-timetable`
- [ ] `/api/export-pdf`
- [ ] `/api/export-excel`

These can work with Supabase data the same way.

**Estimated Time:** 1-2 hours
**Status:** ⏳ Not Started

---

## Phase 5: Cleanup

- [ ] Delete MongoDB connection code from all files
- [ ] Remove MongoDB environment variables
- [ ] Remove backup files (`route.js.backup`, etc.)
- [ ] Verify all tests pass
- [ ] Update README with new database info

**Estimated Time:** 30 minutes
**Status:** ⏳ Not Started

---

## Phase 6: Deployment

### Step 6.1: Production Environment
- [ ] Update Supabase credentials in hosting platform
- [ ] Verify environment variables are set
- [ ] Test production signup/login

### Step 6.2: Deploy
- [ ] Commit changes: `git add .`
- [ ] Commit: `git commit -m "Migrate from MongoDB to Supabase"`
- [ ] Push: `git push`
- [ ] Verify deployment succeeds

**Estimated Time:** 15-30 minutes
**Status:** ⏳ Not Started

---

## Summary Timeline

| Phase | Time | Status |
|-------|------|--------|
| Phase 1: DB Setup | 20 min | ⏳ DO THIS FIRST |
| Phase 2: Project Setup | N/A | ✅ Done |
| Phase 3: Testing | 15 min | ⏳ Do after Phase 1 |
| Phase 4: Migration | 4-5 hours | ⏳ Main work |
| Phase 5: Cleanup | 30 min | ⏳ Final |
| Phase 6: Deploy | 30 min | ⏳ Last |
| **TOTAL** | **~6-7 hours** | ⏳ **START NOW** |

---

## 🚀 Ready to Start?

1. **Complete Phase 1 NOW** (20 minutes)
   - Create 8 tables in Supabase
   - Enable Row Level Security
   - Your project is already configured ✅

2. **Then come back for Phase 3** (15 minutes)
   - Start dev server
   - Test the endpoints

3. **Then do Phase 4** (4-5 hours)
   - Migrate routes one by one
   - Test after each migration

---

## 📞 Quick Reference

### SQL Queries Ready to Copy
- Go to `SUPABASE_QUICK_START.md`
- Copy all 8 CREATE TABLE queries
- Paste in Supabase SQL Editor

### Migration Examples
- Login: `app/api/auth/login/route-supabase.js`
- Data: `app/api/data/route-supabase.js`

### Helper Functions Available
```javascript
import { 
  createUser, getUserByEmail, getUserById,
  saveTimetable, getUserTimetables, publishTimetable,
  saveSetting, getUserSettings, logMetric
} from '@/lib/supabase-helpers'

import {
  verifyToken, getUserIdFromRequest,
  createToken, withAuth
} from '@/lib/auth-middleware'
```

### Documentation
- `README_SUPABASE.md` - Start here
- `SUPABASE_QUICK_START.md` - Setup guide
- `MIGRATION_GUIDE.md` - How to migrate
- `HOW_TO_MIGRATE.md` - Detailed examples
- `INTEGRATION_SUMMARY.md` - Complete overview

---

## ✨ Key Points

✅ **Already Done:**
- Environment variables configured
- Supabase client libraries created
- Helper functions ready
- Reference implementations provided
- Complete documentation

⏳ **You Need to Do:**
1. Create database tables (20 min)
2. Migrate API routes (4-5 hours)
3. Test thoroughly (1 hour)
4. Deploy (30 min)

---

## 🎯 First Action

**DO THIS RIGHT NOW:**

1. Go to https://app.supabase.com
2. Open SQL Editor
3. Copy all SQL from `SUPABASE_QUICK_START.md`
4. Run each CREATE TABLE query
5. Come back here and ✅ check them off

**That's it for today!** Everything else is straightforward following the patterns.

---

**You've got this! 🚀**

Questions? Check the relevant documentation file. Everything is thoroughly documented.

---

Last Updated: June 4, 2024
Total Estimated Setup Time: 6-7 hours for complete migration
