import {
  getStudentProfile,
  saveTimetableOptions,
  updateConstraintRequest
} from '@/lib/student-portal-store'
import { getFacultyAvailabilityReadiness } from '@/lib/faculty-portal-store'
import { generateTopScenarios, prepareTimetableInput } from '@/lib/generate-top-scenarios'

export async function processStudentRequestApproval(request) {
  try {
    const readiness = await getFacultyAvailabilityReadiness(
      request.departmentId,
      request.semester
    )

    if (!readiness.canGenerate) {
      throw new Error(
        `No faculty have submitted availability for ${request.departmentName || 'this department'} (Sem ${request.semester}). Go to Faculty Availability, send requests for Sem ${request.semester}, then have faculty submit their weekly hours.`
      )
    }

    const profile = await getStudentProfile(request.userId)
    const input = await prepareTimetableInput(
      request.departmentId,
      request.semester,
      profile?.departmentCode || null
    )

    const topOptions = generateTopScenarios(input, request.constraints, 5)
    await saveTimetableOptions(request.userId, request.id, topOptions)

    return {
      requestId: request.id,
      userId: request.userId,
      studentName: profile?.name || 'Student',
      status: 'ready',
      optionCount: topOptions.length
    }
  } catch (err) {
    console.error(`Failed for request ${request.id}:`, err)
    await updateConstraintRequest(request.id, { status: 'error', error: err.message })
    return {
      requestId: request.id,
      userId: request.userId,
      status: 'error',
      error: err.message
    }
  }
}
