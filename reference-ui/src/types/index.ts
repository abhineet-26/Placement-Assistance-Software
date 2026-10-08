export type UserRole = 'student' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  fullName: string;
  email: string;
  phone: string;
  degree: string; // e.g., 'B.Tech', 'M.Tech', 'MCA'
  department: string; // e.g., 'Computer Science & Engineering'
  batchYear: number; // e.g., 2026
  cgpa: number; // e.g., 8.45
  activeBacklogs: number;
  historyBacklogs: number;
  skills: string[];
  resumes: ResumeFile[];
  activeResumeId?: string;
  placementStatus: 'unplaced' | 'placed' | 'opted_out';
  placedCompanyName?: string;
  placedCtcLpa?: number;
  isVerifiedByCell: boolean;
}

export interface ResumeFile {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  url: string;
  isDefault: boolean;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  legalEntityName: string;
  industry: string;
  website: string;
  headquarters: string;
  hrContactName: string;
  hrEmail: string;
  hrPhone: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  registeredAt: string;
  approvedAt?: string;
}

export type JobRoleType = 'full_time' | 'internship' | 'intern_to_fte';
export type WorkMode = 'on_site' | 'hybrid' | 'remote';
export type JobStatus = 'draft' | 'pending_approval' | 'published' | 'closed';

export interface SelectionRound {
  stepNumber: number;
  name: string; // e.g. 'Online Assessment', 'Technical Round 1', 'HR Round'
  description?: string;
  mode: 'online' | 'on_campus';
}

export interface JobEligibilityCriteria {
  minCgpa: number;
  allowedDepartments: string[];
  allowedDegrees: string[];
  maxActiveBacklogs: number;
  maxHistoryBacklogs: number;
  requiredSkills: string[];
}

export interface JobPosting {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  roleType: JobRoleType;
  workMode: WorkMode;
  location: string;
  ctcLpa: number; // in LPA, e.g., 14.5
  stipendPerMonth?: number; // for internship in INR, e.g., 50000
  applicationDeadline: string; // ISO date
  description: string;
  requirements: string[];
  selectionRounds: SelectionRound[];
  criteria: JobEligibilityCriteria;
  status: JobStatus;
  createdAt: string;
  applicantCount: number;
  moderationNotes?: string;
}

export interface EligibilityEvaluation {
  isEligible: boolean;
  checks: {
    cgpaPassed: boolean;
    departmentPassed: boolean;
    degreePassed: boolean;
    backlogsPassed: boolean;
    skillsOverlap: number; // percentage or count
  };
  reasons: string[];
}

export type ApplicationStatus =
  | 'submitted'
  | 'forwarded_by_cell'
  | 'shortlisted'
  | 'in_rounds'
  | 'interview_scheduled'
  | 'offered'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentDepartment: string;
  studentCgpa: number;
  resumeId: string;
  resumeFileName: string;
  resumeUrl: string;
  status: ApplicationStatus;
  currentRound: string;
  appliedAt: string;
  updatedAt: string;
  cellForwardedAt?: string;
  recruiterNotes?: string;
  rejectionReason?: string;
}

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface InterviewSlot {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  roundName: string;
  scheduledTime: string; // ISO timestamp
  durationMinutes: number;
  mode: 'virtual' | 'in_person';
  locationOrUrl: string;
  interviewerNames?: string;
  status: InterviewStatus;
  feedback?: string;
}

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export interface OfferRecord {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentDepartment: string;
  ctcLpa: number;
  designation: string;
  joiningDate: string;
  deadline: string; // ISO date to accept/decline
  status: OfferStatus;
  issuedAt: string;
  decisionAt?: string;
  termsSummary: string;
  officialOfferUrl?: string;
}

export interface PlacementNotice {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  author: string;
  priority: 'routine' | 'urgent' | 'deadline';
  category: 'drive_announcement' | 'policy_update' | 'shortlist_published';
}

export interface AdminMetrics {
  totalRegisteredStudents: number;
  verifiedEligibleStudents: number;
  placedStudentsCount: number;
  placementRatePercentage: number;
  activeCompanies: number;
  pendingCompanyApprovals: number;
  activeJobs: number;
  pendingJobReviews: number;
  totalApplicationsThisSeason: number;
  offersExtendedCount: number;
  averageCtcLpa: number;
  highestCtcLpa: number;
}
