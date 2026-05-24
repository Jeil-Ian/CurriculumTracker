// BSIT Curriculum Data - USC Prospectus (Effective 2023)
// Status types: 'locked' | 'available' | 'enrolled' | 'passed' | 'failed'

export const subjects = {
  // ─────────────────────────────────────────
  // YEAR 1 - 1ST SEMESTER
  // ─────────────────────────────────────────
  "CIS 1101": {
    code: "CIS 1101",
    name: "PROGRAMMING I",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "CIS 1102N": {
    code: "CIS 1102N",
    name: "INTRODUCTION TO COMPUTING",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "CIS 1103": {
    code: "CIS 1103",
    name: "DISCRETE STRUCTURES I",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "CIS 1104": {
    code: "CIS 1104",
    name: "HUMAN-COMPUTER INTERACTION",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "EDM 1":{
    code: "EDM 1",
    name: "THE CAROLINIAN MISSIONARY",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "GE-MMW":{
    code: "GE-MMW",
    name: "MATHEMATICS IN THE MODERN WORLD",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "GE-PC":{
    code: "GE-PC",
    name: "PURPOSIVE COMMUNICATION",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "GE-UTS":{
    code: "GE-UTS",
    name: "UNDERSTANDING THE SELF",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "NSTP 1":{
    code: "NSTP 1",
    name: "NATIONAL SERVICE TRAINING PROGRAM 1",
    units: 3,
    year: 1,
    sem: 1,
    prerequisites: [],
  },
  "TPE 1101":{
    code: "TPE 1101",
    name: "PATH-FIT 1 - MOVEMENT ENHANCEMENT",
    units: 2,
    year: 1,
    sem: 1,
    prerequisites: [],
  },

  // ─────────────────────────────────────────
  // YEAR 1 - 2ND SEMESTER
  // ─────────────────────────────────────────
  "CIS 1201": {
    code: "CIS 1201",
    name: "Programming II",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS 1101"],
  },
  "CIS 1202": {
    code: "CIS 1202",
    name: "Web Development I",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS 1101", "CIS 1104"],
  },
  "CIS 1204": {
    code: "CIS 1204",
    name: "Information Management I",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS 1101"],
  },
  "CIS 1205": {
    code: "CIS 1205",
    name: "Networking I",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS 1102N"],
  },
  "CIS 2106N":{
    code: "CIS 2106N",
    name: "COMPUTER HARDWARE SERVICING NC II",
    units: 1,
    year: 1,
    sem: 2,
    prerequisites: [], // 2nd year standing
  },
  "EDM 2":{
    code: "EDM 2",
    name: "THE MISSION OF THE PROPHETIC DIALOGUE",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["EDM 1"],
  },
  "GE-FREELEC 1":{
    code: "GE-FREELEC 1",
    name: "GENERAL EDUCATION FREE ELECTIVES 1",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: [],
  },
  "IT 3106": {
    code: "IT 3106",
    name: "Accounting for IT",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["CIS 1102N"],
  },
  "NSTP 2":{
    code: "NSTP 2",
    name: "NATIONAL SERVICE TRAINING PROGRAM 2",
    units: 3,
    year: 1,
    sem: 2,
    prerequisites: ["NSTP 1"],
  },
  "TPE 1202":{
    code: "TPE 1202",
    name: "PATH-FIT II - FITNESS EXERCISE",
    units: 2,
    year: 1,
    sem: 2,
    prerequisites: ["TPE 1101"],
  },

  // ─────────────────────────────────────────
  // YEAR 1 - SUMMER
  // ─────────────────────────────────────────
  "CIS 2104": {
    code: "CIS 2104",
    name: "Information Management II",
    units: 3,
    year: 1,
    sem: 3, // 3 = Summer
    prerequisites: ["CIS 1204"],
  },
  "CIS 2201": {
    code: "CIS 2201",
    name: "Systems Analysis and Design",
    units: 3,
    year: 1,
    sem: 3,
    prerequisites: ["CIS 1204"],
  },
  "CIS 2202": {
    code: "CIS 2202",
    name: "Digital Logic Design and Digital Computer Circuits",
    units: 3,
    year: 1,
    sem: 3,
    prerequisites: ["CIS 1102N"],
  },

  // ─────────────────────────────────────────
  // YEAR 2 - 1ST SEMESTER
  // ─────────────────────────────────────────
  "CIS 2101": {
    code: "CIS 2101",
    name: "Data Structures and Algorithms",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS 1201"],
  },
  "CIS 2103": {
    code: "CIS 2103",
    name: "Object-Oriented Programming",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS 1201"],
  },
  "CIS 2105": {
    code: "CIS 2105",
    name: "Networking II",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS 1205"],
  },
  "GE-ETHICS":{
    code: "GE-ETHICS",
    name: "ETHICS",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: [],
  },
  "GE-FREELEC 2":{
    code: "GE-FREELEC 2",
    name: "GENERAL EDUCATION FREE ELECTIVES 2",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: [],
  },
  "IT 3101N": {
    code: "IT 3101N",
    name: "Platform Technologies",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS 1202"],
  },
  "IT 3107": {
    code: "IT 3107",
    name: "Fundamentals of Data Warehousing and Data Mining",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS 2104"],
  },
  "IT 4104": {
    code: "IT 4104",
    name: "Linux Operating System",
    units: 3,
    year: 2,
    sem: 1,
    prerequisites: ["CIS 1205"],
  },
  "TPE 2103":{
    code: "TPE 2103",
    name: "PATH-FIT III - MOVEMENT EDUCATION 1",
    units: 2,
    year: 2,
    sem: 1,
    prerequisites: ["TPE 1202"],
  },

  // ─────────────────────────────────────────
  // YEAR 2 - 2ND SEMESTER
  // ─────────────────────────────────────────
  "CIS 2203N": {
    code: "CIS 2203N",
    name: "Mobile Development",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["CIS 1201", "CIS 1202"],
  },
  "GE-FREELEC 3":{
    code: "GE-FREELEC 3",
    name: "GENERAL EDUCATION FREE ELECTIVES 3",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: [],
  },
  "GE-LWR":{
    code: "GE-LWR",
    name: "RIZAL, LIFE AND WORKS",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: [],
  },
  "IT 3102N": {
    code: "IT 3102N",
    name: "Probability and Statistics",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["CIS 1103"],
  },
  "IT 3103A": {
    code: "IT 3103A",
    name: "Systems Integration and Architecture",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["CIS 1205", "CIS 2104"],
  },
  "IT 3202N": {
    code: "IT 3202N",
    name: "Software Quality Assurance",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["CIS 2101", "CIS 2104"],
  },
  "IT ELEC": {
    code: "IT ELEC",
    name: "IT ELECTIVE",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["2ND YEAR STANDING"],
  },
  "IT FREE EL":{
    code: "IT FREE EL",
    name: "IT FREE ELECTIVE",
    units: 3,
    year: 2,
    sem: 2,
    prerequisites: ["2ND YEAR STANDING"],
  },
  "TPE 2204":{
    code: "TPE 2204",
    name: "PATH-FIT IV - FITNESS EDUCATION 2",
    units: 2,
    year: 2,
    sem: 2,
    prerequisites: ["TPE 1202"],
  },
  // ─────────────────────────────────────────
  // YEAR 2 - SUMMER
  // ─────────────────────────────────────────
  "IT 3104A": {
    code: "IT 3104A",
    name: "Information Assurance and Security",
    units: 3,
    year: 2,
    sem: 3,
    prerequisites: ["CIS 1205"],
  },
  "IT 3201N": {
    code: "IT 3201N",
    name: "Capstone Project I",
    units: 3,
    year: 2,
    sem: 3,
    prerequisites: ["IT 3103A", "IT 3202N"],
  },
  "IT 3204N": {
    code: "IT 3204N",
    name: "Research Methods in Computing",
    units: 3,
    year: 2,
    sem: 3,
    prerequisites: ["CIS 2201"],
  },

  // ─────────────────────────────────────────
  // YEAR 3 - 1ST SEMESTER
  // ─────────────────────────────────────────
  "GE-ART":{
    code: "GE-ART",
    name: "ART APPRECIATION",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: [],
  },
  "GE-TCW":{
    code: "GE-TCW",
    name: "CONTEMPORARY WORLD",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: [],
  },
  "IT 3105N": {
    code: "IT 3105N",
    name: "Application Development and Emerging Technologies",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["CIS 2203N"],
  },
  "IT 3203N": {
    code: "IT 3203N",
    name: "Quantitative Methods",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["IT 3204N"],
  },
  "IT 3206N": {
    code: "IT 3206N",
    name: "Integrative Programming and Technology",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["CIS 2101"],
  },
  "IT 4102N": {
    code: "IT 4102N",
    name: "Practicum 1",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["CIS 2101", "CIS 2104", "IT 3101N", "IT 3103A"],
  },
  "IT 4201": {
    code: "IT 4201",
    name: "Systems Administration and Maintenance",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["CIS 2105", "IT 3101N"],
  },
  "IT ELEC 2":{
    code: "IT ELEC 2",
    name: "IT ELECTIVE 2",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["3RD YEAR STANDING"],
  },
  "IT FREE EL 2":{
    code: "IT FREE EL 2",
    name: "IT FREE ELECTIVE 2",
    units: 3,
    year: 3,
    sem: 1,
    prerequisites: ["3RD YEAR STANDING"],
  },

  // ─────────────────────────────────────────
  // YEAR 3 - 2ND SEMESTER
  // ─────────────────────────────────────────
  "CIS 2204": {
    code: "CIS 2204",
    name: "Technopreneurship",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: [],
  },
  "CIS 2206N": {
    code: "CIS 2206N",
    name: "Programming NC IV",
    units: 1,
    year: 3,
    sem: 2,
    prerequisites: ["3RD YEAR STANDING"],
    yearStanding: 3,
  },
  "GE-RPH":{
    code: "GE-RPH",
    name: "READINGS IN PHILIPPINE HISTORY",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: [],
  },
  "GE-STS":{
    code: "GE-STS",
    name: "SCIENCE, TECHNOLOGY AND SOCIETY",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: [],
  },
  "IT 3205": {
    code: "IT 3205",
    name: "Social and Professional Issues",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: [],
  },
  "IT 4101": {
    code: "IT 4101",
    name: "Capstone Project II",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: ["IT 3201N", "IT 3203N"],
  },
  "IT 4103": {
    code: "IT 4103",
    name: "Seminars and Tours",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: ["3RD YEAR STANDING"],
    yearStanding: 3,
  },
  "IT 4202N": {
    code: "IT 4202N",
    name: "Practicum 2",
    units: 6,
    year: 3,
    sem: 2,
    prerequisites: ["IT 4102N"],
  },
  "IT ELEC 3":{
    code: "IT ELEC 3",
    name: "IT ELECTIVE 3",
    units: 3,
    year: 3,
    sem: 2,
    prerequisites: ["3RD YEAR STANDING"],
  }
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