# Role-Based Authentication - Testing Guide

Quick reference for testing the new role-based authentication system in SmartScheduler.AI.

---

## Quick Start

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Visit:** `http://localhost:3000`

3. **You'll see the login page** with a role selector dropdown

---

## Test Scenarios

### Scenario 1: Admin Login
**Expected Behavior**: Admin sees full admin dashboard

1. At login page, select role: **Admin**
2. Enter any email and password (demo mode accepts any)
3. Click "Login"
4. **Should see**:
   - Dashboard with metrics
   - Data upload section
   - Sidebar with: Dashboard, Data Management, Schedule Generation, View Schedules, Settings

### Scenario 2: Faculty Login
**Expected Behavior**: Faculty sees faculty-specific dashboard

1. At login page, select role: **Faculty**
2. Enter any email and password
3. Click "Login"
4. **Should see**:
   - Faculty dashboard with: Your Schedule, Update Availability, Assigned Courses
   - Weekly schedule grid (empty placeholder)
   - Sidebar with: My Dashboard, My Profile
   - Role shown as "Logged in as: faculty" in sidebar

### Scenario 3: Student Login
**Expected Behavior**: Student sees student-specific dashboard

1. At login page, select role: **Student**
2. Enter any email and password
3. Click "Login"
4. **Should see**:
   - Student dashboard with: Your Timetable, Enrolled Courses, Important Dates
   - Weekly timetable grid (empty placeholder)
   - Download options for PDF/Excel
   - Sidebar with: My Timetable, My Profile
   - Role shown as "Logged in as: student" in sidebar

### Scenario 4: Signup as Faculty
**Expected Behavior**: New faculty account created and redirected to faculty dashboard

1. At login page, click "Sign Up"
2. Select role: **Faculty**
3. Fill in: Name, Email, Password
4. Click "Sign Up"
5. **Should see**:
   - Faculty dashboard immediately (auto-redirect)
   - "Logged in as: faculty" in sidebar

### Scenario 5: Signup as Student (Default)
**Expected Behavior**: New student account created

1. At login page, click "Sign Up"
2. Leave role as default: **Student**
3. Fill in: Name, Email, Password
4. Click "Sign Up"
5. **Should see**:
   - Student dashboard immediately
   - "Logged in as: student" in sidebar

### Scenario 6: Logout
**Expected Behavior**: User logged out and returned to login page

1. Login as any role
2. Click the red "Logout" button in sidebar
3. **Should see**:
   - Login page again
   - All session data cleared
   - Can login again as different role

### Scenario 7: Page Refresh (Session Persistence)
**Expected Behavior**: User stays logged in with same role

1. Login as **Faculty**
2. Verify you see faculty dashboard
3. **Press F5** to refresh page
4. **Should see**:
   - Faculty dashboard still visible (not redirected to login)
   - Session maintained across refresh

### Scenario 8: Role-Based Sidebar Navigation
**Expected Behavior**: Different sidebars for different roles

#### For Admin:
- ✓ Dashboard
- ✓ Data Management
- ✓ Schedule Generation
- ✓ View Schedules
- ✓ Settings

#### For Faculty:
- ✓ My Dashboard
- ✓ My Profile
- ✗ Data Management (hidden)
- ✗ Schedule Generation (hidden)

#### For Student:
- ✓ My Timetable
- ✓ My Profile
- ✗ Dashboard (hidden)
- ✗ Data Management (hidden)

---

## Verification Checklist

### Authentication Flow
- [ ] Login page has role selector dropdown
- [ ] Default role is "Student"
- [ ] Can select Admin/Faculty/Student
- [ ] Login redirects to correct dashboard based on role
- [ ] Signup redirects to correct dashboard based on role
- [ ] Logout clears session and returns to login
- [ ] Page refresh maintains session with correct role

### Dashboard Content
- [ ] Admin dashboard shows admin-specific cards
- [ ] Faculty dashboard shows faculty-specific cards
- [ ] Student dashboard shows student-specific cards
- [ ] Each dashboard displays the correct welcome message

### Sidebar Navigation
- [ ] Admin sees all 5 menu items
- [ ] Faculty sees only 2 menu items
- [ ] Student sees only 2 menu items
- [ ] Role name displayed in sidebar
- [ ] Clicking menu items changes page content
- [ ] Active menu item is highlighted (secondary style)
- [ ] Logout button works on all roles

### Data Persistence
- [ ] localStorage.userRole contains correct value
- [ ] localStorage.adminToken contains JWT token
- [ ] localStorage cleared on logout
- [ ] Session restored on page refresh

---

## Browser Console Debug Tips

**Check stored data:**
```javascript
// Check role
console.log(localStorage.getItem('userRole'))  // Should be: "admin", "faculty", or "student"

// Check token
console.log(localStorage.getItem('adminToken'))  // Should be a JWT string

// Clear all data
localStorage.clear()
```

**Check component state:**
```javascript
// The app tracks these states:
// - userRole: "admin" | "faculty" | "student" | null
// - isAuthenticated: true | false
// - currentPage: "dashboard" | "faculty-dashboard" | "student-dashboard" | etc.
```

---

## Common Issues & Solutions

### Issue: After login, still on login page
**Solution**: Check browser console for errors. Verify role selector is working. Clear localStorage and try again.

### Issue: Can see admin features as faculty
**Solution**: This is expected in the current implementation. Role-based RLS policies not yet configured. Frontend restricts UI, but backend needs additional security.

### Issue: Sidebar not updating role options
**Solution**: Reload the page. The sidebar respects the `userRole` state which should update on login.

### Issue: Can't logout
**Solution**: Check if you have browser console errors. The logout button calls `handleLogout()` which clears localStorage and resets state.

---

## Test Data

You can use any email/password combination for testing (demo mode accepts anything):

```
Email: admin@example.com
Password: anypassword123

Email: faculty@example.com  
Password: anypassword123

Email: student@example.com
Password: anypassword123
```

---

## API Testing (Optional)

If you want to test the signup API directly:

**Admin Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass123","name":"Admin User","role":"admin"}'
```

**Faculty Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@test.com","password":"pass123","name":"Faculty User","role":"faculty"}'
```

**Student Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"pass123","name":"Student User","role":"student"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-here",
    "email": "user@test.com",
    "name": "User Name",
    "role": "admin|faculty|student"
  }
}
```

---

## Next Steps After Testing

1. ✅ Verify all role-based UI changes work correctly
2. ⏳ Configure Supabase RLS policies (not yet done)
3. ⏳ Add backend role validation to API endpoints
4. ⏳ Test end-to-end role-based data access
5. ⏳ Deploy to production with role-based security

---

## Support

If you encounter issues:

1. Check the browser console (F12) for JavaScript errors
2. Check the network tab to see API responses
3. Verify localStorage has correct role/token values
4. Read the full documentation in `ROLE_BASED_AUTH_COMPLETE.md`
5. Review the implementation in `app/page.js` (look for `currentPage === 'faculty-dashboard'` and `currentPage === 'student-dashboard'`)

---

**Happy Testing! 🚀**
