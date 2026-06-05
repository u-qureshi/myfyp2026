/**
 * UCP FOIT&CS – Complete faculty roster (Fall 2025)
 * Login: enter full name + password "faculty"
 */

const DEFAULT_PASSWORD = 'faculty'

const csFaculty = [
  { name: 'Dr. Muhammad Amjad Iqbal', designation: 'Dean, Faculty of Information Technology and Computer Science' },
  { name: 'Dr. Muhammad Sarwar Ehsan', designation: 'Associate Dean / Professor' },
  { name: 'Dr. Mohsin Ashraf', designation: 'Associate Professor & HOD CS' },
  { name: 'Dr. Abbas Khalid', designation: 'Professor / Associate Dean' },
  { name: 'Dr. Ahmad Shabbar Kazmi', designation: 'Professor' },
  { name: 'Dr. Saira Andleeb Gillani', designation: 'Professor' },
  { name: 'Liaquat Majeed Sheikh', designation: 'Associate Professor' },
  { name: 'Dr. Muhammad Umair', designation: 'Associate Professor (On Leave)' },
  { name: 'Dr. Rabia Tehseen', designation: 'Associate Professor' },
  { name: 'Dr. Syed Zulqadar Hassan', designation: 'Associate Professor' },
  { name: 'Asad Umar Khan', designation: 'Assistant Professor' },
  { name: 'Dr. Syed Tanweer Shah Bukhari', designation: 'Assistant Professor' },
  { name: 'Muhammad Mustafa Hassan', designation: 'Assistant Professor' },
  { name: 'Mohsin Abbas', designation: 'Assistant Professor' },
  { name: 'Dr. David Samuel Bhatti', designation: 'Assistant Professor' },
  { name: 'Major Faisal Masud Shaikh', designation: 'Assistant Professor' },
  { name: 'Mr. Sajid Hussain', designation: 'Assistant Professor' },
  { name: 'Dr. Syed Atif Mehdi', designation: 'Assistant Professor' },
  { name: 'Dr. Saeed Iqbal Khattak', designation: 'Assistant Professor' },
  { name: 'Awais Muhammad Lodhi', designation: 'Assistant Professor' },
  { name: 'Muhammad Usman Afzal', designation: 'Assistant Professor' },
  { name: 'Dr. Ghulam Mustafa', designation: 'Assistant Professor' },
  { name: 'Muhammad Irfan Anjum', designation: 'Assistant Professor' },
  { name: 'Dr. Salman Muneer', designation: 'Assistant Professor' },
  { name: 'Ms. Amna Mahmood', designation: 'Principal Lecturer' },
  { name: 'Fareeha Iqbal', designation: 'Principal Lecturer' },
  { name: 'Engr. Sajid Saleem', designation: 'Principal Lecturer' },
  { name: 'Muhammad Khurram Zahur Bajwa', designation: 'Principal Lecturer' },
  { name: 'Syed Nisar Ali', designation: 'Principal Lecturer' },
  { name: 'Sabah Arif', designation: 'Principal Lecturer' },
  { name: 'Noman Nazar', designation: 'Principal Lecturer' },
  { name: 'Muhammad Zulkifl Hasan', designation: 'Principal Lecturer' },
  { name: 'Muhammad Rehan Saleem', designation: 'Principal Lecturer' },
  { name: 'Syed Irtaza Muzaffar Shah', designation: 'Principal Lecturer' },
  { name: 'Malik Junaid Aziz', designation: 'Principal Lecturer' },
  { name: 'Shaukat Ali Chaudhry', designation: 'Principal Lecturer' },
  { name: 'Muhammad Umar Hameed', designation: 'Principal Lecturer' },
  { name: 'Mr. Usman Younas', designation: 'Principal Lecturer' },
  { name: 'Asim Raza', designation: 'Senior Lecturer' },
  { name: 'Haroon Ameen', designation: 'Senior Lecturer' },
  { name: 'Mahrukh Batool', designation: 'Senior Lecturer' },
  { name: 'Ali Abbas', designation: 'Senior Lecturer' },
  { name: 'Ayesha Zaheer', designation: 'Senior Lecturer' },
  { name: 'Numan Aslam', designation: 'Senior Lecturer' },
  { name: 'Misbah Naz', designation: 'Senior Lecturer' },
  { name: 'Ahmad Arslan', designation: 'Senior Lecturer' },
  { name: 'Sadia Aslam', designation: 'Senior Lecturer' },
  { name: 'Irfan Latif', designation: 'Senior Lecturer' },
  { name: 'Aneela Mehmood', designation: 'Senior Lecturer' },
  { name: 'Muhammad Kashif', designation: 'Senior Lecturer' },
  { name: 'Asif Farooq', designation: 'Senior Lecturer' },
  { name: 'Sidra Khalid', designation: 'Senior Lecturer' },
  { name: 'Muhammad Ammar Hassan', designation: 'Senior Lecturer' },
  { name: 'Faiza Khadim', designation: 'Senior Lecturer' },
  { name: 'Maria Nazir', designation: 'Senior Lecturer' },
  { name: 'Sheikh Daniyal Ahmed', designation: 'Senior Lecturer' },
  { name: 'Beenish Zafar', designation: 'Senior Lecturer' },
  { name: 'Muhammad Basit Ali Gilani', designation: 'Senior Lecturer' },
  { name: 'Syed Muhamamd Mujtaba Hassan', designation: 'Senior Lecturer' },
  { name: 'Muhammad Asif Haroon', designation: 'Senior Lecturer' },
  { name: 'Mr. Shoaib Khan', designation: 'Senior Lecturer' },
  { name: 'Muhammad Tauseef Hanif', designation: 'Senior Lecturer' },
  { name: 'Ms. Arshia Naeem', designation: 'Senior Lecturer' },
  { name: 'Hina Alam', designation: 'Senior Lecturer' },
  { name: 'Ali Raza', designation: 'Lecturer' },
  { name: 'Usman Ahmed Raza', designation: 'Lecturer' },
  { name: 'Muhammad Noman', designation: 'Lecturer' },
  { name: 'Usman Aamer', designation: 'Lecturer' },
  { name: 'Umer Arshad', designation: 'Lecturer' },
  { name: 'Mahek Kausar', designation: 'Lecturer' },
  { name: 'Hina Tahir', designation: 'Lecturer' },
  { name: 'Ihtisham-Ul-Haq', designation: 'Lecturer' },
  { name: 'Hafiz Bilal Shahid', designation: 'Lecturer' },
  { name: 'Aoun Aftab', designation: 'Lecturer' },
  { name: 'Imran Ahmad', designation: 'Lecturer' },
  { name: 'Sammra Habib', designation: 'Lecturer' },
  { name: 'Nasrullah Jaleel', designation: 'Lecturer' },
  { name: 'Misha Asif', designation: 'Lecturer' },
  { name: 'Sehar Ali', designation: 'Lecturer' },
  { name: 'Muneeb Ali Muzaffar', designation: 'Lecturer' },
  { name: 'Qaiser Habib', designation: 'Lecturer' },
  { name: 'Abdul Saboor Tamoor', designation: 'Lecturer' },
  { name: 'Annas Waseem Malik', designation: 'Lecturer' },
  { name: 'Hafiz Usama Ishtiaq', designation: 'Lecturer' },
  { name: 'Ms. Hira Tayyab', designation: 'Lecturer' },
  { name: 'Ms. Nadia Jehan', designation: 'Lecturer' },
  { name: 'Usama Nasir', designation: 'Lecturer' },
  { name: 'Maham Armaghan', designation: 'Lecturer' },
  { name: 'Zar Bakht Imtiaz', designation: 'Lecturer' },
  { name: 'Arooj Zahra', designation: 'Lecturer' },
  { name: 'Muhammad Bilal Khan', designation: 'Lecturer' },
  { name: 'Haris Ozair Ahmad', designation: 'Associate Lecturer' },
  { name: 'Ghazi Irfan', designation: 'Associate Lecturer' },
  { name: 'Ramsha Saeed', designation: 'Associate Lecturer' },
  { name: 'Nazish Ashfaq', designation: 'Associate Lecturer (On Leave)' },
  { name: 'Sahrish Ghafar', designation: 'Associate Lecturer' },
  { name: 'Aasma Abdul Waheed', designation: 'Associate Lecturer' },
  { name: 'Sawail Khan', designation: 'Associate Lecturer' },
  { name: 'Sibghatullah', designation: 'Associate Lecturer' },
  { name: 'Muhammad Orangzaib Khan', designation: 'Lab Instructor' },
  { name: 'Qaisar Aslam', designation: 'Lab Instructor' },
  { name: 'Waqas Ahmad', designation: 'Lab Instructor' },
  { name: 'Afham Nazir', designation: 'Lab Instructor' },
  { name: 'Hafiza Ayesha Nadeem', designation: 'Lab Instructor' },
  { name: 'Eman Nazir', designation: 'Lab Instructor' },
  { name: 'Fareena Atif', designation: 'Lab Instructor' },
  { name: 'Asad Ali Zakir', designation: 'Lab Instructor' },
  { name: 'Maha Muzammil', designation: 'Lab Instructor' },
  { name: 'Fraz Aslam', designation: 'Lab Instructor' },
  { name: 'Qaiser Nadeem', designation: 'Lab Instructor' },
  { name: 'Mohsin Akram', designation: 'Lab Instructor' },
  { name: 'Roha Irfan', designation: 'Lab Instructor' },
  { name: 'Muhammad Musa', designation: 'UPFP Fellow / Lab Instructor' },
  { name: 'Ms. Asna Abroo', designation: 'Lab Instructor' },
  { name: 'Ms. Hira Siddique', designation: 'Lab Instructor' },
  { name: 'Mr. Muhammad Ali Husnain', designation: 'Lab Instructor' },
  { name: 'Ms. Noor Fatima', designation: 'Lab Instructor' },
  { name: 'Ms. Sijal Fatima', designation: 'Lab Instructor' },
  { name: 'Muhammad Naeem Sabir', designation: 'Graphic Designer' }
]

const seFaculty = [
  { name: 'Dr. Imran Arshad Choudhry', designation: 'Associate Professor, HOD SE' },
  { name: 'Dr. Nauman Mazher', designation: 'Associate Professor' },
  { name: 'Dr. Mahfooz Ul Haque', designation: 'Professor' },
  { name: 'Dr. Nabeel Sabir Khan', designation: 'Associate Professor' },
  { name: 'Dr. Muhammad Adnan Aziz', designation: 'Associate Professor' },
  { name: 'Dr. Abdullah Yousafzai', designation: 'Associate Professor' },
  { name: 'Dr. Anam Mustaqeem', designation: 'Associate Professor' },
  { name: 'Dr. Ali Saeed', designation: 'Associate Professor' },
  { name: 'Haroon Abdul Waheed', designation: 'Assistant Professor' },
  { name: 'Dr. Adeel Arif', designation: 'Assistant Professor' },
  { name: 'Nabeela Khalid', designation: 'Principal Lecturer' },
  { name: 'Waseem Aslam', designation: 'Principal Lecturer' },
  { name: 'Mr. Zain Asghar', designation: 'Principal Lecturer' },
  { name: 'Abid Bashir', designation: 'Principal Lecturer' },
  { name: 'Shah Nawaz', designation: 'Principal Lecturer' },
  { name: 'Muhammad Zahid Hussain', designation: 'Principal Lecturer' },
  { name: 'Usman Akbar Chaudhary', designation: 'Principal Lecturer' },
  { name: 'Mohsin Sami', designation: 'Principal Lecturer' },
  { name: 'Imran Ashraf', designation: 'Principal Lecturer' },
  { name: 'Mr. Taimoor Hassan', designation: 'Principal Lecturer' },
  { name: 'Ms. Sidra Noureen', designation: 'Principal Lecturer' },
  { name: 'Ms. Zupash Awais', designation: 'Principal Lecturer' },
  { name: 'Hafiza Maria Kiran', designation: 'Senior Lecturer' },
  { name: 'Salah u din Ayubi', designation: 'Senior Lecturer' },
  { name: 'Afifa Hameed', designation: 'Senior Lecturer' },
  { name: 'Muhammad Tayyab Mir', designation: 'Senior Lecturer' },
  { name: 'Rubab Javaid', designation: 'Senior Lecturer' },
  { name: 'Ali Haider Arif', designation: 'Senior Lecturer' },
  { name: 'Haider Sultan Ahad', designation: 'Senior Lecturer' },
  { name: 'Ahsan Azhar', designation: 'Senior Lecturer' },
  { name: 'Seher Zia', designation: 'Senior Lecturer' },
  { name: 'Sarah Javed', designation: 'Senior Lecturer' },
  { name: 'Muhammad Fiaz Mustafa', designation: 'Senior Lecturer' },
  { name: 'Muhammad Shakeel', designation: 'Senior Lecturer' },
  { name: 'Ms. Maham Meher', designation: 'Senior Lecturer' },
  { name: 'Ms. Hira Asim', designation: 'Senior Lecturer' },
  { name: 'Tehreem Rai', designation: 'Lecturer' },
  { name: 'Madiha Yousaf Malik', designation: 'Lecturer' },
  { name: 'Saira Latif', designation: 'Lecturer' },
  { name: 'Areesha Sajjad', designation: 'Lecturer' },
  { name: 'Laraib Imran', designation: 'Lecturer' },
  { name: 'Maham Noor', designation: 'Lecturer' },
  { name: 'Rida Maryam', designation: 'Lecturer' },
  { name: 'Khizer Hayat', designation: 'Lecturer' },
  { name: 'Hira Naveed', designation: 'Lecturer' },
  { name: 'Iqra Tahir', designation: 'Lecturer' },
  { name: 'Mubashra Anwar', designation: 'Lecturer' },
  { name: 'Wishal Arshad', designation: 'Lecturer' },
  { name: 'Lalaen Sultan', designation: 'Associate Lecturer' },
  { name: 'M Usman Bhatti', designation: 'Associate Lecturer' },
  { name: 'Zainab Saeed', designation: 'Lab Instructor' },
  { name: 'Javaria Tanveer', designation: 'Lab Instructor' },
  { name: 'Abid Fareed', designation: 'Lab Instructor' },
  { name: 'Misha', designation: 'Lab Instructor' },
  { name: 'Iqra Javaid', designation: 'Lab Instructor' },
  { name: 'Danish Ali Khan', designation: 'Lab Instructor' },
  { name: 'Amina Tahir', designation: 'Lab Instructor' },
  { name: 'Shehar Zaad', designation: 'Lab Instructor' },
  { name: 'Muhammad Abdul Rehman', designation: 'Lab Instructor' },
  { name: 'Nafay Ahmad', designation: 'Lab Instructor' },
  { name: 'Mr. Muhammad Sufiyan', designation: 'Lab Instructor' }
]

const actFaculty = [
  { name: 'Dr. Kashif Nasr', designation: 'Assistant Professor, Head of Department (ACT)' },
  { name: 'Dr. Naveed Hussain', designation: 'Professor' },
  { name: 'Dr. Rabbia Alamdar', designation: 'Assistant Professor' },
  { name: 'Dr. Sehrish Aqeel', designation: 'Assistant Professor' },
  { name: 'Mr. Waqas Ali', designation: 'Principal Lecturer' },
  { name: 'Mr. Zishan Hussain Chuhan', designation: 'Principal Lecturer' },
  { name: 'Mr. Ather Suleman', designation: 'Principal Lecturer' },
  { name: 'Mr. Sheikh Babar Hameed', designation: 'Principal Lecturer' },
  { name: 'Ms. Syeda Tayyaba Bukhari', designation: 'Senior Lecturer' },
  { name: 'Ms. Sarah Ilyas', designation: 'Senior Lecturer' },
  { name: 'Mr. Jawad Hassan', designation: 'Senior Lecturer' },
  { name: 'Ms. Iqra Ashraf', designation: 'Senior Lecturer' },
  { name: 'Ms. Ayesha Majid', designation: 'Senior Lecturer' },
  { name: 'Mr. Umar Rana', designation: 'Senior Lecturer' },
  { name: 'Ms. Rabia Mehmood', designation: 'Lecturer' },
  { name: 'Ms. Iqra Tariq', designation: 'Lecturer' },
  { name: 'Mr. Faraz Ali', designation: 'Lecturer' },
  { name: 'Ms. Sumra Fayyaz', designation: 'Lecturer' },
  { name: 'Mr. Syed Atir Raza Shirazi', designation: 'Lecturer' },
  { name: 'Mr. Muhammad Yasin Nasir', designation: 'Lecturer' },
  { name: 'Ms. Madiha Ijaz', designation: 'Associate Lecturer' },
  { name: 'Mr. Muhammad Rizwan', designation: 'Associate Lecturer' },
  { name: 'Ms. Maida Sajid', designation: 'Associate Lecturer' },
  { name: 'Ms. Khadija Moazzam', designation: 'Lab Instructor' },
  { name: 'Ms. Sadia Inam Ul Haq', designation: 'Lab Instructor' },
  { name: 'Ms. Nukhba Shawal', designation: 'Lab Instructor' },
  { name: 'Mr. Hamza Muneer', designation: 'Lab Instructor' },
  { name: 'Ms. Kainat Ijaz', designation: 'Lab Instructor' },
  { name: 'Mr. Chudhary Muhammad Owais', designation: 'Lab Instructor' },
  { name: 'Muhammad Moiz Khan', designation: 'Lab Instructor' },
  { name: 'Ms. Faria Fawad', designation: 'Lab Instructor' }
]

const departmentLabels = {
  CS: 'Department of Computer Science',
  SE: 'Department of Software Engineering',
  AI: 'Department of ACT (AI, Data Science, Cybersecurity)',
  DS: 'Department of Data Science',
  CYS: 'Department of Cyber Security'
}

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/^(dr\.?|mr\.?|ms\.?|engr\.?|major|hafiz(?:a)?)\.?\s+/gi, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/^(dr|mr|ms|engr|major|hafiz|hafiza)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildFacultyRecords(entries, dept) {
  const slugCounts = {}

  return entries.map((entry) => {
    const baseSlug = slugifyName(entry.name) || `faculty.${dept.toLowerCase()}`
    slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1
    const suffix = slugCounts[baseSlug] > 1 ? `.${slugCounts[baseSlug]}` : ''

    return {
      name: entry.name,
      designation: entry.designation,
      dept,
      department_name: departmentLabels[dept] || dept,
      email: `${baseSlug}${suffix}@ucp.edu.pk`,
      password: DEFAULT_PASSWORD
    }
  })
}

export const facultyMembers = [
  ...buildFacultyRecords(csFaculty, 'CS'),
  ...buildFacultyRecords(seFaculty, 'SE'),
  ...buildFacultyRecords(actFaculty, 'AI')
]

export const facultyByEmail = Object.fromEntries(
  facultyMembers.map((member) => [member.email.toLowerCase(), member])
)

export const facultyByNormalizedName = Object.fromEntries(
  facultyMembers.map((member) => [normalizeName(member.name), member])
)

/** Find faculty metadata by login identifier (email or full name). */
export function findFacultyByLoginIdentifier(identifier) {
  const value = String(identifier || '').trim()
  if (!value) return null

  if (value.includes('@')) {
    return facultyByEmail[value.toLowerCase()] || null
  }

  const normalized = normalizeName(value)
  const exact = facultyByNormalizedName[normalized]
  if (exact) return exact

  const partialMatches = facultyMembers.filter((member) =>
    normalizeName(member.name).includes(normalized)
  )

  if (partialMatches.length === 1) return partialMatches[0]

  return (
    partialMatches.find((member) => normalizeName(member.name) === normalized) ||
    partialMatches[0] ||
    null
  )
}

export function getFacultyMetadata({ email, name }) {
  if (email && facultyByEmail[email.toLowerCase()]) {
    return facultyByEmail[email.toLowerCase()]
  }
  if (name) {
    return facultyByNormalizedName[normalizeName(name)] || null
  }
  return null
}

export { DEFAULT_PASSWORD as FACULTY_DEFAULT_PASSWORD, normalizeName }
