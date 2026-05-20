// BSIT Curriculum Data - USC Prospectus (Effective 2023)
// Status types: 'locked' | 'available' | 'enrolled' | 'passed' | 'failed'

export const subjects = {
  // ─────────────────────────────────────────
  // YEAR 1 - 1ST SEMESTER
  // ─────────────────────────────────────────
  CIS1101: {
    code: "CIS 1101",
    name: "Programming I",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  CIS1102N: {
    code: "CIS 1102N",
    name: "Introduction to Computing",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  CIS1103: {
    code: "CIS 1103",
    name: "Discrete Structures I",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  CIS1104: {
    code: "CIS 1104",
    name: "Human-Computer Interaction",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },

  // ─────────────────────────────────────────
  // YEAR 1 - 2ND SEMESTER
  // ─────────────────────────────────────────
  CIS1201: {
    code: "CIS 1201",
    name: "Programming II",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS1101"],
  },
  CIS1202: {
    code: "CIS 1202",
    name: "Web Development I",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS1101", "CIS1104"],
  },
  CIS1204: {
    code: "CIS 1204",
    name: "Information Management I",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS1101"],
  },
  CIS1205: {
    code: "CIS 1205",
    name: "Networking I",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS1102N"],
  },
  IT3106: {
    code: "IT 3106",
    name: "Accounting for IT",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS1102N"],
  },

  // ─────────────────────────────────────────
  // YEAR 1 - SUMMER
  // ─────────────────────────────────────────
  CIS2104: {
    code: "CIS 2104",
    name: "Information Management II",
    units: 3,
    year: 1,
    sem: 3, // 3 = Summer
    prerequisites: ["CIS1204"],
  },
  CIS2201: {
    code: "CIS 2201",
    name: "Systems Analysis and Design",
    units: 3,
    year: 1,
    sem: 3,
    prerequisites: ["CIS1204"],
  },
  CIS2202: {
    code: "CIS 2202",
    name: "Digital Logic Design and Digital Computer Circuits",
    units: 3,
    year: 1,
    sem: 3,
    prerequisites: ["CIS1102N"],
  },

  // ─────────────────────────────────────────
  // YEAR 2 - 1ST SEMESTER
  // ─────────────────────────────────────────
  CIS2101: {
    code: "CIS 2101",
    name: "Data Structures and Algorithms",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS1201"],
  },
  CIS2103: {
    code: "CIS 2103",
    name: "Object-Oriented Programming",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS1201"],
  },
  CIS2105: {
    code: "CIS 2105",
    name: "Networking II",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS1205"],
  },
  IT3101N: {
    code: "IT 3101N",
    name: "Platform Technologies",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS1202"],
  },
  IT3107: {
    code: "IT 3107",
    name: "Fundamentals of Data Warehousing and Data Mining",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS2104"],
  },
  IT4104: {
    code: "IT 4104",
    name: "Linux Operating System",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS1205"],
  },

  // ─────────────────────────────────────────
  // YEAR 2 - 2ND SEMESTER
  // ─────────────────────────────────────────
  CIS2203N: {
    code: "CIS 2203N",
    name: "Mobile Development",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["CIS1201", "CIS1202"],
  },
  IT3102N: {
    code: "IT 3102N",
    name: "Probability and Statistics",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["CIS1103"],
  },
  IT3103A: {
    code: "IT 3103A",
    name: "Systems Integration and Architecture",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["CIS1205", "CIS2104"],
  },
  IT3202N: {
    code: "IT 3202N",
    name: "Software Quality Assurance",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["CIS2101", "CIS2104"],
  },

  // ─────────────────────────────────────────
  // YEAR 2 - SUMMER
  // ─────────────────────────────────────────
  IT3104A: {
    code: "IT 3104A",
    name: "Information Assurance and Security",
    units: 3,
    year: 2,
    sem: 3,
    prerequisites: ["CIS1205"],
  },
  IT3201N: {
    code: "IT 3201N",
    name: "Capstone Project I",
    units: 3,
    year: 2,
    sem: 3,
    prerequisites: ["IT3103A", "IT3202N"],
  },
  IT3204N: {
    code: "IT 3204N",
    name: "Research Methods in Computing",
    units: 3,
    year: 2,
    sem: 3,
    prerequisites: ["CIS2201"],
  },

  // ─────────────────────────────────────────
  // YEAR 3 - 1ST SEMESTER
  // ─────────────────────────────────────────
  IT3105N: {
    code: "IT 3105N",
    name: "Application Development and Emerging Technologies",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["CIS2203N"],
  },
  IT3203N: {
    code: "IT 3203N",
    name: "Quantitative Methods",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["IT3204N"],
  },
  IT3206N: {
    code: "IT 3206N",
    name: "Integrative Programming and Technology",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["CIS2101"],
  },
  IT4102N: {
    code: "IT 4102N",
    name: "Practicum 1",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["CIS2101", "CIS2104", "IT3101N", "IT3103A"],
  },
  IT4201: {
    code: "IT 4201",
    name: "Systems Administration and Maintenance",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["CIS2105", "IT3101N"],
  },

  // ─────────────────────────────────────────
  // YEAR 3 - 2ND SEMESTER
  // ─────────────────────────────────────────
  CIS2204: {
    code: "CIS 2204",
    name: "Technopreneurship",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: [],
  },
  CIS2206N: {
    code: "CIS 2206N",
    name: "Programming NC IV",
    units: 1,
    year: 3,
    sem: 2,
    prerequisites: [], // 3rd year standing
    yearStanding: 3,
  },
  IT3205: {
    code: "IT 3205",
    name: "Social and Professional Issues",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: [],
  },
  IT4101: {
    code: "IT 4101",
    name: "Capstone Project II",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: ["IT3201N", "IT3203N"],
  },
  IT4103: {
    code: "IT 4103",
    name: "Seminars and Tours",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: [], // 3rd year standing
    yearStanding: 3,
  },
  IT4202N: {
    code: "IT 4202N",
    name: "Practicum 2",
    units: 6,
    year: 3,
    sem: 2,
    prerequisites: ["IT4102N"],
  },
};

// Semester display labels
export const semesterLabels = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

// Group subjects by year and semester for list view
export function getCurriculumByYearSem() {
  const grouped = {};
  for (const [key, subject] of Object.entries(subjects)) {
    const groupKey = `Y${subject.year}S${subject.sem}`;
    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        year: subject.year,
        sem: subject.sem,
        label: `Year ${subject.year} - ${semesterLabels[subject.sem]}`,
        subjects: [],
      };
    }
    grouped[groupKey].subjects.push({ key, ...subject });
  }
  // Sort by year then sem
  return Object.values(grouped).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.sem - b.sem
  );
}

// Get all subjects that depend on a given subject (downstream)
export function getDependents(subjectKey) {
  return Object.entries(subjects)
    .filter(([, s]) => s.prerequisites.includes(subjectKey))
    .map(([key]) => key);
}