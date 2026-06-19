import {
  csSubjectMetaByCode,
  csSubjectSemesterByCode,
  csSubjects,
  resolveCsCourseGroupsForSection,
  resolveCsSubjectCodesForSection
} from './cs-curriculum'

export const MAX_SUBJECTS_PER_SEMESTER = 5
export const MAX_CREDIT_HOURS_PER_SEMESTER = 18
export const MAX_CREDIT_HOURS_PER_SUBJECT = 3

const csSubjectSectionsByCode = Object.fromEntries(
  csSubjects.map((subject) => [subject.code, subject.sections || 1])
)

/** Clamp and round credit hours to allowed range (1–3). */
export function normalizeCreditHours(creditHours) {
  const parsed = parseFloat(creditHours)
  if (Number.isNaN(parsed) || parsed <= 0) return 3
  return Math.min(MAX_CREDIT_HOURS_PER_SUBJECT, Math.max(1, Math.round(parsed)))
}

/**
 * Pick up to 5 subjects with total credits <= 18 for a semester.
 * Used for non-CS departments.
 */
export function applySemesterCreditRules(subjects) {
  const sorted = [...(subjects || [])]
    .map((subject) => ({
      ...subject,
      credit_hours: normalizeCreditHours(subject.credit_hours)
    }))
    .sort((a, b) => (a.code || '').localeCompare(b.code || '') || a.name.localeCompare(b.name))

  const selected = []
  let totalCredits = 0

  for (const subject of sorted) {
    if (selected.length >= MAX_SUBJECTS_PER_SEMESTER) break
    if (totalCredits + subject.credit_hours > MAX_CREDIT_HOURS_PER_SEMESTER) continue
    selected.push(subject)
    totalCredits += subject.credit_hours
  }

  return {
    subjects: selected,
    totalCredits,
    droppedCount: sorted.length - selected.length,
    courseUnits: selected.length
  }
}

/** Display/load summary for one CS section (5 course units max). */
export function getCsSemesterDisplaySummary(semester, sectionIndex = 1) {
  const semNum = parseInt(semester, 10)
  const courseGroups = resolveCsCourseGroupsForSection(semNum, sectionIndex)
  const codes = resolveCsSubjectCodesForSection(semNum, sectionIndex)
  const totalCredits = codes.reduce((sum, code) => {
    const meta = csSubjectMetaByCode[code]
    return sum + normalizeCreditHours(meta?.credit_hours || 3)
  }, 0)

  const rulesType = semNum >= 5 ? 'elective' : 'fixed'

  return {
    courseUnits: courseGroups.length,
    subjectCount: courseGroups.length,
    slotCount: codes.length,
    totalCredits,
    compulsoryCount: rulesType === 'elective' ? 3 : courseGroups.length,
    uniElectiveCount: rulesType === 'elective' ? 1 : 0,
    csElectiveCount: rulesType === 'elective' ? 1 : 0,
    courseGroups,
    codes
  }
}

/** Union of all subject rows needed to schedule every CS section in a semester. */
export function getCsSchedulingSubjects(allSubjects, semester, sectionsList) {
  const semNum = parseInt(semester, 10)
  const codes = new Set()

  ;(sectionsList || [{ name: `BSCS-${semNum}-01`, semester: semNum }]).forEach((section) => {
    resolveCsSubjectCodesForSection(semNum, parseSectionIndex(section.name)).forEach((code) =>
      codes.add(code)
    )
  })

  return (allSubjects || [])
    .filter((subject) => codes.has(subject.code))
    .map((subject) => ({
      ...subject,
      credit_hours: normalizeCreditHours(subject.credit_hours),
      ...csSubjectMetaByCode[subject.code]
    }))
}

/** CS subjects assigned to one section (3 comp + 1 uni + 1 CS elective where applicable). */
export function selectCsSubjectsForSection(allSubjects, section) {
  const codes = new Set(
    resolveCsSubjectCodesForSection(section.semester, parseSectionIndex(section.name))
  )

  return (allSubjects || [])
    .filter((subject) => codes.has(subject.code))
    .map((subject) => ({
      ...subject,
      credit_hours: normalizeCreditHours(subject.credit_hours),
      ...csSubjectMetaByCode[subject.code]
    }))
}

/**
 * Weekly class plan from credit hours:
 * 1 CH → 1 class/week
 * 2 CH → 2 classes/week (different days)
 * 3 CH → 3 classes/week (2 consecutive same day + 1 other day)
 */
export function getWeeklySessionPlan(creditHours) {
  const credits = normalizeCreditHours(creditHours)

  if (credits === 1) {
    return {
      credits,
      weeklyClasses: 1,
      blocks: [{ sessions: 1, consecutive: false }]
    }
  }

  if (credits === 2) {
    return {
      credits,
      weeklyClasses: 2,
      blocks: [
        { sessions: 1, consecutive: false },
        { sessions: 1, consecutive: false }
      ]
    }
  }

  return {
    credits,
    weeklyClasses: 3,
    blocks: [
      { sessions: 2, consecutive: true },
      { sessions: 1, consecutive: false }
    ]
  }
}

/** Derive semester number from subject code (e.g. CS-301 → 3, CS-801 → 8). */
export function getSubjectSemesterFromCode(code) {
  if (!code) return null
  const match = String(code).match(/-(\d)(\d{2})/)
  return match ? parseInt(match[1], 10) : null
}

/** Resolve semester from subject record or UCP CS curriculum lookup. */
export function getSubjectSemester(subject) {
  if (subject?.semester != null) return parseInt(subject.semester, 10)
  if (subject?.code && csSubjectSemesterByCode[subject.code]) {
    return csSubjectSemesterByCode[subject.code]
  }
  return getSubjectSemesterFromCode(subject?.code)
}

/** Parse trailing section index from names like BSCS-6-03 or BSCS-6A. */
export function parseSectionIndex(sectionName) {
  const numericMatch = String(sectionName || '').match(/-(\d+)$/)
  if (numericMatch) return parseInt(numericMatch[1], 10)
  const alphaMatch = String(sectionName || '').match(/([A-Z])$/)
  if (alphaMatch) return alphaMatch[1].charCodeAt(0) - 64
  return 1
}

/** Filter subjects by department and optional semester. */
export function filterSubjectsByDeptAndSemester(subjects, departmentId, semester) {
  return (subjects || []).filter((subject) => {
    if (departmentId && departmentId !== 'all' && subject.department_id !== departmentId) {
      return false
    }
    if (semester && semester !== 'all') {
      const subjectSemester = getSubjectSemester(subject)
      return subjectSemester === parseInt(semester, 10)
    }
    return true
  })
}

/** Subjects assigned to a section (CS roadmap rules or generic credit cap). */
export function getSubjectsForSection(subjects, section, options = {}) {
  const isCs =
    options.deptCode === 'CS' ||
    section?.department_code === 'CS' ||
    String(section?.department_name || '').includes('Computer Science')

  if (isCs) {
    return selectCsSubjectsForSection(subjects, section)
  }

  const filtered = filterSubjectsByDeptAndSemester(
    subjects,
    section.department_id,
    String(section.semester)
  )
  const sectionIndex = parseSectionIndex(section.name)

  const matched = filtered.filter((subject) => {
    const offeringSections = csSubjectSectionsByCode[subject.code]
    if (offeringSections == null) return true
    return sectionIndex <= offeringSections
  })

  return applySemesterCreditRules(matched).subjects
}

/** Get subject names for a section's department + semester. */
export function getSubjectNamesForSection(subjects, section, options = {}) {
  return getSubjectsForSection(subjects, section, options).map((subject) => subject.name)
}

const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const STANDARD_TIMETABLE_TIME_SLOTS = [
  { start: '9:00 AM', end: '10:00 AM', label: '9:00 - 10:00 AM' },
  { start: '10:00 AM', end: '11:00 AM', label: '10:00 - 11:00 AM' },
  { start: '11:00 AM', end: '12:00 PM', label: '11:00 - 12:00 PM' },
  { start: '12:00 PM', end: '1:00 PM', label: '12:00 - 1:00 PM' },
  { start: '1:00 PM', end: '2:00 PM', label: '1:00 - 2:00 PM' },
  { start: '2:00 PM', end: '3:00 PM', label: '2:00 - 3:00 PM' },
  { start: '3:00 PM', end: '4:00 PM', label: '3:00 - 4:00 PM' }
]

export function slotBelongsToSection(slot, sectionId) {
  if (!sectionId) return true
  const ids = slot.sectionIds || slot.students || []
  return ids.some((id) => String(id) === String(sectionId))
}

/** Build day/time grid from raw slots, optionally filtered to one section. */
export function buildScheduleGridFromSlots(rawSlots = [], sectionId = null) {
  const schedule = {}
  TIMETABLE_DAYS.forEach((day) => {
    schedule[day] = {}
  })

  ;(rawSlots || [])
    .filter((slot) => slot.courseType !== 'break')
    .filter((slot) => slotBelongsToSection(slot, sectionId))
    .forEach((slot) => {
      if (!schedule[slot.day]) schedule[slot.day] = {}
      if (!schedule[slot.day][slot.timeSlot]) schedule[slot.day][slot.timeSlot] = []
      schedule[slot.day][slot.timeSlot].push({
        courseCode: slot.courseCode,
        courseName: slot.courseName,
        faculty: slot.facultyName || slot.faculty,
        room: slot.roomName || slot.room,
        sectionIds: slot.students || slot.sectionIds || [],
        sectionNames: slot.studentNames || slot.sectionNames || []
      })
    })

  return schedule
}

/** One schedule per section/student group for individual timetable views. */
export function buildSectionSchedules(rawSlots = [], sections = []) {
  const schedules = {}

  ;(sections || []).forEach((section) => {
    const sectionId = section.id || section['Student ID'] || section.sectionId
    const sectionName = section.name || section.Name || section.Section || sectionId
    if (!sectionId) return

    const sectionSlots = (rawSlots || []).filter(
      (slot) => slot.courseType !== 'break' && slotBelongsToSection(slot, sectionId)
    )

    schedules[sectionId] = {
      sectionId,
      sectionName,
      schedule: buildScheduleGridFromSlots(rawSlots, sectionId),
      classCount: sectionSlots.length,
      subjects: [...new Set(sectionSlots.map((slot) => normalizeCourseName(slot.courseName)))].filter(Boolean)
    }
  })

  return schedules
}

export function getSectionsFromTimetableData(timetableData) {
  if (timetableData?.sections?.length) return timetableData.sections
  if (timetableData?.metadata?.sections?.length) return timetableData.metadata.sections

  const fromSchedules = timetableData?.sectionSchedules
    ? Object.values(timetableData.sectionSchedules).map((entry) => ({
        id: entry.sectionId,
        name: entry.sectionName
      }))
    : []

  return fromSchedules
}

export function getScheduleForSection(timetableData, sectionId) {
  if (!timetableData || !sectionId) return timetableData?.schedule || {}

  if (timetableData.sectionSchedules?.[sectionId]?.schedule) {
    return timetableData.sectionSchedules[sectionId].schedule
  }

  if (timetableData.rawSlots?.length) {
    return buildScheduleGridFromSlots(timetableData.rawSlots, sectionId)
  }

  const filtered = {}
  TIMETABLE_DAYS.forEach((day) => {
    filtered[day] = {}
    const daySchedule = timetableData.schedule?.[day] || {}
    Object.entries(daySchedule).forEach(([timeSlot, entries]) => {
      const matched = (entries || []).filter((entry) =>
        (entry.sectionIds || []).some((id) => String(id) === String(sectionId))
      )
      if (matched.length) filtered[day][timeSlot] = matched
    })
  })

  return filtered
}

export function flattenSectionSchedule(schedule) {
  const rows = []
  ;(schedule ? Object.entries(schedule) : []).forEach(([day, times]) => {
    Object.entries(times || {}).forEach(([timeSlot, entries]) => {
      ;(entries || []).forEach((entry) => {
        rows.push({
          day,
          timeSlot,
          courseName: entry.courseName,
          faculty: entry.faculty,
          room: entry.room
        })
      })
    })
  })

  return rows.sort((a, b) => {
    const dayDiff = TIMETABLE_DAYS.indexOf(a.day) - TIMETABLE_DAYS.indexOf(b.day)
    if (dayDiff !== 0) return dayDiff
    return a.timeSlot.localeCompare(b.timeSlot)
  })
}

/** Hard constraints — always enforced during generation (never toggled off). */
export const HARD_CONSTRAINT_DEFAULTS = {
  preventFacultyClashes: true,
  ensureRoomCapacity: true,
  preventSectionClashes: true,
  preventRoomDoubleBooking: true
}

/** Soft constraints only — used for scenario combination matrix. */
export const CONSTRAINT_TOGGLE_KEYS = [
  { key: 'balanceWorkload', label: 'Daily workload cap', short: 'DW' },
  { key: 'minimizeWalking', label: 'Minimize walking', short: 'MW' },
  { key: 'balancedWorkload', label: 'Balanced workload', short: 'BW' },
  { key: 'preferredSlots', label: 'Preferred slots', short: 'PS' },
  { key: 'minimizeGaps', label: 'Minimize gaps', short: 'MG' }
]

/** Force hard constraint flags on every scenario. */
export function enforceHardConstraints(constraints = {}) {
  return {
    ...constraints,
    ...HARD_CONSTRAINT_DEFAULTS
  }
}

/** Normalize room identity for clash detection (id preferred, name fallback). */
export function normalizeRoomKey(roomId, roomName) {
  const id = String(roomId || '').trim()
  if (id) return `id:${id}`
  const name = String(roomName || '').trim().toLowerCase()
  return name ? `name:${name}` : ''
}

export function normalizeCourseName(name) {
  return String(name || '')
    .replace(/ \(Session.*\)/i, '')
    .trim()
    .toLowerCase()
}

export function getSlotRoomKey(slot) {
  if (slot?.roomKey) return slot.roomKey
  return normalizeRoomKey(slot?.roomId, slot?.roomName)
}

/**
 * Detect mandatory hard-constraint violations in a generated timetable.
 * Checks faculty double-booking, room double-booking, section clashes, room capacity.
 */
export function detectHardConstraintViolations(timetable = [], rooms = []) {
  const violations = []
  const classSlots = (timetable || []).filter((slot) => slot.courseType !== 'break')

  for (let i = 0; i < classSlots.length; i++) {
    for (let j = i + 1; j < classSlots.length; j++) {
      const a = classSlots[i]
      const b = classSlots[j]
      if (a.day !== b.day || a.timeSlot !== b.timeSlot) continue

      if (a.facultyId && b.facultyId && a.facultyId === b.facultyId) {
        violations.push({
          type: 'faculty_clash',
          message: `${a.facultyName || a.facultyId} scheduled twice on ${a.day} at ${a.timeSlot}`,
          slotA: a,
          slotB: b
        })
      }

      if (getSlotRoomKey(a) && getSlotRoomKey(b) && getSlotRoomKey(a) === getSlotRoomKey(b)) {
        violations.push({
          type: 'room_double_booking',
          message: `${a.roomName || a.roomId} double-booked on ${a.day} at ${a.timeSlot}`,
          slotA: a,
          slotB: b
        })
      }

      if (
        getSlotRoomKey(a) &&
        getSlotRoomKey(a) === getSlotRoomKey(b) &&
        normalizeCourseName(a.courseName) === normalizeCourseName(b.courseName) &&
        a.facultyId !== b.facultyId
      ) {
        violations.push({
          type: 'same_room_course_faculty_mismatch',
          message: `${normalizeCourseName(a.courseName)} in ${a.roomName || a.roomId} on ${a.day} at ${a.timeSlot} has conflicting faculty`,
          slotA: a,
          slotB: b
        })
      }

      const aStudents = a.students || []
      const bStudents = b.students || []
      if (aStudents.some((id) => bStudents.includes(id))) {
        violations.push({
          type: 'section_clash',
          message: `Section clash on ${a.day} at ${a.timeSlot}`,
          slotA: a,
          slotB: b
        })
      }
    }
  }

  classSlots.forEach((slot) => {
    const room = rooms.find(
      (r) => (r.id || r['Room ID'] || r.Room_ID) === slot.roomId
    )
    const capacity = parseInt(room?.Capacity || room?.capacity || 30, 10)
    if (slot.studentCount > capacity) {
      violations.push({
        type: 'room_capacity',
        message: `${slot.roomName || slot.roomId} over capacity (${slot.studentCount}/${capacity})`,
        slot
      })
    }
  })

  return violations
}

/** Edge-case values for minimum break time (minutes). */
export const MIN_BREAK_EDGE_VALUES = [0, 5, 10, 30, 60]

function constraintsFingerprint(constraints) {
  return JSON.stringify(
    Object.keys(constraints)
      .sort()
      .reduce((acc, key) => {
        acc[key] = constraints[key]
        return acc
      }, {})
  )
}

function describeToggleState(constraints, toggleKeys = CONSTRAINT_TOGGLE_KEYS) {
  return toggleKeys
    .map(({ key, label }) => `${label}: ${constraints[key] ? 'ON' : 'OFF'}`)
    .join(' · ')
}

/** Normalize student-submitted soft constraints for the optimizer. */
export function normalizeStudentConstraints(constraints = {}) {
  const c = { ...constraints }
  const workload = c.balancedWorkload ?? c.balanceWorkload ?? true
  c.balancedWorkload = workload
  c.balanceWorkload = workload
  if (c.minimizeGaps == null) c.minimizeGaps = true
  c.minBreakTime = 0
  return enforceHardConstraints(c)
}

/** Human-readable summary of student constraint preferences. */
export function describeStudentConstraints(constraints = {}) {
  const c = normalizeStudentConstraints(constraints)
  const parts = []

  if (c.minimizeWalking) parts.push(`Minimize walking (${c.walkingWeight ?? 80}%)`)
  else parts.push('Minimize walking: OFF')

  if (c.balancedWorkload || c.balanceWorkload) {
    parts.push(`Balanced workload (${c.workloadWeight ?? 90}%)`)
  } else {
    parts.push('Balanced workload: OFF')
  }

  if (c.preferredSlots) parts.push(`Preferred slots (${c.slotsWeight ?? 70}%)`)
  else parts.push('Preferred slots: OFF')

  if (c.minimizeGaps !== false) parts.push(`Minimize gaps (${c.gapsWeight ?? 75}%)`)
  else parts.push('Minimize gaps: OFF')

  return parts.join(' · ')
}

export function timetableScheduleFingerprint(timetableResult) {
  const slots = timetableResult?.rawSlots || []
  return slots
    .filter((slot) => slot.courseType !== 'break')
    .map(
      (slot) =>
        `${slot.day}|${slot.timeSlot}|${slot.courseCode || slot.courseName}|${(slot.students || []).join(',')}`
    )
    .sort()
    .join(';')
}

/**
 * Build all boolean constraint combinations plus min-break edge cases.
 * Returns deduplicated scenarios for batch timetable generation.
 */
export function buildConstraintScenarios(baseConstraints = {}) {
  const base = { ...baseConstraints }
  const seen = new Set()
  const scenarios = []

  const addScenario = (scenario) => {
    const fingerprint = constraintsFingerprint(scenario.constraints)
    if (seen.has(fingerprint)) return
    seen.add(fingerprint)
    scenarios.push(scenario)
  }

  const toggleCount = CONSTRAINT_TOGGLE_KEYS.length
  const comboTotal = 1 << toggleCount

  for (let mask = 0; mask < comboTotal; mask++) {
    const constraints = enforceHardConstraints({
      ...base,
      ...CONSTRAINT_TOGGLE_KEYS.reduce((acc, { key }, index) => {
        acc[key] = !!(mask & (1 << index))
        return acc
      }, {})
    })

    const shortLabel = CONSTRAINT_TOGGLE_KEYS.map(({ short }, index) =>
      `${short}${constraints[CONSTRAINT_TOGGLE_KEYS[index].key] ? '✓' : '✗'}`
    ).join(' ')

    addScenario({
      id: `combo-${mask}`,
      type: 'combination',
      index: mask + 1,
      totalCombinations: comboTotal,
      name: `Combination ${mask + 1}/${comboTotal}`,
      shortLabel,
      description: describeToggleState(constraints),
      constraints
    })
  }

  for (const breakTime of MIN_BREAK_EDGE_VALUES) {
    if (breakTime === base.minBreakTime) continue
    addScenario({
      id: `break-${breakTime}`,
      type: 'min-break-edge',
      name: `Min break ${breakTime} min`,
      shortLabel: `Break ${breakTime}m`,
      description: `Minimum break ${breakTime} minutes · ${describeToggleState(enforceHardConstraints(base))}`,
      constraints: enforceHardConstraints({ ...base, minBreakTime: breakTime })
    })
  }

  addScenario({
    id: 'current-settings',
    type: 'baseline',
    name: 'Your current settings',
    shortLabel: 'Current',
    description:
      describeToggleState(enforceHardConstraints(base)) +
      (base.minBreakTime != null ? ` · Break: ${base.minBreakTime} min` : ''),
    constraints: enforceHardConstraints({ ...base })
  })

  return scenarios.sort((a, b) => {
    const typeOrder = { baseline: 0, combination: 1, 'min-break-edge': 2 }
    const typeDiff = (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9)
    if (typeDiff !== 0) return typeDiff
    return (a.index || 0) - (b.index || 0)
  })
}

export function countConstraintScenarios(baseConstraints = {}) {
  const comboTotal = 1 << CONSTRAINT_TOGGLE_KEYS.length
  let total = comboTotal

  for (const breakTime of MIN_BREAK_EDGE_VALUES) {
    if (breakTime !== baseConstraints.minBreakTime) total += 1
  }

  total += 1
  return total
}

/** Merge saved constraints page settings with dashboard constraint state. */
export function mergeSavedConstraints(baseConstraints) {
  if (typeof window === 'undefined') return baseConstraints

  try {
    const saved = localStorage.getItem('constraints')
    if (!saved) return baseConstraints

    const parsed = JSON.parse(saved)
    const soft = parsed.soft || []
    const updates = {}

    soft.forEach((constraint) => {
      if (constraint.id === 'minimize-distance') {
        updates.minimizeWalking = constraint.enabled
        updates.walkingWeight = constraint.weight
      }
      if (constraint.id === 'balanced-workload') {
        updates.balancedWorkload = constraint.enabled
        updates.workloadWeight = constraint.weight
      }
      if (constraint.id === 'preferred-slots') {
        updates.preferredSlots = constraint.enabled
        updates.slotsWeight = constraint.weight
      }
      if (constraint.id === 'minimize-gaps') {
        updates.minimizeGaps = constraint.enabled
        updates.gapsWeight = constraint.weight
      }
      if (constraint.id === 'avoid-morning-labs') {
        updates.avoidMorningLabs = constraint.enabled
      }
    })

    return { ...baseConstraints, ...updates }
  } catch {
    return baseConstraints
  }
}

export const FACULTY_WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const DEFAULT_FACULTY_WEEKLY_AVAILABILITY = Object.fromEntries(
  FACULTY_WEEK_DAYS.map((day) => [
    day,
    {
      enabled: !['Saturday', 'Sunday'].includes(day),
      from: '09:00',
      to: '16:00'
    }
  ])
)

function parseTimeToMinutes(value) {
  if (!value) return 0
  const trimmed = String(value).trim()
  const ampm = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (ampm) {
    let hours = parseInt(ampm[1], 10)
    const minutes = parseInt(ampm[2], 10)
    const period = ampm[3]?.toUpperCase()
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  }
  const parts = trimmed.split(':').map((p) => parseInt(p, 10))
  if (parts.length >= 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return parts[0] * 60 + parts[1]
  }
  return 0
}

function parseTimeSlotLabelToMinutes(label) {
  if (!label) return 0
  const str = String(label)
  const match = str.match(/(\d{1,2}):(\d{2})\s*(?:-\s*\d{1,2}:\d{2})?\s*(AM|PM)?/i)
  if (!match) return parseTimeToMinutes(str)
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3]?.toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  if (!period && hours < 8) hours += 12
  return hours * 60 + minutes
}

/** Normalize faculty weekly availability { day: { enabled, from, to } }. */
export function normalizeFacultyWeeklyAvailability(availability = {}) {
  const normalized = { ...DEFAULT_FACULTY_WEEKLY_AVAILABILITY }
  FACULTY_WEEK_DAYS.forEach((day) => {
    const entry = availability[day]
    if (!entry) return
    normalized[day] = {
      enabled: entry.enabled !== false,
      from: entry.from || '09:00',
      to: entry.to || '16:00'
    }
  })
  return normalized
}

/** Hard constraint: faculty must be available for the full class slot. */
export function isFacultyAvailableAtSlot(weeklyAvailability, day, timeSlotLabel) {
  const dayCfg = weeklyAvailability?.[day]
  if (!dayCfg || dayCfg.enabled === false) return false

  const slotStart = parseTimeSlotLabelToMinutes(timeSlotLabel)
  const from = parseTimeToMinutes(dayCfg.from || '09:00')
  const to = parseTimeToMinutes(dayCfg.to || '17:00')
  const slotEnd = slotStart + 60

  return slotStart >= from && slotEnd <= to
}

/** Map Supabase faculty to generator format with real subject assignments. */
export function mapFacultyForGenerator(facultyList, subjects, semester, availabilityByFacultyId = {}) {
  return facultyList.map((f) => {
    const deptSubjects = filterSubjectsByDeptAndSemester(subjects, f.department_id, semester)
    const subjectNames = deptSubjects.map((s) => s.name)
    const weeklyAvailability = availabilityByFacultyId[f.id]
      ? normalizeFacultyWeeklyAvailability(availabilityByFacultyId[f.id])
      : null

    return {
      id: f.id,
      'Faculty ID': f.id,
      Name: f.name || f.full_name || 'Unknown Faculty',
      Subjects: subjectNames.join(', ') || f.department_name || 'General',
      'Max Hours': String(f.max_hours || 18),
      Availability: weeklyAvailability ? 'submitted' : 'not_submitted',
      weeklyAvailability,
      hasSubmittedAvailability: !!weeklyAvailability,
      department_id: f.department_id,
      department_name: f.department_name
    }
  })
}

/** Map Supabase sections to generator student entries with semester subjects. */
export function mapSectionsForGenerator(sectionsList, subjects, options = {}) {
  return sectionsList.map((section) => {
    const subjectNames = getSubjectNamesForSection(subjects, section, options)

    return {
      id: section.id,
      'Student ID': section.id,
      Name: section.name || 'Unknown Section',
      Class: String(section.semester || '1'),
      Section: section.name || 'A',
      Electives: subjectNames.join(', '),
      student_count: section.student_count || 30,
      department_id: section.department_id,
      department_name: section.department_name,
      department_code: section.department_code,
      semester: section.semester
    }
  })
}
