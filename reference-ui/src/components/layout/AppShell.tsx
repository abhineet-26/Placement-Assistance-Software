import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Users,
  Bell,
  Sliders,
  Award,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { useNotices } from '../../hooks/usePlacementQueries';

export type ActiveView =
  | 'student_dashboard'
  | 'student_jobs'
  | 'student_job_detail'
  | 'student_applications'
  | 'student_interviews'
  | 'student_offers'
  | 'student_profile'
  | 'company_dashboard'
  | 'company_jobs'
  | 'company_job_new'
  | 'company_applicants'
  | 'company_interviews'
  | 'company_offers'
  | 'company_profile'
  | 'admin_dashboard'
  | 'admin_companies'
  | 'admin_jobs'
  | 'admin_students'
  | 'admin_applications'
  | 'admin_interviews'
  | 'admin_offers'
  | 'admin_settings';

interface AppShellProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView, contextId?: string) => void;
  selectedJobId?: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  const { role, switchRole, user, studentProfile } = useAuth();
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const { data: notices = [] } = useNotices();

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    if (newRole === 'student') {
      onNavigate('student_dashboard');
    } else if (newRole === 'company') {
      onNavigate('company_dashboard');
    } else {
      onNavigate('admin_dashboard');
    }
  };

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'student_dashboard':
        return 'Student / Trajectory Overview';
      case 'student_jobs':
        return 'Student / Placement Opportunities';
      case 'student_job_detail':
        return 'Student / Job Criteria & Application';
      case 'student_applications':
        return 'Student / Submitted Applications';
      case 'student_interviews':
        return 'Student / Interview Schedule';
      case 'student_offers':
        return 'Student / Offers & Policy';
      case 'student_profile':
        return 'Student / Academic Dossier';

      case 'company_dashboard':
        return 'Recruiter / Recruitment Campaign';
      case 'company_jobs':
        return 'Recruiter / Job Requisitions';
      case 'company_job_new':
        return 'Recruiter / New Requisition';
      case 'company_applicants':
        return 'Recruiter / Candidate Pipeline';
      case 'company_interviews':
        return 'Recruiter / Interview Slots';
      case 'company_offers':
        return 'Recruiter / Issued Offers';
      case 'company_profile':
        return 'Recruiter / Organization Profile';

      case 'admin_dashboard':
        return 'Placement Cell / Operations Hub';
      case 'admin_companies':
        return 'Placement Cell / Company Approvals';
      case 'admin_jobs':
        return 'Placement Cell / Job Moderation';
      case 'admin_students':
        return 'Placement Cell / Student Registry';
      case 'admin_applications':
        return 'Placement Cell / Applications & CV Forwarding';
      case 'admin_interviews':
        return 'Placement Cell / Campus Interview Coordination';
      case 'admin_offers':
        return 'Placement Cell / Offer Ledger & Policies';
      case 'admin_settings':
        return 'Placement Cell / Policy Settings';
      default:
        return 'Placement Portal';
    }
  };

  // Role theme styles
  const roleTheme = {
    student: {
      accentColor: 'text-blue-600',
      activeNav: 'bg-blue-50 text-blue-700 font-bold border-r-3 border-blue-600',
      badgeBg: 'bg-blue-600 text-white',
      hoverNav: 'text-slate-700 hover:bg-blue-50/60 hover:text-blue-700',
    },
    company: {
      accentColor: 'text-purple-600',
      activeNav: 'bg-purple-50 text-purple-700 font-bold border-r-3 border-purple-600',
      badgeBg: 'bg-purple-600 text-white',
      hoverNav: 'text-slate-700 hover:bg-purple-50/60 hover:text-purple-700',
    },
    admin: {
      accentColor: 'text-emerald-600',
      activeNav: 'bg-emerald-50 text-emerald-800 font-bold border-r-3 border-emerald-600',
      badgeBg: 'bg-emerald-600 text-white',
      hoverNav: 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-800',
    },
  }[role];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans">
      {/* Top Bar with Vibrant Accents */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Zone 1: Wordmark & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                Campus<span className="text-blue-600">Placement</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium block leading-none">
                Directorate of Career Development
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Contextual Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>{getBreadcrumbTitle()}</span>
        </div>

        {/* Zone 3: Actions & Vibrant Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Vibrant Role Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`px-3 py-1 rounded-md transition-all ${
                role === 'student'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('company')}
              className={`px-3 py-1 rounded-md transition-all ${
                role === 'company'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-white/60'
              }`}
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`px-3 py-1 rounded-md transition-all ${
                role === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-white/60'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Announcements Trigger */}
          <button
            type="button"
            onClick={() => setIsNoticeOpen(true)}
            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg relative transition-colors border border-slate-200 bg-white"
            title="Placement Notices"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {notices.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full ring-2 ring-white flex items-center justify-center text-[8px] text-white font-bold">
                {notices.length}
              </span>
            )}
          </button>

          {/* User Identifier */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
              {user?.name.charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
              {user?.name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Dock */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {role === 'student' && 'Student Portal'}
                {role === 'company' && 'Recruiter Workspace'}
                {role === 'admin' && 'Directorate Admin'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  role === 'student'
                    ? 'bg-blue-100 text-blue-700'
                    : role === 'company'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {role}
              </span>
            </div>
          </div>

          <nav className="p-2 space-y-1 flex-1 overflow-y-auto text-xs font-medium">
            {/* Student Navigation */}
            {role === 'student' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('student_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'student_dashboard'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Overview & Trajectory</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student_jobs')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'student_jobs' || currentView === 'student_job_detail'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Opportunities Directory</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student_applications')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'student_applications'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>My Applications</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student_interviews')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'student_interviews'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Interview Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student_offers')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'student_offers'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Award className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Offers & Acceptance</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student_profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'student_profile'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Academic Dossier</span>
                </button>
              </>
            )}

            {/* Recruiter Navigation */}
            {role === 'company' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('company_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'company_dashboard'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Recruitment Campaign</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('company_jobs')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'company_jobs' || currentView === 'company_job_new'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Job Requisitions</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('company_applicants')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'company_applicants'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Candidate Pipeline</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('company_interviews')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'company_interviews'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Interview Coordination</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('company_offers')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'company_offers'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Offers Desk</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('company_profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'company_profile'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Organization Profile</span>
                </button>
              </>
            )}

            {/* Admin Navigation */}
            {role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('admin_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'admin_dashboard'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Operations Console</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin_companies')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'admin_companies'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Company Approvals</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin_jobs')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'admin_jobs'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Job Moderation</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin_students')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'admin_students'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Student Registry</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin_applications')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'admin_applications'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Layers className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>CV Forwarding Desk</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin_interviews')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'admin_interviews'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Campus Interview Desk</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin_offers')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'admin_offers'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Award className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Offer Ledger & Policy</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin_settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    currentView === 'admin_settings'
                      ? roleTheme.activeNav
                      : roleTheme.hoverNav
                  }`}
                >
                  <Sliders className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Policy & Criteria Master</span>
                </button>
              </>
            )}
          </nav>

          {/* Student Status Summary Card in Dock */}
          {role === 'student' && studentProfile && (
            <div className="p-3.5 m-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-xs">
              <div className="text-[11px] font-semibold text-blue-700">Verified Academic Record</div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-mono tabular-nums text-slate-900 font-extrabold text-sm">
                  CGPA {studentProfile.cgpa.toFixed(2)}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                </span>
              </div>
            </div>
          )}

          {/* Recruiter active organization pill */}
          {role === 'company' && (
            <div className="p-3.5 m-2 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-xs">
              <div className="text-[11px] font-semibold text-purple-700">Verified Employer</div>
              <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                Datashield Analytics
              </div>
            </div>
          )}

          {/* Admin institutional status card */}
          {role === 'admin' && (
            <div className="p-3.5 m-2 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-xs">
              <div className="text-[11px] font-semibold text-emerald-700">System Standing</div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                FastAPI `/api/v1` Synchronized
              </div>
            </div>
          )}

          <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Placement Cell Engine v2.4
          </div>
        </aside>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Institutional Notices Drawer */}
      {isNoticeOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsNoticeOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Placement Notices
                  </h3>
                </div>
                <button
                  onClick={() => setIsNoticeOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 bg-white border rounded-lg text-xs space-y-1.5 shadow-xs ${
                      n.priority === 'urgent'
                        ? 'border-rose-300 ring-1 ring-rose-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 leading-snug">{n.title}</h4>
                      {n.priority === 'urgent' && (
                        <span className="text-[10px] text-rose-700 bg-rose-100 font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{n.content}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                      <span className="font-medium text-slate-700">{n.author}</span>
                      <span className="font-mono tabular-nums">
                        {new Date(n.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
