# Supabase RLS Policies - Role-Based Access Control Setup

This document outlines the Row Level Security (RLS) policies needed to enforce role-based access control at the database level. These policies ensure that users can only access data appropriate for their role.

---

## Overview

Row Level Security (RLS) adds an extra layer of security beyond the frontend role-based UI. Even if someone tries to bypass the frontend, these database policies will prevent unauthorized data access.

**Current Status**: ❌ Not yet configured
**Priority**: 🔴 HIGH - Should be done before production deployment

---

## Setup Instructions

### Step 1: Enable RLS on Tables

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;
```

**Verify**: In Supabase Dashboard, go to each table → Authentication tab. "Enable RLS" should be checked ✓

---

## RLS Policies by Table

### 1. Users Table

**Purpose**: Prevent users from viewing other users' data

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Admins can update user roles
CREATE POLICY "Admins can update users"
ON users FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);
```

---

### 2. Timetables Table

**Purpose**: Faculty and Students can only view published timetables

```sql
-- Admins can view and manage all timetables
CREATE POLICY "Admins can manage timetables"
ON timetables FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Faculty can only view published timetables
CREATE POLICY "Faculty can view published timetables"
ON timetables FOR SELECT
USING (
  status = 'published' AND
  (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'faculty'
    )
  )
);

-- Students can only view published timetables
CREATE POLICY "Students can view published timetables"
ON timetables FOR SELECT
USING (
  status = 'published' AND
  (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'student'
    )
  )
);
```

---

### 3. Settings Table

**Purpose**: Users can only manage their own settings

```sql
-- Users can view their own settings
CREATE POLICY "Users can view own settings"
ON settings FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
ON settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
ON settings FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all settings
CREATE POLICY "Admins can view all settings"
ON settings FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);
```

---

### 4. Metrics Table

**Purpose**: Admins can track usage, others cannot modify

```sql
-- Anyone can insert their own metrics
CREATE POLICY "Users can insert own metrics"
ON metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all metrics
CREATE POLICY "Admins can view metrics"
ON metrics FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Users cannot delete metrics
CREATE POLICY "No one can delete metrics"
ON metrics FOR DELETE
USING (false);
```

---

### 5. Faculty Table

**Purpose**: Faculty can view their own data, students can view published faculty info

```sql
-- Faculty can view their own record
CREATE POLICY "Faculty can view own record"
ON faculty FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'faculty' AND user_id = (SELECT user_id FROM faculty WHERE id = faculty.id)
  )
);

-- Faculty can update their own record
CREATE POLICY "Faculty can update own record"
ON faculty FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'faculty' AND user_id = (SELECT user_id FROM faculty WHERE id = faculty.id)
  )
);

-- Admins can view and manage faculty
CREATE POLICY "Admins can manage faculty"
ON faculty FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Students can view faculty info (teaching subjects)
CREATE POLICY "Students can view faculty info"
ON faculty FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'student'
  )
);
```

---

### 6. Students Table

**Purpose**: Students can view their own data, faculty can view enrolled students

```sql
-- Students can view their own record
CREATE POLICY "Students can view own record"
ON students FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'student' AND user_id = (SELECT user_id FROM students WHERE id = students.id)
  )
);

-- Students can update their own record
CREATE POLICY "Students can update own record"
ON students FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'student' AND user_id = (SELECT user_id FROM students WHERE id = students.id)
  )
);

-- Faculty can view their students
CREATE POLICY "Faculty can view enrolled students"
ON students FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'faculty'
  )
);

-- Admins can view and manage students
CREATE POLICY "Admins can manage students"
ON students FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);
```

---

### 7. Rooms Table

**Purpose**: Admins manage rooms, faculty/students view available rooms

```sql
-- Admins can manage all rooms
CREATE POLICY "Admins can manage rooms"
ON rooms FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Faculty and students can view rooms (read-only)
CREATE POLICY "Faculty can view rooms"
ON rooms FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'faculty'
  )
);

CREATE POLICY "Students can view rooms"
ON rooms FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'student'
  )
);
```

---

### 8. Constraints Table

**Purpose**: Only admins can manage constraints

```sql
-- Admins can manage all constraints
CREATE POLICY "Admins can manage constraints"
ON constraints FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Faculty and students cannot access constraints
CREATE POLICY "Deny non-admin access to constraints"
ON constraints FOR ALL
USING (false);
```

---

## Testing RLS Policies

### Step 1: Create Test Users

```sql
-- Create test users with different roles (for manual testing)
-- Note: In production, use proper auth flow
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@test.com', 'hashed_password_admin', 'Admin User', 'admin'),
('faculty@test.com', 'hashed_password_faculty', 'Faculty User', 'faculty'),
('student@test.com', 'hashed_password_student', 'Student User', 'student');
```

### Step 2: Test SELECT Policies

```sql
-- Login as admin and run:
SELECT * FROM users;  -- Should see all users ✓

-- Login as faculty and run:
SELECT * FROM users;  -- Should see nothing (forbidden by policy)
-- But can view own profile (if policy allows it) ✓

-- Login as student and run:
SELECT * FROM users;  -- Should see nothing (forbidden by policy) ✓
```

### Step 3: Verify in Supabase Dashboard

1. Go to SQL Editor
2. For each table, run a SELECT query
3. Supabase will show if RLS policy blocked the query
4. Error message will indicate which policy denied access

---

## Quick Reference: Policy Commands

### View existing policies:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Drop a policy:
```sql
DROP POLICY "policy_name" ON table_name;
```

### Update a policy:
```sql
-- Drop and recreate (PostgreSQL doesn't support ALTER POLICY)
DROP POLICY "old_policy" ON users;
CREATE POLICY "new_policy" ON users ... ;
```

---

## Integration with Frontend

The frontend already:
1. ✅ Captures role during login/signup
2. ✅ Stores role in localStorage
3. ✅ Shows role-specific UI
4. ✅ Restricts navigation based on role

With RLS policies in place:
1. Frontend restricts UI (user experience)
2. Backend RLS enforces access (security)
3. Double protection against unauthorized access

---

## Deployment Checklist

Before deploying to production:

- [ ] All RLS policies created and tested
- [ ] Each table has RLS enabled
- [ ] Test with each role (Admin, Faculty, Student)
- [ ] Verify no data leakage between roles
- [ ] Performance tested (RLS can impact query speed)
- [ ] Error handling implemented in API routes
- [ ] API endpoints check role and return appropriate errors

---

## Troubleshooting

### "ERROR: permission denied for schema public"
**Solution**: Ensure authenticated user (not anonymous). Make sure RLS policies exist for the operation.

### "No rows returned" (when you expect data)
**Solution**: RLS policy is blocking access. Verify:
1. User has correct role
2. Policy allows operation (SELECT/INSERT/UPDATE/DELETE)
3. Policy conditions match the data

### Performance is slow
**Solution**: RLS policies add overhead. Optimize by:
1. Using indexes on foreign keys
2. Simplifying policy conditions
3. Caching frequently accessed data

---

## Next Steps

1. ✅ Role-based frontend UI - **DONE**
2. ⏳ Create RLS policies - **TODO** (this document)
3. ⏳ Test RLS with each role - **TODO**
4. ⏳ Add error handling to API endpoints - **TODO**
5. ⏳ Deploy to production - **TODO**

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [JWT Auth in Supabase](https://supabase.com/docs/guides/auth/jwts)

---

**Status**: 📋 Ready for implementation
**Estimated Time**: 2-3 hours to create, test, and deploy policies
**Priority**: 🔴 HIGH for production deployment

After implementing these policies, your application will have production-grade security with role-based access control enforced at the database level.
