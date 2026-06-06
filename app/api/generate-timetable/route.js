import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { saveGeneratedTimetable } from '@/lib/legacy-store'
import {
  applySemesterCreditRules,
  buildConstraintScenarios,
  buildScheduleGridFromSlots,
  buildSectionSchedules,
  detectHardConstraintViolations,
  enforceHardConstraints,
  getSlotRoomKey,
  getWeeklySessionPlan,
  isFacultyAvailableAtSlot,
  normalizeCourseName,
  normalizeRoomKey,
  normalizeCreditHours
} from '@/lib/timetable-helpers'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

const CLASS_DURATION_MINUTES = 60

const STANDARD_TIME_SLOTS = [
  { start: '9:00 AM', end: '10:00 AM', label: '9:00 - 10:00 AM' },
  { start: '10:00 AM', end: '11:00 AM', label: '10:00 - 11:00 AM' },
  { start: '11:00 AM', end: '12:00 PM', label: '11:00 - 12:00 PM' },
  { start: '12:00 PM', end: '1:00 PM', label: '12:00 - 1:00 PM' },
  { start: '1:00 PM', end: '2:00 PM', label: '1:00 - 2:00 PM' },
  { start: '2:00 PM', end: '3:00 PM', label: '2:00 - 3:00 PM' },
  { start: '3:00 PM', end: '4:00 PM', label: '3:00 - 4:00 PM' }
]

// AI Timetable Optimization Engine
class TimetableOptimizer {
  constructor(students, faculty, rooms, constraints, subjects = [], metadata = {}) {
    this.students = students
    this.faculty = faculty
    this.rooms = rooms
    this.constraints = enforceHardConstraints(constraints)
    const creditSelection = applySemesterCreditRules(subjects)
    this.subjects = creditSelection.subjects
    this.creditSummary = {
      totalCredits: metadata.totalCredits ?? creditSelection.totalCredits,
      subjectCount: metadata.subjectCount ?? creditSelection.subjects.length,
      courseUnits: metadata.courseUnits ?? metadata.subjectCount ?? creditSelection.subjects.length,
      droppedSubjects: creditSelection.droppedCount
    }
    this.metadata = {
      ...metadata,
      maxSubjectsPerSemester: 5,
      maxCreditHoursPerSemester: 18,
      maxCreditHoursPerSubject: 3,
      ...creditSelection
    }
    this.timetable = []
    this.conflicts = []
  }

  // Helper function to convert time string to minutes
  getTimeInMinutes(timeString) {
    if (!timeString) return 0
    // Handle different time formats
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/)
    if (!match) return 0
    
    let hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const period = match[3]
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    
    return hours * 60 + minutes
  }

  getTimeLabel(time) {
    if (!time) return ''
    if (typeof time === 'object') return time.label || ''
    return time
  }

  // Core AI Rules Implementation (always include day — clashes are per day + time)
  validateRule1(timetable, studentId, day, timeSlot) {
    return !timetable.some(
      (slot) =>
        slot.students?.includes(studentId) &&
        slot.day === day &&
        slot.timeSlot === timeSlot &&
        slot.courseType !== 'break'
    )
  }

  validateRule2(timetable, facultyId, day, timeSlot) {
    return !timetable.some(
      (slot) =>
        slot.facultyId === facultyId &&
        slot.day === day &&
        slot.timeSlot === timeSlot &&
        slot.courseType !== 'break'
    )
  }

  validateRule3(timetable, roomKey, day, timeSlot) {
    if (!roomKey) return true
    return !timetable.some(
      (slot) =>
        getSlotRoomKey(slot) === roomKey &&
        slot.day === day &&
        slot.timeSlot === timeSlot &&
        slot.courseType !== 'break'
    )
  }

  getRoomKeyFromRoom(room) {
    if (!room) return ''
    return normalizeRoomKey(
      room.id || room['Room ID'] || room.Room_ID,
      room.Name || room.name || room.Room_Name
    )
  }

  getPrimarySectionId(course) {
    const student = course.students?.[0]
    return student?.id || student?.['Student ID'] || student?.Student_ID || 'section'
  }

  buildSlotKey(sectionId, day, timeLabel) {
    return `${sectionId}-${day}-${timeLabel}`
  }

  getHardViolations(timetable) {
    return detectHardConstraintViolations(timetable, this.rooms)
  }

  calculateWorkloadBalance(facultyId) {
    // Rule 4: Make sure teachers have a balanced workload
    const assignedSlots = this.timetable.filter(slot => slot.facultyId === facultyId)
    const faculty = this.faculty.find(f => f.id === facultyId)
    const maxHours = faculty?.maxHours || 20
    
    return {
      currentHours: assignedSlots.length,
      maxHours,
      isBalanced: assignedSlots.length <= maxHours
    }
  }

  isLunchSlot(timeLabel) {
    return String(timeLabel).includes('Lunch')
  }

  getTeachableFaculty(course, facultyWorkload, preferredFacultyId = null) {
    const pool = course.faculty?.length ? course.faculty : this.faculty
    return pool.filter((f) => {
      const facultyId = f.id || f['Faculty ID'] || f.Faculty_ID
      const facultyInfo = facultyWorkload[facultyId]
      if (!facultyInfo || facultyInfo.currentHours >= facultyInfo.maxHours) return false
      if (preferredFacultyId && facultyId !== preferredFacultyId) return false

      const facultySubjects = f.subjects || f.Subjects || f.courses || ''
      const subjects = facultySubjects.split(',').map((s) => s.trim()).filter(Boolean)
      return subjects.some(
        (subject) =>
          subject.toLowerCase().includes(course.name.toLowerCase()) ||
          course.name.toLowerCase().includes(subject.toLowerCase())
      )
    })
  }

  getSectionIds(course) {
    return course.students.map((s) => s.id || s['Student ID'] || s.Student_ID)
  }

  /** Check minimum break between classes on the same day (faculty or section). */
  violatesMinBreak(day, timeMinutes, timetable, { sectionIds = [], facultyId = null, allowConsecutive = false }) {
    if (allowConsecutive || !this.constraints.minBreakTime || this.constraints.minBreakTime <= 0) {
      return false
    }

    const minBreak = this.constraints.minBreakTime
    const slots = timetable.filter(
      (slot) =>
        slot.day === day &&
        slot.courseType !== 'break' &&
        ((facultyId && slot.facultyId === facultyId) ||
          (sectionIds.length &&
            slot.students?.some((id) => sectionIds.includes(id))))
    )

    return slots.some((slot) => {
      const existingStart = this.getTimeInMinutes(slot.timeSlot)
      const gapAfter = timeMinutes - (existingStart + CLASS_DURATION_MINUTES)
      const gapBefore = existingStart - (timeMinutes + CLASS_DURATION_MINUTES)
      const gap = gapAfter >= 0 ? gapAfter : gapBefore >= 0 ? gapBefore : -1
      return gap >= 0 && gap < minBreak
    })
  }

  /** Lower score = better placement. Respects minimizeGaps, preferredSlots, balanced workload. */
  scoreSlotPlacement(day, timeLabel, course, timetable) {
    let score = 0
    const timeMinutes = this.getTimeInMinutes(timeLabel)
    const sectionIds = this.getSectionIds(course)

    if (this.constraints.minimizeGaps !== false) {
      const weight = this.constraints.gapsWeight ?? 75
      sectionIds.forEach((sectionId) => {
        const sameDaySlots = timetable.filter(
          (slot) =>
            slot.day === day &&
            slot.courseType !== 'break' &&
            slot.students?.includes(sectionId)
        )

        if (sameDaySlots.length === 0) {
          score += weight * 0.15
          return
        }

        let minEmptyPeriods = Infinity
        sameDaySlots.forEach((slot) => {
          const existingStart = this.getTimeInMinutes(slot.timeSlot)
          const separation = Math.abs(timeMinutes - existingStart)
          const emptyPeriods = Math.max(0, separation / CLASS_DURATION_MINUTES - 1)
          minEmptyPeriods = Math.min(minEmptyPeriods, emptyPeriods)
        })

        if (minEmptyPeriods === 0) score -= weight
        else score += minEmptyPeriods * weight * 3
      })
    }

    if (this.constraints.balancedWorkload !== false || this.constraints.balanceWorkload) {
      const weight = this.constraints.workloadWeight ?? 90
      const facultyPool = course.faculty?.length ? course.faculty : this.faculty
      facultyPool.forEach((f) => {
        const facultyId = f.id || f['Faculty ID'] || f.Faculty_ID
        const classesOnDay = timetable.filter(
          (slot) => slot.facultyId === facultyId && slot.day === day && slot.courseType !== 'break'
        ).length
        score += classesOnDay * (weight / 10)
      })
    }

    if (this.constraints.preferredSlots) {
      const weight = this.constraints.slotsWeight ?? 70
      score += (timeMinutes / 600) * weight
    }

    if (this.constraints.minimizeWalking) {
      const weight = this.constraints.walkingWeight ?? 80
      sectionIds.forEach((sectionId) => {
        const lastSlot = timetable
          .filter((slot) => slot.students?.includes(sectionId) && slot.courseType !== 'break')
          .pop()
        if (lastSlot?.roomName) {
          score += weight * 0.05
        }
      })
    }

    return score
  }

  getRankedSingleCandidates(course, days, teachableSlots, usedSlots, timetable, skipDays = new Set()) {
    const candidates = []
    const sectionId = this.getPrimarySectionId(course)

    days.forEach((day) => {
      if (skipDays.has(day)) return
      teachableSlots.forEach((time) => {
        const slotKey = this.buildSlotKey(sectionId, day, time.label)
        if (usedSlots.has(slotKey)) return
        candidates.push({
          day,
          time,
          slotKey,
          score: this.scoreSlotPlacement(day, time.label, course, timetable)
        })
      })
    })

    return candidates.sort((a, b) => a.score - b.score)
  }

  getRankedDoubleBlockCandidates(days, teachableSlots, usedSlots, course, timetable) {
    const candidates = []
    const sectionId = this.getPrimarySectionId(course)

    days.forEach((day) => {
      for (let i = 0; i < teachableSlots.length - 1; i++) {
        const firstSlot = teachableSlots[i]
        const secondSlot = teachableSlots[i + 1]
        const firstKey = this.buildSlotKey(sectionId, day, firstSlot.label)
        const secondKey = this.buildSlotKey(sectionId, day, secondSlot.label)
        if (usedSlots.has(firstKey) || usedSlots.has(secondKey)) continue

        const score =
          this.scoreSlotPlacement(day, firstSlot.label, course, timetable) +
          this.scoreSlotPlacement(day, secondSlot.label, course, timetable)

        candidates.push({ day, firstSlot, secondSlot, firstKey, secondKey, score })
      }
    })

    return candidates.sort((a, b) => a.score - b.score)
  }

  analyzeSoftConstraints(timetable) {
    let gapViolations = 0
    let breakViolations = 0
    const minBreak = this.constraints.minBreakTime || 0

    if (this.constraints.minimizeGaps !== false) {
      const gapsBySection = {}
      timetable.forEach((slot) => {
        if (slot.courseType === 'break' || !slot.students?.length) return
        const sectionId = slot.students[0]
        const key = `${sectionId}-${slot.day}`
        if (!gapsBySection[key]) gapsBySection[key] = []
        gapsBySection[key].push(this.getTimeInMinutes(slot.timeSlot))
      })

      Object.values(gapsBySection).forEach((times) => {
        const sorted = [...times].sort((a, b) => a - b)
        for (let i = 1; i < sorted.length; i++) {
          const emptyPeriods = sorted[i] - sorted[i - 1] - CLASS_DURATION_MINUTES
          if (emptyPeriods > 0) {
            gapViolations += Math.ceil(emptyPeriods / CLASS_DURATION_MINUTES)
          }
        }
      })
    }

    if (minBreak > 0) {
      timetable.forEach((slot) => {
        if (slot.courseType === 'break' || !slot.facultyId) return
        const timeMinutes = this.getTimeInMinutes(slot.timeSlot)
        const others = timetable.filter(
          (other) =>
            other.facultyId === slot.facultyId &&
            other.day === slot.day &&
            other.id !== slot.id &&
            other.courseType !== 'break'
        )
        others.forEach((other) => {
          const otherStart = this.getTimeInMinutes(other.timeSlot)
          const gapAfter = timeMinutes - (otherStart + CLASS_DURATION_MINUTES)
          const gapBefore = otherStart - (timeMinutes + CLASS_DURATION_MINUTES)
          const gap = gapAfter >= 0 ? gapAfter : gapBefore >= 0 ? gapBefore : -1
          if (gap >= 0 && gap < minBreak) {
            const baseName = (name) => String(name || '').replace(/ \(Session.*\)/, '')
            if (gap === 0 && baseName(slot.courseName) === baseName(other.courseName)) return
            breakViolations++
          }
        })
      })
    }

    return { gapViolations, breakViolations }
  }

  // Helper method to try scheduling a course at a specific slot
  tryScheduleCourseAtSlot(
    course,
    day,
    time,
    slotKey,
    usedSlots,
    timetable,
    facultyWorkload,
    courseIndex = 0,
    sessionNumber = 1,
    options = {}
  ) {
    const timeLabel = this.getTimeLabel(time)
    const resolvedSlotKey = slotKey || `${day}-${timeLabel}`
    const timeMinutes = this.getTimeInMinutes(timeLabel)
    const sectionIds = this.getSectionIds(course)

    const sectionClash = timetable.some(
      (slot) =>
        slot.day === day &&
        slot.timeSlot === timeLabel &&
        slot.students?.some((id) => sectionIds.includes(id))
    )
    if (sectionClash) return false

    if (
      this.violatesMinBreak(day, timeMinutes, timetable, {
        sectionIds,
        allowConsecutive: options.allowConsecutive
      })
    ) {
      return false
    }

    if (
      this.constraints.minimizeGaps !== false &&
      (this.constraints.gapsWeight ?? 75) >= 80 &&
      !options.allowConsecutive
    ) {
      for (const sectionId of sectionIds) {
        const sameDaySlots = timetable.filter(
          (slot) =>
            slot.day === day &&
            slot.courseType !== 'break' &&
            slot.students?.includes(sectionId)
        )
        if (sameDaySlots.length === 0) continue
        const isAdjacent = sameDaySlots.some((slot) => {
          const separation = Math.abs(timeMinutes - this.getTimeInMinutes(slot.timeSlot))
          return separation === CLASS_DURATION_MINUTES
        })
        if (!isAdjacent) return false
      }
    }

    let availableFaculty = this.getTeachableFaculty(
      course,
      facultyWorkload,
      options.preferredFacultyId || course.assignedFacultyId || null
    )

    if (availableFaculty.length === 0) {
      return false
    }

    // Find appropriate room
    const isTechnicalSubject = ['AI', 'ML', 'Data Science', 'Cyber Sec', 'IoT', 'Big Data', 'Networks', 'Databases', 'Cloud Computing', 'Computer Science'].some(tech => 
      course.name.toLowerCase().includes(tech.toLowerCase())
    )
    
    const requiredCapacity = course.students.reduce((max, student) => {
      const count = parseInt(student.student_count || student['Student Count'] || student.studentCount || 1, 10)
      return Math.max(max, count)
    }, 1)

    const suitableRooms = this.rooms.filter(room => {
      const roomCapacity = parseInt(room.Capacity || room.capacity || 30, 10)
      if (roomCapacity < requiredCapacity) {
        return false
      }

      const roomType = (room.Type || room.type || '').toLowerCase()
      const roomName = (room.Name || room.name || '').toLowerCase()
      return isTechnicalSubject ? 
        (roomType.includes('lab') || roomName.includes('lab')) :
        (roomType.includes('classroom') || roomType.includes('lecture') || roomName.includes('lecture') || roomType.includes('class'))
    })

    const availableFacultyForSlot = availableFaculty.filter(f => {
      const facultyId = f.id || f['Faculty ID'] || f.Faculty_ID
      const facultyInfo = facultyWorkload[facultyId]

      // HARD: faculty must be available at this day/time if they submitted availability
      if (f.hasSubmittedAvailability && f.weeklyAvailability) {
        if (!isFacultyAvailableAtSlot(f.weeklyAvailability, day, timeLabel)) {
          return false
        }
      }

      // HARD: faculty cannot be in two places at the same time
      if (
        !this.validateRule2(timetable, facultyId, day, timeLabel)
      ) {
        return false
      }

      // CONSTRAINT: Check minimum break time between faculty classes
      if (
        this.violatesMinBreak(day, timeMinutes, timetable, {
          facultyId,
          allowConsecutive: options.allowConsecutive
        })
      ) {
        return false
      }

      // CONSTRAINT: Balance workload - max classes per day
      if (this.constraints.balanceWorkload) {
        const maxClassesPerDay = 4
        const classesToday = timetable.filter(slot => 
          slot.facultyId === facultyId && slot.day === day && slot.courseType !== 'break'
        ).length
        if (classesToday >= maxClassesPerDay) {
          return false
        }
      }
      
      return facultyInfo && facultyInfo.currentHours < facultyInfo.maxHours
    })

    if (availableFacultyForSlot.length === 0) {
      return false
    }

    let selectedRoom = null
    const preferredRoomKey = options.preferredRoomId
      ? this.getRoomKeyFromRoom(
          this.rooms.find(
            (room) => (room.id || room['Room ID'] || room.Room_ID) === options.preferredRoomId
          )
        )
      : course.assignedRoomKey || null

    if (options.preferredRoomId) {
      selectedRoom = this.rooms.find(
        (room) => (room.id || room['Room ID'] || room.Room_ID) === options.preferredRoomId
      )
      if (
        selectedRoom &&
        preferredRoomKey &&
        !this.validateRule3(timetable, preferredRoomKey, day, timeLabel)
      ) {
        selectedRoom = null
      }
    }
    if (!selectedRoom) {
      const openRooms = suitableRooms.filter((room) => {
        const roomKey = this.getRoomKeyFromRoom(room)
        if (!this.validateRule3(timetable, roomKey, day, timeLabel)) return false
        const sameRoomSameCourse = timetable.some(
          (slot) =>
            slot.day === day &&
            slot.timeSlot === timeLabel &&
            getSlotRoomKey(slot) === roomKey &&
            normalizeCourseName(slot.courseName) === normalizeCourseName(course.name)
        )
        return !sameRoomSameCourse
      })
      selectedRoom =
        openRooms.length > 0
          ? openRooms[Math.floor(Math.random() * openRooms.length)]
          : null
    }

    if (!selectedRoom) {
      return false
    }

    const selectedRoomId = selectedRoom.id || selectedRoom['Room ID'] || selectedRoom.Room_ID
    const selectedRoomKey = this.getRoomKeyFromRoom(selectedRoom)

    if (!this.validateRule3(timetable, selectedRoomKey, day, timeLabel)) {
      return false
    }

    const sameRoomSameCourse = timetable.some(
      (slot) =>
        slot.day === day &&
        slot.timeSlot === timeLabel &&
        getSlotRoomKey(slot) === selectedRoomKey &&
        normalizeCourseName(slot.courseName) === normalizeCourseName(course.name)
    )
    if (sameRoomSameCourse) {
      return false
    }

    const lockedFacultyId = course.assignedFacultyId || options.preferredFacultyId || null
    const facultyPool = lockedFacultyId
      ? availableFacultyForSlot.filter(
          (f) => (f.id || f['Faculty ID'] || f.Faculty_ID) === lockedFacultyId
        )
      : availableFacultyForSlot

    if (facultyPool.length === 0) {
      return false
    }

    const selectedFaculty = [...facultyPool].sort((a, b) => {
      const aId = a.id || a['Faculty ID'] || a.Faculty_ID
      const bId = b.id || b['Faculty ID'] || b.Faculty_ID
      return (facultyWorkload[aId]?.currentHours || 0) - (facultyWorkload[bId]?.currentHours || 0)
    })[0]
    const facultyId = selectedFaculty.id || selectedFaculty['Faculty ID'] || selectedFaculty.Faculty_ID

    // Create course code with session indicator
    const courseCode = course.name.replace(/\s+/g, '').substring(0, 6).toUpperCase() + (sessionNumber > 1 ? sessionNumber : '')

    timetable.push({
      id: uuidv4(),
      courseCode: courseCode,
      courseName: sessionNumber > 1 ? `${course.name} (Session ${sessionNumber})` : course.name,
      facultyId: facultyId,
      facultyName: selectedFaculty.Name || selectedFaculty.name || selectedFaculty.Faculty_Name,
      roomId: selectedRoomId,
      roomName: selectedRoom.Name || selectedRoom.name || selectedRoom.Room_Name,
      roomKey: selectedRoomKey,
      day: day,
      timeSlot: timeLabel,
      students: course.students.map(s => s.id || s['Student ID'] || s.Student_ID),
      studentCount: course.students.reduce(
        (max, student) => Math.max(max, parseInt(student.student_count || student['Student Count'] || 1, 10)),
        1
      ),
      studentNames: course.students.map(s => s.Name || s.name || s.Student_Name),
      courseType: course.type
    })

    usedSlots.add(resolvedSlotKey)
    facultyWorkload[facultyId].currentHours++
    course.assignedFacultyId = facultyId
    course.assignedRoomId = selectedRoomId
    course.assignedRoomKey = selectedRoomKey
    console.log(`✅ Scheduled ${course.name}${sessionNumber > 1 ? ` (Session ${sessionNumber})` : ''} on ${day} at ${timeLabel} with ${selectedFaculty.Name || selectedFaculty.name} (${facultyWorkload[facultyId].currentHours}/${facultyWorkload[facultyId].maxHours} hours)`)
    
    return {
      success: true,
      facultyId,
      roomId: selectedRoomId,
      roomKey: selectedRoomKey
    }
  }

  scheduleAllCoursesByCreditRules(allCourses, days, timeSlots, usedSlots, timetable, facultyWorkload) {
    const teachableSlots = [...timeSlots]
    const dayRotation = [...days]
    let dayCursor = 0

    allCourses.forEach((course, courseIndex) => {
      const plan = course.sessionPlan || getWeeklySessionPlan(course.creditHours || 3)
      let sessionNumber = 0
      const usedDaysForCourse = new Set()
      let blockFacultyId = null
      let blockRoomId = null

      const scheduleSession = (day, time, slotKey, allowConsecutive = false) => {
        sessionNumber += 1
        const result = this.tryScheduleCourseAtSlot(
          course,
          day,
          time,
          slotKey,
          usedSlots,
          timetable,
          facultyWorkload,
          courseIndex,
          sessionNumber,
          {
            preferredFacultyId: blockFacultyId,
            preferredRoomId: blockRoomId,
            allowConsecutive
          }
        )
        if (!result?.success) sessionNumber -= 1
        return result
      }

      plan.blocks.forEach((block) => {
        if (block.consecutive && block.sessions === 2) {
          const rotatedDays = days.map((_, i) => dayRotation[(dayCursor + i) % days.length])
          const candidates = this.getRankedDoubleBlockCandidates(
            rotatedDays,
            teachableSlots,
            usedSlots,
            course,
            timetable
          )

          for (const candidate of candidates) {
            const firstResult = scheduleSession(candidate.day, candidate.firstSlot, candidate.firstKey)
            if (!firstResult?.success) continue

            blockFacultyId = firstResult.facultyId
            blockRoomId = firstResult.roomId

            const secondResult = scheduleSession(
              candidate.day,
              candidate.secondSlot,
              candidate.secondKey,
              true
            )

            if (secondResult?.success) {
              blockFacultyId = secondResult.facultyId
              blockRoomId = secondResult.roomId
              usedDaysForCourse.add(candidate.day)
              dayCursor = (dayRotation.indexOf(candidate.day) + 1) % days.length
              console.log(
                `📅 ${course.name} (${plan.credits} CH): double block on ${candidate.day} at ${candidate.firstSlot.label} & ${candidate.secondSlot.label}`
              )
              break
            }

            const rolledBack = timetable.pop()
            usedSlots.delete(candidate.firstKey)
            if (rolledBack?.facultyId && facultyWorkload[rolledBack.facultyId]) {
              facultyWorkload[rolledBack.facultyId].currentHours--
            }
            blockFacultyId = null
            blockRoomId = null
          }
          return
        }

        const skipDays = plan.blocks.length > 1 ? usedDaysForCourse : new Set()
        const rotatedDays = days.map((_, i) => dayRotation[(dayCursor + i) % days.length])
        const candidates = this.getRankedSingleCandidates(
          course,
          rotatedDays,
          teachableSlots,
          usedSlots,
          timetable,
          skipDays
        )

        for (const candidate of candidates) {
          const result = scheduleSession(candidate.day, candidate.time, candidate.slotKey)
          if (result?.success) {
            blockFacultyId = result.facultyId
            blockRoomId = result.roomId
            usedDaysForCourse.add(candidate.day)
            dayCursor = (dayRotation.indexOf(candidate.day) + 1) % days.length
            console.log(
              `📅 ${course.name} (${plan.credits} CH): class ${sessionNumber} on ${candidate.day} at ${candidate.time.label} (score ${candidate.score.toFixed(1)})`
            )
            break
          }
        }
      })
    })
  }

  // Genetic Algorithm Implementation
  generateRandomTimetable() {
    const timeSlots = STANDARD_TIME_SLOTS.map((slot) => ({ ...slot }))
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const timetable = []
    const usedSlots = new Set()
    const facultyWorkload = {}

    console.log('📚 Using uploaded data:')
    console.log('Students:', this.students?.length || 0)
    console.log('Faculty:', this.faculty?.length || 0)
    console.log('Rooms:', this.rooms?.length || 0)
    console.log('Constraints:', this.constraints)

    if (this.students && this.students.length > 0 && this.faculty && this.faculty.length > 0 && this.rooms && this.rooms.length > 0) {
      // Initialize faculty workload tracking
      this.faculty.forEach(faculty => {
        const facultyId = faculty.id || faculty['Faculty ID'] || faculty.Faculty_ID
        const maxHours = parseInt(faculty['Max Hours'] || faculty.maxHours || 10) || 10
        facultyWorkload[facultyId] = {
          currentHours: 0,
          maxHours: maxHours,
          name: faculty.Name || faculty.name || faculty.Faculty_Name,
          dailyClasses: {}, // Track classes per day for balancing
          lastClassTime: null // Track last class time for minimum break
        }
        // Initialize daily class tracking
        days.forEach(day => {
          facultyWorkload[facultyId].dailyClasses[day] = 0
        })
      })

      console.log('👨‍🏫 Faculty workload limits:', facultyWorkload)
      console.log('⚙️ Constraints enabled:', {
        preventFacultyClashes: this.constraints.preventFacultyClashes,
        minBreakTime: this.constraints.minBreakTime,
        balanceWorkload: this.constraints.balanceWorkload,
        minimizeGaps: this.constraints.minimizeGaps
      })

      // Group students by their electives to create classes
      const electiveGroups = {}
      
      this.students.forEach(student => {
        const studentElectives = student.electives || student.Electives || student.subjects || ''
        const electives = studentElectives.split(',').map(e => e.trim()).filter(Boolean)
        
        electives.forEach(elective => {
          if (!electiveGroups[elective]) {
            electiveGroups[elective] = []
          }
          electiveGroups[elective].push(student)
        })
      })

      console.log('📚 Elective groups:', Object.keys(electiveGroups))

      const allCourses = []

      // Build courses from explicit subject list (department + semester filtered)
      if (this.subjects && this.subjects.length > 0) {
        this.subjects.forEach((subject) => {
          const sectionsForSubject = this.students.filter((student) => {
            const electives = (student.electives || student.Electives || student.subjects || '')
              .split(',')
              .map((e) => e.trim())
              .filter(Boolean)
            return electives.some(
              (e) => e.toLowerCase() === subject.name.toLowerCase() ||
                subject.name.toLowerCase().includes(e.toLowerCase())
            )
          })

          const availableFaculty = this.faculty.filter((f) => {
            const facultySubjects = f.subjects || f.Subjects || f.courses || ''
            const subjects = facultySubjects.split(',').map((s) => s.trim()).filter(Boolean)
            return subjects.some(
              (facultySubject) =>
                facultySubject.toLowerCase() === subject.name.toLowerCase() ||
                facultySubject.toLowerCase().includes(subject.name.toLowerCase()) ||
                subject.name.toLowerCase().includes(facultySubject.toLowerCase())
            )
          })

          if (availableFaculty.length > 0 && sectionsForSubject.length > 0) {
            const creditHours = normalizeCreditHours(subject.credit_hours)
            sectionsForSubject.forEach((section) => {
              allCourses.push({
                type: 'subject',
                name: subject.name,
                code: subject.code,
                creditHours,
                sessionPlan: getWeeklySessionPlan(creditHours),
                students: [section],
                faculty: availableFaculty,
                assignedFacultyId: null,
                assignedRoomId: null,
                assignedRoomKey: null,
                priority: 0
              })
            })
          }
        })

        console.log(`📚 Courses from filtered subjects: ${allCourses.length}`)
      }

      // Fallback: derive courses from section electives when no explicit subjects
      if (allCourses.length === 0) {
      // Add elective courses - Schedule each elective multiple times per week
      Object.entries(electiveGroups).forEach(([elective, students]) => {
        // Find faculty who can teach this elective
        const availableFaculty = this.faculty.filter(f => {
          const facultySubjects = f.subjects || f.Subjects || f.courses || ''
          const subjects = facultySubjects.split(',').map(s => s.trim()).filter(Boolean)
          return subjects.some(subject => 
            subject.toLowerCase().includes(elective.toLowerCase()) || 
            elective.toLowerCase().includes(subject.toLowerCase())
          )
        })

        if (availableFaculty.length > 0) {
          // Add the base elective course
          allCourses.push({
            type: 'elective',
            name: elective,
            students: students,
            faculty: availableFaculty,
            priority: 0 // High priority
          })
        }
      })

      // Extract all unique subjects from faculty data
      const facultySubjects = new Set()
      this.faculty.forEach(f => {
        const subjects = (f.subjects || f.Subjects || f.courses || '').split(',').map(s => s.trim()).filter(Boolean)
        subjects.forEach(subject => {
          if (subject && subject !== 'General' && subject !== 'All') {
            facultySubjects.add(subject)
          }
        })
      })

      console.log('📚 Available faculty subjects:', Array.from(facultySubjects))
      
      // Also log faculty-subject mapping for debugging
      console.log('👨‍🏫 Faculty-Subject Mapping:')
      this.faculty.forEach(f => {
        const subjects = (f.subjects || f.Subjects || f.courses || '').split(',').map(s => s.trim()).filter(Boolean)
        console.log(`  ${f.Name || f.name || f.Faculty_Name}: ${subjects.join(', ')}`)
      })

      // Create courses based on faculty subjects (not hardcoded lists)
      Array.from(facultySubjects).forEach(subject => {
        // Find faculty who can teach this subject
        const availableFaculty = this.faculty.filter(f => {
          const facultySubjects = f.subjects || f.Subjects || f.courses || ''
          const subjects = facultySubjects.split(',').map(s => s.trim()).filter(Boolean)
          return subjects.some(facultySubject => 
            facultySubject.toLowerCase().includes(subject.toLowerCase()) || 
            subject.toLowerCase().includes(facultySubject.toLowerCase())
          )
        })

        if (availableFaculty.length > 0) {
          // Determine if this is a core subject based on common patterns
          const coreSubjectPatterns = ['mathematics', 'math', 'english', 'science', 'physics', 'chemistry', 'biology']
          const isCore = coreSubjectPatterns.some(pattern => subject.toLowerCase().includes(pattern))
          
          allCourses.push({
            type: isCore ? 'core' : 'subject',
            name: subject,
            students: this.students.slice(0, Math.min(isCore ? 25 : 20, this.students.length)),
            faculty: availableFaculty,
            priority: isCore ? 1 : 2
          })
        }
      })

      }

      console.log(`📚 Total courses to schedule: ${allCourses.length}`)

      if (allCourses.length === 0) {
        console.warn('⚠️ No courses found for selected department/semester filters')
        return timetable
      }

      allCourses.forEach((course) => {
        if (!course.creditHours) {
          course.creditHours = normalizeCreditHours(3)
          course.sessionPlan = getWeeklySessionPlan(course.creditHours)
        }
      })

      allCourses.sort((a, b) => (a.code || a.name).localeCompare(b.code || b.name))

      console.log('📐 Credit rules: max 5 subjects, max 18 credits/semester, max 3 credits/subject')
      console.log(`📚 Scheduling ${allCourses.length} subjects (${this.creditSummary?.totalCredits || 0} total credits)`)
      allCourses.forEach((course) => {
        console.log(`  - ${course.name}: ${course.creditHours} CH → ${course.sessionPlan.weeklyClasses} classes/week`)
      })

      console.log('🗓️ Scheduling classes by credit-hour rules...')
      const shuffledCourses = [...allCourses].sort(() => Math.random() - 0.5)
      this.scheduleAllCoursesByCreditRules(shuffledCourses, days, timeSlots, usedSlots, timetable, facultyWorkload)

      console.log(`📊 Faculty workload summary:`)
      Object.entries(facultyWorkload).forEach(([facultyId, workload]) => {
        console.log(`  ${workload.name}: ${workload.currentHours}/${workload.maxHours} hours`)
      })
    }

    console.log(`📅 Generated ${timetable.length} timetable slots`)
    console.log(`📊 Time slots used: ${usedSlots.size} out of ${days.length * timeSlots.length} available`)
    return timetable
  }

  // Fitness function for genetic algorithm
  calculateFitness(timetable) {
    const hardViolations = this.getHardViolations(timetable)
    let fitness = 1000
    const conflicts = hardViolations.map((violation) => ({
      type: violation.type,
      message: violation.message,
      hard: true,
      ...violation
    }))

    // Hard violations make timetable invalid — heavy penalty per violation
    fitness -= hardViolations.length * 500

    timetable.forEach((slot) => {
      if (!slot.facultyId || slot.courseType === 'break') return
      const assignedSlots = timetable.filter((s) => s.facultyId === slot.facultyId)
      const faculty = this.faculty.find((f) => (f.id || f['Faculty ID']) === slot.facultyId)
      const maxHours = parseInt(faculty?.['Max Hours'] || faculty?.maxHours || 20, 10) || 20
      if (assignedSlots.length > maxHours) {
        fitness -= 50
      }
    })

    if (this.constraints.balancedWorkload) {
      const facultyDaily = {}
      timetable.forEach((slot) => {
        if (!slot.facultyId || slot.courseType === 'break') return
        const key = `${slot.facultyId}-${slot.day}`
        facultyDaily[key] = (facultyDaily[key] || 0) + 1
      })
      const counts = Object.values(facultyDaily)
      if (counts.length > 1) {
        const spread = Math.max(...counts) - Math.min(...counts)
        fitness -= Math.floor(spread * (this.constraints.workloadWeight || 90) / 20)
      }
    }

    if (this.constraints.minimizeGaps !== false) {
      const weight = this.constraints.gapsWeight ?? 75
      const gapsBySection = {}
      timetable.forEach((slot) => {
        if (slot.courseType === 'break' || !slot.students?.length) return
        const sectionId = slot.students[0]
        const key = `${sectionId}-${slot.day}`
        if (!gapsBySection[key]) gapsBySection[key] = []
        gapsBySection[key].push(this.getTimeInMinutes(slot.timeSlot))
      })
      Object.values(gapsBySection).forEach((times) => {
        const sorted = [...times].sort((a, b) => a - b)
        for (let i = 1; i < sorted.length; i++) {
          const emptyPeriods = (sorted[i] - sorted[i - 1] - CLASS_DURATION_MINUTES) / CLASS_DURATION_MINUTES
          if (emptyPeriods > 0) {
            fitness -= Math.ceil(emptyPeriods) * weight
          }
        }
      })
    }

    return { fitness, conflicts, hardViolations }
  }

  pickBestValidTimetable(evaluated) {
    const valid = evaluated.filter((item) => item.hardViolations.length === 0)
    const pool = valid.length ? valid : evaluated
    pool.sort((a, b) => {
      if (a.hardViolations.length !== b.hardViolations.length) {
        return a.hardViolations.length - b.hardViolations.length
      }
      return b.fitness - a.fitness
    })
    return pool[0]
  }

  // Main optimization algorithm
  optimize(options = {}) {
    const populationSize = options.populationSize ?? 10
    const generations = options.generations ?? 20
    console.log(`🤖 Starting AI Timetable Optimization (pop=${populationSize}, gen=${generations})...`)
    
    let population = []
    
    for (let i = 0; i < populationSize; i++) {
      population.push(this.generateRandomTimetable())
    }
    let bestTimetable = null
    let bestFitness = -Infinity

    for (let gen = 0; gen < generations; gen++) {
      const evaluated = population.map((timetable) => {
        const result = this.calculateFitness(timetable)
        return {
          timetable,
          fitness: result.fitness,
          conflicts: result.conflicts,
          hardViolations: result.hardViolations
        }
      })

      const bestCandidate = this.pickBestValidTimetable(evaluated)

      if (bestCandidate.fitness > bestFitness) {
        bestFitness = bestCandidate.fitness
        bestTimetable = bestCandidate.timetable
        this.conflicts = bestCandidate.conflicts
      }

      const softStats = this.analyzeSoftConstraints(bestTimetable)
      const softViolations = softStats.gapViolations + softStats.breakViolations
      if (bestCandidate.hardViolations.length === 0 && bestFitness >= 1000 && softViolations === 0) {
        console.log(`✅ Optimal schedule found in generation ${gen}`)
        break
      }

      const top50Percent = evaluated
        .filter((item) => item.hardViolations.length === 0)
        .slice(0, Math.floor(populationSize / 2))
      const seedPool = top50Percent.length ? top50Percent : evaluated.slice(0, Math.floor(populationSize / 2))
      population = seedPool.map((individual) => individual.timetable)

      while (population.length < populationSize) {
        population.push(this.generateRandomTimetable())
      }
    }

    console.log(`🎯 Optimization complete. Best fitness: ${bestFitness}`)

    const finalEvaluated = population.map((timetable) => {
      const result = this.calculateFitness(timetable)
      return {
        timetable,
        fitness: result.fitness,
        conflicts: result.conflicts,
        hardViolations: result.hardViolations
      }
    })
    const finalBest = this.pickBestValidTimetable(finalEvaluated)

    this.timetable = finalBest?.timetable || bestTimetable || population[0]
    this.hardViolations = this.getHardViolations(this.timetable)
    this.conflicts = this.hardViolations.map((violation) => ({
      type: violation.type,
      message: violation.message,
      hard: true,
      ...violation
    }))
    this.constraintStats = this.analyzeSoftConstraints(this.timetable)
    return this.formatTimetableOutput()
  }

  mutate(timetable) {
    // Mutation disabled — random time changes were breaking hard constraints.
    return timetable
  }

  formatTimetableOutput() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    const rawSlots = this.timetable.map((slot) => ({
      id: slot.id,
      courseCode: slot.courseCode,
      courseName: slot.courseName,
      facultyId: slot.facultyId,
      facultyName: slot.facultyName,
      roomId: slot.roomId,
      roomName: slot.roomName,
      roomKey: slot.roomKey,
      day: slot.day,
      timeSlot: slot.timeSlot,
      students: slot.students || [],
      studentNames: slot.studentNames || [],
      studentCount: slot.studentCount,
      courseType: slot.courseType
    }))

    const sections = (this.students || []).map((student) => ({
      id: student.id || student['Student ID'] || student.Student_ID,
      name: student.Name || student.name || student.Section || student.section || 'Section'
    }))

    const sectionSchedules = buildSectionSchedules(rawSlots, this.students || [])
    const schedule = buildScheduleGridFromSlots(rawSlots)

    return {
      schedule,
      rawSlots,
      sections,
      sectionSchedules,
      conflicts: this.conflicts,
      hardViolations: this.hardViolations || [],
      metadata: {
        ...this.metadata,
        sections
      },
      appliedConstraints: { ...this.constraints },
      constraintStats: this.constraintStats || this.analyzeSoftConstraints(this.timetable),
      summary: {
        totalSlots: this.timetable.filter((slot) => slot.courseType !== 'break').length,
        conflictCount: this.conflicts.length,
        hardViolationCount: (this.hardViolations || []).length,
        hardConstraintsEnforced: (this.hardViolations || []).length === 0,
        optimizationScore:
          (this.hardViolations || []).length === 0
            ? this.conflicts.length === 0
              ? 100
              : Math.max(0, 100 - this.conflicts.length * 10)
            : 0,
        department: this.metadata.departmentName || null,
        departmentId: this.metadata.departmentId || null,
        semester: this.metadata.semester || null,
        subjectCount: this.creditSummary?.courseUnits || this.metadata?.subjectCount || 0,
        courseUnits: this.creditSummary?.courseUnits || this.metadata?.courseUnits || 0,
        sectionCount: this.students?.length || 0,
        facultyCount: this.faculty?.length || 0,
        totalCredits: this.creditSummary?.totalCredits || this.metadata?.totalCredits || 0,
        maxSubjectsPerSemester: 5,
        maxCreditHoursPerSemester: 18,
        maxCreditHoursPerSubject: 3,
        gapViolations: (this.constraintStats || {}).gapViolations || 0,
        breakViolations: (this.constraintStats || {}).breakViolations || 0,
        minBreakTime: this.constraints.minBreakTime || 0,
        gapsWeight: this.constraints.gapsWeight ?? 75
      }
    }
  }
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

function runOptimization(students, faculty, rooms, constraints, subjects, metadata, optimizeOptions = {}) {
  const optimizer = new TimetableOptimizer(students, faculty, rooms, constraints, subjects || [], metadata || {})
  return optimizer.optimize(optimizeOptions)
}

export { runOptimization }

export async function POST(request) {
  try {
    const {
      students,
      faculty,
      rooms,
      constraints,
      subjects,
      metadata,
      generateAllScenarios = true,
      scenarioIds = null
    } = await request.json()
    
    console.log('🚀 Starting AI Timetable Generation with constraints:', constraints)
    console.log('🏫 Filters:', metadata)
    console.log(`📊 Input data: ${students?.length || 0} sections, ${faculty?.length || 0} faculty, ${rooms?.length || 0} rooms, ${subjects?.length || 0} subjects`)
    console.log(`🧪 Scenario mode: ${generateAllScenarios ? 'all combinations' : 'single'}`)
    
    if (generateAllScenarios) {
      let scenarios = buildConstraintScenarios(constraints || {})
      if (Array.isArray(scenarioIds) && scenarioIds.length > 0) {
        const idSet = new Set(scenarioIds)
        scenarios = scenarios.filter((scenario) => idSet.has(scenario.id))
      }
      const fastOptions = { populationSize: 4, generations: 10 }
      const generatedScenarios = []
      const batchId = scenarioIds?.length ? null : uuidv4()

      console.log(`📋 Generating ${scenarios.length} constraint scenarios...`)

      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i]
        console.log(`  [${i + 1}/${scenarios.length}] ${scenario.name}: ${scenario.shortLabel}`)

        const result = runOptimization(
          students,
          faculty,
          rooms,
          scenario.constraints,
          subjects,
          metadata,
          fastOptions
        )

        generatedScenarios.push({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          scenarioType: scenario.type,
          shortLabel: scenario.shortLabel,
          description: scenario.description,
          constraints: scenario.constraints,
          timetable: result
        })
      }

      const bestScenario = [...generatedScenarios].sort(
        (a, b) =>
          (a.timetable.summary?.hardViolationCount || 0) -
            (b.timetable.summary?.hardViolationCount || 0) ||
          (b.timetable.summary?.optimizationScore || 0) -
            (a.timetable.summary?.optimizationScore || 0) ||
          (a.timetable.summary?.conflictCount || 0) - (b.timetable.summary?.conflictCount || 0)
      )[0]

      if (batchId) {
        await saveGeneratedTimetable({
          id: batchId,
          mode: 'scenarios',
          scenarios: generatedScenarios,
          timetable: bestScenario?.timetable,
          bestScenarioId: bestScenario?.scenarioId,
          constraints,
          generatedAt: new Date().toISOString(),
          semester: metadata?.semester || 'Fall 2025',
          department: metadata?.departmentName || null,
          program: metadata?.departmentName || 'B.Ed + FYUP'
        })
        console.log(`✅ Saved ${generatedScenarios.length} scenario timetables to Supabase`)
      }

      return handleCORS(
        NextResponse.json({
          success: true,
          mode: 'scenarios',
          scenarioCount: generatedScenarios.length,
          scenarios: generatedScenarios,
          bestScenarioId: bestScenario?.scenarioId,
          timetable: bestScenario?.timetable,
          id: batchId,
          message: `Generated ${generatedScenarios.length} timetables for constraint combinations`
        })
      )
    }

    const result = runOptimization(students, faculty, rooms, constraints, subjects, metadata)
    
    const timetableRecord = {
      id: uuidv4(),
      mode: 'single',
      timetable: result,
      constraints,
      generatedAt: new Date(),
      semester: metadata?.semester || 'Fall 2025',
      department: metadata?.departmentName || null,
      program: metadata?.departmentName || 'B.Ed + FYUP'
    }
    
    await saveGeneratedTimetable({
      ...timetableRecord,
      generatedAt: timetableRecord.generatedAt.toISOString()
    })
    console.log('✅ Timetable generation completed successfully and saved to Supabase')
    
    console.log(`📈 Results: ${result.summary.totalSlots} slots, ${result.summary.conflictCount} conflicts, ${result.summary.optimizationScore}% score`)
    
    return handleCORS(NextResponse.json({
      success: true,
      mode: 'single',
      timetable: result,
      id: timetableRecord.id,
      message: 'Timetable generated successfully using AI optimization'
    }))
  } catch (error) {
    console.error('❌ Timetable generation error:', error)
    return handleCORS(NextResponse.json(
      { error: "Failed to generate timetable" },
      { status: 500 }
    ))
  }
}