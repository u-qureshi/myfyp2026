# Faculty Management - Quick Start Guide

## 🚀 Quick Access

**URL**: `http://localhost:3000/admin/faculty`

**Requires**: Admin role authentication

---

## 📋 What's New

### Frontend
- ✅ `/app/admin/faculty/page.js` - Complete admin page with modals

### Backend
- ✅ `/app/api/admin/faculty/route.js` - Complete API (GET, POST, PUT, DELETE)

---

## 🎯 Features at a Glance

| Feature | Details |
|---------|---------|
| **View Faculty** | Table with search and filtering |
| **Add Faculty** | Modal form with validation |
| **Edit Faculty** | Inline edit modal |
| **Delete Faculty** | Confirmation dialog with safety checks |
| **Statistics** | Real-time counts (total, available, on leave, avg workload) |
| **Search** | Live filtering by name, email, department |
| **Responsive** | Mobile, tablet, desktop support |
| **Authentication** | Admin-only access |

---

## 📊 API Reference

### Get All Faculty
```bash
GET /api/admin/faculty
```

**Response:**
```json
{
  "faculty": [
    {
      "id": "uuid",
      "name": "Dr. John Smith",
      "email": "john.smith@university.edu",
      "department_name": "Computer Science",
      "availability_status": "available"
    }
  ],
  "message": "Faculty fetched successfully"
}
```

---

### Create Faculty
```bash
POST /api/admin/faculty
Content-Type: application/json

{
  "name": "Dr. John Smith",
  "email": "john.smith@university.edu",
  "password": "faculty123",
  "department_id": "uuid"
}
```

**Response:** (201 Created)
```json
{
  "faculty": {
    "id": "uuid",
    "name": "Dr. John Smith",
    "email": "john.smith@university.edu",
    "department_id": "uuid",
    "role": "faculty"
  },
  "message": "Faculty member created successfully"
}
```

---

### Update Faculty
```bash
PUT /api/admin/faculty
Content-Type: application/json

{
  "id": "uuid",
  "name": "Dr. John Smith Jr.",
  "email": "john.smith@university.edu",
  "department_id": "uuid"
}
```

**Response:** (200 OK)
```json
{
  "faculty": { /* updated record */ },
  "message": "Faculty member updated successfully"
}
```

---

### Delete Faculty
```bash
DELETE /api/admin/faculty?id=<uuid>
```

**Response:** (200 OK)
```json
{
  "message": "Faculty member deleted successfully"
}
```

**Error (409 Conflict):** If faculty has timetable slots
```json
{
  "error": "Cannot delete faculty member with assigned timetable slots"
}
```

---

## 🎨 UI Components Used

- **Dialog** - Modal forms for add/edit
- **Button** - Primary, outline, destructive variants
- **Input** - Text inputs with label
- **Card** - Statistics and content containers
- **Label** - Form labels
- **Select** - Department dropdown
- **Icons** from Lucide React:
  - `Plus` - Add button
  - `Calendar` - View schedule button
  - `Pencil` - Edit button
  - `Trash2` - Delete button
  - `Search` - Search input
  - `Menu` - Sidebar toggle
  - `LogOut` - Logout

---

## 🔐 Authentication Flow

```
User visits /admin/faculty
    ↓
useEffect checks session via /api/auth/check-session
    ↓
If no session or role !== 'admin'
    ↓
Redirect to /login
    ↓
Else load faculty page
```

---

## 💾 Data Storage

**Supabase Tables:**
- `users` - Faculty records (filtered by role='faculty')
- `departments` - Department information
- `timetable_slots` - For delete validation

---

## ⚠️ Validation Rules

### Full Name
- ✅ Required
- ✅ Any length allowed
- ✅ Trimmed on save

### Email
- ✅ Required
- ✅ Must be valid format
- ✅ Must be unique
- ✅ Checked before operations

### Password (Add Only)
- ✅ Required
- ✅ Default: "faculty123"
- ✅ Hashed with bcryptjs
- ✅ Not shown in edit mode

### Department
- ✅ Required (dropdown selection)
- ✅ Must exist in database
- ✅ Verified before operations

### Delete Protection
- ❌ Cannot delete if has timetable slots
- ✅ Error shown if deletion prevented

---

## 🛠️ Development Notes

### Environment Variables Needed
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Dependencies
- React 18+
- Next.js 14+
- Supabase JS client
- bcryptjs (for password hashing)
- Sonner (toasts)
- Tailwind CSS
- Lucide React icons

### No New Dependencies Added
All required packages already in project

---

## 🧪 Manual Testing Steps

### 1. Create Faculty
1. Go to `/admin/faculty`
2. Click "+ Add Faculty"
3. Enter:
   - Name: "Dr. Jane Doe"
   - Email: "jane.doe@university.edu"
   - Password: (default "faculty123" or custom)
   - Department: Select from dropdown
4. Click "Add Faculty"
5. ✅ Should appear in table

### 2. Search
1. Type "Jane" in search box
2. ✅ Should filter to show only matching faculty
3. Type "CS" to search by department

### 3. Edit Faculty
1. Click pencil icon
2. Change name to "Dr. Jane Doe, PhD"
3. Click "Update Faculty"
4. ✅ Table should refresh with new name

### 4. Try Delete with Relations
1. If faculty has timetable slots assigned
2. Click trash icon
3. Confirm in dialog
4. ✅ Should show error: "Cannot delete faculty..."

### 5. Delete Faculty
1. Create a new test faculty member
2. Click trash icon
3. Confirm in dialog
4. ✅ Should be deleted from table

---

## 🐛 Common Issues

### Issue: "Email already in use"
**Solution**: Use a unique email or delete existing faculty first

### Issue: Cannot delete faculty
**Solution**: Remove all timetable slots for the faculty first

### Issue: Faculty not loading
**Solution**:
1. Check Supabase connection
2. Verify service role key in .env.local
3. Check browser console for errors

### Issue: Auth check fails
**Solution**:
1. Verify session cookie is set correctly
2. Check /api/auth/check-session working
3. Ensure admin role in database

### Issue: Department dropdown empty
**Solution**: Create departments first via Department Management page

---

## 📈 Performance Tips

- Faculty are fetched once on mount
- Use Ctrl+F in browser to search locally if list is small
- For 1000+ faculty, add pagination (ready-to-implement)
- Department names fetched in parallel for speed

---

## 🚀 Production Checklist

- [ ] Environment variables set correctly
- [ ] Supabase tables have proper indexes
- [ ] RLS policies configured (allow admins)
- [ ] Error handling logs reviewed
- [ ] Mobile responsiveness tested
- [ ] Toast notifications working
- [ ] Logout redirect working
- [ ] Search performance acceptable
- [ ] Password hashing verified
- [ ] Delete confirmation prevents accidents
- [ ] Form validation working

---

## 📞 Support

For issues or questions about the Faculty Management system, check:
1. Browser console for JavaScript errors
2. Network tab for API responses
3. Supabase logs for database errors
4. Compare with admin dashboard for pattern matching

---

## ✅ Status

**READY TO USE** - All features implemented and tested.

Last Updated: 2024-01-15
