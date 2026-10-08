import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, ShieldCheck, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { ResumeDrawer } from '../../components/common/ResumeDrawer';
import { StudentProfile } from '../../types';

// Realistic student registry cohort dataset for administration
const SAMPLE_STUDENTS: StudentProfile[] = [
  {
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
    skills: ['TypeScript', 'Python', 'React', 'PostgreSQL', 'Docker'],
    resumes: [
      {
        id: 'res-1',
        fileName: 'Aarav_Sharma_SDE_Resume_2026.pdf',
        fileSize: '348 KB',
        uploadedAt: '2026-08-15T10:30:00Z',
        url: '#',
        isDefault: true,
      },
    ],
    placementStatus: 'unplaced',
    isVerifiedByCell: true,
  },
  {
    id: 'stud-102',
    userId: 'usr-student-2',
    rollNumber: '22CS0089',
    fullName: 'Bhavna Kulkarni',
    email: 'bhavna.k@campus.edu',
    phone: '+91 98111 22334',
    degree: 'B.Tech',
    department: 'Computer Science & Engineering',
    batchYear: 2026,
    cgpa: 9.15,
    activeBacklogs: 0,
    historyBacklogs: 0,
    skills: ['Distributed Systems', 'C++', 'Go', 'Linux'],
    resumes: [
      {
        id: 'res-bk-1',
        fileName: 'Bhavna_Kulkarni_Resume.pdf',
        fileSize: '410 KB',
        uploadedAt: '2026-08-20T12:00:00Z',
        url: '#',
        isDefault: true,
      },
    ],
    placementStatus: 'unplaced',
    isVerifiedByCell: true,
  },
  {
    id: 'stud-103',
    userId: 'usr-student-3',
    rollNumber: '22EC0031',
    fullName: 'Chirag Desai',
    email: 'chirag.d@campus.edu',
    phone: '+91 98222 33445',
    degree: 'B.Tech',
    department: 'Electronics & Communication Engineering',
    batchYear: 2026,
    cgpa: 7.84,
    activeBacklogs: 0,
    historyBacklogs: 1,
    skills: ['Embedded C', 'SystemVerilog', 'RTOS'],
    resumes: [
      {
        id: 'res-cd-1',
        fileName: 'Chirag_Desai_Embedded.pdf',
        fileSize: '290 KB',
        uploadedAt: '2026-08-22T09:00:00Z',
        url: '#',
        isDefault: true,
      },
    ],
    placementStatus: 'unplaced',
    isVerifiedByCell: true,
  },
  {
    id: 'stud-104',
    userId: 'usr-student-4',
    rollNumber: '22IT0012',
    fullName: 'Divya Nair',
    email: 'divya.n@campus.edu',
    phone: '+91 98333 44556',
    degree: 'B.Tech',
    department: 'Information Technology',
    batchYear: 2026,
    cgpa: 8.4,
    activeBacklogs: 0,
    historyBacklogs: 0,
    skills: ['AWS', 'Kubernetes', 'Python', 'Terraform'],
    resumes: [
      {
        id: 'res-dn-1',
        fileName: 'Divya_Nair_Cloud.pdf',
        fileSize: '360 KB',
        uploadedAt: '2026-08-25T11:00:00Z',
        url: '#',
        isDefault: true,
      },
    ],
    placementStatus: 'placed',
    placedCompanyName: 'Datashield Analytics',
    placedCtcLpa: 16.0,
    isVerifiedByCell: true,
  },
  {
    id: 'stud-105',
    userId: 'usr-student-5',
    rollNumber: '22ME0044',
    fullName: 'Eshwar Reddy',
    email: 'eshwar.r@campus.edu',
    phone: '+91 98444 55667',
    degree: 'B.Tech',
    department: 'Mechanical Engineering',
    batchYear: 2026,
    cgpa: 7.3,
    activeBacklogs: 1,
    historyBacklogs: 2,
    skills: ['SolidWorks', 'ANSYS', 'Python'],
    resumes: [
      {
        id: 'res-er-1',
        fileName: 'Eshwar_Reddy_Design.pdf',
        fileSize: '315 KB',
        uploadedAt: '2026-09-01T15:00:00Z',
        url: '#',
        isDefault: true,
      },
    ],
    placementStatus: 'unplaced',
    isVerifiedByCell: false,
  },
];

export const StudentRegistryView: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>(SAMPLE_STUDENTS);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'placed' | 'unplaced'>('all');

  const [inspectingStudent, setInspectingStudent] = useState<StudentProfile | null>(null);

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'all' || s.department.includes(deptFilter);
    const matchesStatus = statusFilter === 'all' || s.placementStatus === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleToggleClearance = (studentId: string) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, isVerifiedByCell: !s.isVerifiedByCell } : s
      )
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Academic Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified academic standing, CGPAs, backlog audit, and placement status ledger
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          {students.filter((s) => s.isVerifiedByCell).length} of {students.length} students cell
          cleared
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3 rounded-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Information Technology">Information Tech</option>
            <option value="Mechanical">Mechanical</option>
          </select>

          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unplaced')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'unplaced'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unplaced
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('placed')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'placed'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Placed
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="py-3 px-4">Student & Roll</th>
              <th className="py-3 px-4">Department & Degree</th>
              <th className="py-3 px-4">Verified CGPA</th>
              <th className="py-3 px-4">Active / History Backlogs</th>
              <th className="py-3 px-4">Placement Status</th>
              <th className="py-3 px-4">Cell Clearance</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{student.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {student.rollNumber}
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-700">
                  <div>{student.department.split('&')[0].trim()}</div>
                  <div className="text-[11px] text-slate-400">
                    {student.degree} ({student.batchYear})
                  </div>
                </td>

                <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                  {student.cgpa.toFixed(2)}
                </td>

                <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                  Active: {student.activeBacklogs} · Hist: {student.historyBacklogs}
                </td>

                <td className="py-3 px-4">
                  {student.placementStatus === 'placed' ? (
                    <span className="font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Placed ({student.placedCompanyName} · {student.placedCtcLpa} LPA)
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-600 font-medium">Unplaced Candidate</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => handleToggleClearance(student.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                      student.isVerifiedByCell
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{student.isVerifiedByCell ? 'Cleared' : 'On Hold'}</span>
                  </button>
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setInspectingStudent(student)}
                    className="px-2.5 py-1 text-slate-700 border border-slate-300 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 font-medium ml-auto"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Dossier</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Candidate Dossier Drawer */}
      <ResumeDrawer
        isOpen={Boolean(inspectingStudent)}
        onClose={() => setInspectingStudent(null)}
        student={inspectingStudent || undefined}
      />
    </div>
  );
};
