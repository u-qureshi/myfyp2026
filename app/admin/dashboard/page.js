'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Upload, Brain, Calendar, Settings, Users, BookOpen, Building2, FileSpreadsheet, Menu, X, Download, Pencil, Trash2, Plus, LogOut, Share2, DoorOpen, LayoutGrid, Settings2, AlertTriangle, BarChart2 } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDropzone } from 'react-dropzone'
import { toast, Toaster } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  applySemesterCreditRules,
  buildConstraintScenarios,
  countConstraintScenarios,
  filterSubjectsByDeptAndSemester,
  flattenSectionSchedule,
  getCsSchedulingSubjects,
  getCsSemesterDisplaySummary,
  getScheduleForSection,
  getSectionsFromTimetableData,
  mapFacultyForGenerator,
  mapSectionsForGenerator,
  mergeSavedConstraints,
  STANDARD_TIMETABLE_TIME_SLOTS
} from '@/lib/timetable-helpers'

const VALID_PAGES = ['dashboard', 'data-management', 'generate', 'view-timetable', 'settings']

function PageQuerySync({ onPageChange }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const page = searchParams.get('page')
    if (page && VALID_PAGES.includes(page)) {
      onPageChange(page)
    }
  }, [searchParams, onPageChange])

  return null
}

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    students: null,
    faculty: null,
    rooms: null
  })
  const [timetableData, setTimetableData] = useState(null)
  const [timetableScenarios, setTimetableScenarios] = useState([])
  const [selectedScenarioId, setSelectedScenarioId] = useState(null)
  const [selectedViewSectionId, setSelectedViewSectionId] = useState(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  const [constraints, setConstraints] = useState({
    preventFacultyClashes: true,
    ensureRoomCapacity: true,
    minBreakTime: 10,
    balanceWorkload: true,
    workloadLevel: 1,
    preferredGirls: 2,
    minimizeEmptyPeriods: true,
    maxConsecutiveFaculty: 3,
    minimizeWalking: true,
    walkingWeight: 80,
    balancedWorkload: true,
    workloadWeight: 90,
    preferredSlots: true,
    slotsWeight: 70,
    minimizeGaps: true,
    gapsWeight: 75
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [metrics, setMetrics] = useState({ students: null, faculty: null, rooms: null })
  const [dataByType, setDataByType] = useState({ 
    students: [
      { id: 'S001', 'Student ID': 'S001', Name: 'Arjun Mehta', Class: '2nd', Section: 'A', Electives: 'AI, Data Science' },
      { id: 'S002', 'Student ID': 'S002', Name: 'Riya Sharma', Class: '2nd', Section: 'A', Electives: 'AI, Cyber Sec' },
      { id: 'S003', 'Student ID': 'S003', Name: 'Kiran Patel', Class: '2nd', Section: 'B', Electives: 'ML, IoT' },
      { id: 'S004', 'Student ID': 'S004', Name: 'Sneha Rao', Class: '2nd', Section: 'B', Electives: 'Data Science' },
      { id: 'S005', 'Student ID': 'S005', Name: 'Devansh Gupta', Class: '2nd', Section: 'A', Electives: 'Cyber Sec, IoT' }
    ],
    faculty: [
      { id: 'F001', 'Faculty ID': 'F001', Name: 'Dr. Anjali Nair', Subjects: 'Artificial Intelligence, ML', Availability: 'Mon-Fri 9am-4pm', 'Max Hours': '12' },
      { id: 'F002', 'Faculty ID': 'F002', Name: 'Prof. Rajesh Iyer', Subjects: 'Data Science, Big Data, Cyber Security', Availability: 'Mon-Fri 10am-5pm', 'Max Hours': '10' },
      { id: 'F003', 'Faculty ID': 'F003', Name: 'Dr. Kavita Joshi', Subjects: 'Cyber Security, Networks', Availability: 'Tue-Thu 9am-12pm', 'Max Hours': '8' },
      { id: 'F004', 'Faculty ID': 'F004', Name: 'Prof. Manoj Rao', Subjects: 'IoT, Embedded Systems', Availability: 'Mon-Wed 11am-3pm', 'Max Hours': '9' },
      { id: 'F005', 'Faculty ID': 'F005', Name: 'Dr. Sameer Kulkarni', Subjects: 'Database, Cloud Computing', Availability: 'Fri 9am-4pm', 'Max Hours': '6' }
    ],
    rooms: [
      { id: 'R101', 'Room ID': 'R101', Name: 'Lecture Hall A', Type: 'Classroom', Capacity: '60', Equipment: 'Projector, Whiteboard' },
      { id: 'R102', 'Room ID': 'R102', Name: 'Lecture Hall B', Type: 'Classroom', Capacity: '50', Equipment: 'Smart Board, AC' },
      { id: 'L201', 'Room ID': 'L201', Name: 'AI Lab', Type: 'Lab', Capacity: '40', Equipment: 'GPUs, Workstations' },
      { id: 'L202', 'Room ID': 'L202', Name: 'Cyber Sec Lab', Type: 'Lab', Capacity: '35', Equipment: 'Firewalls, Virtualization Servers' },
      { id: 'L203', 'Room ID': 'L203', Name: 'Data Science Lab', Type: 'Lab', Capacity: '45', Equipment: 'Python IDEs' }
    ]
  })
  const [dataLoading, setDataLoading] = useState(false)
  const [settings, setSettings] = useState(null)
  const [realFaculty, setRealFaculty] = useState([])
  const [realRooms, setRealRooms] = useState([])
  const [realSections, setRealSections] = useState([])
  const [realDepartments, setRealDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')

  // Load saved constraints from Constraints page
  useEffect(() => {
    setConstraints((prev) => mergeSavedConstraints(prev))
  }, [])

  const scenarioCount = useMemo(
    () => countConstraintScenarios(constraints),
    [constraints]
  )

  // Load real data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      // Fetch faculty data
      try {
        console.log('Starting faculty fetch...')
        const facultyRes = await fetch('/api/admin/faculty')
        if (facultyRes.ok) {
          const facultyData = await facultyRes.json()
          setRealFaculty(Array.isArray(facultyData) ? facultyData : [])
          console.log('Faculty fetch success:', facultyData?.length || 0)
        }
      } catch (e) {
        console.error('Error fetching faculty:', e)
      }

      // Fetch rooms data
      try {
        console.log('Starting rooms fetch...')
        const roomsRes = await fetch('/api/admin/rooms')
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json()
          setRealRooms(Array.isArray(roomsData) ? roomsData : [])
          console.log('Rooms fetch success:', roomsData?.length || 0)
        }
      } catch (e) {
        console.error('Error fetching rooms:', e)
      }

      // Fetch sections data
      try {
        console.log('Starting sections fetch...')
        const sectionsRes = await fetch('/api/admin/sections')
        if (sectionsRes.ok) {
          const sectionsData = await sectionsRes.json()
          setRealSections(Array.isArray(sectionsData) ? sectionsData : [])
          console.log('Sections fetch success:', sectionsData?.length || 0)
        }
      } catch (e) {
        console.error('Error fetching sections:', e)
      }

      // Fetch departments data
      try {
        console.log('Starting departments fetch...')
        const deptsRes = await fetch('/api/admin/departments')
        console.log('Departments fetch response status:', deptsRes.status)
        
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json()
          console.log('Departments API response:', deptsData)
          console.log('deptsData type:', typeof deptsData)
          console.log('deptsData.departments exists?', !!deptsData.departments)
          console.log('deptsData.departments is array?', Array.isArray(deptsData.departments))
          
          // Handle both response formats
          if (Array.isArray(deptsData)) {
            console.log('Setting from array format')
            setRealDepartments(deptsData)
            console.log('Set departments from array:', deptsData)
          } else if (deptsData.departments && Array.isArray(deptsData.departments)) {
            console.log('Setting from object.departments format, count:', deptsData.departments.length)
            setRealDepartments(deptsData.departments)
            console.log('Set departments from object.departments:', deptsData.departments)
          } else {
            console.warn('Unexpected departments response format:', deptsData)
          }
        } else {
          console.error('Departments fetch failed with status:', deptsRes.status)
          const errorData = await deptsRes.json()
          console.error('Error response:', errorData)
        }
      } catch (e) {
        console.error('Error fetching departments:', e)
      }

      // Fetch stats data
      try {
        console.log('Starting stats fetch...')
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        if (res.ok) {
          setMetrics({
            students: data.sections || 0,
            faculty: data.faculty || 0,
            rooms: data.rooms || 0
          })
          console.log('Stats fetch success:', data)
        }
      } catch (e) {
        console.error('Error fetching stats:', e)
      }
    }

    loadAllData()
  }, [])

  // Log when realDepartments changes
  useEffect(() => {
    console.log('realDepartments state updated:', realDepartments)
    console.log('realDepartments length:', realDepartments?.length)
  }, [realDepartments])



  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const json = await res.json()
        if (res.ok) setSettings(json)
      } catch (_) {
        // Set default settings if API fails
        setSettings({
          profile: { name: 'Administrator', email: 'admin@example.com', phone: '', avatarUrl: '' },
          notifications: { email: true, inApp: true, frequency: 'daily' },
          security: { twoFactorEnabled: false }
        })
      }
    }
    // Load settings on mount
    loadSettings()
  }, [])

  // Data Management fetching
  const fetchTypeData = async (type) => {
    try {
      const res = await fetch(`/api/data?type=${type}`)
      const json = await res.json()
      if (res.ok && Array.isArray(json) && json.length > 0) {
        setDataByType(prev => ({ ...prev, [type]: json }))
      } else if (uploadedFiles[type]) {
        // Fallback to recently uploaded, unsaved data (demo mode)
        setDataByType(prev => ({ ...prev, [type]: uploadedFiles[type] }))
      }
      // If no data from API or uploads, keep the default sample data
    } catch (_) {
      // Keep default sample data on error
    }
  }

  const fetchAllData = async () => {
    setDataLoading(true)
    await Promise.all([
      fetchTypeData('students'),
      fetchTypeData('faculty'),
      fetchTypeData('rooms')
    ])
    setDataLoading(false)
  }

  useEffect(() => {
    if (currentPage === 'data-management') {
      fetchAllData()
    }
  }, [currentPage])

  useEffect(() => {
    if (!timetableData) return
    const sections = getSectionsFromTimetableData(timetableData)
    if (!sections.length) return
    setSelectedViewSectionId((current) => {
      if (current && sections.some((section) => String(section.id) === String(current))) {
        return current
      }
      return sections[0].id
    })
  }, [timetableData])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const handleFileUpload = async (files, type) => {
    if (!files.length) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', files[0])
    formData.append('type', type)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      
      if (response.ok) {
        setUploadedFiles(prev => ({ ...prev, [type]: result.data }))
        toast.success(`${type} data uploaded successfully!`)
        // Refresh metrics after a successful upload
        fetchMetrics()
        // Also refresh data lists if on data management
        if (currentPage === 'data-management') {
          // Seed UI immediately with uploaded data without waiting for DB
          setDataByType(prev => ({ ...prev, [type]: result.data }))
          fetchTypeData(type)
        }
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const generateTimetable = async () => {
    try {
      if (!selectedDept || selectedDept === 'all') {
        toast.error('Please select a specific department before generating.')
        return
      }
      if (!selectedSemester || selectedSemester === 'all') {
        toast.error('Please select a specific semester before generating.')
        return
      }

      console.log('Fetching real data from Supabase...')
      console.log('Filters: department =', selectedDept, 'semester =', selectedSemester)
      
      const [facultyRes, roomsRes, sectionsRes, subjectsRes] = await Promise.all([
        fetch('/api/admin/faculty'),
        fetch('/api/admin/rooms'),
        fetch('/api/admin/sections'),
        fetch('/api/admin/subjects')
      ])

      const facultyJson = await facultyRes.json()
      const roomsJson = await roomsRes.json()
      const sectionsJson = await sectionsRes.json()
      const subjectsJson = await subjectsRes.json()

      let facultyData = facultyJson.faculty || facultyJson || []
      const roomsData = roomsJson.rooms || roomsJson || []
      let sectionsData = sectionsJson.sections || sectionsJson || []
      const allSubjects = subjectsJson.subjects || subjectsJson || []

      facultyData = facultyData.filter((f) => f.department_id === selectedDept)
      sectionsData = sectionsData.filter(
        (s) => s.department_id === selectedDept && s.semester === parseInt(selectedSemester, 10)
      )

      const deptSemesterSubjects = filterSubjectsByDeptAndSemester(
        allSubjects,
        selectedDept,
        selectedSemester
      )

      const selectedDepartment = realDepartments.find((d) => d.id === selectedDept)
      const departmentName =
        selectedDepartment?.name ||
        sectionsData[0]?.department_name ||
        'Selected Department'
      const deptCode = selectedDepartment?.code

      let filteredSubjects
      let totalCredits
      let subjectCount
      let courseUnits

      if (deptCode === 'CS') {
        filteredSubjects = getCsSchedulingSubjects(allSubjects, selectedSemester, sectionsData)
        const csSummary = getCsSemesterDisplaySummary(selectedSemester, 1)
        courseUnits = csSummary.courseUnits
        subjectCount = csSummary.subjectCount
        totalCredits = csSummary.totalCredits

        toast.info(
          parseInt(selectedSemester, 10) >= 5
            ? `CS semester plan: ${courseUnits} courses/section (3 compulsory + 1 uni elective + 1 CS elective), ${totalCredits}/18 credits`
            : `CS semester plan: ${courseUnits} compulsory courses/section, ${totalCredits}/18 credits`
        )
      } else {
        const creditResult = applySemesterCreditRules(deptSemesterSubjects)
        filteredSubjects = creditResult.subjects
        totalCredits = creditResult.totalCredits
        subjectCount = creditResult.subjects.length
        courseUnits = creditResult.courseUnits

        if (creditResult.droppedCount > 0) {
          toast.info(
            `Semester limit applied: ${subjectCount} subjects (${totalCredits}/18 credits). ${creditResult.droppedCount} extra subject(s) skipped.`
          )
        }
      }

      console.log('Filtered data:', {
        faculty: facultyData.length,
        sections: sectionsData.length,
        subjects: filteredSubjects.length,
        rooms: roomsData.length
      })

      if (!facultyData.length || !roomsData.length || !sectionsData.length) {
        toast.error('No faculty, sections, or rooms found for the selected department and semester.')
        return
      }

      if (!filteredSubjects.length) {
        toast.error('No subjects found for the selected department and semester.')
        return
      }

      const mappedFaculty = mapFacultyForGenerator(facultyData, filteredSubjects, selectedSemester)
      const mappedStudents = mapSectionsForGenerator(sectionsData, allSubjects, { deptCode })

      const mappedRooms = roomsData.map(r => ({
        id: r.id,
        'Room ID': r.id,
        Name: r.name || 'Unknown Room',
        Type: r.type === 'lab' ? 'Lab' : r.type === 'seminar_hall' ? 'Seminar Hall' : 'Classroom',
        Capacity: String(r.capacity || 30),
        Equipment: 'Standard'
      }))

      const activeConstraints = constraints
      const metadata = {
        departmentId: selectedDept,
        departmentName,
        departmentCode: deptCode,
        semester: parseInt(selectedSemester, 10),
        subjectNames: filteredSubjects.map((s) => s.name),
        totalCredits,
        subjectCount,
        courseUnits,
        sections: mappedStudents.map((section) => ({
          id: section.id || section['Student ID'],
          name: section.Name || section.Section || section.name
        }))
      }

      console.log('Mapped data for timetable generator:', { 
        faculty: mappedFaculty.length, 
        rooms: mappedRooms.length, 
        sections: mappedStudents.length,
        subjects: filteredSubjects.length,
        metadata
      })

      const scenarioCount = countConstraintScenarios(activeConstraints)
      const allScenarioDefs = buildConstraintScenarios(activeConstraints)
      const BATCH_SIZE = 16
      setGenerating(true)
      setGenerationProgress(0)
      setGenerationStatus(`Preparing ${scenarioCount} constraint scenarios...`)

      try {
        console.log('Sending constraints to API:', activeConstraints)
        const collectedScenarios = []

        for (let offset = 0; offset < allScenarioDefs.length; offset += BATCH_SIZE) {
          const batch = allScenarioDefs.slice(offset, offset + BATCH_SIZE)
          const batchEnd = Math.min(offset + BATCH_SIZE, allScenarioDefs.length)
          setGenerationStatus(
            `Generating scenarios ${offset + 1}-${batchEnd} of ${allScenarioDefs.length}...`
          )
          setGenerationProgress(Math.round((offset / allScenarioDefs.length) * 100))

          const response = await fetch('/api/generate-timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              students: mappedStudents,
              faculty: mappedFaculty,
              rooms: mappedRooms,
              subjects: filteredSubjects,
              constraints: activeConstraints,
              metadata,
              generateAllScenarios: true,
              scenarioIds: batch.map((s) => s.id)
            })
          })
          const result = await response.json()

          if (!response.ok) {
            console.error('Generation failed:', result.error)
            toast.error(result.error || 'Generation failed')
            return
          }

          if (result.scenarios?.length) {
            collectedScenarios.push(...result.scenarios)
          }
        }

        setGenerationProgress(100)

        if (collectedScenarios.length) {
          const sorted = [...collectedScenarios].sort(
            (a, b) =>
              (a.timetable?.summary?.hardViolationCount || 0) -
                (b.timetable?.summary?.hardViolationCount || 0) ||
              (b.timetable?.summary?.optimizationScore || 0) -
                (a.timetable?.summary?.optimizationScore || 0) ||
              (a.timetable?.summary?.conflictCount || 0) -
                (b.timetable?.summary?.conflictCount || 0)
          )
          const best = sorted[0]
          setTimetableScenarios(collectedScenarios)
          setSelectedScenarioId(best.scenarioId)
          setTimetableData(best.timetable)
          const sections = getSectionsFromTimetableData(best.timetable)
          setSelectedViewSectionId(sections[0]?.id || null)
          toast.success(
            `${collectedScenarios.length} timetables generated for all constraint combinations!`
          )
          setCurrentPage('view-timetable')
        } else {
          toast.error('No timetables were generated')
        }
      } catch (error) {
        console.error('Generation error:', error)
        toast.error('Generation failed: ' + error.message)
      } finally {
        setGenerating(false)
        setGenerationStatus('')
        setTimeout(() => setGenerationProgress(0), 1000)
      }
    } catch (error) {
      console.error('Fetch error during timetable generation:', error)
      toast.error('Failed to fetch data: ' + error.message)
      setGenerating(false)
    }
  }

  const handleScenarioChange = (scenarioId) => {
    setSelectedScenarioId(scenarioId)
    const scenario = timetableScenarios.find((s) => s.scenarioId === scenarioId)
    if (scenario) {
      setTimetableData(scenario.timetable)
      const sections = getSectionsFromTimetableData(scenario.timetable)
      setSelectedViewSectionId((current) => {
        if (current && sections.some((section) => String(section.id) === String(current))) {
          return current
        }
        return sections[0]?.id || null
      })
    }
  }

  const selectedScenario = timetableScenarios.find((s) => s.scenarioId === selectedScenarioId)
  const viewSections = getSectionsFromTimetableData(timetableData)
  const sectionSchedule = timetableData
    ? getScheduleForSection(timetableData, selectedViewSectionId || viewSections[0]?.id)
    : null
  const selectedViewSection = viewSections.find(
    (section) => String(section.id) === String(selectedViewSectionId || viewSections[0]?.id)
  )
  const selectedSectionClassCount = selectedViewSectionId
    ? timetableData?.sectionSchedules?.[selectedViewSectionId]?.classCount ??
      flattenSectionSchedule(sectionSchedule).length
    : 0

  const exportToPDF = async () => {
    if (!timetableData) {
      toast.error('No schedule data to export')
      return
    }

    try {
      toast.info('Opening print dialog for PDF export...')
      
      // Use browser's print functionality for reliable PDF generation
      const printWindow = window.open('', '_blank', 'width=1200,height=800')
      const timetableHTML = generateTimetableForPrint(timetableData)
      
      printWindow.document.write(timetableHTML)
      printWindow.document.close()
      
      // Auto-trigger print dialog after content loads
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        toast.success('Print dialog opened! You can save as PDF from the print options or use Ctrl+P.')
      }, 1500)
      
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to open print dialog. Please try the Excel export instead.')
    }
  }

  // Helper function to generate HTML for printing
  const generateTimetableForPrint = (timetableData) => {
    const { schedule, summary } = timetableData
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '1:30 PM', '2:30 PM', '3:30 PM']
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Schedule - Fall 2025</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #2563eb; margin-bottom: 10px; }
          .summary { margin-bottom: 20px; text-align: center; }
          .timetable { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .timetable th, .timetable td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 11px; }
          .timetable th { background-color: #2563eb; color: white; }
          .time-slot { background-color: #f1f5f9; font-weight: bold; }
          .course { background-color: #dbeafe; padding: 4px; margin: 2px 0; border-radius: 3px; }
          @media print { body { margin: 10px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Academic Schedule</h1>
          <div>B.Ed + FYUP • Fall 2025</div>
          <div>Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="summary">
          <strong>Summary:</strong> 
          ${summary?.totalSlots || 0} Total Classes | 
          ${summary?.conflictCount || 0} Conflicts | 
          ${summary?.optimizationScore || 0}% Optimization Score
        </div>
        
        <table class="timetable">
          <tr>
            <th>Time</th>
            ${days.map(day => `<th>${day}</th>`).join('')}
          </tr>
          ${timeSlots.map(time => `
            <tr>
              <td class="time-slot">${time}</td>
              ${days.map(day => {
                const daySchedule = schedule?.[day]?.[time] || []
                return `
                  <td>
                    ${daySchedule.map(slot => {
                    const courseData = slot.course || ''
                    const [courseCode, courseName] = courseData.includes(' - ') ? courseData.split(' - ') : [courseData, '']
                    return `
                      <div class="course">
                        <strong>${courseCode}</strong><br>
                        ${courseName}<br>
                        <small>${slot.faculty}<br>${slot.room}</small>
                      </div>
                    `
                  }).join('')}
                  </td>
                `
              }).join('')}
            </tr>
          `).join('')}
        </table>
        
        <div style="text-align: center; font-size: 12px; color: #666;">
          Generated by SmartScheduler • Intelligent Scheduling System
        </div>
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print / Save as PDF
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `
  }

  const exportToExcel = async () => {
    if (!timetableData) {
      toast.error('No schedule data to export')
      return
    }

    try {
      toast.info('Generating Excel file... This may take a moment.')
      
      const response = await fetch('/api/export-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableData,
          metadata: {
            semester: 'Fall 2025',
            program: 'B.Ed + FYUP',
            year: new Date().getFullYear()
          }
        })
      })

      if (response.ok) {
        // Create blob from response
        const blob = await response.blob()
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `schedule-fall-2025-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        
        // Cleanup
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
        
        toast.success('Excel file exported successfully!')
      } else {
        const errorData = await response.json()
        toast.error('Failed to export Excel: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Failed to export Excel: ' + error.message)
    }
  }

  const publishTimetable = async () => {
    if (!timetableData) {
      toast.error('No schedule data to publish')
      return
    }

    try {
      toast.info('Publishing schedule...')
      
      const response = await fetch('/api/publish-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableData,
          metadata: {
            semester: 'Fall 2025',
            program: 'B.Ed + FYUP',
            year: new Date().getFullYear(),
            publishedAt: new Date().toISOString(),
            publishedBy: settings?.profile?.name || 'Administrator'
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        try {
          localStorage.setItem(
            'publishedTimetable',
            JSON.stringify({
              timetableData,
              sectionSchedules: timetableData.sectionSchedules,
              sections: getSectionsFromTimetableData(timetableData),
              metadata: {
                ...timetableData.metadata,
                semester: timetableData.metadata?.semester || selectedSemester,
                departmentName: timetableData.metadata?.departmentName,
                publishedAt: new Date().toISOString(),
                publishedBy: settings?.profile?.name || 'Administrator'
              }
            })
          )
        } catch (storageError) {
          console.warn('Could not cache published timetable locally:', storageError)
        }
        toast.success('Schedule published successfully! Students and faculty can now access it.')
        console.log('Published timetable:', result)
      } else {
        const errorData = await response.json()
        toast.error('Failed to publish schedule: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Failed to publish schedule: ' + error.message)
    }
  }

  // File dropzone components
  const FileUploadZone = ({ title, description, expectedColumns, onUpload, uploaded, type }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onUpload(files, type),
      accept: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'text/csv': ['.csv']
      },
      multiple: false
    })

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${uploaded ? 'border-green-500 bg-green-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {uploaded ? (
              <div>
                <p className="text-green-600 font-medium">✓ File uploaded successfully</p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                  {uploaded.length} records loaded
                </Badge>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop the file here' : 'Drop Excel file here or click to browse'}
                </p>
                <Button variant="outline" disabled={uploading}>
                  Choose File
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Label className="text-sm font-medium">Expected columns:</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {expectedColumns.map(col => (
                <Badge key={col} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] lg:flex">
      <Suspense fallback={null}>
        <PageQuerySync onPageChange={setCurrentPage} />
      </Suspense>
      <Toaster />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        adminName={settings?.profile?.name || 'Administrator'}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <p className="ml-3 font-serif text-lg font-semibold text-[#001a4d]">Admin Portal</p>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <BrandLogo size={52} priority />
                <div>
                  <h1 className="text-3xl font-bold">Welcome, {settings?.profile?.name || 'Administrator'}!</h1>
                  <p className="text-blue-600 font-medium text-sm">AI-Powered Timetable Generation System</p>
                  <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => setCurrentPage('generate')}>Generate Schedule</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full mb-2"
                    onClick={() => setCurrentPage('generate')}
                  >
                    Generate Schedule
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.students ?? 0}</div>
                    <p className="text-sm text-muted-foreground">Sections</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.faculty ?? 0}</div>
                    <p className="text-sm text-muted-foreground">Faculty</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.rooms ?? 0}</div>
                    <p className="text-sm text-muted-foreground">Rooms</p>
                  </div>
                </CardContent>
              </Card>

              {/* Removed Notifications and Recent Activity per request */}
            </div>

            {/* Data Management Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Upload Excel files to configure your schedule data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FileUploadZone
                    title="Students & Electives"
                    description="Upload Excel file with student data and elective subjects"
                    expectedColumns={['Student ID', 'Name', 'Class', 'Section', 'Electives']}
                    onUpload={handleFileUpload}
                    uploaded={uploadedFiles.students}
                    type="students"
                  />
                  <FileUploadZone
                    title="Faculty & Subjects"
                    description="Upload Excel file with faculty data, subjects, and availability"
                    expectedColumns={['Faculty ID', 'Name', 'Subjects', 'Availability', 'Max Hours']}
                    onUpload={handleFileUpload}
                    uploaded={uploadedFiles.faculty}
                    type="faculty"
                  />
                  <FileUploadZone
                    title="Classrooms & Labs"
                    description="Upload Excel file with classroom and lab data with capacity"
                    expectedColumns={['Room ID', 'Name', 'Type', 'Capacity', 'Equipment']}
                    onUpload={handleFileUpload}
                    uploaded={uploadedFiles.rooms}
                    type="rooms"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'generate' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Generate Schedule</h1>
              <p className="text-muted-foreground">Configure AI optimization parameters and generate conflict-free schedules</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Semester</Label>
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                        <SelectItem value="5">Semester 5</SelectItem>
                        <SelectItem value="6">Semester 6</SelectItem>
                        <SelectItem value="7">Semester 7</SelectItem>
                        <SelectItem value="8">Semester 8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Select Department</Label>
                    <Select value={selectedDept} onValueChange={(val) => setSelectedDept(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        {console.log('realDepartments in render:', realDepartments)}
                        <SelectItem value="all">All Departments</SelectItem>
                        {realDepartments && realDepartments.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Constraints & Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between opacity-80">
                    <div>
                      <Label>Prevent all faculty clashes</Label>
                      <p className="text-xs text-muted-foreground">Hard constraint — always enforced</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  <div className="flex items-center justify-between opacity-80">
                    <div>
                      <Label>Ensure room capacity respected</Label>
                      <p className="text-xs text-muted-foreground">Hard constraint — always enforced</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  <div>
                    <Label>Minimum break time between (minutes): {constraints.minBreakTime}</Label>
                    <Slider
                      value={[constraints.minBreakTime]}
                      onValueChange={([value]) => setConstraints(prev => ({ ...prev, minBreakTime: value }))}
                      max={60}
                      min={5}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hard Constraints</CardTitle>
                  <CardDescription>Must be satisfied - cannot be violated</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">No Time Slot Clashes</p>
                      <p className="text-xs text-muted-foreground">A teacher or section cannot be in two places at same time</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Room Capacity</p>
                      <p className="text-xs text-muted-foreground">Section enrollment must not exceed room capacity</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Teacher Availability</p>
                      <p className="text-xs text-muted-foreground">Teachers can only be assigned during available hours</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Room Availability</p>
                      <p className="text-xs text-muted-foreground">Rooms must be available and not under maintenance</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Soft Constraints</CardTitle>
                  <CardDescription>Optimized based on priority weights (0-100)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Minimize Walking Distance</p>
                        <p className="text-xs text-muted-foreground">Prefer consecutive classes in nearby buildings</p>
                      </div>
                      <Switch 
                        checked={constraints.minimizeWalking ?? true}
                        onCheckedChange={(v) => setConstraints(prev => ({...prev, minimizeWalking: v}))}
                      />
                    </div>
                    {(constraints.minimizeWalking ?? true) && (
                      <div className="pl-4">
                        <Label className="text-xs">Priority Weight: {constraints.walkingWeight ?? 80}%</Label>
                        <Slider
                          value={[constraints.walkingWeight ?? 80]}
                          onValueChange={([v]) => setConstraints(prev => ({...prev, walkingWeight: v}))}
                          max={100}
                          min={0}
                          step={5}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Balanced Daily Workload</p>
                        <p className="text-xs text-muted-foreground">Distribute classes evenly throughout the week</p>
                      </div>
                      <Switch 
                        checked={constraints.balancedWorkload ?? true}
                        onCheckedChange={(v) => setConstraints(prev => ({...prev, balancedWorkload: v}))}
                      />
                    </div>
                    {(constraints.balancedWorkload ?? true) && (
                      <div className="pl-4">
                        <Label className="text-xs">Priority Weight: {constraints.workloadWeight ?? 90}%</Label>
                        <Slider
                          value={[constraints.workloadWeight ?? 90]}
                          onValueChange={([v]) => setConstraints(prev => ({...prev, workloadWeight: v}))}
                          max={100}
                          min={0}
                          step={5}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Preferred Time Slots</p>
                        <p className="text-xs text-muted-foreground">Assign popular subjects to preferred time slots</p>
                      </div>
                      <Switch 
                        checked={constraints.preferredSlots ?? true}
                        onCheckedChange={(v) => setConstraints(prev => ({...prev, preferredSlots: v}))}
                      />
                    </div>
                    {(constraints.preferredSlots ?? true) && (
                      <div className="pl-4">
                        <Label className="text-xs">Priority Weight: {constraints.slotsWeight ?? 70}%</Label>
                        <Slider
                          value={[constraints.slotsWeight ?? 70]}
                          onValueChange={([v]) => setConstraints(prev => ({...prev, slotsWeight: v}))}
                          max={100}
                          min={0}
                          step={5}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Minimize Gaps</p>
                        <p className="text-xs text-muted-foreground">Reduce idle gaps between classes for students</p>
                      </div>
                      <Switch 
                        checked={constraints.minimizeGaps ?? true}
                        onCheckedChange={(v) => setConstraints(prev => ({...prev, minimizeGaps: v}))}
                      />
                    </div>
                    {(constraints.minimizeGaps ?? true) && (
                      <div className="pl-4">
                        <Label className="text-xs">Priority Weight: {constraints.gapsWeight ?? 75}%</Label>
                        <Slider
                          value={[constraints.gapsWeight ?? 75]}
                          onValueChange={([v]) => setConstraints(prev => ({...prev, gapsWeight: v}))}
                          max={100}
                          min={0}
                          step={5}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {generating && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Brain className="h-6 w-6 animate-pulse text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Generating all constraint combinations... This may take several minutes.
                      </p>
                      <Progress value={generationProgress} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {generationStatus ||
                          'Running timetable for each constraint edge case and boolean combination...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-dashed">
              <CardContent className="pt-4 pb-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Generate will create{' '}
                  <span className="font-semibold text-foreground">
                    {scenarioCount}
                  </span>{' '}
                  timetables — soft constraint ON/OFF combinations plus min-break edge cases.
                </p>
                <p className="text-sm text-green-700 font-medium">
                  Hard constraints are always enforced: no faculty double-booking, no room
                  double-booking, no section clashes, room capacity respected.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={generateTimetable} disabled={generating} className="flex-1">
                {generating
                  ? 'Generating all scenarios...'
                  : `Generate All Scenarios (${scenarioCount})`}
              </Button>
              <Button variant="outline">Save Draft</Button>
              <Button variant="outline">Reset Parameters</Button>
            </div>
          </div>
        )}

        {currentPage === 'view-timetable' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">View & Manage Schedules</h1>
                {timetableData && (
                  <p className="text-muted-foreground">
                    {timetableScenarios.length > 0 && selectedScenario && (
                      <>
                        <span className="font-medium text-foreground">{selectedScenario.scenarioName}</span>
                        {' · '}
                        {selectedScenario.shortLabel}
                        {' · '}
                      </>
                    )}
                    {timetableData.summary?.department || timetableData.metadata?.departmentName
                      ? `${timetableData.summary?.department || timetableData.metadata?.departmentName}`
                      : 'Generated schedule'}
                    {timetableData.summary?.semester
                      ? ` · Semester ${timetableData.summary.semester}`
                      : timetableData.metadata?.semester
                        ? ` · Semester ${timetableData.metadata.semester}`
                        : ''}
                    {' · '}{timetableData.summary?.courseUnits || timetableData.summary?.subjectCount || 0} courses/section
                    ({timetableData.summary?.totalCredits || 0}/18 credits)
                    {' · '}{timetableData.summary?.totalSlots || 0} classes, 
                    {timetableData.summary?.conflictCount || 0} conflicts
                    {typeof timetableData.summary?.gapViolations === 'number'
                      ? `, ${timetableData.summary.gapViolations} gap issue(s)`
                      : ''}
                    {typeof timetableData.summary?.breakViolations === 'number' && timetableData.summary?.minBreakTime
                      ? `, ${timetableData.summary.breakViolations} break issue(s)`
                      : ''}
                    , {timetableData.summary?.optimizationScore || 0}% score
                    {typeof timetableData.summary?.hardViolationCount === 'number' && (
                      <>
                        {' · '}
                        {timetableData.summary.hardViolationCount === 0 ? (
                          <span className="text-green-700">Hard constraints OK</span>
                        ) : (
                          <span className="text-red-600">
                            {timetableData.summary.hardViolationCount} hard violation(s)
                          </span>
                        )}
                      </>
                    )}
                  </p>
                )}
                {selectedScenario?.description && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-4xl">{selectedScenario.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToPDF} disabled={!timetableData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
                <Button variant="outline" onClick={exportToExcel} disabled={!timetableData}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
                <Button onClick={publishTimetable} disabled={!timetableData} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Share2 className="h-4 w-4 mr-2" />
                  Publish Schedule
                </Button>
              </div>
            </div>

            {timetableScenarios.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Constraint Scenarios ({timetableScenarios.length})
                  </CardTitle>
                  <CardDescription>
                    A separate timetable for each constraint combination — the highest-scoring option is selected first
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedScenarioId || ''} onValueChange={handleScenarioChange}>
                    <SelectTrigger className="w-full max-w-2xl">
                      <SelectValue placeholder="Select a scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {timetableScenarios.map((scenario) => (
                        <SelectItem key={scenario.scenarioId} value={scenario.scenarioId}>
                          {scenario.scenarioName} — {scenario.shortLabel} —{' '}
                          {scenario.timetable?.summary?.optimizationScore ?? 0}% score,{' '}
                          {scenario.timetable?.summary?.conflictCount ?? 0} conflicts
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <ScrollArea className="h-48 rounded-md border">
                    <div className="p-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="p-2 font-medium">Scenario</th>
                            <th className="p-2 font-medium">Constraints</th>
                            <th className="p-2 font-medium">Score</th>
                            <th className="p-2 font-medium">Hard</th>
                            <th className="p-2 font-medium">Conflicts</th>
                            <th className="p-2 font-medium">Classes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...timetableScenarios]
                            .sort(
                              (a, b) =>
                                (a.timetable?.summary?.hardViolationCount || 0) -
                                  (b.timetable?.summary?.hardViolationCount || 0) ||
                                (b.timetable?.summary?.optimizationScore || 0) -
                                  (a.timetable?.summary?.optimizationScore || 0) ||
                                (a.timetable?.summary?.conflictCount || 0) -
                                  (b.timetable?.summary?.conflictCount || 0)
                            )
                            .map((scenario) => (
                              <tr
                                key={scenario.scenarioId}
                                className={`border-b cursor-pointer hover:bg-muted/50 ${
                                  scenario.scenarioId === selectedScenarioId ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => handleScenarioChange(scenario.scenarioId)}
                              >
                                <td className="p-2">{scenario.scenarioName}</td>
                                <td className="p-2 font-mono text-[10px]">{scenario.shortLabel}</td>
                                <td className="p-2">{scenario.timetable?.summary?.optimizationScore ?? 0}%</td>
                                <td className="p-2">
                                  {(scenario.timetable?.summary?.hardViolationCount ?? 0) === 0 ? (
                                    <span className="text-green-700">OK</span>
                                  ) : (
                                    <span className="text-red-600">
                                      {scenario.timetable?.summary?.hardViolationCount}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2">{scenario.timetable?.summary?.conflictCount ?? 0}</td>
                                <td className="p-2">{scenario.timetable?.summary?.totalSlots ?? 0}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap gap-4 items-center">
              <Select
                value={timetableData?.metadata?.semester?.toString() || selectedSemester}
                disabled
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(timetableData?.metadata?.semester || selectedSemester)}>
                    Semester {timetableData?.metadata?.semester || selectedSemester}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={timetableData?.metadata?.departmentId || selectedDept}
                disabled
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={timetableData?.metadata?.departmentId || selectedDept}>
                    {timetableData?.summary?.department || timetableData?.metadata?.departmentName || 'Department'}
                  </SelectItem>
                </SelectContent>
              </Select>
              {viewSections.length > 0 && (
                <Select
                  value={String(selectedViewSectionId || viewSections[0]?.id || '')}
                  onValueChange={setSelectedViewSectionId}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {viewSections.map((section) => (
                      <SelectItem key={section.id} value={String(section.id)}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="ml-auto flex gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Hard:{' '}
                  {(timetableData?.summary?.hardViolationCount ?? 0) === 0
                    ? 'No faculty/room duplicates'
                    : `${timetableData.summary.hardViolationCount} violation(s)`}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ {timetableData?.summary?.conflictCount === 0 ? 'No soft conflicts' : `${timetableData?.summary?.conflictCount} soft conflicts`}
                </Badge>
              </div>
            </div>

            {selectedViewSection && (
              <Card className="border-teal-200 bg-teal-50/40">
                <CardContent className="py-4">
                  <p className="text-sm">
                    Showing timetable for{' '}
                    <span className="font-semibold">{selectedViewSection.name}</span>
                    {' · '}
                    {selectedSectionClassCount} classes this week
                    {' · '}
                    Separate timetable per section — student view
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-8 border-b">
                  <div className="p-4 font-medium">Time</div>
                  <div className="p-4 font-medium border-l">Monday</div>
                  <div className="p-4 font-medium border-l">Tuesday</div>
                  <div className="p-4 font-medium border-l">Wednesday</div>
                  <div className="p-4 font-medium border-l">Thursday</div>
                  <div className="p-4 font-medium border-l">Friday</div>
                  <div className="p-4 font-medium border-l">Saturday</div>
                  <div className="p-4 font-medium border-l">Sunday</div>
                </div>
                
                {timetableData && sectionSchedule ? (
                  STANDARD_TIMETABLE_TIME_SLOTS.map((timeSlot, i) => {
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

                    return (
                      <div key={i} className="grid grid-cols-8 border-b">
                        <div className="p-4 bg-muted/30 font-medium text-xs">{timeSlot.label}</div>
                        {days.map((day, j) => {
                          const daySchedule =
                            sectionSchedule?.[day]?.[timeSlot.label] ||
                            sectionSchedule?.[day]?.[timeSlot.start] ||
                            sectionSchedule?.[day]?.[`${timeSlot.start} - ${timeSlot.end}`] ||
                            []
                          const entry = daySchedule[0]

                          return (
                            <div key={j} className="p-2 border-l min-h-16">
                              {entry && (
                                <div className="p-2 rounded text-xs font-medium bg-teal-50 text-teal-900 border border-teal-100">
                                  <p className="font-semibold">{entry.courseName}</p>
                                  {entry.faculty && <p className="mt-1 text-[11px]">{entry.faculty}</p>}
                                  {entry.room && <p className="text-[11px] text-muted-foreground">{entry.room}</p>}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-8 p-8 text-center text-muted-foreground">
                    No schedule generated yet. Please generate a schedule first.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend and extra controls removed per request */}
          </div>
        )}

        {currentPage === 'data-management' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Data Management</h1>
              <p className="text-muted-foreground">Upload and manage your academic data</p>
            </div>

            <Tabs defaultValue="courses" className="space-y-4">
              <TabsList>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
              </TabsList>

              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Manage Courses</CardTitle>
                      <Button disabled>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Add New Course
                      </Button>
                    </div>
                    <CardDescription>Course management and configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input placeholder="Search courses..." disabled />
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">Courses are static in this demo</p>
                        <p className="text-sm text-muted-foreground">
                          You can edit Students, Faculty, and Rooms data in their respective tabs.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faculty">
                <EditableDraggableList
                  title="Faculty"
                  type="faculty"
                  records={dataByType.faculty}
                  loading={dataLoading}
                  onReload={() => fetchTypeData('faculty')}
                />
              </TabsContent>

              <TabsContent value="students">
                <EditableDraggableList
                  title="Students"
                  type="students"
                  records={dataByType.students}
                  loading={dataLoading}
                  onReload={() => fetchTypeData('students')}
                />
              </TabsContent>

              <TabsContent value="rooms">
                <EditableDraggableList
                  title="Rooms"
                  type="rooms"
                  records={dataByType.rooms}
                  loading={dataLoading}
                  onReload={() => fetchTypeData('rooms')}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}


        {currentPage === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your profile, security, and notifications</p>
            </div>

            <SettingsPanel settings={settings} onSettingsUpdate={setSettings} />
          </div>
        )}
        </main>
      </div>
    </div>
  )
}

function SettingsPanel({ settings, onSettingsUpdate }) {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', avatarUrl: '' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [twoFA, setTwoFA] = useState(false)
  const [notifications, setNotifications] = useState({ email: true, inApp: true, frequency: 'daily' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({ profile: false, security: false, notifications: false, password: false })

  useEffect(() => {
    if (settings) {
      setProfile(settings.profile || { name: '', email: '', phone: '', avatarUrl: '' })
      setTwoFA(!!settings.security?.twoFactorEnabled)
      setNotifications(settings.notifications || { email: true, inApp: true, frequency: 'daily' })
      setLoading(false)
    }
  }, [settings])

  const saveProfile = async () => {
    setSaving(prev => ({ ...prev, profile: true }))
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })
      if (response.ok) {
        toast.success('Profile updated')
        // Update parent settings state
        onSettingsUpdate(prev => ({ ...prev, profile }))
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(prev => ({ ...prev, profile: false }))
    }
  }

  const saveSecurity = async () => {
    setSaving(prev => ({ ...prev, security: true }))
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ security: { twoFactorEnabled: twoFA } })
      })
      if (response.ok) {
        toast.success('Security updated')
        // Update parent settings state
        onSettingsUpdate(prev => ({ ...prev, security: { ...prev.security, twoFactorEnabled: twoFA } }))
      } else {
        toast.error('Failed to update security')
      }
    } catch (error) {
      console.error('Security update error:', error)
      toast.error('Failed to update security')
    } finally {
      setSaving(prev => ({ ...prev, security: false }))
    }
  }

  const saveNotifications = async () => {
    setSaving(prev => ({ ...prev, notifications: true }))
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications })
      })
      if (response.ok) {
        toast.success('Notifications updated')
        // Update parent settings state
        onSettingsUpdate(prev => ({ ...prev, notifications }))
      } else {
        toast.error('Failed to update notifications')
      }
    } catch (error) {
      console.error('Notifications update error:', error)
      toast.error('Failed to update notifications')
    } finally {
      setSaving(prev => ({ ...prev, notifications: false }))
    }
  }

  const changePassword = async () => {
    if (!passwords.current) {
      toast.error('Current password is required')
      return
    }
    if (!passwords.next) {
      toast.error('New password is required')
      return
    }
    if (passwords.next.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('Passwords do not match')
      return
    }
    
    setSaving(prev => ({ ...prev, password: true }))
    try {
      // In a real app, you'd validate current password and update it
      // For demo purposes, we'll just simulate the API call
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          security: { 
            ...settings?.security, 
            passwordChanged: true,
            lastPasswordChange: new Date().toISOString()
          } 
        })
      })
      
      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswords({ current: '', next: '', confirm: '' })
        // Update parent settings state
        onSettingsUpdate(prev => ({ 
          ...prev, 
          security: { 
            ...prev.security, 
            passwordChanged: true,
            lastPasswordChange: new Date().toISOString()
          } 
        }))
      } else {
        toast.error('Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(prev => ({ ...prev, password: false }))
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading settings...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={profile.name || ''} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={profile.email || ''} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profile.phone || ''} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Avatar URL</Label>
              <Input value={profile.avatarUrl || ''} onChange={(e) => setProfile(p => ({ ...p, avatarUrl: e.target.value }))} />
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving.profile}>
            {saving.profile ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Two-factor authentication and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable 2FA</Label>
            <Switch checked={twoFA} onCheckedChange={setTwoFA} />
          </div>
          <Button onClick={saveSecurity} variant="outline" disabled={saving.security}>
            {saving.security ? 'Saving...' : 'Save Security'}
          </Button>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" value={passwords.current} onChange={(e) => setPasswords(ps => ({ ...ps, current: e.target.value }))} />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={passwords.next} onChange={(e) => setPasswords(ps => ({ ...ps, next: e.target.value }))} />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords(ps => ({ ...ps, confirm: e.target.value }))} />
            </div>
          </div>
          <Button onClick={changePassword} disabled={saving.password}>
            {saving.password ? 'Changing...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Email and in-app notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications(n => ({ ...n, email: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>In-app Notifications</Label>
            <Switch checked={notifications.inApp} onCheckedChange={(v) => setNotifications(n => ({ ...n, inApp: v }))} />
          </div>
          <div>
            <Label>Frequency</Label>
            <Select value={notifications.frequency} onValueChange={(v) => setNotifications(n => ({ ...n, frequency: v }))}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={saveNotifications} disabled={saving.notifications}>
            {saving.notifications ? 'Saving...' : 'Save Notifications'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
// Editable and draggable list for Data Management
function EditableDraggableList({ title, type, records, loading, onReload }) {
  const [localRows, setLocalRows] = useState(records || [])
  const [dragIndex, setDragIndex] = useState(null)

  useEffect(() => {
    setLocalRows(records || [])
  }, [records])

  // Derive visible columns from first record
  const reserved = new Set(['id', 'type', 'uploadedAt', 'order'])
  const columns = localRows.length
    ? Object.keys(localRows[0]).filter(k => !reserved.has(k))
    : []

  const handleChange = async (rowId, key, value) => {
    setLocalRows(prev => prev.map(r => r.id === rowId ? { ...r, [key]: value } : r))
    try {
      await fetch('/api/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id: rowId, updates: { [key]: value } })
      })
      toast.success('Saved')
    } catch (_) {
      toast.error('Save failed')
    }
  }

  const handleDrop = async (toIndex) => {
    if (dragIndex == null || toIndex == null || dragIndex === toIndex) return
    const next = [...localRows]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(toIndex, 0, moved)
    setLocalRows(next)
    setDragIndex(null)
    try {
      await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, orderedIds: next.map(r => r.id) })
      })
      toast.success('Order updated')
    } catch (_) {
      toast.error('Reorder failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage {title}</CardTitle>
                            <div className="flex gap-2">
            <Button variant="outline" onClick={onReload} disabled={loading}>Refresh</Button>
                            </div>
                          </div>
        <CardDescription>Drag rows to reorder. Click any field to edit.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : localRows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No records found. Upload a file to get started.</div>
        ) : (
          <div className="overflow-auto">
            <div className="min-w-[700px]">
              <div className="grid" style={{ gridTemplateColumns: `40px ${columns.map(() => '1fr').join(' ')} 120px` }}>
                <div className="p-2 text-xs uppercase text-muted-foreground">#</div>
                {columns.map(col => (
                  <div key={col} className="p-2 text-xs uppercase text-muted-foreground">{col}</div>
                ))}
                <div className="p-2 text-xs uppercase text-muted-foreground">Actions</div>
                      </div>
              {localRows.map((row, idx) => (
                <div
                  key={row.id}
                  className="grid border-b items-center"
                  style={{ gridTemplateColumns: `40px ${columns.map(() => '1fr').join(' ')} 120px` }}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(idx)}
                >
                  <div className="p-2 text-xs text-muted-foreground cursor-grab">{idx + 1}</div>
                  {columns.map(col => (
                    <EditableCell
                      key={col}
                      value={row[col] ?? ''}
                      onChange={(val) => handleChange(row.id, col, val)}
                    />
                  ))}
                  <div className="p-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onReload()}>
                        <Pencil className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        try {
                          await fetch(`/api/data?type=${type}&id=${row.id}`, { method: 'DELETE' })
                          setLocalRows(prev => prev.filter(r => r.id !== row.id))
                          toast.success('Deleted')
                        } catch (_) {
                          toast.error('Delete failed')
                        }
                      }}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
                  </CardContent>
                </Card>
  )
}

function EditableCell({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value ?? '')

  useEffect(() => {
    setVal(value ?? '')
  }, [value])

  const commit = () => {
    setEditing(false)
    if (val !== value) onChange(val)
  }

  return (
    <div className="p-2">
      {editing ? (
        <input
          className="w-full rounded border px-2 py-1 text-sm"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
          autoFocus
        />
      ) : (
        <div className="text-sm cursor-text" onClick={() => setEditing(true)}>
          {String(value ?? '')}
          </div>
        )}
    </div>
  )
}