import {
  applySemesterCreditRules,
  describeStudentConstraints,
  filterSubjectsByDeptAndSemester,
  getCsSchedulingSubjects,
  getCsSemesterDisplaySummary,
  mapFacultyForGenerator,
  mapSectionsForGenerator,
  normalizeStudentConstraints,
  timetableScheduleFingerprint
} from '@/lib/timetable-helpers'
import { runOptimization } from '@/app/api/generate-timetable/route'
import { supabaseServer } from '@/lib/supabase'

export async function prepareTimetableInput(departmentId, semester, departmentCode = null) {
  const sem = parseInt(semester, 10)

  const [facultyRes, roomsRes, sectionsRes, subjectsRes, deptRes] = await Promise.all([
    supabaseServer.from('users').select('*, departments(name, code)').eq('role', 'faculty'),
    supabaseServer.from('rooms').select('*'),
    supabaseServer.from('sections').select('*'),
    supabaseServer.from('subjects').select('*'),
    supabaseServer.from('departments').select('*').eq('id', departmentId).maybeSingle()
  ])

  const deptCode = departmentCode || deptRes.data?.code
  const departmentName = deptRes.data?.name || 'Department'

  let facultyData = (facultyRes.data || []).filter((f) => f.department_id === departmentId)
  const roomsData = roomsRes.data || []
  let sectionsData = (sectionsRes.data || []).filter(
    (s) => s.department_id === departmentId && s.semester === sem
  )
  const allSubjects = subjectsRes.data || []

  if (!facultyData.length || !roomsData.length || !sectionsData.length) {
    throw new Error('Missing faculty, rooms, or sections for selected department and semester')
  }

  const deptSemesterSubjects = filterSubjectsByDeptAndSemester(allSubjects, departmentId, String(sem))

  let filteredSubjects
  let totalCredits
  let subjectCount
  let courseUnits

  if (deptCode === 'CS') {
    filteredSubjects = getCsSchedulingSubjects(allSubjects, String(sem), sectionsData)
    const csSummary = getCsSemesterDisplaySummary(String(sem), 1)
    courseUnits = csSummary.courseUnits
    subjectCount = csSummary.subjectCount
    totalCredits = csSummary.totalCredits
  } else {
    const creditResult = applySemesterCreditRules(deptSemesterSubjects)
    filteredSubjects = creditResult.subjects
    totalCredits = creditResult.totalCredits
    subjectCount = creditResult.subjects.length
    courseUnits = creditResult.courseUnits
  }

  if (!filteredSubjects.length) {
    throw new Error('No subjects found for selected department and semester')
  }

  const mappedFaculty = mapFacultyForGenerator(facultyData, filteredSubjects, String(sem))
  const mappedStudents = mapSectionsForGenerator(sectionsData, allSubjects, { deptCode })
  const mappedRooms = roomsData.map((r) => ({
    id: r.id,
    'Room ID': r.id,
    Name: r.name || 'Unknown Room',
    Type: r.type === 'lab' ? 'Lab' : r.type === 'seminar_hall' ? 'Seminar Hall' : 'Classroom',
    Capacity: String(r.capacity || 30),
    Equipment: 'Standard'
  }))

  const metadata = {
    departmentId,
    departmentName,
    departmentCode: deptCode,
    semester: sem,
    subjectNames: filteredSubjects.map((s) => s.name),
    totalCredits,
    subjectCount,
    courseUnits
  }

  return {
    students: mappedStudents,
    faculty: mappedFaculty,
    rooms: mappedRooms,
    subjects: filteredSubjects,
    metadata
  }
}

/**
 * Generate top N timetable options using the student's exact constraints.
 * Each option is a different valid schedule under the same preferences
 * (not different constraint combinations).
 */
export function generateTopScenarios(input, constraints, topN = 5) {
  const { students, faculty, rooms, subjects, metadata } = input
  const studentConstraints = normalizeStudentConstraints(constraints || {})
  const constraintSummary = describeStudentConstraints(studentConstraints)

  const seen = new Set()
  const generated = []
  const maxAttempts = Math.max(topN * 3, 12)

  for (let attempt = 0; attempt < maxAttempts && generated.length < topN; attempt++) {
    const timetable = runOptimization(
      students,
      faculty,
      rooms,
      studentConstraints,
      subjects,
      metadata,
      {
        populationSize: 4 + (attempt % 4),
        generations: 10 + (attempt % 6)
      }
    )

    const fingerprint = timetableScheduleFingerprint(timetable)
    if (seen.has(fingerprint)) continue
    seen.add(fingerprint)

    const optionNumber = generated.length + 1
    generated.push({
      rank: 0,
      scenarioId: `student-option-${optionNumber}`,
      scenarioName: `Timetable Option ${optionNumber}`,
      shortLabel: `Option ${optionNumber}`,
      description: constraintSummary,
      constraints: studentConstraints,
      constraintSummary,
      timetable,
      score: timetable.summary?.optimizationScore || 0,
      hardViolationCount: timetable.summary?.hardViolationCount || 0,
      conflictCount: timetable.summary?.conflictCount || 0
    })
  }

  if (!generated.length) {
    throw new Error('Could not generate any timetables for the selected constraints')
  }

  return generated
    .sort(
      (a, b) =>
        a.hardViolationCount - b.hardViolationCount ||
        b.score - a.score ||
        a.conflictCount - b.conflictCount
    )
    .slice(0, topN)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

export { describeStudentConstraints, normalizeStudentConstraints }
