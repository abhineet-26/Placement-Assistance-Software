import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import StudentRegisterPage from './pages/auth/StudentRegisterPage';
import CompanyRegisterPage from './pages/auth/CompanyRegisterPage';

import StudentDashboardPage from './pages/student/DashboardPage';
import ProfilePage from './pages/student/ProfilePage';
import CVEditorPage from './pages/student/CVEditorPage';
import OpportunitiesPage from './pages/student/OpportunitiesPage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import StudentFeedbackPage from './pages/student/FeedbackPage';

import CompanyDashboardPage from './pages/company/DashboardPage';
import CompanyJobsPage from './pages/company/JobsPage';
import PostJobPage from './pages/company/PostJobPage';
import CompanyJobCVsPage from './pages/company/CompanyJobCVsPage';
import CompanyFeedbackPage from './pages/company/FeedbackPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminInterviewsPage from './pages/admin/AdminInterviewsPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import PendingCompaniesPage from './pages/admin/PendingCompaniesPage';
import PendingJobsPage from './pages/admin/PendingJobsPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import JobMatchesPage from './pages/admin/JobMatchesPage';
import FeedbackModerationPage from './pages/admin/FeedbackModerationPage';

import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'company') return <Navigate to="/company" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/student" element={<StudentRegisterPage />} />
            <Route path="/register/company" element={<CompanyRegisterPage />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<RootRedirect />} />
              
              <Route path="student/*" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Routes>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<StudentDashboardPage />} />
                    <Route path="opportunities" element={<OpportunitiesPage />} />
                    <Route path="applications" element={<ApplicationsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="cv" element={<CVEditorPage />} />
                    <Route path="feedback" element={<StudentFeedbackPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Routes>
                </ProtectedRoute>
              } />
              
              <Route path="company/*" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <Routes>
                    <Route index element={<CompanyDashboardPage />} />
                    <Route path="jobs" element={<CompanyJobsPage />} />
                    <Route path="jobs/new" element={<PostJobPage />} />
                    <Route path="cvs" element={<CompanyJobCVsPage />} />
                    <Route path="jobs/:jobId/cvs" element={<CompanyJobCVsPage />} />
                    <Route path="feedback" element={<CompanyFeedbackPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Routes>
                </ProtectedRoute>
              } />
              
              <Route path="admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="students" element={<AdminStudentsPage />} />
                    <Route path="companies" element={<PendingCompaniesPage />} />
                    <Route path="jobs/pending" element={<PendingJobsPage />} />
                    <Route path="jobs" element={<AdminJobsPage />} />
                    <Route path="jobs/:jobId/matches" element={<JobMatchesPage />} />
                    <Route path="applications" element={<AdminApplicationsPage />} />
                    <Route path="interviews" element={<AdminInterviewsPage />} />
                    <Route path="offers" element={<AdminOffersPage />} />
                    <Route path="feedback" element={<FeedbackModerationPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Routes>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
