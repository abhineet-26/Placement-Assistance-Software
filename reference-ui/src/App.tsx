/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActiveView, AppShell } from './components/layout/AppShell';

// Student Views
import { StudentDashboardView } from './views/student/StudentDashboardView';
import { JobsListView } from './views/student/JobsListView';
import { JobDetailView } from './views/student/JobDetailView';
import { ApplicationsView } from './views/student/ApplicationsView';
import { InterviewsView } from './views/student/InterviewsView';
import { OffersView } from './views/student/OffersView';
import { ProfileView } from './views/student/ProfileView';

// Company Views
import { CompanyDashboardView } from './views/company/CompanyDashboardView';
import { CompanyJobsView } from './views/company/CompanyJobsView';
import { JobEditorView } from './views/company/JobEditorView';
import { ApplicantsView } from './views/company/ApplicantsView';
import { CompanyInterviewsView } from './views/company/CompanyInterviewsView';
import { CompanyOffersView } from './views/company/CompanyOffersView';
import { CompanyProfileView } from './views/company/CompanyProfileView';

// Admin Views
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { CompanyApprovalsView } from './views/admin/CompanyApprovalsView';
import { JobModerationView } from './views/admin/JobModerationView';
import { StudentRegistryView } from './views/admin/StudentRegistryView';
import { ApplicationOversightView } from './views/admin/ApplicationOversightView';
import { CampusInterviewsView } from './views/admin/CampusInterviewsView';
import { OfferLedgerView } from './views/admin/OfferLedgerView';
import { PolicySettingsView } from './views/admin/PolicySettingsView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

const MainRouter: React.FC = () => {
  const { role } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    if (role === 'company') return 'company_dashboard';
    if (role === 'admin') return 'admin_dashboard';
    return 'student_dashboard';
  });

  const [selectedJobId, setSelectedJobId] = useState<string>('job-101');

  const handleNavigate = (view: ActiveView, contextId?: string) => {
    if (contextId) {
      setSelectedJobId(contextId);
    }
    setCurrentView(view);
  };

  return (
    <AppShell
      currentView={currentView}
      onNavigate={handleNavigate}
      selectedJobId={selectedJobId}
    >
      {/* Student Views */}
      {currentView === 'student_dashboard' && (
        <StudentDashboardView onNavigate={handleNavigate} />
      )}
      {currentView === 'student_jobs' && (
        <JobsListView onSelectJob={(id) => handleNavigate('student_job_detail', id)} />
      )}
      {currentView === 'student_job_detail' && (
        <JobDetailView
          jobId={selectedJobId}
          onBack={() => handleNavigate('student_jobs')}
          onViewApplications={() => handleNavigate('student_applications')}
        />
      )}
      {currentView === 'student_applications' && (
        <ApplicationsView onSelectJob={(id) => handleNavigate('student_job_detail', id)} />
      )}
      {currentView === 'student_interviews' && <InterviewsView />}
      {currentView === 'student_offers' && <OffersView />}
      {currentView === 'student_profile' && <ProfileView />}

      {/* Recruiter Views */}
      {currentView === 'company_dashboard' && (
        <CompanyDashboardView onNavigate={handleNavigate} />
      )}
      {currentView === 'company_jobs' && (
        <CompanyJobsView onNavigate={handleNavigate} />
      )}
      {currentView === 'company_job_new' && (
        <JobEditorView
          onBack={() => handleNavigate('company_jobs')}
          onSuccess={() => handleNavigate('company_jobs')}
        />
      )}
      {currentView === 'company_applicants' && (
        <ApplicantsView
          initialJobId={selectedJobId}
          onNavigateToScheduler={() => handleNavigate('company_interviews')}
        />
      )}
      {currentView === 'company_interviews' && <CompanyInterviewsView />}
      {currentView === 'company_offers' && <CompanyOffersView />}
      {currentView === 'company_profile' && <CompanyProfileView />}

      {/* Admin Views */}
      {currentView === 'admin_dashboard' && (
        <AdminDashboardView onNavigate={handleNavigate} />
      )}
      {currentView === 'admin_companies' && <CompanyApprovalsView />}
      {currentView === 'admin_jobs' && <JobModerationView />}
      {currentView === 'admin_students' && <StudentRegistryView />}
      {currentView === 'admin_applications' && <ApplicationOversightView />}
      {currentView === 'admin_interviews' && <CampusInterviewsView />}
      {currentView === 'admin_offers' && <OfferLedgerView />}
      {currentView === 'admin_settings' && <PolicySettingsView />}
    </AppShell>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}
