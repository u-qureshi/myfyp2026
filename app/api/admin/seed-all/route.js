import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { csSubjects } from '@/lib/cs-curriculum'
import { departments, rooms, subjects, faculty, sections } from '@/lib/seed-data'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    console.log('🌱 Starting database seeding...')

    // Initialize Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing Supabase credentials')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing Supabase environment variables'
        }),
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const inserted = {
      departments: 0,
      rooms: 0,
      subjects: 0,
      faculty: 0,
      sections: 0
    }

    // Step 1: Insert departments
    console.log('📚 Inserting departments...')
    const deptMap = {} // Map to store { code: id }

    for (const dept of departments) {
      try {
        // Check if department already exists
        const { data: existing } = await supabase
          .from('departments')
          .select('id')
          .eq('code', dept.code)
          .single()

        if (existing?.id) {
          deptMap[dept.code] = existing.id
          console.log(`  ⏭️  Skipped department ${dept.code} (already exists)`)
        } else {
          const { data, error } = await supabase
            .from('departments')
            .insert([dept])
            .select('id')
            .single()

          if (error) throw error
          deptMap[dept.code] = data.id
          inserted.departments++
          console.log(`  ✅ Inserted department ${dept.code}`)
        }
      } catch (error) {
        console.error(`  ❌ Error inserting department ${dept.code}:`, error.message)
      }
    }

    // Step 2: Insert rooms (no department dependency)
    console.log('🏛️  Inserting rooms...')
    for (const room of rooms) {
      try {
        // Upsert by name
        const { data: existing } = await supabase
          .from('rooms')
          .select('id')
          .eq('name', room.name)
          .single()

        if (existing?.id) {
          console.log(`  ⏭️  Skipped room ${room.name} (already exists)`)
        } else {
          const { error } = await supabase
            .from('rooms')
            .insert([room])

          if (error) throw error
          inserted.rooms++
          console.log(`  ✅ Inserted room ${room.name}`)
        }
      } catch (error) {
        console.error(`  ❌ Error inserting room ${room.name}:`, error.message)
      }
    }

    // Step 3: Insert subjects (using department ID map)
    console.log('📖 Inserting subjects...')

    const realCsCodes = new Set(csSubjects.map((subject) => subject.code))
    const csDeptId = deptMap.CS
    if (csDeptId) {
      const { data: oldCsSubjects } = await supabase
        .from('subjects')
        .select('id, code')
        .eq('department_id', csDeptId)

      for (const oldSubject of oldCsSubjects || []) {
        if (!realCsCodes.has(oldSubject.code)) {
          await supabase.from('subjects').delete().eq('id', oldSubject.id)
          console.log(`  🗑️  Removed outdated CS subject ${oldSubject.code}`)
        }
      }
    }

    for (const subject of subjects) {
      try {
        const deptId = deptMap[subject.dept]
        if (!deptId) {
          console.log(`  ⏭️  Skipped subject ${subject.code} (department not found)`)
          continue
        }

        const payload = {
          name: subject.name,
          code: subject.code,
          credit_hours: subject.credit_hours,
          department_id: deptId
        }

        const { data: existing } = await supabase
          .from('subjects')
          .select('id')
          .eq('code', subject.code)
          .single()

        if (existing?.id) {
          const { error } = await supabase.from('subjects').update(payload).eq('id', existing.id)
          if (error) throw error
          console.log(`  🔄 Updated subject ${subject.code}`)
        } else {
          const { error } = await supabase.from('subjects').insert([payload])
          if (error) throw error
          inserted.subjects++
          console.log(`  ✅ Inserted subject ${subject.code}`)
        }
      } catch (error) {
        console.error(`  ❌ Error inserting subject ${subject.code}:`, error.message)
      }
    }

    // Step 4: Insert faculty users
    console.log('👨‍🏫 Inserting faculty users...')
    const facultyPasswordHash = await bcrypt.hash('faculty', 10)

    for (const facMember of faculty) {
      try {
        const deptId = deptMap[facMember.dept]
        if (!deptId) {
          console.log(`  ⏭️  Skipped faculty ${facMember.email} (department not found)`)
          continue
        }

        const { data, error } = await supabase
          .from('users')
          .upsert(
            [
              {
                email: facMember.email,
                password_hash: facultyPasswordHash,
                role: 'faculty',
                name: facMember.name,
                department_id: deptId
              }
            ],
            { onConflict: 'email' }
          )
          .select()

        if (error) {
          console.error(`  ❌ Error upserting faculty ${facMember.email}:`, {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
          continue
        }

        if (data && data.length > 0) {
          inserted.faculty++
          console.log(`  ✅ Upserted faculty ${facMember.name}`)
        }
      } catch (error) {
        console.error(`  🔥 Fatal error inserting faculty ${facMember.email}:`, {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
      }
    }

    // Step 5: Insert sections (using department ID map)
    console.log('👥 Inserting sections...')
    for (const section of sections) {
      try {
        const deptId = deptMap[section.dept]
        if (!deptId) {
          console.log(`  ⏭️  Skipped section ${section.name} (department not found)`)
          continue
        }

        const payload = {
          name: section.name,
          semester: section.semester,
          department_id: deptId,
          student_count: section.student_count
        }

        const { data: existing } = await supabase
          .from('sections')
          .select('id')
          .eq('name', section.name)
          .single()

        if (existing?.id) {
          const { error } = await supabase.from('sections').update(payload).eq('id', existing.id)
          if (error) throw error
          console.log(`  🔄 Updated section ${section.name}`)
        } else {
          const { error } = await supabase.from('sections').insert([payload])
          if (error) throw error
          inserted.sections++
          console.log(`  ✅ Inserted section ${section.name}`)
        }
      } catch (error) {
        console.error(`  ❌ Error inserting section ${section.name}:`, error.message)
      }
    }

    console.log('✨ Database seeding completed!')
    console.log('📊 Summary:', inserted)

    return new Response(
      JSON.stringify({
        success: true,
        inserted
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('🔥 Fatal error during seeding:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
