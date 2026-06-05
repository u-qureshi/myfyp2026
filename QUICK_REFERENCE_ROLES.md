# SmartScheduler.AI - Role-Based System Quick Reference

## 🎯 Three User Roles

### 1. **ADMIN** 👨‍💼
| Aspect | Details |
|--------|---------|
| **Purpose** | Manage entire system |
| **Dashboard** | Full admin dashboard with all features |
| **Sidebar Items** | 5 items (Dashboard, Data Management, Schedule Generation, View Schedules, Settings) |
| **Access** | Upload data, generate schedules, view all timetables |
| **localStorage Role** | `'admin'` |
| **Default Route** | `/dashboard` |

### 2. **FACULTY** 👨‍🏫
| Aspect | Details |
|--------|---------|
| **Purpose** | View schedule, update availability |
| **Dashboard** | Faculty-specific dashboard |
| **Sidebar Items** | 2 items (My Dashboard, My Profile) |
| **Access** | View assigned schedule, update availability |
| **localStorage Role** | `'faculty'` |
| **Default Route** | `/faculty-dashboard` |

### 3. **STUDENT** 👨‍🎓
| Aspect | Details |
|--------|---------|
| **Purpose** | View timetable |
| **Dashboard** | Student-specific dashboard |
| **Sidebar Items** | 2 items (My Timetable, My Profile) |
| **Access** | View timetable, download as PDF/Excel |
| **localStorage Role** | `'student'` |
| **Default Route** | `/student-dashboard` |

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `app/page.js` | Main implementation (role logic, dashboards) |
| `app/api/auth/signup/route.js` | Signup endpoint (already supports role) |
| `app/api/auth/login/route.js` | Login endpoint |

---

## 📝 Signup/Login Parameters

### Signup Request
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "admin|faculty|student"  // Optional, defaults to "student"
}
```

### Signup Response
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin|faculty|student"
  }
}
```

---

## 💾 Storage

### After Login/Signup
```javascript
localStorage.setItem('adminToken', 'jwt-token-here')
localStorage.setItem('userRole', 'admin|faculty|student')
```

### On Page Load
```javascript
const token = localStorage.getItem('adminToken')
const role = localStorage.getItem('userRole')
// If both exist, user auto-redirected to role dashboard
```

### On Logout
```javascript
localStorage.removeItem('adminToken')
localStorage.removeItem('userRole')
// Redirects to login page
```

---

## 🎨 Admin Dashboard Features

```
┌─────────────────────────────────┐
│    ADMIN DASHBOARD              │
├─────────────────────────────────┤
│  📊 Key Metrics                 │
│   • Students: 5                 │
│   • Faculty: 5                  │
│   • Rooms: 5                    │
├─────────────────────────────────┤
│  📤 Data Management             │
│   • Upload Students             │
│   • Upload Faculty              │
│   • Upload Rooms                │
├─────────────────────────────────┤
│  🧠 Schedule Generation         │
│   • Configure Constraints       │
│   • Generate Timetable          │
├─────────────────────────────────┤
│  📋 View Schedules              │
│   • View Generated Schedule     │
│   • Export to PDF/Excel         │
│   • Publish Schedule            │
├─────────────────────────────────┤
│  ⚙️ Settings                     │
│   • Profile                     │
│   • Security                    │
│   • Notifications               │
└─────────────────────────────────┘
```

---

## 📅 Faculty Dashboard Features

```
┌─────────────────────────────────┐
│    FACULTY DASHBOARD            │
├─────────────────────────────────┤
│  📅 Your Schedule               │
│   • Assigned Teaching Hours     │
│   • View Classes                │
├─────────────────────────────────┤
│  ⏰ Update Availability          │
│   • Set Teaching Hours          │
│   • Set Preferences             │
├─────────────────────────────────┤
│  📚 Assigned Courses            │
│   • Subjects Assigned           │
│   • Class Information           │
├─────────────────────────────────┤
│  📊 Weekly Schedule             │
│   • Monday - Sunday Grid        │
│   • Time Slots 9AM - 3:30PM     │
├─────────────────────────────────┤
│  👤 My Profile                  │
│   • Name, Email, Phone          │
│   • Security Settings           │
└─────────────────────────────────┘
```

---

## 🎓 Student Dashboard Features

```
┌─────────────────────────────────┐
│    STUDENT DASHBOARD            │
├─────────────────────────────────┤
│  📚 Your Timetable              │
│   • Class Schedule              │
│   • Room Assignments            │
├─────────────────────────────────┤
│  📖 Enrolled Courses            │
│   • Course List                 │
│   • Course Details              │
├─────────────────────────────────┤
│  📅 Important Dates             │
│   • Semester Start/End          │
│   • Key Deadlines               │
├─────────────────────────────────┤
│  📊 Weekly Timetable            │
│   • Monday - Sunday Grid        │
│   • All Classes This Week       │
├─────────────────────────────────┤
│  💾 Download Options            │
│   • Download as PDF             │
│   • Download as Excel           │
├─────────────────────────────────┤
│  👤 My Profile                  │
│   • Name, Email                 │
│   • Account Settings            │
└─────────────────────────────────┘
```

---

## 🔄 User Flow Diagram

```
                        ┌─────────────┐
                        │   START     │
                        └──────┬──────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  SmartScheduler.AI   │
                    │   Login Page         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Select Role:         │
                    │ • Admin              │
                    │ • Faculty            │
                    │ • Student            │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Enter Email &        │
                    │ Password             │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
            ┌──────▶│ Authenticate         │
            │       │ at Backend           │
            │       └──────────┬───────────┘
            │                  │
            │        ┌─────────▼─────────┐
            │        │ Save:             │
            │        │ • Token           │
            │        │ • Role            │
            │        └─────────┬─────────┘
            │                  │
        ┌───▼──────────────────▼─────────────┐
        │  Redirect Based on Role:           │
        ├───────────────────────────────────┤
        │ Admin → /dashboard                │
        │ Faculty → /faculty-dashboard      │
        │ Student → /student-dashboard      │
        └───────────┬───────────────────────┘
                    │
        ┌───────────▼──────────────┐
        │ Display Role Dashboard   │
        │ Show Role-Specific UI    │
        └───────────┬──────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │ User Can Now:             │
        │ • Use Role Features       │
        │ • Navigate Role Menu      │
        │ • Access Role Pages       │
        └───────────┬───────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │ Click Logout              │
        └───────────┬───────────────┘
                    │
        ┌───────────▼───────────────┐
        │ Clear:                    │
        │ • Token                   │
        │ • Role                    │
        └───────────┬───────────────┘
                    │
        ┌───────────▼───────────────┐
        │ Return to Login Page      │
        └───────────┬───────────────┘
                    │
                    ▼
                 [END]
```

---

## 🧪 Quick Test Checklist

### Immediate (5 minutes)
- [ ] Start app: `npm run dev`
- [ ] See login page with role selector
- [ ] Login as Admin → see admin dashboard
- [ ] Logout

### Admin Testing (5 minutes)
- [ ] Login as Admin
- [ ] Verify sidebar shows 5 items
- [ ] Verify all admin features visible
- [ ] Verify "Logged in as: admin" shows

### Faculty Testing (5 minutes)
- [ ] Logout (if logged in)
- [ ] At signup: Select Faculty role
- [ ] Fill form and sign up
- [ ] Verify redirected to faculty dashboard
- [ ] Verify sidebar shows only 2 items
- [ ] Verify "Logged in as: faculty" shows

### Student Testing (5 minutes)
- [ ] Logout
- [ ] At login: Select Student role
- [ ] Login with any credentials
- [ ] Verify redirected to student dashboard
- [ ] Verify sidebar shows only 2 items
- [ ] Verify "Logged in as: student" shows

### Session Testing (5 minutes)
- [ ] Login as any role
- [ ] Refresh page (F5)
- [ ] Verify you're still logged in
- [ ] Verify same dashboard appears
- [ ] Verify role unchanged

---

## 📊 Feature Matrix

| Feature | Admin | Faculty | Student |
|---------|-------|---------|---------|
| View Dashboard | ✅ | ✅ | ✅ |
| Upload Data | ✅ | ❌ | ❌ |
| Generate Schedule | ✅ | ❌ | ❌ |
| View Schedule | ✅ | ✅ | ✅ |
| Edit Schedule | ✅ | ❌ | ❌ |
| Update Availability | ✅ | ✅ | ❌ |
| View Timetable | ✅ | ✅ | ✅ |
| Download Timetable | ✅ | ✅ | ✅ |
| Manage Settings | ✅ | ✅ | ✅ |
| View Metrics | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

---

## 🚀 How to Use

### For Users
1. Go to SmartScheduler.AI login page
2. Select your role (Admin/Faculty/Student)
3. Enter email and password
4. Click Login
5. You'll be taken to your role-specific dashboard
6. Use the sidebar to navigate within your role
7. Click Logout when done

### For Developers
1. Check `app/page.js` for implementation
2. Search for `currentPage === 'faculty-dashboard'` to see faculty code
3. Search for `currentPage === 'student-dashboard'` to see student code
4. Check sidebar code for role-specific navigation
5. See `handleLogin` and `handleSignup` for auth flow

### For System Admins
1. Use admin dashboard to upload data
2. Configure schedule generation parameters
3. Generate timetable
4. Publish schedule (makes it visible to faculty/students)
5. Faculty can then view their schedule
6. Students can then view their timetable

---

## 🔒 Security Notes

### Current (Frontend)
- ✅ Role selector prevents UI access
- ✅ localStorage stores token and role
- ✅ Session persists across page refreshes
- ⚠️ Frontend-only security (not production-ready)

### TODO (Backend)
- ⏳ Supabase RLS policies for database
- ⏳ API endpoint role validation
- ⏳ JWT token expiration handling
- ⏳ HTTPS enforcement
- ⏳ Rate limiting

---

## 📞 Support

**For Testing Issues**:
See `ROLE_TESTING_GUIDE.md`

**For Architecture Details**:
See `ROLE_BASED_AUTH_COMPLETE.md`

**For Implementation Details**:
See `IMPLEMENTATION_SUMMARY.md`

**For Backend Security**:
See `RLS_POLICIES_TODO.md`

---

## 🎯 Status

| Task | Status |
|------|--------|
| Frontend Role-Based UI | ✅ DONE |
| Login/Signup Role Selection | ✅ DONE |
| Role-Specific Dashboards | ✅ DONE |
| Role-Specific Sidebar | ✅ DONE |
| Session Persistence | ✅ DONE |
| Testing Guide | ✅ DONE |
| Supabase RLS Policies | ⏳ TODO |
| Backend API Validation | ⏳ TODO |
| Production Deployment | ⏳ TODO |

---

**Ready to test?** Start here: `ROLE_TESTING_GUIDE.md` 🚀
