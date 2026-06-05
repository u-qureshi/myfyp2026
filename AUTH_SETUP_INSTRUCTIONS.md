# Authentication System Setup Instructions

Complete step-by-step guide to set up and test the new authentication system.

## ✅ Prerequisites

Before starting, ensure you have:
- [x] Supabase project created with PostgreSQL database
- [x] Database schema executed (`lib/schema.sql`)
- [x] Environment variables configured (`.env.local`)
- [x] bcryptjs installed (already in package.json)
- [x] Next.js 14+ running

## 🚀 Setup Steps

### Step 1: Verify Environment Variables

Check `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=http://localhost:3000
NODE_ENV=development
```

### Step 2: Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Server runs on `http://localhost:3000`

### Step 3: Create Demo Users

Navigate to: **http://localhost:3000/api/auth/seed**

You should see a response like:
```json
{
  "message": "Database seeding completed",
  "totalUsers": 3,
  "successCount": 3,
  "results": [
    {
      "id": "...",
      "email": "admin@smartscheduler.com",
      "role": "admin",
      "status": "created"
    },
    ...
  ]
}
```

### Step 4: Test Login Page

Navigate to: **http://localhost:3000/login**

You should see:
- SmartScheduler logo with sparkle icon
- Email and password input fields
- Demo credentials section showing all 3 roles
- Purple/Indigo gradient background

### Step 5: Test Admin Login

1. Click on "Admin" demo credentials box
   - Email and password fields auto-fill
2. Click "Sign In"
3. Should redirect to `/admin/dashboard`

### Step 6: Test Faculty Login

1. Logout from admin dashboard (click "Logout")
2. Should redirect to login page
3. Click on "Faculty" demo credentials
4. Click "Sign In"
5. Should redirect to `/faculty/dashboard`

### Step 7: Test Student Login

1. Logout from faculty dashboard
2. Click on "Student" demo credentials
3. Click "Sign In"
4. Should redirect to `/student/dashboard`

### Step 8: Test Route Protection

1. Try accessing `/admin/dashboard` without logging in
   - Should redirect to `/login`
2. Login as student
3. Try accessing `/admin/dashboard`
   - Should redirect to `/student/dashboard`

### Step 9: Test Logout

1. Click "Logout" button on any dashboard
2. Should redirect to `/login`
3. Session cookie should be cleared

## 🔑 Demo Credentials

After seeding, use these to test:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartscheduler.com | admin123 |
| Faculty | faculty@smartscheduler.com | faculty123 |
| Student | student@smartscheduler.com | student123 |

## 📁 Files Created/Modified

### New Files
- ✅ `app/login/page.js` - Login page
- ✅ `app/admin/dashboard/page.js` - Admin dashboard
- ✅ `app/faculty/dashboard/page.js` - Faculty dashboard
- ✅ `app/student/dashboard/page.js` - Student dashboard
- ✅ `app/api/auth/logout/route.js` - Logout endpoint
- ✅ `app/api/auth/seed/route.js` - Seed endpoint
- ✅ `middleware.js` - Route protection
- ✅ `AUTH_SYSTEM_GUIDE.md` - Full documentation
- ✅ `AUTH_SETUP_INSTRUCTIONS.md` - This file

### Modified Files
- ✅ `app/api/auth/login/route.js` - Updated to use Supabase

### Unchanged Files
- ✅ All existing files remain intact
- ✅ No breaking changes to existing functionality

## 🧪 Testing Checklist

- [ ] Demo users created successfully
- [ ] Login page displays correctly
- [ ] Admin login works and redirects to `/admin/dashboard`
- [ ] Faculty login works and redirects to `/faculty/dashboard`
- [ ] Student login works and redirects to `/student/dashboard`
- [ ] Logout clears session and redirects to `/login`
- [ ] Unauthenticated users redirected to `/login`
- [ ] Users cannot access other roles' dashboards
- [ ] Session persists on page refresh
- [ ] CORS headers present on responses

## 🔍 Verification Steps

### Check Database
```sql
-- Run in Supabase SQL Editor
SELECT id, name, email, role FROM users;
```

Should return 3 rows with the demo users.

### Check Session Cookie
1. Open browser DevTools (F12)
2. Go to Application tab
3. Check Cookies for `user_session`
4. After login, should contain: `{"id":"...","name":"...","email":"...","role":"..."}`

### Check API Response
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartscheduler.com","password":"admin123"}'
```

Response should include user object and `Set-Cookie` header.

## 🐛 Common Issues & Solutions

### Issue: "Seed endpoint returns error"
**Solution**: 
- Check Supabase connection in `.env.local`
- Verify database schema is executed
- Check database tables exist in Supabase dashboard

### Issue: "Login fails with 'Database error occurred'"
**Solution**:
- Verify users table has data from seed
- Check Supabase service role key is correct
- Look at browser DevTools Network tab for actual error

### Issue: "Redirect loop between login and dashboard"
**Solution**:
- Clear all cookies in browser
- Check middleware.js file hasn't been modified
- Verify session cookie is being set correctly

### Issue: "User can access other role's dashboard"
**Solution**:
- Verify middleware.js is in project root
- Check Next.js config includes middleware
- Ensure route protection rules are correct

### Issue: "Password compare fails for correct password"
**Solution**:
- Verify password is hashed during seed
- Check bcryptjs version in package.json (^2.4.3)
- Ensure password is passed as string to bcryptjs.compare()

## 📊 Architecture

```
┌─────────────┐
│  Login Page │ (app/login/page.js)
│  Purple UI  │
└──────┬──────┘
       │ POST /api/auth/login
       ▼
┌──────────────────────┐
│  Validate Credentials│ (app/api/auth/login/route.js)
│  Hash with bcrypt    │
│  Set Session Cookie  │
└──────┬───────────────┘
       │ Redirect
       ▼
┌──────────────────────┐
│   Middleware Check   │ (middleware.js)
│   Role Validation    │
└──────┬───────────────┘
       │ Allow/Redirect
       ▼
┌──────────────────────┐
│  Role Dashboard      │
│  Admin/Faculty/      │
│  Student             │
└──────────────────────┘
```

## 🔗 Related Documentation

- [Supabase Setup Guide](SUPABASE_MIGRATION_GUIDE.md)
- [Database Schema](lib/schema.sql)
- [Auth System Guide](AUTH_SYSTEM_GUIDE.md)
- [Supabase Documentation](https://supabase.com/docs)

## 📞 Support

If you encounter issues:

1. **Check logs**: `npm run dev` console output
2. **Browser DevTools**: Network tab for API responses
3. **Supabase Dashboard**: Verify data in tables
4. **Environment Variables**: Double-check `.env.local`

## ✨ Next Steps

After setup is complete:

1. **Customize Dashboards**: Add features specific to your institution
2. **Add More Users**: Create users through admin panel
3. **Implement 2FA**: Add two-factor authentication
4. **Add Permissions**: More granular role-based access
5. **Social Login**: Add OAuth providers
6. **Audit Logging**: Log all authentication events

---

**Setup Status**: Ready for testing
**Last Updated**: June 4, 2026
**Questions?** See AUTH_SYSTEM_GUIDE.md for detailed information
