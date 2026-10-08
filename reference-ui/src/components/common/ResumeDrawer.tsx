import React from 'react';
import { Application, StudentProfile } from '../../types';
import { X, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResumeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application;
  student?: StudentProfile;
}

export const ResumeDrawer: React.FC<ResumeDrawerProps> = ({
  isOpen,
  onClose,
  application,
  student,
}) => {
  if (!isOpen) return null;

  const candidateName = application ? application.studentName : student?.fullName || '';
  const rollNumber = application ? application.studentRollNumber : student?.rollNumber || '';
  const department = application ? application.studentDepartment : student?.department || '';
  const cgpa = application ? application.studentCgpa : student?.cgpa || 0;
  const fileName = application ? application.resumeFileName : student?.resumes[0]?.fileName || 'Resume.pdf';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{candidateName}</h3>
                <span className="text-xs text-slate-500 font-mono tabular-nums">{rollNumber}</span>
              </div>
              <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <span>{department}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  CGPA {cgpa.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Resume File Header */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">{fileName}</p>
                  <p className="text-[11px] text-slate-500">Verified institutional upload</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                onClick={() => alert(`Downloading verified copy of ${fileName}`)}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>

            {/* Academic Standing */}
            <div>
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                Academic Standing
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="text-slate-500 block">Graduation Batch</span>
                  <span className="font-mono tabular-nums text-slate-900 font-semibold text-sm mt-0.5 block">
                    2026
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="text-slate-500 block">Active Backlogs</span>
                  <span className="font-mono tabular-nums text-slate-900 font-semibold text-sm mt-0.5 block">
                    0
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="text-slate-500 block">Cell Clearance</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Clean Dossier Content Preview */}
            <div>
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                Curriculum Vitae Preview
              </h4>
              <div className="border border-slate-200 rounded p-6 bg-white space-y-4 font-sans text-xs text-slate-700 leading-relaxed shadow-xs">
                <div>
                  <h5 className="font-bold text-sm text-slate-900">TECHNICAL EXPERTISE</h5>
                  <p className="mt-1">
                    Languages: TypeScript, Python, C++, Go, SQL
                    <br />
                    Frameworks: React, Node.js, FastAPI, PostgreSQL, Redis
                    <br />
                    DevOps & Cloud: Docker, Kubernetes, AWS (S3, EC2, Lambda), Linux
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h5 className="font-bold text-sm text-slate-900">PROJECT EXPERIENCE</h5>
                  <div className="mt-1.5 space-y-2">
                    <div>
                      <p className="font-semibold text-slate-800">
                        High-Throughput Distributed Cache Server (Go, Raft)
                      </p>
                      <p className="text-slate-600">
                        Engineered distributed in-memory key-value store using Raft consensus.
                        Benchmarked 85,000 requests/sec with p99 latency under 4ms.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        Campus Recruitment Management Engine (React, FastAPI, PostgreSQL)
                      </p>
                      <p className="text-slate-600">
                        Designed normalized schema with Alembic migrations; implemented JWT
                        role-based access control and deterministic eligibility evaluation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h5 className="font-bold text-sm text-slate-900">ACADEMIC HONORS</h5>
                  <p className="mt-1">
                    · Ranked in top 3% of Computer Science department (CGPA: {cgpa.toFixed(2)})
                    <br />· Winner, Annual Inter-College Algorithmic Hackathon 2025
                  </p>
                </div>
              </div>
            </div>

            {application?.recruiterNotes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Recruiter Notes:</span>
                <p>{application.recruiterNotes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Done Viewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
