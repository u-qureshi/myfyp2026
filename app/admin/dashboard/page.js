'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Upload, Brain, Calendar, Settings, Users, BookOpen, Building2, FileSpreadsheet, Menu, X, Download, Pencil, Trash2, Plus, LogOut, Share2, DoorOpen, LayoutGrid, Settings2, AlertTriangle, BarChart2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDropzone } from 'react-dropzone'
import { toast, Toaster } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

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
  const [generationProgress, setGenerationProgress] = useState(0)
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
      // Fetch real data from Supabase APIs
      console.log('Fetching real data from Supabase...')
      console.log('Filters: department =', selectedDept, 'semester =', selectedSemester)
      
      const facultyRes = await fetch('/api/admin/faculty')
      const facultyJson = await facultyRes.json()
      let facultyData = facultyJson.faculty || facultyJson || []
      
      const roomsRes = await fetch('/api/admin/rooms')
      const roomsJson = await roomsRes.json()
      const roomsData = roomsJson.rooms || roomsJson || []
      
      const sectionsRes = await fetch('/api/admin/sections')
      const sectionsJson = await sectionsRes.json()
      let sectionsData = sectionsJson.sections || sectionsJson || []
      
      console.log('Raw API data before filtering:', { faculty: facultyData.length, rooms: roomsData.length, sections: sectionsData.length })

      // Filter by department if selected
      if (selectedDept && selectedDept !== 'all') {
        console.log('Filtering by department:', selectedDept)
        facultyData = facultyData.filter(f => f.department_id === selectedDept)
        sectionsData = sectionsData.filter(s => s.department_id === selectedDept)
        console.log('After department filter:', { faculty: facultyData.length, sections: sectionsData.length })
      }

      // Debug logging after filtering
      console.log('Selected dept:', selectedDept)
      console.log('Selected semester:', selectedSemester)
      console.log('Faculty after filter:', facultyData.length, facultyData.map(f => f.name))
      console.log('Sections after filter:', sectionsData.length, sectionsData.map(s => s.name + ' sem:' + s.semester))
      console.log('Rooms:', roomsData.length)

      // Filter by semester if selected
      if (selectedSemester && selectedSemester !== 'all') {
        console.log('Filtering by semester:', selectedSemester)
        const semNum = parseInt(selectedSemester)
        sectionsData = sectionsData.filter(s => s.semester === semNum)
        console.log('After semester filter:', sectionsData.length, 'sections')
      }

      if (!facultyData.length || !roomsData.length || !sectionsData.length) {
        toast.error('No data found for selected filters. Please check your department/semester selection.')
        return
      }

      // Map Supabase data to expected format for timetable generator
      const mappedFaculty = facultyData.map(f => ({
        id: f.id,
        'Faculty ID': f.id,
        Name: f.name || f.full_name || 'Unknown Faculty',
        Subjects: f.department_name || f.specialization || 'General',
        'Max Hours': String(f.max_hours || 18),
        Availability: 'Mon-Fri 9am-5pm'
      }))

      const mappedRooms = roomsData.map(r => ({
        id: r.id,
        'Room ID': r.id,
        Name: r.name || 'Unknown Room',
        Type: r.type === 'lab' ? 'Lab' : r.type === 'seminar_hall' ? 'Seminar Hall' : 'Classroom',
        Capacity: String(r.capacity || 30),
        Equipment: 'Standard'
      }))

      const mappedStudents = sectionsData.map(s => ({
        id: s.id,
        'Student ID': s.id,
        Name: s.name || 'Unknown Section',
        Class: String(s.semester || '1'),
        Section: s.name || 'A',
        Electives: s.department_name || 'General'
      }))

      console.log('Mapped data for timetable generator:', { 
        faculty: mappedFaculty.length, 
        rooms: mappedRooms.length, 
        sections: mappedStudents.length 
      })
      console.log('Sample mapped faculty:', mappedFaculty[0])
      console.log('Sample mapped room:', mappedRooms[0])
      console.log('Sample mapped section:', mappedStudents[0])

      setGenerating(true)
      setGenerationProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      try {
        console.log('Sending constraints to API:', constraints)
        const response = await fetch('/api/generate-timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            students: mappedStudents,
            faculty: mappedFaculty,
            rooms: mappedRooms,
            constraints
          })
        })
        const result = await response.json()
        
        clearInterval(progressInterval)
        setGenerationProgress(100)
        
        if (response.ok) {
          console.log('Generated timetable:', result.timetable)
          setTimetableData(result.timetable)
          toast.success('Schedule generated successfully!')
          setCurrentPage('view-timetable')
        } else {
          console.error('Generation failed:', result.error)
          toast.error(result.error || 'Generation failed')
        }
      } catch (error) {
        clearInterval(progressInterval)
        console.error('Generation error:', error)
        toast.error('Generation failed: ' + error.message)
      } finally {
        setGenerating(false)
        setTimeout(() => setGenerationProgress(0), 1000)
      }
    } catch (error) {
      console.error('Fetch error during timetable generation:', error)
      toast.error('Failed to fetch data: ' + error.message)
      setGenerating(false)
    }
  }

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
          Generated by SmartScheduler.AI • Intelligent Scheduling System
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
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-600 to-blue-700 text-white p-4 z-50 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-400">SmartScheduler.AI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-blue-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="space-y-2">
          <Button
            variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-white hover:bg-blue-500"
            onClick={() => {
              setCurrentPage('dashboard')
              setSidebarOpen(false)
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={currentPage === 'data-management' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-white hover:bg-blue-500"
            onClick={() => {
              setCurrentPage('data-management')
              setSidebarOpen(false)
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Data Management
          </Button>
          <Button
            variant={currentPage === 'generate' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-white hover:bg-blue-500"
            onClick={() => {
              setCurrentPage('generate')
              setSidebarOpen(false)
            }}
          >
            <Brain className="h-4 w-4 mr-2" />
            Schedule Generation
          </Button>
          <Button
            variant={currentPage === 'view-timetable' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-white hover:bg-blue-500"
            onClick={() => {
              setCurrentPage('view-timetable')
              setSidebarOpen(false)
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Schedules
          </Button>
          <Button
            variant={currentPage === 'settings' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-white hover:bg-blue-500"
            onClick={() => {
              setCurrentPage('settings')
              setSidebarOpen(false)
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </nav>

        <div className="mt-6 border-t border-blue-400 pt-4">
          <div className="mb-2 text-xs text-blue-100 uppercase font-semibold tracking-wide">Management</div>
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                window.location.href = '/admin/departments'
              }}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Departments
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                window.location.href = '/admin/faculty'
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Faculty
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                window.location.href = '/admin/rooms'
              }}
            >
              <DoorOpen className="h-4 w-4 mr-2" />
              Rooms
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                window.location.href = '/admin/subjects'
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Subjects
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                window.location.href = '/admin/sections'
              }}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Sections
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                window.location.href = '/admin/constraints'
              }}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Constraints
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                window.location.href = '/admin/emergency-update'
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Update
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                window.location.href = '/admin/reports'
              }}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500"
              onClick={() => {
                setCurrentPage('generate')
                setSidebarOpen(false)
              }}
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Timetable
            </Button>
          </nav>
        </div>

        <div className="mt-8 border-t border-blue-400 pt-4">
          <div className="mb-2 text-xs text-blue-100 uppercase font-semibold tracking-wide">Account</div>
          <Button 
            variant="destructive" 
            onClick={handleLogout} 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      } p-6`}>
        {/* Header with Sidebar Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden lg:block">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Mobile Logout Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Welcome, {settings?.profile?.name || 'Administrator'}!</h1>
                <p className="text-blue-600 font-medium text-sm">AI-Powered Timetable Generation System</p>
                <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                  <div className="flex items-center justify-between">
                    <Label>Prevent all faculty clashes</Label>
                    <Switch 
                      checked={constraints.preventFacultyClashes}
                      onCheckedChange={(checked) => setConstraints(prev => ({ ...prev, preventFacultyClashes: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Ensure room capacity respected</Label>
                    <Switch 
                      checked={constraints.ensureRoomCapacity}
                      onCheckedChange={(checked) => setConstraints(prev => ({ ...prev, ensureRoomCapacity: checked }))}
                    />
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
                      <p className="font-medium">Generating schedule... This may take a few minutes.</p>
                      <Progress value={generationProgress} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-1">
                        AI Brain processing constraints and optimizing schedule...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button onClick={generateTimetable} disabled={generating} className="flex-1">
                {generating ? 'Generating...' : 'Generate Schedule'}
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
                    Generated schedule with {timetableData.summary?.totalSlots || 0} slots, 
                    {timetableData.summary?.conflictCount || 0} conflicts, 
                    {timetableData.summary?.optimizationScore || 0}% optimization score
                  </p>
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

            <div className="flex gap-4">
              <Select defaultValue="fall-2025">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fall-2025">Fall 2025</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="bed-fyup">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bed-fyup">B.Ed + FYUP</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ {timetableData?.summary?.conflictCount === 0 ? 'No conflicts detected' : `${timetableData?.summary?.conflictCount} conflicts`}
                </Badge>
              </div>
            </div>

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
                
                {/* Generated timetable data */}
                {timetableData ? (
                  (() => {
                    const timeSlots = [
                      { start: '9:00 AM', end: '10:00 AM', label: '9:00 - 10:00 AM' },
                      { start: '10:00 AM', end: '11:00 AM', label: '10:00 - 11:00 AM' },
                      { start: '11:00 AM', end: '12:00 PM', label: '11:00 - 12:00 PM' },
                      { start: '12:00 PM', end: '1:00 PM', label: '12:00 - 1:00 PM' },
                      { start: '1:00 PM', end: '2:00 PM', label: '1:00 - 2:00 PM (Lunch)' },
                      { start: '1:30 PM', end: '2:30 PM', label: '1:30 - 2:30 PM' },
                      { start: '2:30 PM', end: '3:30 PM', label: '2:30 - 3:30 PM' },
                      { start: '3:30 PM', end: '4:30 PM', label: '3:30 - 4:30 PM' }
                    ]
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                    
                    return timeSlots.map((timeSlot, i) => {
                      const slots = days.map(day => {
                        // Try to find schedule using either the label or start time as key
                        const daySchedule = timetableData.schedule?.[day]?.[timeSlot.label] || 
                                          timetableData.schedule?.[day]?.[timeSlot.start] || 
                                          timetableData.schedule?.[day]?.[`${timeSlot.start} - ${timeSlot.end}`] || []
                        return daySchedule.map(slot => {
                          const title = slot.courseName || ''
                          const code = slot.courseCode || ''
                          const fac = slot.faculty || ''
                          const room = slot.room || ''
                          const parts = []
                          if (title) parts.push(title)
                          if (fac) parts.push(fac)
                          if (room) parts.push(room)
                          return parts.join(' • ')
                        }).join(', ')
                      })
                      
                      return (
                        <div key={i} className="grid grid-cols-8 border-b">
                          <div className="p-4 bg-muted/30 font-medium text-xs">{timeSlot.label}</div>
                          {slots.map((slot, j) => (
                            <div key={j} className="p-2 border-l min-h-16">
                              {slot && (
                                <div className={`p-2 rounded text-xs font-medium ${
                                  slot.includes('Lunch Break') ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                  slot.includes('English') ? 'bg-blue-100 text-blue-800' :
                                  slot.includes('Mathematics') ? 'bg-green-100 text-green-800' :
                                  slot.includes('Science') ? 'bg-purple-100 text-purple-800' :
                                  slot.includes('History') ? 'bg-orange-100 text-orange-800' :
                                  slot.includes('Computer') ? 'bg-pink-100 text-pink-800' :
                                  slot.includes('Data Science') ? 'bg-indigo-100 text-indigo-800' :
                                  slot.includes('AI') || slot.includes('Artificial Intelligence') ? 'bg-cyan-100 text-cyan-800' :
                                  slot.includes('ML') || slot.includes('Machine Learning') ? 'bg-teal-100 text-teal-800' :
                                  slot.includes('Cyber') || slot.includes('Security') ? 'bg-red-100 text-red-800' :
                                  slot.includes('IoT') || slot.includes('Embedded') ? 'bg-emerald-100 text-emerald-800' :
                                  slot.includes('Database') || slot.includes('Cloud') ? 'bg-slate-100 text-slate-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {slot}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })
                  })()
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