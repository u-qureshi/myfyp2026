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
  // CS Semester 1
  { name: 'Programming Fundamentals', code: 'CS-101', credit_hours: 3, dept: 'CS' },
  { name: 'Calculus & Analytical Geometry', code: 'MTH-101', credit_hours: 3, dept: 'CS' },
  { name: 'Applied Physics', code: 'PHY-101', credit_hours: 3, dept: 'CS' },
  { name: 'English Composition', code: 'ENG-101', credit_hours: 3, dept: 'CS' },
  { name: 'Islamic Studies', code: 'ISL-101', credit_hours: 2, dept: 'CS' },

  // CS Semester 2
  { name: 'Object Oriented Programming', code: 'CS-201', credit_hours: 3, dept: 'CS' },
  { name: 'Discrete Mathematics', code: 'MTH-201', credit_hours: 3, dept: 'CS' },
  { name: 'Digital Logic Design', code: 'CS-202', credit_hours: 3, dept: 'CS' },
  { name: 'Communication Skills', code: 'ENG-201', credit_hours: 3, dept: 'CS' },
  { name: 'Pakistan Studies', code: 'PST-201', credit_hours: 2, dept: 'CS' },

  // CS Semester 3
  { name: 'Data Structures & Algorithms', code: 'CS-301', credit_hours: 3, dept: 'CS' },
  { name: 'Computer Organization & Assembly', code: 'CS-302', credit_hours: 3, dept: 'CS' },
  { name: 'Linear Algebra', code: 'MTH-301', credit_hours: 3, dept: 'CS' },
  { name: 'Probability & Statistics', code: 'MTH-302', credit_hours: 3, dept: 'CS' },
  { name: 'Technical Writing', code: 'ENG-301', credit_hours: 3, dept: 'CS' },

  // CS Semester 4
  { name: 'Database Systems', code: 'CS-401', credit_hours: 3, dept: 'CS' },
  { name: 'Operating Systems', code: 'CS-402', credit_hours: 3, dept: 'CS' },
  { name: 'Computer Networks', code: 'CS-403', credit_hours: 3, dept: 'CS' },
  { name: 'Design & Analysis of Algorithms', code: 'CS-404', credit_hours: 3, dept: 'CS' },
  { name: 'Theory of Automata', code: 'CS-405', credit_hours: 3, dept: 'CS' },

  // CS Semester 5
  { name: 'Artificial Intelligence', code: 'CS-501', credit_hours: 3, dept: 'CS' },
  { name: 'Software Engineering', code: 'CS-502', credit_hours: 3, dept: 'CS' },
  { name: 'Web Technologies', code: 'CS-503', credit_hours: 3, dept: 'CS' },
  { name: 'Information Security', code: 'CS-504', credit_hours: 3, dept: 'CS' },
  { name: 'Human Computer Interaction', code: 'CS-505', credit_hours: 3, dept: 'CS' },

  // CS Semester 6
  { name: 'Machine Learning', code: 'CS-601', credit_hours: 3, dept: 'CS' },
  { name: 'Compiler Construction', code: 'CS-602', credit_hours: 3, dept: 'CS' },
  { name: 'Parallel & Distributed Computing', code: 'CS-603', credit_hours: 3, dept: 'CS' },
  { name: 'Mobile Application Development', code: 'CS-604', credit_hours: 3, dept: 'CS' },
  { name: 'Computer Graphics', code: 'CS-605', credit_hours: 3, dept: 'CS' },

  // CS Semester 7
  { name: 'Deep Learning', code: 'CS-701', credit_hours: 3, dept: 'CS' },
  { name: 'Cloud Computing', code: 'CS-702', credit_hours: 3, dept: 'CS' },
  { name: 'Final Year Project I', code: 'CS-703', credit_hours: 3, dept: 'CS' },
  { name: 'Professional Ethics', code: 'CS-704', credit_hours: 3, dept: 'CS' },

  // CS Semester 8
  { name: 'Final Year Project II', code: 'CS-801', credit_hours: 6, dept: 'CS' },
  { name: 'Entrepreneurship', code: 'CS-802', credit_hours: 3, dept: 'CS' },

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

export const faculty = [
  // CS Department Faculty
  { name: 'Dr. Ahmad Shabbar Kazmi', email: 'ahmad.kazmi@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Dr. Adnan Nabeel Qureshi', email: 'adnan.qureshi@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Dr. Muhammad Amjad Iqbal', email: 'amjad.iqbal@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Ms. Sundas Asghar', email: 'sundas.asghar@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Mr. Bilal Ahmed Khan', email: 'bilal.khan@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Dr. Rabia Irfan', email: 'rabia.irfan@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Ms. Hira Tariq', email: 'hira.tariq@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Mr. Zain ul Abideen', email: 'zain.abideen@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Dr. Naveed Hussain', email: 'naveed.hussain@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Ms. Ayesha Bano', email: 'ayesha.bano@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Mr. Shahid Mehmood', email: 'shahid.mehmood@ucp.edu.pk', password: 'faculty123', dept: 'CS' },
  { name: 'Dr. Tariq Mahmood', email: 'tariq.mahmood@ucp.edu.pk', password: 'faculty123', dept: 'CS' },

  // SE Department Faculty
  { name: 'Dr. Syed Karrar Haider', email: 'karrar.haider@ucp.edu.pk', password: 'faculty123', dept: 'SE' },
  { name: 'Ms. Fareeha Zafar', email: 'fareeha.zafar@ucp.edu.pk', password: 'faculty123', dept: 'SE' },
  { name: 'Mr. Hassan Raza', email: 'hassan.raza@ucp.edu.pk', password: 'faculty123', dept: 'SE' },
  { name: 'Dr. Nadia Kanwal', email: 'nadia.kanwal@ucp.edu.pk', password: 'faculty123', dept: 'SE' },
  { name: 'Mr. Kamran Ahsan', email: 'kamran.ahsan@ucp.edu.pk', password: 'faculty123', dept: 'SE' },
  { name: 'Ms. Sadia Anwar', email: 'sadia.anwar@ucp.edu.pk', password: 'faculty123', dept: 'SE' },
  { name: 'Dr. Imran Sarwar', email: 'imran.sarwar@ucp.edu.pk', password: 'faculty123', dept: 'SE' },
  { name: 'Mr. Asad Malik', email: 'asad.malik@ucp.edu.pk', password: 'faculty123', dept: 'SE' },
  { name: 'Ms. Madiha Noor', email: 'madiha.noor@ucp.edu.pk', password: 'faculty123', dept: 'SE' },

  // DS Department Faculty
  { name: 'Dr. Fatima Tul Zahra', email: 'fatima.zahra@ucp.edu.pk', password: 'faculty123', dept: 'DS' },
  { name: 'Mr. Usman Tariq', email: 'usman.tariq@ucp.edu.pk', password: 'faculty123', dept: 'DS' },
  { name: 'Ms. Maryam Rafique', email: 'maryam.rafique@ucp.edu.pk', password: 'faculty123', dept: 'DS' },
  { name: 'Dr. Zahid Iqbal', email: 'zahid.iqbal@ucp.edu.pk', password: 'faculty123', dept: 'DS' },
  { name: 'Mr. Ali Raza Bhatti', email: 'ali.bhatti@ucp.edu.pk', password: 'faculty123', dept: 'DS' },
  { name: 'Ms. Iqra Shahid', email: 'iqra.shahid@ucp.edu.pk', password: 'faculty123', dept: 'DS' },

  // AI Department Faculty
  { name: 'Dr. Muhammad Rehan', email: 'muhammad.rehan@ucp.edu.pk', password: 'faculty123', dept: 'AI' },
  { name: 'Ms. Amna Shafiq', email: 'amna.shafiq@ucp.edu.pk', password: 'faculty123', dept: 'AI' },
  { name: 'Dr. Saad Ahmed', email: 'saad.ahmed@ucp.edu.pk', password: 'faculty123', dept: 'AI' },
  { name: 'Mr. Faisal Rehman', email: 'faisal.rehman@ucp.edu.pk', password: 'faculty123', dept: 'AI' },
  { name: 'Ms. Zara Khan', email: 'zara.khan@ucp.edu.pk', password: 'faculty123', dept: 'AI' },
  { name: 'Dr. Waqar Ahmad', email: 'waqar.ahmad@ucp.edu.pk', password: 'faculty123', dept: 'AI' },

  // CYS Department Faculty
  { name: 'Dr. Omer Riaz', email: 'omer.riaz@ucp.edu.pk', password: 'faculty123', dept: 'CYS' },
  { name: 'Mr. Hamza Khalid', email: 'hamza.khalid@ucp.edu.pk', password: 'faculty123', dept: 'CYS' },
  { name: 'Ms. Sana Fatima', email: 'sana.fatima@ucp.edu.pk', password: 'faculty123', dept: 'CYS' },
  { name: 'Dr. Arslan Shaukat', email: 'arslan.shaukat@ucp.edu.pk', password: 'faculty123', dept: 'CYS' },
  { name: 'Mr. Talha Mehmood', email: 'talha.mehmood@ucp.edu.pk', password: 'faculty123', dept: 'CYS' },
  { name: 'Ms. Huma Waseem', email: 'huma.waseem@ucp.edu.pk', password: 'faculty123', dept: 'CYS' }
]

export const sections = [
  // CS Sections - Semester 1
  { name: 'BSCS-1A', semester: 1, dept: 'CS', student_count: 50 },
  { name: 'BSCS-1B', semester: 1, dept: 'CS', student_count: 48 },
  { name: 'BSCS-1C', semester: 1, dept: 'CS', student_count: 45 },

  // CS Sections - Semester 2
  { name: 'BSCS-2A', semester: 2, dept: 'CS', student_count: 48 },
  { name: 'BSCS-2B', semester: 2, dept: 'CS', student_count: 46 },
  { name: 'BSCS-2C', semester: 2, dept: 'CS', student_count: 44 },

  // CS Sections - Semester 3
  { name: 'BSCS-3A', semester: 3, dept: 'CS', student_count: 47 },
  { name: 'BSCS-3B', semester: 3, dept: 'CS', student_count: 45 },
  { name: 'BSCS-3C', semester: 3, dept: 'CS', student_count: 43 },

  // CS Sections - Semester 4
  { name: 'BSCS-4A', semester: 4, dept: 'CS', student_count: 46 },
  { name: 'BSCS-4B', semester: 4, dept: 'CS', student_count: 44 },

  // CS Sections - Semester 5
  { name: 'BSCS-5A', semester: 5, dept: 'CS', student_count: 45 },
  { name: 'BSCS-5B', semester: 5, dept: 'CS', student_count: 43 },

  // CS Sections - Semester 6
  { name: 'BSCS-6A', semester: 6, dept: 'CS', student_count: 44 },
  { name: 'BSCS-6B', semester: 6, dept: 'CS', student_count: 42 },

  // CS Sections - Semester 7
  { name: 'BSCS-7A', semester: 7, dept: 'CS', student_count: 45 },
  { name: 'BSCS-7B', semester: 7, dept: 'CS', student_count: 42 },

  // CS Sections - Semester 8
  { name: 'BSCS-8A', semester: 8, dept: 'CS', student_count: 40 },
  { name: 'BSCS-8B', semester: 8, dept: 'CS', student_count: 38 },

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
