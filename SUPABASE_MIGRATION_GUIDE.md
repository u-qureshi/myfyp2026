# Supabase PostgreSQL Migration Guide

This guide will help you migrate your MongoDB timetable application to Supabase (PostgreSQL).

## Prerequisites

- Supabase account (create at https://supabase.com)
- Environment variables already configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Files Created

1. **lib/supabase.js** - Supabase client initialization (already exists)
2. **lib/schema.sql** - Complete PostgreSQL database schema

## Step 1: Create the Database Schema in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `lib/schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** to execute

This will create:
- All necessary tables with proper relationships
- ENUM types for roles, room types, and availability status
- Indexes for performance optimization
- Row Level Security (RLS) policies for data protection

## Step 2: Environment Variables

Your `.env.local` should already contain:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

If not, copy from `.env.example` and add your credentials.

## Step 3: Verify Dependencies

The Supabase client (`@supabase/supabase-js`) is already installed in `package.json`.

## Database Schema Overview

### Tables

#### Users
- Stores admin, faculty, and student information
- Fields: id, email, password_hash, role, name, phone, department_id, created_at, updated_at

#### Departments
- Educational departments/colleges
- Fields: id, name, code, created_at, updated_at

#### Rooms
- Classroom, lab, and seminar halls
- Fields: id, name, type, capacity, building, availability_status, created_at, updated_at

#### Subjects
- Course subjects/classes
- Fields: id, name, code, credit_hours, department_id, created_at, updated_at

#### Sections
- Student groups/batches
- Fields: id, name, semester, department_id, student_count, created_at, updated_at

#### Faculty Availability
- Track faculty availability by day
- Fields: id, faculty_id, day_of_week, is_available, created_at, updated_at

#### Timetable Slots
- Scheduled classes in the timetable
- Fields: id, section_id, subject_id, faculty_id, room_id, day_of_week, start_time, end_time, semester, created_at, updated_at

#### Notifications
- User notifications
- Fields: id, user_id, title, message, is_read, created_at, updated_at

## Key Features

### Data Types
- **ENUM Types**: 
  - `user_role`: 'admin', 'faculty', 'student'
  - `room_type`: 'classroom', 'lab', 'seminar_hall'
  - `availability_status`: 'available', 'occupied', 'maintenance'

### Constraints & Validation
- Foreign key relationships for referential integrity
- Check constraints for valid values (day_of_week 0-6, end_time > start_time)
- Unique constraints for codes and email addresses
- NOT NULL constraints for required fields

### Performance Optimization
- 18 indexes on frequently queried columns
- Optimized for joins and filtering

### Security
- Row Level Security (RLS) enabled on all tables
- RLS policies for user data privacy
- Service role key for administrative operations

## Next Steps

1. **Migrate existing MongoDB data** (if applicable):
   - Extract data from MongoDB
   - Transform to match PostgreSQL schema
   - Use Supabase's bulk insert capabilities

2. **Update API routes** to use Supabase client:
   - Replace MongoDB queries with Supabase queries
   - Update auth endpoints to use Supabase Auth
   - Implement proper error handling

3. **Test thoroughly**:
   - Verify all CRUD operations work correctly
   - Test user authentication
   - Validate role-based access control
   - Check timetable generation logic

## Connection Details

- **Database Type**: PostgreSQL
- **Provider**: Supabase
- **Client Library**: @supabase/supabase-js
- **Authentication**: JWT-based via Supabase Auth

## Troubleshooting

### Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure your IP is not restricted by firewall rules

### Schema Errors
- Check that all prerequisites are met
- Verify the SQL syntax if you modified the schema
- Ensure you're using the correct Supabase project

### RLS Policy Issues
- Make sure you're using the correct Supabase authentication
- Verify service role key for admin operations
- Check policy conditions match your use case

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
