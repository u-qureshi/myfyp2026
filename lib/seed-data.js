import { csSubjects, generateCsSections } from './cs-curriculum'
import { facultyMembers } from './faculty-data'

export const departments = [
  { name: 'Computer Science', code: 'CS' },
  { name: 'Software Engineering', code: 'SE' },
  { name: 'Data Science', code: 'DS' },
  { name: 'Artificial Intelligence', code: 'AI' },
  { name: 'Cyber Security', code: 'CYS' }
]

export const rooms = [
  // Block A - CS Department
  { name: 'A-101', type: 'classroom', capacity: 60, building: 'Block A', availability_status: 'available' },
  { name: 'A-102', type: 'classroom', capacity: 60, building: 'Block A', availability_status: 'available' },
  { name: 'A-103', type: 'classroom', capacity: 55, building: 'Block A', availability_status: 'available' },
  { name: 'A-104', type: 'classroom', capacity: 50, building: 'Block A', availability_status: 'available' },
  { name: 'A-105', type: 'classroom', capacity: 60, building: 'Block A', availability_status: 'available' },
  { name: 'A-201', type: 'classroom', capacity: 60, building: 'Block A', availability_status: 'available' },
  { name: 'A-202', type: 'classroom', capacity: 55, building: 'Block A', availability_status: 'available' },
  { name: 'A-203', type: 'classroom', capacity: 50, building: 'Block A', availability_status: 'available' },
  { name: 'A-204', type: 'classroom', capacity: 60, building: 'Block A', availability_status: 'available' },
  { name: 'A-301', type: 'classroom', capacity: 60, building: 'Block A', availability_status: 'available' },
  { name: 'A-302', type: 'classroom', capacity: 55, building: 'Block A', availability_status: 'available' },
  { name: 'A-Lab-1', type: 'lab', capacity: 40, building: 'Block A', availability_status: 'available' },
  { name: 'A-Lab-2', type: 'lab', capacity: 40, building: 'Block A', availability_status: 'available' },
  { name: 'A-Lab-3', type: 'lab', capacity: 35, building: 'Block A', availability_status: 'available' },
  { name: 'A-Lab-4', type: 'lab', capacity: 40, building: 'Block A', availability_status: 'available' },

  // Block B - SE Department
  { name: 'B-101', type: 'classroom', capacity: 60, building: 'Block B', availability_status: 'available' },
  { name: 'B-102', type: 'classroom', capacity: 55, building: 'Block B', availability_status: 'available' },
  { name: 'B-103', type: 'classroom', capacity: 60, building: 'Block B', availability_status: 'available' },
  { name: 'B-104', type: 'classroom', capacity: 50, building: 'Block B', availability_status: 'available' },
  { name: 'B-201', type: 'classroom', capacity: 60, building: 'Block B', availability_status: 'available' },
  { name: 'B-202', type: 'classroom', capacity: 55, building: 'Block B', availability_status: 'available' },
  { name: 'B-203', type: 'classroom', capacity: 60, building: 'Block B', availability_status: 'available' },
  { name: 'B-301', type: 'classroom', capacity: 60, building: 'Block B', availability_status: 'available' },
  { name: 'B-302', type: 'classroom', capacity: 55, building: 'Block B', availability_status: 'available' },
  { name: 'B-Lab-1', type: 'lab', capacity: 40, building: 'Block B', availability_status: 'available' },
  { name: 'B-Lab-2', type: 'lab', capacity: 35, building: 'Block B', availability_status: 'available' },
  { name: 'B-Lab-3', type: 'lab', capacity: 40, building: 'Block B', availability_status: 'available' },

  // Block C - DS & AI Department
  { name: 'C-101', type: 'classroom', capacity: 60, building: 'Block C', availability_status: 'available' },
  { name: 'C-102', type: 'classroom', capacity: 55, building: 'Block C', availability_status: 'available' },
  { name: 'C-103', type: 'classroom', capacity: 60, building: 'Block C', availability_status: 'available' },
  { name: 'C-201', type: 'classroom', capacity: 60, building: 'Block C', availability_status: 'available' },
  { name: 'C-202', type: 'classroom', capacity: 50, building: 'Block C', availability_status: 'available' },
  { name: 'C-203', type: 'classroom', capacity: 55, building: 'Block C', availability_status: 'available' },
  { name: 'C-301', type: 'classroom', capacity: 60, building: 'Block C', availability_status: 'available' },
  { name: 'C-Lab-1', type: 'lab', capacity: 40, building: 'Block C', availability_status: 'available' },
  { name: 'C-Lab-2', type: 'lab', capacity: 40, building: 'Block C', availability_status: 'available' },
  { name: 'C-Lab-3', type: 'lab', capacity: 35, building: 'Block C', availability_status: 'available' },

  // Block D - CYS Department
  { name: 'D-101', type: 'classroom', capacity: 60, building: 'Block D', availability_status: 'available' },
  { name: 'D-102', type: 'classroom', capacity: 55, building: 'Block D', availability_status: 'available' },
  { name: 'D-103', type: 'classroom', capacity: 60, building: 'Block D', availability_status: 'available' },
  { name: 'D-201', type: 'classroom', capacity: 50, building: 'Block D', availability_status: 'available' },
  { name: 'D-202', type: 'classroom', capacity: 60, building: 'Block D', availability_status: 'available' },
  { name: 'D-Lab-1', type: 'lab', capacity: 40, building: 'Block D', availability_status: 'available' },
  { name: 'D-Lab-2', type: 'lab', capacity: 35, building: 'Block D', availability_status: 'available' },

  // Seminar Halls
  { name: 'Seminar Hall A', type: 'seminar_hall', capacity: 200, building: 'Block A', availability_status: 'available' },
  { name: 'Seminar Hall B', type: 'seminar_hall', capacity: 150, building: 'Block B', availability_status: 'available' },
  { name: 'Seminar Hall C', type: 'seminar_hall', capacity: 120, building: 'Block C', availability_status: 'available' },
  { name: 'Conference Room 1', type: 'seminar_hall', capacity: 50, building: 'Block A', availability_status: 'available' },
  { name: 'Conference Room 2', type: 'seminar_hall', capacity: 50, building: 'Block B', availability_status: 'available' }
]

export const subjects = [
  ...csSubjects,

  // SE Subjects
  { name: 'Software Requirements Engineering', code: 'SE-301', credit_hours: 3, dept: 'SE' },
  { name: 'Software Design & Architecture', code: 'SE-401', credit_hours: 3, dept: 'SE' },
  { name: 'Software Testing & Quality Assurance', code: 'SE-402', credit_hours: 3, dept: 'SE' },
  { name: 'Web Engineering', code: 'SE-403', credit_hours: 3, dept: 'SE' },
  { name: 'Software Project Management', code: 'SE-501', credit_hours: 3, dept: 'SE' },
  { name: 'DevOps & Agile Development', code: 'SE-502', credit_hours: 3, dept: 'SE' },
  { name: 'Microservices Architecture', code: 'SE-601', credit_hours: 3, dept: 'SE' },
  { name: 'Enterprise Application Development', code: 'SE-602', credit_hours: 3, dept: 'SE' },
  { name: 'SE Final Year Project I', code: 'SE-701', credit_hours: 3, dept: 'SE' },
  { name: 'SE Final Year Project II', code: 'SE-801', credit_hours: 6, dept: 'SE' },

  // DS Subjects
  { name: 'Introduction to Data Science', code: 'DS-301', credit_hours: 3, dept: 'DS' },
  { name: 'Data Visualization', code: 'DS-302', credit_hours: 3, dept: 'DS' },
  { name: 'Statistical Inference', code: 'DS-401', credit_hours: 3, dept: 'DS' },
  { name: 'Machine Learning for DS', code: 'DS-402', credit_hours: 3, dept: 'DS' },
  { name: 'Data Mining & Warehousing', code: 'DS-403', credit_hours: 3, dept: 'DS' },
  { name: 'Big Data Analytics', code: 'DS-501', credit_hours: 3, dept: 'DS' },
  { name: 'Natural Language Processing', code: 'DS-502', credit_hours: 3, dept: 'DS' },
  { name: 'Time Series Analysis', code: 'DS-503', credit_hours: 3, dept: 'DS' },
  { name: 'DS Final Year Project I', code: 'DS-701', credit_hours: 3, dept: 'DS' },
  { name: 'DS Final Year Project II', code: 'DS-801', credit_hours: 6, dept: 'DS' },

  // AI Subjects
  { name: 'Foundations of AI', code: 'AI-301', credit_hours: 3, dept: 'AI' },
  { name: 'Neural Networks', code: 'AI-401', credit_hours: 3, dept: 'AI' },
  { name: 'Computer Vision', code: 'AI-402', credit_hours: 3, dept: 'AI' },
  { name: 'Reinforcement Learning', code: 'AI-403', credit_hours: 3, dept: 'AI' },
  { name: 'AI Ethics & Governance', code: 'AI-404', credit_hours: 3, dept: 'AI' },
  { name: 'Robotics & Automation', code: 'AI-501', credit_hours: 3, dept: 'AI' },
  { name: 'Generative AI', code: 'AI-502', credit_hours: 3, dept: 'AI' },
  { name: 'AI Final Year Project I', code: 'AI-701', credit_hours: 3, dept: 'AI' },
  { name: 'AI Final Year Project II', code: 'AI-801', credit_hours: 6, dept: 'AI' },

  // CYS Subjects
  { name: 'Introduction to Cyber Security', code: 'CYS-301', credit_hours: 3, dept: 'CYS' },
  { name: 'Network Security', code: 'CYS-401', credit_hours: 3, dept: 'CYS' },
  { name: 'Ethical Hacking', code: 'CYS-402', credit_hours: 3, dept: 'CYS' },
  { name: 'Digital Forensics', code: 'CYS-403', credit_hours: 3, dept: 'CYS' },
  { name: 'Cryptography', code: 'CYS-501', credit_hours: 3, dept: 'CYS' },
  { name: 'Penetration Testing', code: 'CYS-502', credit_hours: 3, dept: 'CYS' },
  { name: 'Malware Analysis', code: 'CYS-503', credit_hours: 3, dept: 'CYS' },
  { name: 'CYS Final Year Project I', code: 'CYS-701', credit_hours: 3, dept: 'CYS' },
  { name: 'CYS Final Year Project II', code: 'CYS-801', credit_hours: 6, dept: 'CYS' }
]

export const faculty = facultyMembers

export const sections = [
  ...generateCsSections(),

  // SE Sections
  { name: 'BSSE-1A', semester: 1, dept: 'SE', student_count: 45 },
  { name: 'BSSE-1B', semester: 1, dept: 'SE', student_count: 43 },
  { name: 'BSSE-2A', semester: 2, dept: 'SE', student_count: 44 },
  { name: 'BSSE-2B', semester: 2, dept: 'SE', student_count: 42 },
  { name: 'BSSE-3A', semester: 3, dept: 'SE', student_count: 43 },
  { name: 'BSSE-3B', semester: 3, dept: 'SE', student_count: 41 },
  { name: 'BSSE-4A', semester: 4, dept: 'SE', student_count: 42 },
  { name: 'BSSE-5A', semester: 5, dept: 'SE', student_count: 40 },
  { name: 'BSSE-5B', semester: 5, dept: 'SE', student_count: 38 },
  { name: 'BSSE-6A', semester: 6, dept: 'SE', student_count: 39 },
  { name: 'BSSE-7A', semester: 7, dept: 'SE', student_count: 38 },
  { name: 'BSSE-8A', semester: 8, dept: 'SE', student_count: 35 },

  // DS Sections
  { name: 'BSDS-1A', semester: 1, dept: 'DS', student_count: 40 },
  { name: 'BSDS-2A', semester: 2, dept: 'DS', student_count: 38 },
  { name: 'BSDS-3A', semester: 3, dept: 'DS', student_count: 37 },
  { name: 'BSDS-4A', semester: 4, dept: 'DS', student_count: 36 },
  { name: 'BSDS-5A', semester: 5, dept: 'DS', student_count: 35 },
  { name: 'BSDS-6A', semester: 6, dept: 'DS', student_count: 34 },
  { name: 'BSDS-7A', semester: 7, dept: 'DS', student_count: 33 },
  { name: 'BSDS-8A', semester: 8, dept: 'DS', student_count: 30 },

  // AI Sections
  { name: 'BSAI-1A', semester: 1, dept: 'AI', student_count: 42 },
  { name: 'BSAI-2A', semester: 2, dept: 'AI', student_count: 40 },
  { name: 'BSAI-3A', semester: 3, dept: 'AI', student_count: 39 },
  { name: 'BSAI-4A', semester: 4, dept: 'AI', student_count: 38 },
  { name: 'BSAI-5A', semester: 5, dept: 'AI', student_count: 37 },
  { name: 'BSAI-6A', semester: 6, dept: 'AI', student_count: 36 },
  { name: 'BSAI-7A', semester: 7, dept: 'AI', student_count: 35 },
  { name: 'BSAI-8A', semester: 8, dept: 'AI', student_count: 32 },

  // CYS Sections
  { name: 'BSCYS-1A', semester: 1, dept: 'CYS', student_count: 40 },
  { name: 'BSCYS-2A', semester: 2, dept: 'CYS', student_count: 38 },
  { name: 'BSCYS-3A', semester: 3, dept: 'CYS', student_count: 37 },
  { name: 'BSCYS-4A', semester: 4, dept: 'CYS', student_count: 36 },
  { name: 'BSCYS-5A', semester: 5, dept: 'CYS', student_count: 35 },
  { name: 'BSCYS-6A', semester: 6, dept: 'CYS', student_count: 34 },
  { name: 'BSCYS-7A', semester: 7, dept: 'CYS', student_count: 33 },
  { name: 'BSCYS-8A', semester: 8, dept: 'CYS', student_count: 30 }
]
