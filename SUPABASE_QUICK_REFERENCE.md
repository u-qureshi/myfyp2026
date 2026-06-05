# Supabase Quick Reference Card

## 🎯 Start Here

1. **Execute Schema**: Copy `lib/schema.sql` → Supabase SQL Editor → Run
2. **Test Connection**: Import helper functions and test CRUD operations
3. **Replace MongoDB**: Update API routes with Supabase helpers

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `SUPABASE_INTEGRATION_COMPLETE.md` | Overview & key features |
| `SUPABASE_MIGRATION_GUIDE.md` | Detailed migration steps |
| `SUPABASE_SETUP_CHECKLIST.md` | Implementation checklist |
| `lib/EXAMPLE_API_USAGE.md` | Code examples & patterns |
| `lib/schema.sql` | PostgreSQL database schema |

---

## 💾 Database Schema (8 Tables)

```
users → departments (N:1)
rooms
subjects → departments (N:1)
sections → departments (N:1)
faculty_availability → users (N:1)
timetable_slots → sections, subjects, users, rooms (N:1 each)
notifications → users (N:1)
```

---

## 🔑 Quick API Examples

### Get All Departments
```javascript
import { getDepartments } from '@/lib/supabase-db'

const depts = await getDepartments(true) // true = server key
```

### Create User
```javascript
import { createUser } from '@/lib/supabase-db'

const user = await createUser({
  email: 'user@example.com',
  password_hash: hashedPassword,
  name: 'John Doe',
  role: 'faculty',
  department_id: 'uuid-here'
}, true)
```

### Get Timetable Slots
```javascript
import { getTimetableSlots } from '@/lib/supabase-db'

const slots = await getTimetableSlots({
  section_id: 'uuid-here',
  semester: 1
}, true)
```

### Create Notification
```javascript
import { createNotification } from '@/lib/supabase-db'

const notif = await createNotification({
  user_id: 'uuid-here',
  title: 'Schedule Updated',
  message: 'Your timetable has been updated',
  is_read: false
}, true)
```

---

## 📋 Available Functions

### Pattern
```javascript
functionName(args, useServer = false)
// useServer = true → Uses service role key (for API routes)
// useServer = false → Uses anon key (for client components)
```

### Complete List
```
DEPARTMENTS:   getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment

USERS:         getUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser

ROOMS:         getRooms, getRoomById, createRoom, updateRoom, deleteRoom

SUBJECTS:      getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject

SECTIONS:      getSections, getSectionById, createSection, updateSection, deleteSection

AVAILABILITY:  getFacultyAvailability, createFacultyAvailability, updateFacultyAvailability

TIMETABLE:     getTimetableSlots, getTimetableSlotById, createTimetableSlot, updateTimetableSlot, 
               deleteTimetableSlot, deleteTimetableSlotsForSection

NOTIFICATIONS: getNotifications, getUnreadNotifications, createNotification, 
               markNotificationAsRead, markAllNotificationsAsRead, deleteNotification
```

---

## 🔐 Data Types & Enums

```sql
user_role: 'admin' | 'faculty' | 'student'
room_type: 'classroom' | 'lab' | 'seminar_hall'
availability_status: 'available' | 'occupied' | 'maintenance'
```

---

## ✅ Environment Setup

Your `.env.local` already contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://oridfgzgfmmmjpwedfdz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🚀 API Route Pattern

```javascript
import { NextResponse } from 'next/server'
import { getDepartments, createDepartment } from '@/lib/supabase-db'

export async function GET() {
  try {
    const data = await getDepartments(true)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const data = await createDepartment(body, true)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 🔒 Security Checklist

- [x] Row Level Security (RLS) enabled
- [x] Foreign keys with cascading
- [x] Password hashing support
- [x] Service role key for admin ops
- [x] Anon key for client ops
- [ ] Test RLS policies
- [ ] Verify no password hashes leak
- [ ] Check firewall rules

---

## 📊 Performance Optimization

- **18 indexes** on frequently queried columns
- **Foreign keys** for data integrity
- **Pagination ready** - use `.range(0, 9)` for 10 items
- **Query selection** - only select needed fields with `.select('field1, field2')`

---

## 🆘 Common Issues

### Connection Failed
- Check environment variables in `.env.local`
- Verify Supabase project is active
- Check firewall/IP restrictions

### Schema Execution Failed
- Copy exact contents of `lib/schema.sql`
- Paste into Supabase SQL Editor
- Run line by line if errors occur

### Permission Denied
- Always use `useServer = true` in API routes
- Use anon key (`false`) for client components
- Check RLS policies in Supabase dashboard

### Data Not Showing
- Verify schema executed successfully
- Check RLS policies allow SELECT
- Use `.select('*')` to see all columns

---

## 📞 Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✨ Migration Path

### Before (MongoDB)
```javascript
const user = await db.collection('users').findOne({ email })
```

### After (Supabase)
```javascript
const user = await getUserByEmail(email, true)
```

---

**Status**: ✅ Ready to Deploy
**Last Updated**: June 4, 2026
**Next Step**: Execute `lib/schema.sql` in Supabase SQL Editor
