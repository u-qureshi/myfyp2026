# Authentication System Guide

Complete role-based authentication system for SmartScheduler.AI with Admin, Faculty, and Student roles.

## 📋 Overview

This authentication system provides:
- **3 User Roles**: Admin, Faculty, Student
- **Secure Login**: Password hashing with bcryptjs
- **Session Management**: HTTP-only cookies for security
- **Route Protection**: Middleware-based access control
- **Role-Based Dashboards**: Customized pages for each role
- **Supabase Integration**: PostgreSQL database backend

## 🗂️ File Structure

```
app/
├── login/
│   └── page.js                    # Login page with demo credentials
├── admin/
│   └── dashboard/
│       └── page.js                # Admin dashboard
├── faculty/
│   └── dashboard/
│       └── page.js                # Faculty dashboard
├── student/
│   └── dashboard/
│       └── page.js                # Student dashboard
└── api/
    └── auth/
        ├── login/
        │   └── route.js           # Login endpoint
        ├── logout/
        │   └── route.js           # Logout endpoint
        └── seed/
            └── route.js           # Database seeding endpoint

middleware.js                       # Route protection middleware
```

## 🚀 Quick Start

### 1. Seed Demo Users

Call this endpoint once to create demo users:

```bash
GET /api/auth/seed
```

This creates:
- **Admin**: admin@smartscheduler.com / admin123
- **Faculty**: faculty@smartscheduler.com / faculty123
- **Student**: student@smartscheduler.com / student123

### 2. Login

Navigate to `/login` and use any of the demo credentials.

### 3. Access Role-Based Dashboards

- **Admin** → `/admin/dashboard`
- **Faculty** → `/faculty/dashboard`
- **Student** → `/student/dashboard`

## 🔐 Security Features

### Password Hashing
- Uses bcryptjs with 10 salt rounds
- Never stores plain passwords
- Compared during login authentication

### Session Management
- HTTP-only cookies prevent XSS attacks
- Secure cookie flag in production
- SameSite=Lax CSRF protection
- 24-hour expiration

### Route Protection
- Middleware validates all protected routes
- Automatic redirection to `/login` if unauthorized
- Role-based access control
- Seamless redirect to appropriate dashboard

## 📝 API Endpoints

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "admin@smartscheduler.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@smartscheduler.com",
    "role": "admin",
    "department_id": "uuid"
  },
  "message": "Login successful"
}
```

### POST /api/auth/logout
Logout current user and clear session.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/seed
Seed demo users into database (run once).

**Response:**
```json
{
  "message": "Database seeding completed",
  "totalUsers": 3,
  "successCount": 3,
  "results": [...]
}
```

## 🔄 Login Flow

```
1. User visits /login page
2. Enters credentials or clicks demo credentials
3. Form submits to POST /api/auth/login
4. Backend validates email and password in Supabase
5. Password verified with bcryptjs.compare()
6. Session cookie set (HTTP-only, 24h expiration)
7. Redirect to role-based dashboard
   - Admin → /admin/dashboard
   - Faculty → /faculty/dashboard
   - Student → /student/dashboard
8. Middleware protects routes based on role
```

## 👥 User Roles

### Admin
- **Access**: `/admin/*`
- **Features**: Manage all system data
- **Dashboard**: Full administrative control

### Faculty
- **Access**: `/faculty/*`
- **Features**: View/manage own schedule and courses
- **Dashboard**: Teaching schedule and course management

### Student
- **Access**: `/student/*`
- **Features**: View timetable and enrolled courses
- **Dashboard**: Personal timetable and course information

## 🛡️ Middleware Protection

Routes are protected by `/middleware.js`:

**Protected Routes:**
- `/admin/*` → Only admin users
- `/faculty/*` → Faculty and admin users
- `/student/*` → Student and admin users

**Public Routes:**
- `/login` → Accessible to all
- `/api/auth/*` → Public auth endpoints
- `/api/*` → All API routes

**Rules:**
1. Unauthenticated users → Redirect to `/login`
2. Unauthorized users → Redirect to their dashboard
3. Logged-in users at `/login` → Redirect to their dashboard

## 📊 Database Schema

The `users` table in Supabase contains:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role ('admin', 'faculty', 'student'),
  department_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🔄 Session Storage

Session data stored in HTTP-only cookie:

```javascript
{
  "id": "user-uuid",
  "name": "User Name",
  "email": "user@example.com",
  "role": "admin|faculty|student"
}
```

Decoded on each request by middleware to verify permissions.

## 🧪 Testing

### Test Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartscheduler.com","password":"admin123"}'
```

### Test Protected Route
```bash
# Should redirect to /login without session
curl http://localhost:3000/admin/dashboard

# Should work with valid session cookie
curl -b "user_session={...}" http://localhost:3000/admin/dashboard
```

### Test Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

## 🐛 Troubleshooting

### Issue: "Invalid credentials"
- Check email exists in database (run `/api/auth/seed` first)
- Verify password is correct
- Check database connection in Supabase

### Issue: "Redirect loop"
- Clear browser cookies
- Check middleware configuration
- Verify session cookie is being set

### Issue: "403 Unauthorized"
- User role doesn't have access to route
- Check middleware protected routes
- Verify user role in database

### Issue: "Cookie not persisting"
- Check httpOnly flag is set correctly
- Verify Secure flag (production only)
- Check SameSite policy settings

## 📈 Next Steps

1. **Customize Login Page**: Edit `app/login/page.js` to match branding
2. **Add More Roles**: Modify `users` table ENUM and middleware
3. **Implement 2FA**: Add two-factor authentication
4. **Add Password Reset**: Create password recovery flow
5. **Social Login**: Integrate OAuth providers
6. **Audit Logging**: Log all auth events
7. **Rate Limiting**: Add login attempt limits

## 🔗 Related Files

- `lib/supabase.js` - Supabase client initialization
- `lib/supabase-db.js` - Database helper functions
- `lib/schema.sql` - Database schema
- `.env.local` - Environment variables

## 💡 Key Features

✅ Secure password hashing (bcryptjs)
✅ HTTP-only session cookies
✅ Middleware-based route protection
✅ Role-based access control (RBAC)
✅ Automatic dashboard routing
✅ Demo credentials for testing
✅ CORS support
✅ Error handling
✅ Supabase PostgreSQL integration
✅ Responsive login UI
✅ Purple/Indigo branding theme

## 📞 Support

For issues or questions:
1. Check this guide
2. Review error messages in browser console
3. Check Supabase dashboard for data
4. Verify database connection in `.env.local`

---

**Status**: ✅ Complete
**Last Updated**: June 4, 2026
**Database**: Supabase PostgreSQL
