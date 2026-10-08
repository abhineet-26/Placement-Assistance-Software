import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCompanies, useJobs } from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import { Plus, Users, Clock, MapPin, Edit3 } from 'lucide-react';

interface CompanyJobsViewProps {
  onNavigate: (view: any, id?: string) => void;
}

export const CompanyJobsView: React.FC<CompanyJobsViewProps> = ({ onNavigate }) => {
  const { data: companies = [] } = useCompanies();
  const currentCompany = companies[0];

  const { data: jobs = [], isLoading } = useJobs();
  const companyJobs = jobs.filter((j) => j.companyId === currentCompany?.id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Job Requisitions Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure campus recruitment drives, eligibility rules, and selection rounds
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('company_job_new')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Requisition</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading requisitions...</div>
      ) : companyJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No requisitions authored yet. Click "New Requisition" to draft a campus opening.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
          {companyJobs.map((job) => (
            <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <StatusText status={job.status} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {job.ctcLpa} LPA
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="capitalize">{job.roleType.replace(/_/g, ' ')}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span>{job.location}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="font-mono tabular-nums">
                    Min CGPA: {job.criteria.minCgpa.toFixed(1)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString()} ·
                  Created {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('company_applicants', job.id)}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Pipeline ({job.applicantCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
