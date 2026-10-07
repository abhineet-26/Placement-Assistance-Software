import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import StudentRegisterPage from './pages/auth/StudentRegisterPage';
import CompanyRegisterPage from './pages/auth/CompanyRegisterPage';
import ProfilePage from './pages/student/ProfilePage';
import CVEditorPage from './pages/student/CVEditorPage';
import OpportunitiesPage from './pages/student/OpportunitiesPage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import CompanyDashboardPage from './pages/company/DashboardPage';
import PostJobPage from './pages/company/PostJobPage';
import CompanyJobCVsPage from './pages/company/CompanyJobCVsPage';
import PendingCompaniesPage from './pages/admin/PendingCompaniesPage';
import PendingJobsPage from './pages/admin/PendingJobsPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import JobMatchesPage from './pages/admin/JobMatchesPage';

const queryClient = new QueryClient();


// Component to handle role-based redirection from root
const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'company') return <Navigate to="/company" replace />;
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/student" element={<StudentRegisterPage />} />
            <Route path="/register/company" element={<CompanyRegisterPage />} />

            {/* Protected layout and routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<RootRedirect />} />
              
              <Route path="student/*" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Routes>
                    <Route index element={<Navigate to="opportunities" replace />} />
                    <Route path="opportunities" element={<OpportunitiesPage />} />
                    <Route path="applications" element={<ApplicationsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="cv" element={<CVEditorPage />} />
                  </Routes>
                </ProtectedRoute>
              } />
              
              <Route path="company/*" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <Routes>
                    <Route index element={<CompanyDashboardPage />} />
                    <Route path="jobs/new" element={<PostJobPage />} />
                    <Route path="cvs" element={<CompanyJobCVsPage />} />
                    <Route path="jobs/:jobId/cvs" element={<CompanyJobCVsPage />} />
                  </Routes>
                </ProtectedRoute>
              } />
              
              <Route path="admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route index element={<Navigate to="companies" replace />} />
                    <Route path="companies" element={<PendingCompaniesPage />} />
                    <Route path="jobs/pending" element={<PendingJobsPage />} />
                    <Route path="jobs" element={<AdminJobsPage />} />
                    <Route path="jobs/:jobId/matches" element={<JobMatchesPage />} />
                  </Routes>
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
