# Supabase PostgreSQL Setup Checklist

## ✅ Completed Steps

- [x] Supabase client initialized (`lib/supabase.js`)
- [x] Database schema created (`lib/schema.sql`)
- [x] Database helper functions created (`lib/supabase-db.js`)
- [x] Environment variables configured (`.env.local`)
- [x] Migration guide created (`SUPABASE_MIGRATION_GUIDE.md`)

## 📋 Next Steps to Complete Migration

### 1. Execute Database Schema
- [ ] Go to https://app.supabase.com
- [ ] Select your project
- [ ] Navigate to **SQL Editor**
- [ ] Create a new query
- [ ] Copy entire contents of `lib/schema.sql`
- [ ] Execute the SQL to create all tables and indexes

### 2. Verify Database Creation
- [ ] Go to **Table Editor** in Supabase
- [ ] Confirm all tables are created:
  - [ ] departments
  - [ ] users
  - [ ] rooms
  - [ ] subjects
  - [ ] sections
  - [ ] faculty_availability
  - [ ] timetable_slots
  - [ ] notifications

### 3. Test Supabase Connection
- [ ] Create a test API route to verify connection
- [ ] Test reading data from a table
- [ ] Test creating a record
- [ ] Test updating a record
- [ ] Test deleting a record

### 4. Migrate Existing Data (if applicable)
- [ ] Export data from MongoDB
- [ ] Transform data to match PostgreSQL schema
- [ ] Import data into Supabase tables
- [ ] Verify data integrity

### 5. Update API Routes
- [ ] Identify all MongoDB queries in API routes
- [ ] Replace with Supabase client calls
- [ ] Update error handling
- [ ] Test each endpoint

### 6. Update Frontend Components
- [ ] Review all data fetching logic
- [ ] Update fetch/axios calls to use Supabase
- [ ] Test all features:
  - [ ] User authentication
  - [ ] Timetable generation
  - [ ] Timetable viewing
  - [ ] User management
  - [ ] Room management
  - [ ] Subject management

### 7. Test Authentication
- [ ] Test user signup
- [ ] Test user login
- [ ] Test role-based access control
- [ ] Test token refresh

### 8. Security Review
- [ ] Verify Row Level Security (RLS) policies
- [ ] Test that users can only access their own data
- [ ] Verify admin access works correctly
- [ ] Check that service role key is not exposed in frontend code

### 9. Performance Testing
- [ ] Test timetable generation performance
- [ ] Monitor query execution times
- [ ] Add indexes if needed
- [ ] Load test with multiple concurrent users

### 10. Deploy to Production
- [ ] Set production environment variables
- [ ] Run final testing in staging environment
- [ ] Deploy to production
- [ ] Monitor logs for errors
- [ ] Set up alerts for errors

## 📚 Reference Files

- **lib/supabase.js** - Supabase client initialization
- **lib/supabase-db.js** - Database helper functions with CRUD operations
- **lib/schema.sql** - Complete PostgreSQL schema
- **SUPABASE_MIGRATION_GUIDE.md** - Detailed migration guide

## 🔧 Available Functions

### General Pattern
All functions follow this pattern:
```javascript
import { functionName } from '@/lib/supabase-db'

// Browser-side (uses anon key)
await functionName(args)

// Server-side (uses service role key)
await functionName(args, true)
```

### Departments Functions
- `getDepartments(useServer)`
- `getDepartmentById(id, useServer)`
- `createDepartment(department, useServer)`
- `updateDepartment(id, updates, useServer)`
- `deleteDepartment(id, useServer)`

### Users Functions
- `getUsers(useServer)`
- `getUserById(id, useServer)`
- `getUserByEmail(email, useServer)`
- `createUser(user, useServer)`
- `updateUser(id, updates, useServer)`
- `deleteUser(id, useServer)`

### Rooms Functions
- `getRooms(useServer)`
- `getRoomById(id, useServer)`
- `createRoom(room, useServer)`
- `updateRoom(id, updates, useServer)`
- `deleteRoom(id, useServer)`

### Subjects Functions
- `getSubjects(useServer)`
- `getSubjectById(id, useServer)`
- `createSubject(subject, useServer)`
- `updateSubject(id, updates, useServer)`
- `deleteSubject(id, useServer)`

### Sections Functions
- `getSections(useServer)`
- `getSectionById(id, useServer)`
- `createSection(section, useServer)`
- `updateSection(id, updates, useServer)`
- `deleteSection(id, useServer)`

### Faculty Availability Functions
- `getFacultyAvailability(facultyId, useServer)`
- `createFacultyAvailability(availability, useServer)`
- `updateFacultyAvailability(id, updates, useServer)`

### Timetable Slots Functions
- `getTimetableSlots(filters, useServer)`
- `getTimetableSlotById(id, useServer)`
- `createTimetableSlot(slot, useServer)`
- `updateTimetableSlot(id, updates, useServer)`
- `deleteTimetableSlot(id, useServer)`
- `deleteTimetableSlotsForSection(sectionId, useServer)`

### Notifications Functions
- `getNotifications(userId, useServer)`
- `getUnreadNotifications(userId, useServer)`
- `createNotification(notification, useServer)`
- `markNotificationAsRead(notificationId, useServer)`
- `markAllNotificationsAsRead(userId, useServer)`
- `deleteNotification(id, useServer)`

## 💡 Tips

1. **Always use `useServer = true` for sensitive operations** (user creation, updates)
2. **Test in development first** before deploying to production
3. **Monitor database performance** after migration
4. **Keep backups** of your MongoDB data during migration
5. **Use the Supabase Dashboard** to monitor queries and performance

## 🆘 Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Community](https://discord.supabase.io)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 📝 Notes

- Your Supabase credentials are stored in `.env.local` (already configured)
- The schema includes Row Level Security (RLS) policies for data protection
- All tables have audit fields (`created_at`, `updated_at`) for tracking changes
- Indexes are created on frequently queried columns for better performance
