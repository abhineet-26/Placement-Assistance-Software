import {
  AdminMetrics,
  Application,
  CompanyProfile,
  EligibilityEvaluation,
  InterviewSlot,
  JobPosting,
  OfferRecord,
  PlacementNotice,
  StudentProfile,
  User,
  UserRole,
} from '../types';

// API Configuration for FastAPI Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Pre-seeded realistic data for initial runtime
const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'stud-101',
  userId: 'usr-student-1',
  rollNumber: '22CS0144',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@campus.edu',
  phone: '+91 98765 43210',
  degree: 'B.Tech',
  department: 'Computer Science & Engineering',
  batchYear: 2026,
  cgpa: 8.72,
  activeBacklogs: 0,
  historyBacklogs: 0,
  skills: ['TypeScript', 'Python', 'React', 'PostgreSQL', 'Docker', 'Distributed Systems'],
  resumes: [
    {
      id: 'res-1',
      fileName: 'Aarav_Sharma_SDE_Resume_2026.pdf',
      fileSize: '348 KB',
      uploadedAt: '2026-08-15T10:30:00Z',
      url: '#',
      isDefault: true,
    },
    {
      id: 'res-2',
      fileName: 'Aarav_Sharma_Systems_Resume.pdf',
      fileSize: '412 KB',
      uploadedAt: '2026-09-02T14:15:00Z',
      url: '#',
      isDefault: false,
    },
  ],
  activeResumeId: 'res-1',
  placementStatus: 'unplaced',
  isVerifiedByCell: true,
};

const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp-1',
    userId: 'usr-comp-1',
    name: 'Datashield Analytics',
    legalEntityName: 'Datashield Technologies India Pvt. Ltd.',
    industry: 'Enterprise Cloud & Cybersecurity',
    website: 'https://datashield.io',
    headquarters: 'Bengaluru, India',
    hrContactName: 'Priya Nambiar',
    hrEmail: 'priya.n@datashield.io',
    hrPhone: '+91 98450 11223',
    verificationStatus: 'approved',
    registeredAt: '2026-07-10T09:00:00Z',
    approvedAt: '2026-07-12T14:20:00Z',
  },
  {
    id: 'comp-2',
    userId: 'usr-comp-2',
    name: 'Aether Robotics',
    legalEntityName: 'Aether Systems Automation LLP',
    industry: 'Industrial Automation & Embedded AI',
    website: 'https://aether-robotics.tech',
    headquarters: 'Pune, India',
    hrContactName: 'Vikram Joshi',
    hrEmail: 'v.joshi@aether-robotics.tech',
    hrPhone: '+91 99230 44556',
    verificationStatus: 'approved',
    registeredAt: '2026-07-28T11:45:00Z',
    approvedAt: '2026-08-01T16:00:00Z',
  },
  {
    id: 'comp-3',
    userId: 'usr-comp-3',
    name: 'FinVortex Global',
    legalEntityName: 'FinVortex Capital Markets Ltd.',
    industry: 'High-Frequency Quantitative Trading',
    website: 'https://finvortex.co',
    headquarters: 'Mumbai, India',
    hrContactName: 'Sanjay Mehta',
    hrEmail: 'talent@finvortex.co',
    hrPhone: '+91 98200 99881',
    verificationStatus: 'pending',
    registeredAt: '2026-10-02T16:30:00Z',
  },
  {
    id: 'comp-4',
    userId: 'usr-comp-4',
    name: 'Nexis Semiconductor Labs',
    legalEntityName: 'Nexis VLSI Technologies Ltd.',
    industry: 'Semiconductor Design & EDA',
    website: 'https://nexis-semi.com',
    headquarters: 'Hyderabad, India',
    hrContactName: 'Ritu Sen',
    hrEmail: 'ritu.sen@nexis-semi.com',
    hrPhone: '+91 90001 22334',
    verificationStatus: 'approved',
    registeredAt: '2026-08-10T12:00:00Z',
    approvedAt: '2026-08-14T10:00:00Z',
  },
];

const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'job-101',
    companyId: 'comp-1',
    companyName: 'Datashield Analytics',
    title: 'Software Development Engineer - Backend Systems',
    roleType: 'full_time',
    workMode: 'hybrid',
    location: 'Bengaluru / Hyderabad',
    ctcLpa: 18.5,
    applicationDeadline: '2026-10-25T23:59:59Z',
    description:
      'We are looking for core systems engineers to architect our distributed event streaming engine. You will design low-latency microservices handling 250k RPS, write high-concurrency Go/Python services, and optimize database access plans.',
    requirements: [
      'Strong grasp of Algorithms, Data Structures, and OS fundamentals',
      'Hands-on experience with Relational Databases (PostgreSQL) and indexing',
      'Familiarity with containerization (Docker) and microservice patterns',
      'Solid command of Python, Go, or Java',
    ],
    selectionRounds: [
      { stepNumber: 1, name: 'Online Coding Assessment (2 Hours)', mode: 'online' },
      { stepNumber: 2, name: 'Technical Round 1: DSA & Core Systems', mode: 'online' },
      { stepNumber: 3, name: 'Technical Round 2: System Architecture & Database Design', mode: 'on_campus' },
      { stepNumber: 4, name: 'Executive & Cultural Fit Round', mode: 'on_campus' },
    ],
    criteria: {
      minCgpa: 7.5,
      allowedDepartments: [
        'Computer Science & Engineering',
        'Information Technology',
        'Electronics & Communication Engineering',
      ],
      allowedDegrees: ['B.Tech', 'M.Tech'],
      maxActiveBacklogs: 0,
      maxHistoryBacklogs: 1,
      requiredSkills: ['Python', 'PostgreSQL', 'Docker'],
    },
    status: 'published',
    createdAt: '2026-09-10T08:00:00Z',
    applicantCount: 42,
  },
  {
    id: 'job-102',
    companyId: 'comp-2',
    companyName: 'Aether Robotics',
    title: 'Embedded Firmware & Systems Engineer',
    roleType: 'full_time',
    workMode: 'on_site',
    location: 'Pune',
    ctcLpa: 14.0,
    applicationDeadline: '2026-10-30T23:59:59Z',
    description:
      'Join our robotics control team developing RTOS firmware for heavy industrial autonomous units. Focus on sensor integration, CAN bus communication, and motor trajectory controllers with real-time determinism.',
    requirements: [
      'Proficiency in Modern C/C++ (C++17/20) and hardware debugging',
      'Experience with FreeRTOS or embedded Linux kernels',
      'Understanding of microcontrollers (ARM Cortex-M, STM32)',
      'Basic electrical schematic reading and lab test equipment usage',
    ],
    selectionRounds: [
      { stepNumber: 1, name: 'Hardware & RTOS Written Diagnostic', mode: 'online' },
      { stepNumber: 2, name: 'Live Hardware Interfacing & Firmware Debugging', mode: 'on_campus' },
      { stepNumber: 3, name: 'HR & Final Evaluation', mode: 'on_campus' },
    ],
    criteria: {
      minCgpa: 7.0,
      allowedDepartments: [
        'Electronics & Communication Engineering',
        'Electrical Engineering',
        'Mechanical Engineering',
      ],
      allowedDegrees: ['B.Tech'],
      maxActiveBacklogs: 0,
      maxHistoryBacklogs: 2,
      requiredSkills: ['C++', 'RTOS', 'Embedded'],
    },
    status: 'published',
    createdAt: '2026-09-15T11:00:00Z',
    applicantCount: 19,
  },
  {
    id: 'job-103',
    companyId: 'comp-4',
    companyName: 'Nexis Semiconductor Labs',
    title: 'ASIC Verification & Silicon Modeling Engineer',
    roleType: 'full_time',
    workMode: 'on_site',
    location: 'Hyderabad',
    ctcLpa: 22.0,
    applicationDeadline: '2026-11-05T23:59:59Z',
    description:
      'Design verification engineering for next-generation 3nm compute dies. Develop SystemVerilog testbenches using UVM methodology, simulate protocol controllers (PCIe Gen5, DDR5), and automate regression suites.',
    requirements: [
      'Comprehensive knowledge of Digital Electronics and Computer Architecture',
      'Hands-on experience with Verilog/SystemVerilog and UVM methodology',
      'Proficiency in scripting (Python / Perl / Bash)',
      'Exposure to EDA tools (Cadence Xcelium, Synopsys VCS)',
    ],
    selectionRounds: [
      { stepNumber: 1, name: 'Digital Logic & Architecture MCQ Test', mode: 'online' },
      { stepNumber: 2, name: 'SystemVerilog / Verilog Coding Round', mode: 'online' },
      { stepNumber: 3, name: 'Technical Depth & Architecture Viva', mode: 'on_campus' },
      { stepNumber: 4, name: 'Managerial Fitment', mode: 'on_campus' },
    ],
    criteria: {
      minCgpa: 8.0,
      allowedDepartments: [
        'Electronics & Communication Engineering',
        'Electrical Engineering',
      ],
      allowedDegrees: ['B.Tech', 'M.Tech'],
      maxActiveBacklogs: 0,
      maxHistoryBacklogs: 0,
      requiredSkills: ['SystemVerilog', 'Digital Design', 'Python'],
    },
    status: 'published',
    createdAt: '2026-09-20T14:30:00Z',
    applicantCount: 28,
  },
  {
    id: 'job-104',
    companyId: 'comp-1',
    companyName: 'Datashield Analytics',
    title: 'Site Reliability & Infrastructure Intern (6 Months)',
    roleType: 'intern_to_fte',
    workMode: 'hybrid',
    location: 'Bengaluru',
    ctcLpa: 12.0,
    stipendPerMonth: 45000,
    applicationDeadline: '2026-10-18T23:59:59Z',
    description:
      'Work with our SRE leads to automate Kubernetes cluster deployments, maintain Prometheus alerting rules, and improve CI/CD pipeline reliability. Potential conversion to full-time engineer upon graduation.',
    requirements: [
      'Strong Linux system administration skills',
      'Knowledge of networking (TCP/IP, DNS, TLS certificates)',
      'Basic scripting in Python or Bash',
    ],
    selectionRounds: [
      { stepNumber: 1, name: 'Linux & Networking Practical Challenge', mode: 'online' },
      { stepNumber: 2, name: 'Technical Discussion', mode: 'online' },
    ],
    criteria: {
      minCgpa: 6.8,
      allowedDepartments: [
        'Computer Science & Engineering',
        'Information Technology',
        'Electronics & Communication Engineering',
      ],
      allowedDegrees: ['B.Tech'],
      maxActiveBacklogs: 0,
      maxHistoryBacklogs: 1,
      requiredSkills: ['Linux', 'Docker', 'Networking'],
    },
    status: 'published',
    createdAt: '2026-09-28T09:15:00Z',
    applicantCount: 35,
  },
  {
    id: 'job-105',
    companyId: 'comp-3',
    companyName: 'FinVortex Global',
    title: 'Quantitative Research Analyst',
    roleType: 'full_time',
    workMode: 'on_site',
    location: 'Mumbai',
    ctcLpa: 32.0,
    applicationDeadline: '2026-11-15T23:59:59Z',
    description:
      'Research mathematical statistical arbitrage algorithms on equities and derivative feeds. Requires world-class mathematical aptitude, stochastic calculus familiarity, and lightning-fast C++ optimization.',
    requirements: [
      'Top 5% percentile mathematical and statistical aptitude',
      'Mastery of Probability, Linear Algebra, and Time Series Analysis',
      'C++ or Python numerical modeling (NumPy, SciPy)',
    ],
    selectionRounds: [
      { stepNumber: 1, name: 'Advanced Math & Probability Proctored Exam', mode: 'online' },
      { stepNumber: 2, name: 'Algorithmic Problem Solving (Hard)', mode: 'online' },
      { stepNumber: 3, name: 'Partner Quantitative Deep-Dive', mode: 'on_campus' },
    ],
    criteria: {
      minCgpa: 8.5,
      allowedDepartments: [
        'Computer Science & Engineering',
        'Mathematics & Computing',
        'Electrical Engineering',
      ],
      allowedDegrees: ['B.Tech', 'M.Tech'],
      maxActiveBacklogs: 0,
      maxHistoryBacklogs: 0,
      requiredSkills: ['C++', 'Python', 'Mathematics'],
    },
    status: 'pending_approval', // Needs admin approval before student publication
    createdAt: '2026-10-04T17:00:00Z',
    applicantCount: 0,
  },
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-501',
    jobId: 'job-101',
    jobTitle: 'Software Development Engineer - Backend Systems',
    companyId: 'comp-1',
    companyName: 'Datashield Analytics',
    studentId: 'stud-101',
    studentName: 'Aarav Sharma',
    studentRollNumber: '22CS0144',
    studentDepartment: 'Computer Science & Engineering',
    studentCgpa: 8.72,
    resumeId: 'res-1',
    resumeFileName: 'Aarav_Sharma_SDE_Resume_2026.pdf',
    resumeUrl: '#',
    status: 'shortlisted',
    currentRound: 'Technical Round 1: DSA & Core Systems',
    appliedAt: '2026-09-12T10:14:00Z',
    updatedAt: '2026-10-02T11:00:00Z',
    cellForwardedAt: '2026-09-15T09:30:00Z',
    recruiterNotes: 'Exceptional online coding assessment score (100/100 in 48 minutes).',
  },
  {
    id: 'app-502',
    jobId: 'job-104',
    jobTitle: 'Site Reliability & Infrastructure Intern (6 Months)',
    companyId: 'comp-1',
    companyName: 'Datashield Analytics',
    studentId: 'stud-101',
    studentName: 'Aarav Sharma',
    studentRollNumber: '22CS0144',
    studentDepartment: 'Computer Science & Engineering',
    studentCgpa: 8.72,
    resumeId: 'res-1',
    resumeFileName: 'Aarav_Sharma_SDE_Resume_2026.pdf',
    resumeUrl: '#',
    status: 'submitted',
    currentRound: 'Application Review',
    appliedAt: '2026-09-29T15:20:00Z',
    updatedAt: '2026-09-29T15:20:00Z',
  },
  {
    id: 'app-503',
    jobId: 'job-101',
    jobTitle: 'Software Development Engineer - Backend Systems',
    companyId: 'comp-1',
    companyName: 'Datashield Analytics',
    studentId: 'stud-102',
    studentName: 'Bhavna Kulkarni',
    studentRollNumber: '22CS0089',
    studentDepartment: 'Computer Science & Engineering',
    studentCgpa: 9.15,
    resumeId: 'res-bk-1',
    resumeFileName: 'Bhavna_Kulkarni_Resume.pdf',
    resumeUrl: '#',
    status: 'forwarded_by_cell',
    currentRound: 'Online Coding Assessment (2 Hours)',
    appliedAt: '2026-09-11T12:00:00Z',
    updatedAt: '2026-09-15T09:30:00Z',
    cellForwardedAt: '2026-09-15T09:30:00Z',
  },
  {
    id: 'app-504',
    jobId: 'job-102',
    jobTitle: 'Embedded Firmware & Systems Engineer',
    companyId: 'comp-2',
    companyName: 'Aether Robotics',
    studentId: 'stud-103',
    studentName: 'Chirag Desai',
    studentRollNumber: '22EC0031',
    studentDepartment: 'Electronics & Communication Engineering',
    studentCgpa: 7.84,
    resumeId: 'res-cd-1',
    resumeFileName: 'Chirag_Desai_Embedded.pdf',
    resumeUrl: '#',
    status: 'interview_scheduled',
    currentRound: 'Live Hardware Interfacing & Firmware Debugging',
    appliedAt: '2026-09-18T14:00:00Z',
    updatedAt: '2026-10-04T16:00:00Z',
    cellForwardedAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'app-505',
    jobId: 'job-103',
    jobTitle: 'ASIC Verification & Silicon Modeling Engineer',
    companyId: 'comp-4',
    companyName: 'Nexis Semiconductor Labs',
    studentId: 'stud-103',
    studentName: 'Chirag Desai',
    studentRollNumber: '22EC0031',
    studentDepartment: 'Electronics & Communication Engineering',
    studentCgpa: 7.84,
    resumeId: 'res-cd-1',
    resumeFileName: 'Chirag_Desai_Embedded.pdf',
    resumeUrl: '#',
    status: 'rejected',
    currentRound: 'Eligibility Screening',
    appliedAt: '2026-09-22T08:30:00Z',
    updatedAt: '2026-09-23T10:00:00Z',
    rejectionReason: 'CGPA threshold not met (Criteria: 8.0, Candidate: 7.84)',
  },
];

const INITIAL_INTERVIEWS: InterviewSlot[] = [
  {
    id: 'int-701',
    applicationId: 'app-501',
    jobId: 'job-101',
    jobTitle: 'Software Development Engineer - Backend Systems',
    companyName: 'Datashield Analytics',
    studentId: 'stud-101',
    studentName: 'Aarav Sharma',
    studentRollNumber: '22CS0144',
    roundName: 'Technical Round 1: DSA & Core Systems',
    scheduledTime: '2026-10-14T14:30:00Z',
    durationMinutes: 60,
    mode: 'virtual',
    locationOrUrl: 'https://meet.google.com/xyz-placement-2026',
    interviewerNames: 'Raghavan Iyer (Staff Engineer), Neha Das (Lead Architect)',
    status: 'scheduled',
  },
  {
    id: 'int-702',
    applicationId: 'app-504',
    jobId: 'job-102',
    jobTitle: 'Embedded Firmware & Systems Engineer',
    companyName: 'Aether Robotics',
    studentId: 'stud-103',
    studentName: 'Chirag Desai',
    studentRollNumber: '22EC0031',
    roundName: 'Live Hardware Interfacing & Firmware Debugging',
    scheduledTime: '2026-10-16T10:00:00Z',
    durationMinutes: 90,
    mode: 'in_person',
    locationOrUrl: 'Embedded Lab 402, Main Engineering Block',
    interviewerNames: 'Vikram Joshi (VP Hardware)',
    status: 'scheduled',
  },
];

const INITIAL_OFFERS: OfferRecord[] = [
  {
    id: 'off-901',
    applicationId: 'app-599',
    jobId: 'job-100-past',
    jobTitle: 'Cloud Infrastructure Associate',
    companyId: 'comp-1',
    companyName: 'Datashield Analytics',
    studentId: 'stud-104',
    studentName: 'Divya Nair',
    studentRollNumber: '22IT0012',
    studentDepartment: 'Information Technology',
    ctcLpa: 16.0,
    designation: 'Associate Cloud Engineer',
    joiningDate: '2026-07-01',
    deadline: '2026-10-20T23:59:59Z',
    status: 'accepted',
    issuedAt: '2026-10-01T15:00:00Z',
    decisionAt: '2026-10-03T18:22:00Z',
    termsSummary: 'Base salary 13.5 LPA + 2.5 LPA retention bonus. Joining in Bengaluru campus.',
  },
];

const INITIAL_NOTICES: PlacementNotice[] = [
  {
    id: 'not-1',
    title: 'Drive Announcement: Datashield Analytics Technical Round 1 Schedule',
    content:
      'Shortlisted candidates for Datashield Analytics Technical Round 1 have been allocated time slots on October 14. Ensure your audio/video setup is tested 15 minutes before your schedule.',
    publishedAt: '2026-10-05T09:30:00Z',
    author: 'Placement Directorate',
    priority: 'urgent',
    category: 'shortlist_published',
  },
  {
    id: 'not-2',
    title: 'University One-Student-One-Offer & Dream Company Policy Reminder',
    content:
      'Per Institutional Placement Guideline clause 4.2: Any student securing an offer <= 10 LPA remains eligible for one Dream Company drive (CTC >= 18 LPA). Acceptance of any Dream offer constitutes immediate closure of campus candidacy.',
    publishedAt: '2026-09-01T10:00:00Z',
    author: 'Dean of Corporate Relations',
    priority: 'routine',
    category: 'policy_update',
  },
  {
    id: 'not-3',
    title: 'Nexis Semiconductor Labs Registration Window Closes in 48 Hours',
    content:
      'Final call for B.Tech/M.Tech ECE & EE candidates to submit applications for Nexis Semiconductor Labs. The portal will automatically seal entries on the published deadline.',
    publishedAt: '2026-10-07T12:00:00Z',
    author: 'Student Placement Committee',
    priority: 'deadline',
    category: 'drive_announcement',
  },
];

// Persistent state container with local storage sync
class LocalPlacementStore {
  studentProfile: StudentProfile;
  companies: CompanyProfile[];
  jobs: JobPosting[];
  applications: Application[];
  interviews: InterviewSlot[];
  offers: OfferRecord[];
  notices: PlacementNotice[];

  constructor() {
    this.studentProfile = this.load('pl_student', INITIAL_STUDENT_PROFILE);
    this.companies = this.load('pl_companies', INITIAL_COMPANIES);
    this.jobs = this.load('pl_jobs', INITIAL_JOBS);
    this.applications = this.load('pl_applications', INITIAL_APPLICATIONS);
    this.interviews = this.load('pl_interviews', INITIAL_INTERVIEWS);
    this.offers = this.load('pl_offers', INITIAL_OFFERS);
    this.notices = this.load('pl_notices', INITIAL_NOTICES);
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch {
      // fallback
    }
    return fallback;
  }

  save() {
    try {
      localStorage.setItem('pl_student', JSON.stringify(this.studentProfile));
      localStorage.setItem('pl_companies', JSON.stringify(this.companies));
      localStorage.setItem('pl_jobs', JSON.stringify(this.jobs));
      localStorage.setItem('pl_applications', JSON.stringify(this.applications));
      localStorage.setItem('pl_interviews', JSON.stringify(this.interviews));
      localStorage.setItem('pl_offers', JSON.stringify(this.offers));
      localStorage.setItem('pl_notices', JSON.stringify(this.notices));
    } catch {
      // ignore
    }
  }

  resetToDefaults() {
    this.studentProfile = INITIAL_STUDENT_PROFILE;
    this.companies = INITIAL_COMPANIES;
    this.jobs = INITIAL_JOBS;
    this.applications = INITIAL_APPLICATIONS;
    this.interviews = INITIAL_INTERVIEWS;
    this.offers = INITIAL_OFFERS;
    this.notices = INITIAL_NOTICES;
    this.save();
  }
}

export const store = new LocalPlacementStore();

// Deterministic backend eligibility evaluator
export function evaluateStudentEligibility(
  student: StudentProfile,
  job: JobPosting
): EligibilityEvaluation {
  const reasons: string[] = [];
  const criteria = job.criteria;

  const cgpaPassed = student.cgpa >= criteria.minCgpa;
  if (!cgpaPassed) {
    reasons.push(
      `CGPA (${student.cgpa.toFixed(2)}) is below the required minimum of ${criteria.minCgpa.toFixed(2)}`
    );
  }

  const departmentPassed =
    criteria.allowedDepartments.length === 0 ||
    criteria.allowedDepartments.includes(student.department);
  if (!departmentPassed) {
    reasons.push(
      `Department (${student.department}) is not permitted by company criteria. Permitted: ${criteria.allowedDepartments.join(', ')}`
    );
  }

  const degreePassed =
    criteria.allowedDegrees.length === 0 ||
    criteria.allowedDegrees.includes(student.degree);
  if (!degreePassed) {
    reasons.push(`Degree (${student.degree}) does not match allowed degrees.`);
  }

  const backlogsPassed =
    student.activeBacklogs <= criteria.maxActiveBacklogs &&
    student.historyBacklogs <= criteria.maxHistoryBacklogs;
  if (!backlogsPassed) {
    reasons.push(
      `Backlogs count (Active: ${student.activeBacklogs}, History: ${student.historyBacklogs}) exceeds limits (Max Active: ${criteria.maxActiveBacklogs}, Max History: ${criteria.maxHistoryBacklogs})`
    );
  }

  const matchedSkills = criteria.requiredSkills.filter((s) =>
    student.skills.some((sk) => sk.toLowerCase() === s.toLowerCase())
  );
  const skillsOverlap =
    criteria.requiredSkills.length > 0
      ? (matchedSkills.length / criteria.requiredSkills.length) * 100
      : 100;

  const isEligible = cgpaPassed && departmentPassed && degreePassed && backlogsPassed;

  return {
    isEligible,
    checks: {
      cgpaPassed,
      departmentPassed,
      degreePassed,
      backlogsPassed,
      skillsOverlap: Math.round(skillsOverlap),
    },
    reasons,
  };
}

// REST API Service Layer
export const api = {
  // Auth & Identity
  async getCurrentUser(role: UserRole): Promise<User> {
    if (role === 'student') {
      return {
        id: 'usr-student-1',
        email: store.studentProfile.email,
        name: store.studentProfile.fullName,
        role: 'student',
        isVerified: store.studentProfile.isVerifiedByCell,
      };
    } else if (role === 'company') {
      const comp = store.companies[0];
      return {
        id: comp.userId,
        email: comp.hrEmail,
        name: `${comp.name} Recruiter`,
        role: 'company',
        isVerified: comp.verificationStatus === 'approved',
      };
    } else {
      return {
        id: 'usr-admin-1',
        email: 'placement.cell@campus.edu',
        name: 'Prof. S. R. Varma (Placement Director)',
        role: 'admin',
        isVerified: true,
      };
    }
  },

  // Student Profile
  async getStudentProfile(): Promise<StudentProfile> {
    return { ...store.studentProfile };
  },

  async updateStudentProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    store.studentProfile = { ...store.studentProfile, ...updates };
    store.save();
    return { ...store.studentProfile };
  },

  async uploadResume(fileName: string, fileSize: string): Promise<StudentProfile> {
    const newResume = {
      id: `res-${Date.now()}`,
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString(),
      url: '#',
      isDefault: store.studentProfile.resumes.length === 0,
    };
    store.studentProfile.resumes.unshift(newResume);
    if (!store.studentProfile.activeResumeId) {
      store.studentProfile.activeResumeId = newResume.id;
    }
    store.save();
    return { ...store.studentProfile };
  },

  async setDefaultResume(resumeId: string): Promise<StudentProfile> {
    store.studentProfile.resumes.forEach((r) => {
      r.isDefault = r.id === resumeId;
    });
    store.studentProfile.activeResumeId = resumeId;
    store.save();
    return { ...store.studentProfile };
  },

  // Jobs
  async getJobs(params?: { status?: string; roleType?: string }): Promise<JobPosting[]> {
    let result = [...store.jobs];
    if (params?.status) {
      result = result.filter((j) => j.status === params.status);
    }
    if (params?.roleType) {
      result = result.filter((j) => j.roleType === params.roleType);
    }
    return result;
  },

  async getJob(id: string): Promise<JobPosting | undefined> {
    return store.jobs.find((j) => j.id === id);
  },

  async createJob(payload: Omit<JobPosting, 'id' | 'createdAt' | 'applicantCount'>): Promise<JobPosting> {
    const newJob: JobPosting = {
      ...payload,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      applicantCount: 0,
    };
    store.jobs.unshift(newJob);
    store.save();
    return newJob;
  },

  async updateJob(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
    const idx = store.jobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new Error('Job not found');
    store.jobs[idx] = { ...store.jobs[idx], ...updates };
    store.save();
    return store.jobs[idx];
  },

  async moderateJob(id: string, status: 'published' | 'closed' | 'draft', notes?: string): Promise<JobPosting> {
    return this.updateJob(id, { status, moderationNotes: notes });
  },

  // Applications
  async getApplications(params?: {
    studentId?: string;
    jobId?: string;
    companyId?: string;
    status?: string;
  }): Promise<Application[]> {
    let list = [...store.applications];
    if (params?.studentId) {
      list = list.filter((a) => a.studentId === params.studentId);
    }
    if (params?.jobId) {
      list = list.filter((a) => a.jobId === params.jobId);
    }
    if (params?.companyId) {
      list = list.filter((a) => a.companyId === params.companyId);
    }
    if (params?.status) {
      list = list.filter((a) => a.status === params.status);
    }
    return list;
  },

  async applyToJob(jobId: string, resumeId: string): Promise<Application> {
    const job = store.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const evalResult = evaluateStudentEligibility(store.studentProfile, job);
    if (!evalResult.isEligible) {
      throw new Error(`Ineligible to apply: ${evalResult.reasons.join('; ')}`);
    }

    const existing = store.applications.find(
      (a) => a.jobId === jobId && a.studentId === store.studentProfile.id
    );
    if (existing) {
      throw new Error('Application already submitted for this position.');
    }

    const resume = store.studentProfile.resumes.find((r) => r.id === resumeId) || store.studentProfile.resumes[0];

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      studentId: store.studentProfile.id,
      studentName: store.studentProfile.fullName,
      studentRollNumber: store.studentProfile.rollNumber,
      studentDepartment: store.studentProfile.department,
      studentCgpa: store.studentProfile.cgpa,
      resumeId: resume.id,
      resumeFileName: resume.fileName,
      resumeUrl: resume.url,
      status: 'submitted',
      currentRound: 'Application Review',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.applications.unshift(newApp);
    job.applicantCount += 1;
    store.save();
    return newApp;
  },

  async updateApplicationStatus(
    appId: string,
    status: Application['status'],
    currentRound?: string,
    notes?: string,
    rejectionReason?: string
  ): Promise<Application> {
    const idx = store.applications.findIndex((a) => a.id === appId);
    if (idx === -1) throw new Error('Application not found');

    store.applications[idx] = {
      ...store.applications[idx],
      status,
      currentRound: currentRound || store.applications[idx].currentRound,
      recruiterNotes: notes !== undefined ? notes : store.applications[idx].recruiterNotes,
      rejectionReason: rejectionReason !== undefined ? rejectionReason : store.applications[idx].rejectionReason,
      updatedAt: new Date().toISOString(),
    };
    store.save();
    return store.applications[idx];
  },

  async batchForwardApplicationsToCompany(appIds: string[]): Promise<Application[]> {
    const now = new Date().toISOString();
    const updated: Application[] = [];

    store.applications.forEach((a) => {
      if (appIds.includes(a.id) && a.status === 'submitted') {
        a.status = 'forwarded_by_cell';
        a.cellForwardedAt = now;
        a.updatedAt = now;
        updated.push(a);
      }
    });

    store.save();
    return updated;
  },

  // Interviews
  async getInterviews(params?: {
    studentId?: string;
    companyName?: string;
  }): Promise<InterviewSlot[]> {
    let list = [...store.interviews];
    if (params?.studentId) {
      list = list.filter((i) => i.studentId === params.studentId);
    }
    if (params?.companyName) {
      list = list.filter((i) => i.companyName === params.companyName);
    }
    return list;
  },

  async scheduleInterview(payload: Omit<InterviewSlot, 'id' | 'status'>): Promise<InterviewSlot> {
    const newSlot: InterviewSlot = {
      ...payload,
      id: `int-${Date.now()}`,
      status: 'scheduled',
    };
    store.interviews.unshift(newSlot);

    // Also transition application status
    const app = store.applications.find((a) => a.id === payload.applicationId);
    if (app) {
      app.status = 'interview_scheduled';
      app.currentRound = payload.roundName;
      app.updatedAt = new Date().toISOString();
    }

    store.save();
    return newSlot;
  },

  async updateInterviewStatus(id: string, status: InterviewSlot['status'], feedback?: string): Promise<InterviewSlot> {
    const idx = store.interviews.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Interview not found');
    store.interviews[idx] = {
      ...store.interviews[idx],
      status,
      feedback: feedback || store.interviews[idx].feedback,
    };
    store.save();
    return store.interviews[idx];
  },

  // Offers
  async getOffers(params?: { studentId?: string; companyId?: string }): Promise<OfferRecord[]> {
    let list = [...store.offers];
    if (params?.studentId) {
      list = list.filter((o) => o.studentId === params.studentId);
    }
    if (params?.companyId) {
      list = list.filter((o) => o.companyId === params.companyId);
    }
    return list;
  },

  async issueOffer(payload: Omit<OfferRecord, 'id' | 'status' | 'issuedAt'>): Promise<OfferRecord> {
    const newOffer: OfferRecord = {
      ...payload,
      id: `off-${Date.now()}`,
      status: 'pending',
      issuedAt: new Date().toISOString(),
    };
    store.offers.unshift(newOffer);

    // Update application
    const app = store.applications.find((a) => a.id === payload.applicationId);
    if (app) {
      app.status = 'offered';
      app.updatedAt = new Date().toISOString();
    }

    store.save();
    return newOffer;
  },

  async respondToOffer(offerId: string, response: 'accepted' | 'declined'): Promise<OfferRecord> {
    const idx = store.offers.findIndex((o) => o.id === offerId);
    if (idx === -1) throw new Error('Offer not found');

    const offer = store.offers[idx];
    offer.status = response;
    offer.decisionAt = new Date().toISOString();

    if (response === 'accepted') {
      // Mark student placed
      store.studentProfile.placementStatus = 'placed';
      store.studentProfile.placedCompanyName = offer.companyName;
      store.studentProfile.placedCtcLpa = offer.ctcLpa;
    }

    store.save();
    return offer;
  },

  // Companies & Admin Oversight
  async getCompanies(): Promise<CompanyProfile[]> {
    return [...store.companies];
  },

  async setCompanyVerification(
    companyId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<CompanyProfile> {
    const idx = store.companies.findIndex((c) => c.id === companyId);
    if (idx === -1) throw new Error('Company not found');
    store.companies[idx].verificationStatus = status;
    store.companies[idx].rejectionReason = reason;
    if (status === 'approved') {
      store.companies[idx].approvedAt = new Date().toISOString();
    }
    store.save();
    return store.companies[idx];
  },

  // Notices
  async getNotices(): Promise<PlacementNotice[]> {
    return [...store.notices];
  },

  async createNotice(notice: Omit<PlacementNotice, 'id' | 'publishedAt'>): Promise<PlacementNotice> {
    const newNotice: PlacementNotice = {
      ...notice,
      id: `not-${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
    store.notices.unshift(newNotice);
    store.save();
    return newNotice;
  },

  // Admin Overview Statistics
  async getAdminMetrics(): Promise<AdminMetrics> {
    const totalApps = store.applications.length;
    const placedStudents = store.offers.filter((o) => o.status === 'accepted').length;
    const totalStudents = 320; // Cohort size
    const activeJobs = store.jobs.filter((j) => j.status === 'published').length;
    const pendingJobs = store.jobs.filter((j) => j.status === 'pending_approval').length;
    const pendingComps = store.companies.filter((c) => c.verificationStatus === 'pending').length;
    const activeComps = store.companies.filter((c) => c.verificationStatus === 'approved').length;

    const ctcValues = store.jobs.map((j) => j.ctcLpa);
    const avgCtc = ctcValues.reduce((a, b) => a + b, 0) / (ctcValues.length || 1);
    const highestCtc = Math.max(...ctcValues, 32.0);

    return {
      totalRegisteredStudents: totalStudents,
      verifiedEligibleStudents: 298,
      placedStudentsCount: placedStudents + 48, // Including verified early PPOs
      placementRatePercentage: Math.round(((placedStudents + 48) / 298) * 100),
      activeCompanies: activeComps,
      pendingCompanyApprovals: pendingComps,
      activeJobs,
      pendingJobReviews: pendingJobs,
      totalApplicationsThisSeason: totalApps + 180,
      offersExtendedCount: store.offers.length + 52,
      averageCtcLpa: Number(avgCtc.toFixed(1)),
      highestCtcLpa: highestCtc,
    };
  },
};
