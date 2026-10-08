import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  useApplications,
  useInterviews,
  useJobs,
  useOffers,
  useNotices,
} from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { evaluateStudentEligibility } from '../../services/api';

interface StudentDashboardViewProps {
  onNavigate: (view: any, id?: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ onNavigate }) => {
  const { studentProfile } = useAuth();
  const { data: jobs = [] } = useJobs({ status: 'published' });
  const { data: applications = [] } = useApplications({ studentId: studentProfile?.id });
  const { data: interviews = [] } = useInterviews({ studentId: studentProfile?.id });
  const { data: offers = [] } = useOffers({ studentId: studentProfile?.id });
  const { data: notices = [] } = useNotices();

  if (!studentProfile) {
    return <div className="text-slate-500 text-xs">Loading profile records...</div>;
  }

  const eligibleJobs = jobs.filter(
    (j) => evaluateStudentEligibility(studentProfile, j).isEligible
  );

  const upcomingInterviews = interviews.filter((i) => i.status === 'scheduled');
  const activeApplications = applications.filter(
    (a) => !['rejected', 'withdrawn'].includes(a.status)
  );

  return (
    <div className="space-y-6">
      {/* Vibrant Welcome & Candidacy Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white p-6 sm:p-7 rounded-xl shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                Active Placement Candidacy
              </span>
              <span className="text-xs font-mono tabular-nums text-blue-200">
                · Batch {studentProfile.batchYear}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1.5">
              Welcome back, {studentProfile.fullName}!
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-blue-100 mt-2 font-medium">
              <span>{studentProfile.department}</span>
              <span aria-hidden="true" className="text-blue-300">
                ·
              </span>
              <span className="font-mono tabular-nums">Roll: {studentProfile.rollNumber}</span>
              <span aria-hidden="true" className="text-blue-300">
                ·
              </span>
              <span className="font-mono tabular-nums font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                CGPA {studentProfile.cgpa.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {studentProfile.placementStatus === 'placed' ? (
              <div className="p-3.5 bg-emerald-500/90 text-white rounded-lg shadow-sm backdrop-blur-xs">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Placed at {studentProfile.placedCompanyName}</span>
                </div>
                <span className="font-mono tabular-nums text-xs text-emerald-100 font-semibold mt-0.5 block">
                  Package: {studentProfile.placedCtcLpa} LPA
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-white/15 text-white rounded-lg backdrop-blur-xs border border-white/20">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Eligible Candidate</span>
                </div>
                <span className="text-xs text-blue-100 mt-0.5 block font-medium">
                  {eligibleJobs.length} active drives match your profile
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vibrant Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Eligible Drives */}
        <div className="bg-white border border-blue-100 p-5 rounded-xl shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Eligible Drives
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-blue-700 block">
            {eligibleJobs.length}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            out of {jobs.length} published positions
          </span>
        </div>

        {/* Card 2: Active Applications */}
        <div className="bg-white border border-emerald-100 p-5 rounded-xl shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-emerald-700 block">
            {activeApplications.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {applications.filter((a) => a.status === 'forwarded_by_cell').length} forwarded to HR
          </span>
        </div>

        {/* Card 3: Interviews */}
        <div className="bg-white border border-amber-100 p-5 rounded-xl shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Interviews
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-amber-600 block">
            {upcomingInterviews.length}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Scheduled assessment rounds
          </span>
        </div>

        {/* Card 4: Offers */}
        <div className="bg-white border border-purple-100 p-5 rounded-xl shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Offers
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono tabular-nums text-3xl font-extrabold text-purple-700 block">
            {offers.length}
          </span>
          <span className="text-[11px] text-purple-600 font-medium mt-1 block">
            {offers.filter((o) => o.status === 'pending').length} pending decision
          </span>
        </div>
      </div>

      {/* Vibrant Next Interview Alert */}
      {upcomingInterviews.length > 0 && (
        <div className="border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                    Upcoming Round
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {upcomingInterviews[0].roundName} · {upcomingInterviews[0].companyName}
                  </h4>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2 font-medium">
                  <span className="font-mono tabular-nums font-bold text-blue-700">
                    {new Date(upcomingInterviews[0].scheduledTime).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{upcomingInterviews[0].mode} Session</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-xs">{upcomingInterviews[0].locationOrUrl}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('student_interviews')}
              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs shrink-0"
            >
              View Coordinates
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Recommended Open Drives + Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Open Drives */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommended Campus Drives</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vetted by placement cell according to your branch & CGPA
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('student_jobs')}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <span>View All ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {eligibleJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="p-4 hover:bg-blue-50/30 transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800">{job.companyName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {job.ctcLpa} LPA
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{job.location}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono tabular-nums">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('student_job_detail', job.id)}
                  className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Inspect & Apply
                </button>
              </div>
            ))}

            {eligibleJobs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No active drives currently match your specific branch criteria. Check back soon.
              </div>
            )}
          </div>
        </div>

        {/* Application Trajectory */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Trajectory</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current progress across selection funnels
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('student_applications')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
            >
              <span>Manage ({applications.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {applications.slice(0, 4).map((app) => (
              <div key={app.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{app.jobTitle}</h4>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{app.companyName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600">Round: {app.currentRound}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <StatusText status={app.status} size="sm" />
                </div>
              </div>
            ))}

            {applications.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                You have not submitted any drive applications yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
