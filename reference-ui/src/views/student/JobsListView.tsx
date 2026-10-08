import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../hooks/usePlacementQueries';
import { evaluateStudentEligibility } from '../../services/api';
import { Search, Filter, Clock, MapPin, Building, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { JobPosting } from '../../types';

interface JobsListViewProps {
  onSelectJob: (jobId: string) => void;
}

export const JobsListView: React.FC<JobsListViewProps> = ({ onSelectJob }) => {
  const { studentProfile } = useAuth();
  const { data: jobs = [], isLoading } = useJobs({ status: 'published' });

  const [search, setSearch] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState<string>('all');
  const [eligibilityOnly, setEligibilityOnly] = useState<boolean>(false);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.companyName.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleTypeFilter === 'all' || job.roleType === roleTypeFilter;

    if (!matchesSearch || !matchesRole) return false;

    if (eligibilityOnly && studentProfile) {
      const evalResult = evaluateStudentEligibility(studentProfile, job);
      if (!evalResult.isEligible) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Opportunities Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active campus recruitment drives authorized by the Placement Directorate
          </p>
        </div>
        <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-mono tabular-nums">
          {filteredJobs.length} of {jobs.length} drives visible
        </div>
      </div>

      {/* Filter Bar with Vibrant Segmented Controls */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role title, company name, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Type Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => setRoleTypeFilter('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                roleTypeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter('full_time')}
              className={`px-3 py-1 rounded-md transition-all ${
                roleTypeFilter === 'full_time'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Full-Time
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter('intern_to_fte')}
              className={`px-3 py-1 rounded-md transition-all ${
                roleTypeFilter === 'intern_to_fte'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Internships / FTE
            </button>
          </div>

          {/* Eligibility Toggle Button */}
          <button
            type="button"
            onClick={() => setEligibilityOnly(!eligibilityOnly)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 font-bold ${
              eligibilityOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-500 hover:text-emerald-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Eligible Only</span>
          </button>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading drive directory...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-xs">
          No recruitment drives match your active filter criteria. Try resetting filters or search
          query.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredJobs.map((job) => {
            const evalResult = studentProfile
              ? evaluateStudentEligibility(studentProfile, job)
              : null;

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="p-5 hover:bg-blue-50/40 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  {/* Job Title & Company */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {job.companyName}
                    </span>
                  </div>

                  {/* Clean metadata with vibrant highlight pills */}
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600">
                    <span className="font-mono tabular-nums font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-md border border-emerald-300/80">
                      {job.ctcLpa} LPA
                    </span>
                    {job.stipendPerMonth && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="font-mono tabular-nums text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          ₹{job.stipendPerMonth.toLocaleString()} / mo stipend
                        </span>
                      </>
                    )}
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="capitalize font-medium text-slate-700">
                      {job.roleType.replace(/_/g, ' ')}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="capitalize text-slate-600">
                      {job.workMode.replace(/_/g, ' ')}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span>{job.location}</span>
                  </div>

                  {/* Branches & Cutoff summary */}
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2">
                    <span>
                      Cutoff: Min CGPA{' '}
                      <strong className="text-slate-800 font-mono tabular-nums">
                        {job.criteria.minCgpa.toFixed(1)}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Branches:{' '}
                      {job.criteria.allowedDepartments.map((d) => d.split('&')[0].trim()).join(', ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right side: Eligibility indicator */}
                <div className="flex items-center gap-4 shrink-0">
                  {evalResult && (
                    <div className="text-right">
                      {evalResult.isEligible ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Eligible</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Ineligible</span>
                        </div>
                      )}
                      <span className="text-[11px] text-slate-400 block font-mono tabular-nums mt-0.5">
                        {evalResult.checks.skillsOverlap}% skill match
                      </span>
                    </div>
                  )}

                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
