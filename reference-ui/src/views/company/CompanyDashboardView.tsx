import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  useApplications,
  useCompanies,
  useInterviews,
  useJobs,
  useOffers,
} from '../../hooks/usePlacementQueries';
import {
  Briefcase,
  Users,
  Calendar,
  Award,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StatusText } from '../../components/common/StatusText';

interface CompanyDashboardViewProps {
  onNavigate: (view: any, id?: string) => void;
}

export const CompanyDashboardView: React.FC<CompanyDashboardViewProps> = ({ onNavigate }) => {
  const { data: companies = [] } = useCompanies();
  const currentCompany = companies[0];

  const { data: jobs = [] } = useJobs();
  const companyJobs = jobs.filter((j) => j.companyId === currentCompany?.id);

  const { data: applications = [] } = useApplications({ companyId: currentCompany?.id });
  const { data: interviews = [] } = useInterviews({ companyName: currentCompany?.name });
  const { data: offers = [] } = useOffers({ companyId: currentCompany?.id });

  const totalApplicants = companyJobs.reduce((acc, j) => acc + j.applicantCount, 0);
  const shortlistedCount = applications.filter((a) =>
    ['shortlisted', 'in_rounds', 'interview_scheduled'].includes(a.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Recruiter Header Banner with Vibrant Purple Gradient */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-6 sm:p-7 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-200 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                Recruitment Campaign Console
              </span>
              <span aria-hidden="true" className="text-purple-300">
                ·
              </span>
              <span className="text-xs text-purple-200 font-medium">
                {currentCompany?.industry}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1.5">
              {currentCompany?.name}
            </h1>
            <div className="text-xs text-purple-100 mt-2 flex items-center gap-2 font-medium">
              <span>HR Lead: {currentCompany?.hrContactName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{currentCompany?.hrEmail}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('company_job_new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-800 rounded-lg text-xs font-extrabold hover:bg-purple-50 transition-all shadow-md transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Requisition</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Funnel Metrics with Vibrant Styling */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Requisitions */}
        <div className="bg-white border border-purple-100 p-5 rounded-xl shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Requisitions
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-purple-700 block">
            {companyJobs.filter((j) => j.status === 'published').length}
          </span>
          <span className="text-[11px] text-purple-600 font-medium mt-1 block">
            {companyJobs.filter((j) => j.status === 'pending_approval').length} awaiting cell
            approval
          </span>
        </div>

        {/* Total Applicants */}
        <div className="bg-white border border-blue-100 p-5 rounded-xl shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Applicants
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-blue-700 block">
            {totalApplicants}
          </span>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">
            Verified candidate pool
          </span>
        </div>

        {/* In Evaluation Pipeline */}
        <div className="bg-white border border-indigo-100 p-5 rounded-xl shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In Evaluation
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-indigo-700 block">
            {shortlistedCount}
          </span>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
            {interviews.filter((i) => i.status === 'scheduled').length} interviews scheduled
          </span>
        </div>

        {/* Offers Extended */}
        <div className="bg-white border border-emerald-100 p-5 rounded-xl shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Offers
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-emerald-700 block">
            {offers.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {offers.filter((o) => o.status === 'accepted').length} accepted by candidates
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Requisitions */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Open Job Requisitions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current recruitment drives on campus
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('company_jobs')}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {companyJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 hover:bg-purple-50/30 transition-colors flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span className="font-mono tabular-nums font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {job.ctcLpa} LPA
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-700">
                      {job.applicantCount} applicants
                    </span>
                    <span aria-hidden="true">·</span>
                    <StatusText status={job.status} size="sm" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('company_applicants', job.id)}
                  className="px-3.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shrink-0"
                >
                  View Pipeline
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Assessment Queue */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Interview Panel</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Candidate slots allocated for technical rounds
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('company_interviews')}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900"
            >
              <span>Scheduler</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {interviews.slice(0, 4).map((slot) => (
              <div key={slot.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{slot.studentName}</h4>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                    <span className="font-medium text-slate-800">{slot.roundName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-bold text-indigo-700">
                      {new Date(slot.scheduledTime).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono tabular-nums font-bold px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">
                  {slot.durationMinutes}m {slot.mode}
                </span>
              </div>
            ))}

            {interviews.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No active interview slots scheduled yet. Shortlist candidates from the applicant
                pipeline.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
