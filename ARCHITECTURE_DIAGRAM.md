# Departments Management - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │          /admin/departments (page.js)                          │ │
│  │                                                                 │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐ │ │
│  │  │   Sidebar Nav    │  │   Header Bar     │  │   Stats     │ │ │
│  │  │ - Dashboard      │  │ - Title          │  │  Cards      │ │ │
│  │  │ - Departments    │  │ - Admin Name     │  │ - Total     │ │ │
│  │  │ - Faculty        │  │ - Logout         │  │ - Programs  │ │ │
│  │  │ - Rooms          │  │                  │  │ - Sections  │ │ │
│  │  │ - Subjects       │  │                  │  │             │ │ │
│  │  │ - Sections       │  │                  │  │             │ │ │
│  │  │ - etc...         │  │                  │  │             │ │ │
│  │  └──────────────────┘  └──────────────────┘  └─────────────┘ │ │
│  │                                                                 │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │             Search & Filter Box                           │ │ │
│  │  │  [Search departments...]                                  │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │         Department Management Table                       │ │ │
│  │  │  ┌────────┬──────┬──────────┬─────────┬───────┬────────┐ │ │
│  │  │  │ Name   │ Code │ Programs │Sections │Faculty│Actions│ │ │
│  │  │  ├────────┼──────┼──────────┼─────────┼───────┼────────┤ │ │
│  │  │  │ CS     │ CS   │    15    │    4    │  12   │ ✏️ 🗑️ │ │ │
│  │  │  │ ECE    │ ECE  │    12    │    3    │   8   │ ✏️ 🗑️ │ │ │
│  │  │  │ ME     │ ME   │    10    │    2    │   6   │ ✏️ 🗑️ │ │ │
│  │  │  └────────┴──────┴──────────┴─────────┴───────┴────────┘ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  ┌─────────────────────┐  ┌─────────────────────────────────┐ │ │
│  │  │ Add Department      │  │ Edit Department Modal           │ │ │
│  │  │ Modal               │  │ ┌─────────────────────────────┐ │ │
│  │  │ ┌─────────────────┐ │  │ │ Department Name: [______]  │ │ │
│  │  │ │ Dept Name: [__] │ │  │ │ Department Code: [______]  │ │ │
│  │  │ │ Dept Code: [__] │ │  │ │                             │ │ │
│  │  │ │                 │ │  │ │ [Cancel] [Update]          │ │ │
│  │  │ │ [Cancel] [Add]  │ │  │ └─────────────────────────────┘ │ │
│  │  │ └─────────────────┘ │  │                                 │ │
│  │  └─────────────────────┘  └─────────────────────────────────┘ │ │
│  │                                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  State Management:                                                   │
│  • departments: [...]                                               │
│  • loading: boolean                                                 │
│  • searchTerm: string                                               │
│  • showAddModal: boolean                                            │
│  • showEditModal: boolean                                           │
│  • formData: { name, code }                                         │
│  • stats: { departments, programs, sections }                       │
│  • submitting: boolean                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                          API LAYER (route.js)
                                    ↓
```

---

## 🔄 Data Flow

### Add Department Flow
```
User Input (Modal Form)
    ↓
handleAddDepartment()
    ↓
fetch('POST /api/admin/departments')
    ↓
API Route Validation
├─ Check name & code required ✓
├─ Check code max 10 chars ✓
├─ Check code uniqueness ✓
    ↓
INSERT into departments table
    ↓
Response with 201 status
    ↓
Toast: "Department added successfully"
    ↓
fetchDepartments() - Refresh data
    ↓
UI Updates - Table refreshes
    ↓
Modal closes
    ↓
fetchDepartments() response updates stats
    ↓
Stats cards reflect new count
```

### Edit Department Flow
```
User clicks pencil icon
    ↓
Modal opens with pre-filled data
    ↓
User modifies fields
    ↓
handleEditDepartment()
    ↓
fetch('PUT /api/admin/departments')
    ↓
API Route Validation
├─ Check all fields provided ✓
├─ Check code max 10 chars ✓
├─ Check code uniqueness (excl. current) ✓
    ↓
UPDATE departments table
    ↓
Response with updated record
    ↓
Toast: "Department updated successfully"
    ↓
fetchDepartments() - Refresh data
    ↓
UI Updates - Table refreshes
    ↓
Modal closes
```

### Delete Department Flow
```
User clicks trash icon
    ↓
confirm() dialog
    ↓
if (confirmed)
    ↓
handleDeleteDepartment()
    ↓
fetch('DELETE /api/admin/departments?id=xyz')
    ↓
API Route Safety Checks
├─ Count related sections > 0? → 409 Error
├─ Count related subjects > 0? → 409 Error
├─ Count related faculty > 0? → 409 Error
    ↓
if (checks pass)
    DELETE from departments table
    ↓
Response success
    ↓
Toast: "Department deleted successfully"
    ↓
fetchDepartments() - Refresh data
    ↓
UI Updates - Table refreshes
```

### Search Flow
```
User types in search box
    ↓
setSearchTerm(value)
    ↓
React re-renders component
    ↓
filteredDepartments = departments.filter(...)
    ↓
Table filters in real-time (client-side)
    ↓
Matching departments displayed
    ↓
Clear search
    ↓
All departments shown again
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ departments Table                                   │  │
│  │ ┌─────────────────────────────────────────────────┐ │  │
│  │ │ id          | UUID (PRIMARY KEY)                │ │  │
│  │ │ name        | VARCHAR (NOT NULL)                │ │  │
│  │ │ code        | VARCHAR (NOT NULL, UNIQUE)        │ │  │
│  │ │ created_at  | TIMESTAMP                         │ │  │
│  │ │ updated_at  | TIMESTAMP                         │ │  │
│  │ └─────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                            ↕                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ users Table (Faculty)                              │  │
│  │ ┌─────────────────────────────────────────────────┐ │  │
│  │ │ id              | UUID                          │ │  │
│  │ │ department_id   | UUID (FOREIGN KEY)            │ │  │
│  │ │ role            | 'faculty' / 'student' / 'admin'│ │  │
│  │ │ name            | VARCHAR                       │ │  │
│  │ │ ... (other fields)                              │ │  │
│  │ └─────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                            ↕                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ sections Table                                      │  │
│  │ ┌─────────────────────────────────────────────────┐ │  │
│  │ │ id              | UUID (PRIMARY KEY)            │ │  │
│  │ │ department_id   | UUID (FOREIGN KEY)            │ │  │
│  │ │ name            | VARCHAR                       │ │  │
│  │ │ semester        | INTEGER                       │ │  │
│  │ │ ... (other fields)                              │ │  │
│  │ └─────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                            ↕                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ subjects Table                                      │  │
│  │ ┌─────────────────────────────────────────────────┐ │  │
│  │ │ id              | UUID (PRIMARY KEY)            │ │  │
│  │ │ department_id   | UUID (FOREIGN KEY)            │ │  │
│  │ │ name            | VARCHAR                       │ │  │
│  │ │ code            | VARCHAR                       │ │  │
│  │ │ ... (other fields)                              │ │  │
│  │ └─────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

```
┌──────────────────────────────────────────────────────────────────┐
│                    API Route Handler                             │
│        /api/admin/departments/route.js                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ GET /api/admin/departments                                 │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Request: (no body)                                         │ │
│  │ Response:                                                  │ │
│  │ {                                                          │ │
│  │   departments: [                                           │ │
│  │     {                                                      │ │
│  │       id: "uuid",                                          │ │
│  │       name: "Computer Science",                            │ │
│  │       code: "CS",                                          │ │
│  │       facultyCount: 12,                                    │ │
│  │       sections: 4,                                         │ │
│  │       programs: 15                                         │ │
│  │     }                                                      │ │
│  │   ],                                                       │ │
│  │   programCount: 50,                                        │ │
│  │   sectionCount: 20,                                        │ │
│  │   message: "Departments fetched successfully"              │ │
│  │ }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ POST /api/admin/departments                                │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Request:                                                   │ │
│  │ {                                                          │ │
│  │   name: "Computer Science",                                │ │
│  │   code: "CS"                                               │ │
│  │ }                                                          │ │
│  │ Response: 201 Created                                      │ │
│  │ {                                                          │ │
│  │   department: { id, name, code, created_at, updated_at },│ │
│  │   message: "Department created successfully"               │ │
│  │ }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ PUT /api/admin/departments                                 │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Request:                                                   │ │
│  │ {                                                          │ │
│  │   id: "uuid",                                              │ │
│  │   name: "Computer Science & Engineering",                  │ │
│  │   code: "CSE"                                              │ │
│  │ }                                                          │ │
│  │ Response: 200 OK                                           │ │
│  │ {                                                          │ │
│  │   department: { ... updated record ... },                 │ │
│  │   message: "Department updated successfully"               │ │
│  │ }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ DELETE /api/admin/departments?id=uuid                      │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Request: (query param id)                                  │ │
│  │ Response: 200 OK                                           │ │
│  │ {                                                          │ │
│  │   message: "Department deleted successfully"               │ │
│  │ }                                                          │ │
│  │ Error: 409 Conflict                                        │ │
│  │ {                                                          │ │
│  │   error: "Cannot delete department with associated..."     │ │
│  │ }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Security Flow

```
┌────────────────────────────────────────────────────┐
│        Page Load: /admin/departments               │
│                                                    │
│  useEffect() - On Component Mount                 │
│      ↓                                             │
│  fetch('/api/auth/check-session')                │
│      ↓                                             │
│  ┌──────────────────────────────────────┐         │
│  │ Check Session Response               │         │
│  │ ├─ Status: 200?                      │         │
│  │ ├─ User exists?                      │         │
│  │ ├─ Role === 'admin'?                 │         │
│  └──────────────────────────────────────┘         │
│      ↓                                             │
│  ┌────────────────────┐  ┌──────────────────────┐ │
│  │  ALL OK ✓         │  │  NOT OK ✗            │ │
│  ├────────────────────┤  ├──────────────────────┤ │
│  │ • Load page        │  │ • Redirect to /login │ │
│  │ • Fetch departments│  │ • Clear state        │ │
│  │ • Display UI       │  │ • Stop loading       │ │
│  │ • Set admin name   │  │                      │ │
│  └────────────────────┘  └──────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 📦 Component Hierarchy

```
DepartmentManagement (main component)
│
├─ Toaster (notifications)
│
├─ Sidebar
│  ├─ Logo
│  ├─ Navigation Buttons
│  │  ├─ Dashboard
│  │  ├─ Departments (active)
│  │  ├─ Faculty
│  │  ├─ Rooms
│  │  ├─ Subjects
│  │  ├─ Sections
│  │  ├─ Constraints
│  │  ├─ Generate Timetable
│  │  └─ Reports
│  └─ Logout Button
│
├─ Header
│  ├─ Menu Toggle
│  ├─ Title
│  ├─ Admin Name
│  └─ Logout Button (mobile)
│
├─ Main Content
│  ├─ Stats Cards (3)
│  │  ├─ Total Departments
│  │  ├─ Total Programs
│  │  └─ Total Sections
│  │
│  ├─ Department Card
│  │  ├─ Title + Add Button
│  │  ├─ Search Input
│  │  └─ Table
│  │     ├─ Header Row
│  │     └─ Data Rows (with Actions)
│  │
│  └─ Modals
│     ├─ Add Modal
│     │  ├─ Name Input
│     │  ├─ Code Input
│     │  └─ Buttons
│     │
│     └─ Edit Modal
│        ├─ Name Input
│        ├─ Code Input
│        └─ Buttons
```

---

## 🔄 State Management

```
State Variables:

┌─────────────────────────────────────────────────────┐
│ UI State                                            │
├─────────────────────────────────────────────────────┤
│ • sidebarOpen: boolean                              │
│ • showAddModal: boolean                             │
│ • showEditModal: boolean                            │
│ • loading: boolean                                  │
│ • submitting: boolean                               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Data State                                          │
├─────────────────────────────────────────────────────┤
│ • departments: Array<Department>                    │
│ • searchTerm: string                                │
│ • editingDept: Department | null                    │
│ • formData: { name, code }                          │
│ • stats: { departments, programs, sections }        │
│ • adminName: string                                 │
└─────────────────────────────────────────────────────┘

Derived State:

┌─────────────────────────────────────────────────────┐
│ Computed on Render                                  │
├─────────────────────────────────────────────────────┤
│ • filteredDepartments = departments.filter(...)     │
│   (based on searchTerm)                             │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Validation Rules

```
┌──────────────────────────────────────────────────────┐
│          Add/Edit Department Validation              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Department Name:                                    │
│  ├─ Required ✓                                       │
│  ├─ Trimmed before save ✓                            │
│  ├─ No length limit ✓                                │
│  └─ Validated before API call ✓                      │
│                                                      │
│  Department Code:                                    │
│  ├─ Required ✓                                       │
│  ├─ Max 10 characters ✓                              │
│  ├─ Auto-uppercase ✓                                 │
│  ├─ Unique in database ✓                             │
│  └─ Validated before API call ✓                      │
│                                                      │
│  Delete Operation:                                   │
│  ├─ Confirmation required ✓                          │
│  ├─ Check sections count ✓                           │
│  ├─ Check subjects count ✓                           │
│  ├─ Check faculty count ✓                            │
│  └─ Prevent if any relations exist ✓                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📊 Data Enrichment Process

```
GET /api/admin/departments

Raw Data from departments table:
┌─────────────────────────────────┐
│ id    │ name             │ code  │
├─────────────────────────────────┤
│ uuid1 │ Computer Science │ CS    │
│ uuid2 │ Engineering      │ ENG   │
└─────────────────────────────────┘
         ↓
    Promise.all([
      COUNT faculty where dept_id=uuid1
      COUNT sections where dept_id=uuid1
      COUNT subjects where dept_id=uuid1
      COUNT faculty where dept_id=uuid2
      ... etc
    ])
         ↓
Enriched Data Response:
┌─────────────────────────────────────────────────────────┐
│ id    │ name │ code │ facultyCount │ sections │programs │
├─────────────────────────────────────────────────────────┤
│ uuid1 │ CS   │ CS   │     12       │    4     │   15    │
│ uuid2 │ Eng  │ ENG  │      8       │    3     │   10    │
└─────────────────────────────────────────────────────────┘
         ↓
Stats Aggregation:
┌────────────────────────────────┐
│ programCount: 25               │
│ sectionCount: 7                │
└────────────────────────────────┘
         ↓
Response to Frontend
         ↓
UI Renders with Live Data
```

---

## 🎯 User Journey

```
START
  ↓
Login
  ↓
Navigate to /admin/departments
  ↓
Auth Check ──NO──→ Redirect to Login ──→ END
  ↓ YES
Load Departments Page
  ├─ Show loading spinner
  ├─ Fetch from API
  ├─ Calculate stats
  ├─ Display table
  ↓
User Actions:
├─ Search
│  ├─ Filter in real-time
│  ├─ Display matches
│  ↓
├─ Add Department
│  ├─ Open modal
│  ├─ Fill form
│  ├─ Submit
│  ├─ API validation
│  ├─ Insert in DB
│  ├─ Show success
│  ├─ Refresh table
│  ↓
├─ Edit Department
│  ├─ Click pencil
│  ├─ Pre-fill form
│  ├─ Modify fields
│  ├─ Submit
│  ├─ API validation
│  ├─ Update in DB
│  ├─ Show success
│  ├─ Refresh table
│  ↓
├─ Delete Department
│  ├─ Click trash
│  ├─ Confirm dialog
│  ├─ Check relations
│  ├─ Delete from DB
│  ├─ Show success
│  ├─ Refresh table
│  ↓
├─ Logout
│  ├─ Clear session
│  ├─ Redirect to login
│  ↓
END
```

---

This architecture ensures clean separation of concerns, efficient data flow, and secure operations throughout the Departments Management system.
