/**
 * UCP BS Computer Science – Fall 2025 official curriculum
 * Each subject: code, name, credit_hours, semester, sections, category, courseGroup
 *
 * Semester load rule: max 5 course units, max 18 credit hours
 * Upper semesters (5–8): 3 compulsory + 1 university elective + 1 CS elective
 * Labs share a courseGroup with theory and count as the same course unit.
 */

export const csSubjects = [
  // Semester 1
  { code: 'CP103', name: 'Introduction to Computing', credit_hours: 3, semester: 1, dept: 'CS', sections: 25, category: 'compulsory', courseGroup: 'CP103' },
  { code: 'CP101', name: 'Introduction to Computing - Lab', credit_hours: 1, semester: 1, dept: 'CS', sections: 25, category: 'compulsory', courseGroup: 'CP103', isLab: true },
  { code: 'GE102', name: 'Basic Electronics', credit_hours: 2, semester: 1, dept: 'CS', sections: 25, category: 'compulsory', courseGroup: 'GE102' },
  { code: 'GE101', name: 'Basic Electronics - Lab', credit_hours: 1, semester: 1, dept: 'CS', sections: 25, category: 'compulsory', courseGroup: 'GE102', isLab: true },
  { code: 'ENG110', name: 'Functional English', credit_hours: 3, semester: 1, dept: 'CS', sections: 25, category: 'compulsory', courseGroup: 'ENG110' },
  { code: 'PAK102', name: 'Ideology and Constitution of Pakistan', credit_hours: 2, semester: 1, dept: 'CS', sections: 25, category: 'compulsory', courseGroup: 'PAK102' },
  { code: 'AL143', name: 'Discrete Structures', credit_hours: 3, semester: 1, dept: 'CS', sections: 25, category: 'compulsory', courseGroup: 'AL143' },
  { code: 'MAT103', name: 'Pre-Calculus', credit_hours: 3, semester: 1, dept: 'CS', sections: 7, category: 'compulsory', courseGroup: 'MAT103' },

  // Semester 2
  { code: 'CP113', name: 'Programming Fundamentals', credit_hours: 3, semester: 2, dept: 'CS', sections: 4, category: 'compulsory', courseGroup: 'CP113' },
  { code: 'CP111', name: 'Programming Fundamentals - Lab', credit_hours: 1, semester: 2, dept: 'CS', sections: 4, category: 'compulsory', courseGroup: 'CP113', isLab: true },
  { code: 'AR102', name: 'Digital Logic and Design', credit_hours: 2, semester: 2, dept: 'CS', sections: 4, category: 'compulsory', courseGroup: 'AR102' },
  { code: 'AR101', name: 'Digital Logic and Design - Lab', credit_hours: 1, semester: 2, dept: 'CS', sections: 4, category: 'compulsory', courseGroup: 'AR102', isLab: true },
  { code: 'ENG211', name: 'Expository Writing', credit_hours: 3, semester: 2, dept: 'CS', sections: 4, category: 'compulsory', courseGroup: 'ENG211' },
  { code: 'MAT113', name: 'Calculus and Analytical Geometry', credit_hours: 3, semester: 2, dept: 'CS', sections: 4, category: 'compulsory', courseGroup: 'MAT113' },
  { code: 'CCE201', name: 'Civics and Community Engagement', credit_hours: 2, semester: 2, dept: 'CS', sections: 4, category: 'compulsory', courseGroup: 'CCE201' },
  { code: 'MAT123', name: 'Elementary Algebra', credit_hours: 3, semester: 2, dept: 'CS', sections: 1, category: 'compulsory', courseGroup: 'MAT123' },

  // Semester 3
  { code: 'CP223', name: 'Object Oriented Programming', credit_hours: 3, semester: 3, dept: 'CS', sections: 21, category: 'compulsory', courseGroup: 'CP223' },
  { code: 'CP221', name: 'Object Oriented Programming Lab', credit_hours: 1, semester: 3, dept: 'CS', sections: 21, category: 'compulsory', courseGroup: 'CP223', isLab: true },
  { code: 'AR223', name: 'Computer Organization & Assembly Language', credit_hours: 3, semester: 3, dept: 'CS', sections: 21, category: 'compulsory', courseGroup: 'AR223' },
  { code: 'AR221', name: 'Computer Organization & Assembly Language Lab', credit_hours: 1, semester: 3, dept: 'CS', sections: 21, category: 'compulsory', courseGroup: 'AR223', isLab: true },
  { code: 'MAT243', name: 'Multivariate Calculus', credit_hours: 3, semester: 3, dept: 'CS', sections: 21, category: 'compulsory', courseGroup: 'MAT243' },
  { code: 'SEP203', name: 'Professional Practices', credit_hours: 3, semester: 3, dept: 'CS', sections: 21, category: 'compulsory', courseGroup: 'SEP203' },
  { code: 'ENT102', name: 'Entrepreneurship', credit_hours: 2, semester: 3, dept: 'CS', sections: 21, category: 'uni_elective', courseGroup: 'ENT102' },
  { code: 'MAT253', name: 'Probability & Statistics', credit_hours: 3, semester: 3, dept: 'CS', sections: 21, category: 'compulsory', courseGroup: 'MAT253' },

  // Semester 4
  { code: 'CP233', name: 'Data Structures', credit_hours: 3, semester: 4, dept: 'CS', sections: 5, category: 'compulsory', courseGroup: 'CP233' },
  { code: 'CP231', name: 'Data Structures - Lab', credit_hours: 1, semester: 4, dept: 'CS', sections: 5, category: 'compulsory', courseGroup: 'CP233', isLab: true },
  { code: 'DB203', name: 'Database Systems', credit_hours: 3, semester: 4, dept: 'CS', sections: 5, category: 'compulsory', courseGroup: 'DB203' },
  { code: 'DB201', name: 'Database Systems - Lab', credit_hours: 1, semester: 4, dept: 'CS', sections: 5, category: 'compulsory', courseGroup: 'DB203', isLab: true },
  { code: 'SE203', name: 'Software Engineering', credit_hours: 3, semester: 4, dept: 'CS', sections: 5, category: 'compulsory', courseGroup: 'SE203' },
  { code: 'MAT233', name: 'Linear Algebra', credit_hours: 3, semester: 4, dept: 'CS', sections: 5, category: 'cs_elective', courseGroup: 'MAT233' },
  { code: 'ISL201', name: 'Islamic Studies', credit_hours: 2, semester: 4, dept: 'CS', sections: 5, category: 'uni_elective', courseGroup: 'ISL201' },
  { code: 'SS102', name: 'Fundamentals of Psychology', credit_hours: 3, semester: 4, dept: 'CS', sections: 3, category: 'uni_elective', courseGroup: 'SS102' },
  { code: 'SS202', name: 'Introduction to Economics', credit_hours: 3, semester: 4, dept: 'CS', sections: 2, category: 'uni_elective', courseGroup: 'SS202' },

  // Semester 5
  { code: 'CSCS3553', name: 'Operating Systems (Theory)', credit_hours: 3, semester: 5, dept: 'CS', sections: 17, category: 'compulsory', courseGroup: 'CSCS3553' },
  { code: 'CSCS3551', name: 'Operating Systems - Lab', credit_hours: 1, semester: 5, dept: 'CS', sections: 17, category: 'compulsory', courseGroup: 'CSCS3553', isLab: true },
  { code: 'CSSE3113', name: 'Introduction to Software Engineering I', credit_hours: 3, semester: 5, dept: 'CS', sections: 17, category: 'compulsory', courseGroup: 'CSSE3113' },
  { code: 'CSAL3233', name: 'Design and Analysis of Algorithm', credit_hours: 3, semester: 5, dept: 'CS', sections: 17, category: 'compulsory', courseGroup: 'CSAL3233' },
  { code: 'CSSS2763', name: 'Differential Equation', credit_hours: 3, semester: 5, dept: 'CS', sections: 17, category: 'uni_elective', courseGroup: 'CSSS2763' },
  { code: 'CSSE3143', name: 'Web Application Development', credit_hours: 3, semester: 5, dept: 'CS', sections: 5, category: 'cs_elective', courseGroup: 'CSSE3143' },
  { code: 'CSCP3063', name: 'Mobile Application Development', credit_hours: 3, semester: 5, dept: 'CS', sections: 4, category: 'cs_elective', courseGroup: 'CSCP3063' },
  { code: 'CSAL3203', name: 'Introduction to Image Processing', credit_hours: 3, semester: 5, dept: 'CS', sections: 4, category: 'cs_elective', courseGroup: 'CSAL3203' },
  { code: 'CSST3633', name: 'Game Development', credit_hours: 3, semester: 5, dept: 'CS', sections: 4, category: 'cs_elective', courseGroup: 'CSST3633' },

  // Semester 6
  { code: 'CSAL3243', name: 'Artificial Intelligence (Theory)', credit_hours: 3, semester: 6, dept: 'CS', sections: 7, category: 'compulsory', courseGroup: 'CSAL3243' },
  { code: 'CSAL3241', name: 'Artificial Intelligence - Lab', credit_hours: 1, semester: 6, dept: 'CS', sections: 7, category: 'compulsory', courseGroup: 'CSAL3243', isLab: true },
  { code: 'CSNC2413', name: 'Computer Communications and Networks (Theory)', credit_hours: 3, semester: 6, dept: 'CS', sections: 7, category: 'compulsory', courseGroup: 'CSNC2413' },
  { code: 'CSNC2411', name: 'Computer Communications and Networks - Lab', credit_hours: 1, semester: 6, dept: 'CS', sections: 7, category: 'compulsory', courseGroup: 'CSNC2413', isLab: true },
  { code: 'CSAL3253', name: 'Theory of Automata (TOA)', credit_hours: 3, semester: 6, dept: 'CS', sections: 7, category: 'compulsory', courseGroup: 'CSAL3253' },
  { code: 'CSSS2743', name: 'Probability and Statistics', credit_hours: 3, semester: 6, dept: 'CS', sections: 7, category: 'uni_elective', courseGroup: 'CSSS2743' },
  { code: 'CSDS4473', name: 'Big Data Analytics', credit_hours: 3, semester: 6, dept: 'CS', sections: 3, category: 'cs_elective', courseGroup: 'CSDS4473' },
  { code: 'CSAL4323', name: '3D Computer Graphics', credit_hours: 3, semester: 6, dept: 'CS', sections: 1, category: 'cs_elective', courseGroup: 'CSAL4323' },
  { code: 'CSNC3453', name: 'Introduction to Cloud Computing', credit_hours: 3, semester: 6, dept: 'CS', sections: 3, category: 'cs_elective', courseGroup: 'CSNC3453' },

  // Semester 7
  { code: 'CSNC3413', name: 'Information Security (ISEC)', credit_hours: 3, semester: 7, dept: 'CS', sections: 15, category: 'compulsory', courseGroup: 'CSNC3413' },
  { code: 'CSCS4573', name: 'Compiler Construction (CC)', credit_hours: 3, semester: 7, dept: 'CS', sections: 15, category: 'compulsory', courseGroup: 'CSCS4573' },
  { code: 'CSAL4263', name: 'Numerical Computing (NM)', credit_hours: 3, semester: 7, dept: 'CS', sections: 15, category: 'uni_elective', courseGroup: 'CSAL4263' },
  { code: 'CSSE4173', name: 'Final Year Project I (FYP-I)', credit_hours: 3, semester: 7, dept: 'CS', sections: 1, category: 'compulsory', courseGroup: 'CSSE4173' },
  { code: 'CSMG3943', name: 'Organizational Behavior and Culture (OBC)', credit_hours: 3, semester: 7, dept: 'CS', sections: 8, category: 'uni_elective', courseGroup: 'CSMG3943' },
  { code: 'CSMG2913', name: 'Technology Entrepreneurship (TENT)', credit_hours: 3, semester: 7, dept: 'CS', sections: 7, category: 'uni_elective', courseGroup: 'CSMG2913' },
  { code: 'CSDB4313', name: 'Introduction to Data Science (IDS)', credit_hours: 3, semester: 7, dept: 'CS', sections: 5, category: 'cs_elective', courseGroup: 'CSDB4313' },
  { code: 'CSAL4243', name: 'Introduction to Machine Learning', credit_hours: 3, semester: 7, dept: 'CS', sections: 5, category: 'cs_elective', courseGroup: 'CSAL4243' },
  { code: 'CSAL4253', name: 'Introduction to Natural Language Processing', credit_hours: 3, semester: 7, dept: 'CS', sections: 5, category: 'cs_elective', courseGroup: 'CSAL4253' },

  // Semester 8
  { code: 'CSGE4963', name: 'Professional Practices (PP)', credit_hours: 3, semester: 8, dept: 'CS', sections: 7, category: 'compulsory', courseGroup: 'CSGE4963' },
  { code: 'CSCS2543', name: 'Parallel and Distributed Computing', credit_hours: 3, semester: 8, dept: 'CS', sections: 7, category: 'compulsory', courseGroup: 'CSCS2543' },
  { code: 'CSSE4183', name: 'Final Year Project II (FYP-II)', credit_hours: 3, semester: 8, dept: 'CS', sections: 1, category: 'compulsory', courseGroup: 'CSSE4183' },
  { code: 'CSHU4213', name: 'Business Law', credit_hours: 3, semester: 8, dept: 'CS', sections: 3, category: 'uni_elective', courseGroup: 'CSHU4213' },
  { code: 'CSMG4913', name: 'Fundamentals of Enterprise Resource Planning', credit_hours: 3, semester: 8, dept: 'CS', sections: 2, category: 'uni_elective', courseGroup: 'CSMG4913' },
  { code: 'CSHU3873', name: 'Speak Well - English Conversation', credit_hours: 3, semester: 8, dept: 'CS', sections: 2, category: 'uni_elective', courseGroup: 'CSHU3873' },
  { code: 'CSNC4403', name: 'Introduction to Cryptography', credit_hours: 3, semester: 8, dept: 'CS', sections: 2, category: 'cs_elective', courseGroup: 'CSNC4403' },
  { code: 'CSAL4333', name: 'Introduction to Deep Learning', credit_hours: 3, semester: 8, dept: 'CS', sections: 2, category: 'cs_elective', courseGroup: 'CSAL4333' },
  { code: 'CSSE4193', name: 'Software Testing', credit_hours: 3, semester: 8, dept: 'CS', sections: 3, category: 'cs_elective', courseGroup: 'CSSE4193' }
]

/** Per-semester selection: 3 compulsory course groups + 1 uni + 1 CS elective (sem 5–8). */
export const csSemesterSelectionRules = {
  1: {
    type: 'fixed',
    courseGroups: ['CP103', 'GE102', 'ENG110', 'PAK102', 'AL143'],
    conditional: [{ ifSectionIndexLte: 7, replace: { AL143: 'MAT103' } }]
  },
  2: {
    type: 'fixed',
    courseGroups: ['CP113', 'AR102', 'ENG211', 'MAT113', 'CCE201'],
    conditional: [{ ifSectionIndexLte: 1, replace: { CCE201: 'MAT123' } }]
  },
  3: {
    type: 'fixed',
    courseGroups: ['CP223', 'AR223', 'MAT243', 'SEP203', 'MAT253']
  },
  4: {
    type: 'elective',
    compulsoryGroups: ['CP233', 'DB203', 'SE203'],
    uniElectiveGroups: ['ISL201', 'SS102', 'SS202'],
    csElectiveGroups: ['MAT233']
  },
  5: {
    type: 'elective',
    compulsoryGroups: ['CSCS3553', 'CSAL3233', 'CSSE3113'],
    uniElectiveGroups: ['CSSS2763'],
    csElectiveGroups: ['CSSE3143', 'CSCP3063', 'CSAL3203', 'CSST3633']
  },
  6: {
    type: 'elective',
    compulsoryGroups: ['CSAL3243', 'CSNC2413', 'CSAL3253'],
    uniElectiveGroups: ['CSSS2743'],
    csElectiveGroups: ['CSDS4473', 'CSNC3453', 'CSAL4323']
  },
  7: {
    type: 'elective',
    compulsoryGroups: ['CSNC3413', 'CSCS4573', 'CSSE4173'],
    uniElectiveGroups: ['CSAL4263', 'CSMG3943', 'CSMG2913'],
    csElectiveGroups: ['CSDB4313', 'CSAL4243', 'CSAL4253']
  },
  8: {
    type: 'elective',
    compulsoryGroups: ['CSGE4963', 'CSCS2543', 'CSSE4183'],
    uniElectiveGroups: ['CSHU4213', 'CSHU3873', 'CSMG4913'],
    csElectiveGroups: ['CSNC4403', 'CSAL4333', 'CSSE4193']
  }
}

export const csSubjectSemesterByCode = Object.fromEntries(
  csSubjects.map((subject) => [subject.code, subject.semester])
)

export const csSubjectMetaByCode = Object.fromEntries(
  csSubjects.map((subject) => [subject.code, subject])
)

export function getCsSubjectsForSemester(semester) {
  const semNum = parseInt(semester, 10)
  return csSubjects.filter((subject) => subject.semester === semNum)
}

/** Pick one elective code from a pool based on section index and offering capacity. */
export function pickElectiveBySection(options, sectionIndex, csMetaByCode = csSubjectMetaByCode) {
  const available = (options || []).filter((code) => {
    const meta = csMetaByCode[code]
    if (!meta) return false
    return sectionIndex <= (meta.sections || 1)
  })

  if (!available.length) return null
  return available[(sectionIndex - 1) % available.length]
}

/** Resolve course group codes for a CS section (includes paired labs). */
export function resolveCsCourseGroupsForSection(semester, sectionIndex) {
  const semNum = parseInt(semester, 10)
  const rules = csSemesterSelectionRules[semNum]
  if (!rules) return []

  if (rules.type === 'fixed') {
    let groups = [...rules.courseGroups]
    for (const condition of rules.conditional || []) {
      if (sectionIndex <= condition.ifSectionIndexLte) {
        for (const [from, to] of Object.entries(condition.replace || {})) {
          groups = groups.map((group) => (group === from ? to : group))
        }
      }
    }
    return groups
  }

  const compulsory = [...(rules.compulsoryGroups || [])]
  const uni = pickElectiveBySection(rules.uniElectiveGroups, sectionIndex)
  const cs = pickElectiveBySection(rules.csElectiveGroups, sectionIndex)

  if (uni) compulsory.push(uni)
  if (cs) compulsory.push(cs)

  return compulsory.slice(0, 5)
}

/** All subject codes (theory + labs) scheduled for one CS section. */
export function resolveCsSubjectCodesForSection(semester, sectionIndex) {
  const groups = resolveCsCourseGroupsForSection(semester, sectionIndex)
  const semNum = parseInt(semester, 10)
  const semesterSubjects = csSubjects.filter((subject) => subject.semester === semNum)
  const selected = []

  groups.forEach((group) => {
    semesterSubjects
      .filter((subject) => subject.courseGroup === group)
      .forEach((subject) => selected.push(subject.code))
  })

  return selected
}

export function generateCsSections() {
  const maxSectionsBySemester = {}

  csSubjects.forEach((subject) => {
    maxSectionsBySemester[subject.semester] = Math.max(
      maxSectionsBySemester[subject.semester] || 0,
      subject.sections || 1
    )
  })

  const sections = []
  for (let semester = 1; semester <= 8; semester++) {
    const count = maxSectionsBySemester[semester] || 1
    for (let i = 1; i <= count; i++) {
      sections.push({
        name: `BSCS-${semester}-${String(i).padStart(2, '0')}`,
        semester,
        dept: 'CS',
        student_count: 25
      })
    }
  }

  return sections
}

export function getCoreSubjectsForSemester(semester) {
  const semNum = parseInt(semester, 10)
  const semesterSubjects = csSubjects.filter((s) => s.semester === semNum)
  if (semesterSubjects.length === 0) return []

  const maxSections = Math.max(...semesterSubjects.map((s) => s.sections || 1))
  return semesterSubjects.filter((s) => (s.sections || 1) === maxSections)
}
