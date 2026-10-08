import React from 'react';
import {
  useAdminMetrics,
  useCompanies,
  useJobs,
  useApplications,
} from '../../hooks/usePlacementQueries';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { StatusText } from '../../components/common/StatusText';

interface AdminDashboardViewProps {
  onNavigate: (view: any, id?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const { data: metrics, isLoading } = useAdminMetrics();
  const { data: companies = [] } = useCompanies();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();

  const pendingCompanies = companies.filter((c) => c.verificationStatus === 'pending');
  const pendingJobs = jobs.filter((j) => j.status === 'pending_approval');
  const pendingForwardingApps = applications.filter((a) => a.status === 'submitted');

  if (isLoading || !metrics) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading operations console...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner with Vibrant Emerald & Teal Gradient */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white p-6 sm:p-7 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                Institutional Placement Operations
              </span>
              <span aria-hidden="true" className="text-emerald-300">
                ·
              </span>
              <span className="text-xs font-mono tabular-nums text-emerald-100 font-semibold">
                Session 2025–2026
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1.5">
              Placement Directorate Operations Hub
            </h1>
            <p className="text-xs text-emerald-100 mt-1 font-medium">
              Live governance across students, employer accreditations, and drive compliance
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="p-4 bg-white/15 backdrop-blur-xs border border-white/20 rounded-xl text-right">
              <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
                Institutional Placement Rate
              </span>
              <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                {metrics.placementRatePercentage}%
              </span>
              <span className="text-[11px] text-emerald-200 font-bold block mt-0.5">
                {metrics.placedStudentsCount} of {metrics.verifiedEligibleStudents} verified placed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Attention Queue Alert if bottlenecks exist */}
      {(pendingCompanies.length > 0 ||
        pendingJobs.length > 0 ||
        pendingForwardingApps.length > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-4 rounded-xl shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Pending Institutional Moderation Actions
              </h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-900 font-semibold">
                {pendingCompanies.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate('admin_companies')}
                    className="hover:underline text-amber-950 font-bold"
                  >
                    · {pendingCompanies.length} Employer Registration(s) Awaiting Vetting
                  </button>
                )}
                {pendingJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate('admin_jobs')}
                    className="hover:underline text-amber-950 font-bold"
                  >
                    · {pendingJobs.length} Job Requisition(s) Pending Moderation
                  </button>
                )}
                {pendingForwardingApps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate('admin_applications')}
                    className="hover:underline text-amber-950 font-bold"
                  >
                    · {pendingForwardingApps.length} Student Application(s) Awaiting CV Forwarding
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid with Vibrant Styling */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Verified Cohort */}
        <div className="bg-white border border-emerald-100 p-5 rounded-xl shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              Eligible Cohort
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-emerald-800 block">
            {metrics.verifiedEligibleStudents}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            out of {metrics.totalRegisteredStudents} total enrolled
          </span>
        </div>

        {/* Partner Employers */}
        <div className="bg-white border border-blue-100 p-5 rounded-xl shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              Active Employers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-blue-700 block">
            {metrics.activeCompanies}
          </span>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">
            {metrics.pendingCompanyApprovals} registrations in review
          </span>
        </div>

        {/* Average CTC */}
        <div className="bg-white border border-teal-100 p-5 rounded-xl shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              Average Package
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-teal-800 block">
            {metrics.averageCtcLpa} LPA
          </span>
          <span className="text-[11px] text-teal-700 font-bold mt-1 block font-mono tabular-nums">
            Highest: {metrics.highestCtcLpa} LPA
          </span>
        </div>

        {/* Total Applications */}
        <div className="bg-white border border-purple-100 p-5 rounded-xl shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-purple-700 block">
            {metrics.totalApplicationsThisSeason}
          </span>
          <span className="text-[11px] text-purple-600 font-medium mt-1 block">
            {metrics.offersExtendedCount} offers recorded
          </span>
        </div>
      </div>

      {/* Two Column Layout: Employer Queue & Requisition Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Vetting Desk */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employer Accreditation Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vetting corporate credentials prior to campus access
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin_companies')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              <span>Manage ({companies.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {companies.slice(0, 4).map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-medium text-slate-700">{c.industry}</span>
                    <span aria-hidden="true">·</span>
                    <span>HR: {c.hrContactName}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <StatusText status={c.verificationStatus} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requisition Moderation Desk */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Job Requisitions Moderation Desk
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compensation review and criteria authorization
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin_jobs')}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              <span>Inspect All ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-medium text-slate-700">{job.companyName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {job.ctcLpa} LPA
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Min CGPA {job.criteria.minCgpa.toFixed(1)}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <StatusText status={job.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
