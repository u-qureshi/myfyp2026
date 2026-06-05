# Example API Route Usage with Supabase

This guide shows how to use the `supabase-db.js` helper functions in your API routes.

## Basic API Route Pattern

```javascript
// app/api/departments/route.js
import { NextResponse } from 'next/server'
import { getDepartments, createDepartment } from '@/lib/supabase-db'

export async function GET() {
  try {
    const departments = await getDepartments(true) // true = use server key
    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const department = await createDepartment(data, true)
    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## Example 1: User Management API

```javascript
// app/api/users/route.js
import { NextResponse } from 'next/server'
import { getUsers, createUser, getUserByEmail } from '@/lib/supabase-db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await getUsers(true)
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { email, password, name, role = 'student', department_id } = await request.json()

    // Check if user already exists
    const existingUser = await getUserByEmail(email, true)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await createUser(
      {
        email,
        password_hash: hashedPassword,
        name,
        role,
        department_id
      },
      true // Use server key for user creation
    )

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## Example 2: Timetable Slots API

```javascript
// app/api/timetable-slots/route.js
import { NextResponse } from 'next/server'
import {
  getTimetableSlots,
  createTimetableSlot,
  deleteTimetableSlotsForSection
} from '@/lib/supabase-db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('section_id')
    const semester = searchParams.get('semester')

    const filters = {}
    if (sectionId) filters.section_id = sectionId
    if (semester) filters.semester = parseInt(semester)

    const slots = await getTimetableSlots(filters, true)
    return NextResponse.json(slots)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const slotData = await request.json()
    const slot = await createTimetableSlot(slotData, true)
    return NextResponse.json(slot, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Replace all slots for a section
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('section_id')

    if (!sectionId) {
      return NextResponse.json(
        { error: 'section_id is required' },
        { status: 400 }
      )
    }

    await deleteTimetableSlotsForSection(sectionId, true)
    return NextResponse.json({ message: 'Slots deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## Example 3: Notifications API

```javascript
// app/api/notifications/route.js
import { NextResponse } from 'next/server'
import {
  getNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead
} from '@/lib/supabase-db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    let notifications
    if (unreadOnly) {
      notifications = await getUnreadNotifications(userId, true)
    } else {
      notifications = await getNotifications(userId, true)
    }

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    await markAllNotificationsAsRead(userId, true)
    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## Example 4: Complex Query - Rooms by Type and Availability

```javascript
// app/api/rooms/available/route.js
import { NextResponse } from 'next/server'
import { getRooms } from '@/lib/supabase-db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'classroom', 'lab', 'seminar_hall'
    const availability = searchParams.get('availability') // 'available', 'occupied', 'maintenance'

    const allRooms = await getRooms(true)

    // Filter on client side
    let filtered = allRooms
    if (type) {
      filtered = filtered.filter(room => room.type === type)
    }
    if (availability) {
      filtered = filtered.filter(room => room.availability_status === availability)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## Example 5: Frontend Component Usage

```javascript
// components/TimetableForm.jsx
'use client'

import { useEffect, useState } from 'react'
import { getTimetableSlots, getRooms, getSubjects } from '@/lib/supabase-db'

export default function TimetableForm({ sectionId }) {
  const [slots, setSlots] = useState([])
  const [rooms, setRooms] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from component (client-side with anon key)
        const slotsData = await getTimetableSlots({ section_id: sectionId })
        const roomsData = await getRooms()
        const subjectsData = await getSubjects()

        setSlots(slotsData)
        setRooms(roomsData)
        setSubjects(subjectsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sectionId])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Timetable Slots: {slots.length}</h2>
      <h3>Available Rooms: {rooms.length}</h3>
      <h3>Subjects: {subjects.length}</h3>
    </div>
  )
}
```

## Example 6: Error Handling Pattern

```javascript
// app/api/departments/[id]/route.js
import { NextResponse } from 'next/server'
import { getDepartmentById, updateDepartment, deleteDepartment } from '@/lib/supabase-db'

export async function GET(request, { params }) {
  try {
    const department = await getDepartmentById(params.id, true)
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }
    return NextResponse.json(department)
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const updates = await request.json()
    const department = await updateDepartment(params.id, updates, true)
    return NextResponse.json(department)
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteDepartment(params.id, true)
    return NextResponse.json({ message: 'Department deleted' })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## Key Points

1. **Always use `true` for `useServer` parameter in API routes** - This uses the service role key with full permissions

2. **Handle errors gracefully** - Always wrap database calls in try-catch

3. **Validate input** - Check required fields before making database calls

4. **Don't expose sensitive data** - Filter out password hashes before returning user data

5. **Use proper HTTP status codes**:
   - 200: GET success
   - 201: POST success (resource created)
   - 400: Bad request (validation error)
   - 404: Not found
   - 500: Server error

6. **For client-side components** - Use `false` or omit the second parameter (browser uses anon key with limited permissions)

7. **Real-time subscriptions** - For real-time features, use Supabase realtime API directly instead of polling

## Migration from MongoDB

**Before (MongoDB):**
```javascript
const departments = await db.collection('departments').find({}).toArray()
```

**After (Supabase):**
```javascript
const departments = await getDepartments(true)
```

Much simpler and type-safe!

---

For more examples, check individual helper functions in `lib/supabase-db.js`
