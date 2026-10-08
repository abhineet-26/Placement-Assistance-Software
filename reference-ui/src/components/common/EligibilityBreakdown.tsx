import React from 'react';
import { EligibilityEvaluation, JobEligibilityCriteria, StudentProfile } from '../../types';
import { Check, X, CheckCircle2, XCircle } from 'lucide-react';

interface EligibilityBreakdownProps {
  evaluation: EligibilityEvaluation;
  criteria: JobEligibilityCriteria;
  student: StudentProfile;
}

export const EligibilityBreakdown: React.FC<EligibilityBreakdownProps> = ({
  evaluation,
  criteria,
  student,
}) => {
  const { checks, isEligible, reasons } = evaluation;

  return (
    <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">
            Placement Eligibility Assessment
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified by Placement Directorate based on institutional academic records
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          {isEligible ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Meets Drive Criteria</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Ineligible for this Drive</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* CGPA */}
        <div
          className={`p-3.5 border rounded-lg transition-colors ${
            checks.cgpaPassed
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-rose-50/50 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 font-bold">CGPA Cutoff</span>
            {checks.cgpaPassed ? (
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Check className="w-3 h-3" />
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <X className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="font-mono tabular-nums text-slate-900 font-extrabold text-base">
            {student.cgpa.toFixed(2)}{' '}
            <span className="text-slate-400 font-normal text-xs">
              / min {criteria.minCgpa.toFixed(2)}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold block mt-1 ${
              checks.cgpaPassed ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {checks.cgpaPassed ? 'Above threshold' : 'Below cutoff requirement'}
          </span>
        </div>

        {/* Department / Branch */}
        <div
          className={`p-3.5 border rounded-lg transition-colors ${
            checks.departmentPassed
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-rose-50/50 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 font-bold">Eligible Branch</span>
            {checks.departmentPassed ? (
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Check className="w-3 h-3" />
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <X className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="text-slate-900 font-bold truncate text-sm" title={student.department}>
            {student.department.split('&')[0].trim()}
          </div>
          <span
            className={`text-[11px] font-semibold block mt-1 ${
              checks.departmentPassed ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {checks.departmentPassed ? 'Branch recognized' : 'Branch excluded'}
          </span>
        </div>

        {/* Backlogs */}
        <div
          className={`p-3.5 border rounded-lg transition-colors ${
            checks.backlogsPassed
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-rose-50/50 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 font-bold">Active Backlogs</span>
            {checks.backlogsPassed ? (
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Check className="w-3 h-3" />
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <X className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="font-mono tabular-nums text-slate-900 font-extrabold text-base">
            {student.activeBacklogs}{' '}
            <span className="text-slate-400 font-normal text-xs">
              / max {criteria.maxActiveBacklogs}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold block mt-1 ${
              checks.backlogsPassed ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {checks.backlogsPassed ? 'Cleared standing' : 'Standing violation'}
          </span>
        </div>

        {/* Skill Match */}
        <div className="p-3.5 border border-indigo-200 bg-indigo-50/50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-indigo-900 font-bold">Skill Alignment</span>
            <span className="font-mono tabular-nums text-indigo-700 font-extrabold text-xs bg-indigo-100 px-1.5 py-0.5 rounded">
              {checks.skillsOverlap}%
            </span>
          </div>
          <div className="text-slate-900 font-semibold text-xs truncate">
            {criteria.requiredSkills.slice(0, 2).join(', ')}
            {criteria.requiredSkills.length > 2 && ' +more'}
          </div>
          <div className="w-full bg-indigo-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${checks.skillsOverlap}%` }}
            />
          </div>
        </div>
      </div>

      {!isEligible && reasons.length > 0 && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
          <span className="font-bold block mb-1">Ineligibility Audit Reasons:</span>
          <ul className="list-disc list-inside space-y-0.5 text-rose-800 font-medium">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
