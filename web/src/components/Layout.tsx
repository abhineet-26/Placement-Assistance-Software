import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const Bell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);
const Menu = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.role],
    queryFn: async () => {
      if (user?.role === 'student') return (await api.get('/students/me')).data;
      if (user?.role === 'company') return (await api.get('/companies/me')).data;
      return null;
    },
    enabled: !!user && user.role !== 'admin',
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data.count,
    enabled: !!user,
  });

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('opportunities')) return 'Job Opportunities';
    if (path.includes('applications')) return 'Applications';
    if (path.includes('profile')) return 'Profile';
    if (path.includes('cv')) return 'CV Editor';
    if (path.includes('jobs/new')) return 'Post Job';
    if (path.includes('jobs')) return 'Jobs';
    if (path.includes('companies')) return 'Companies';
    if (path.includes('feedback')) return 'Feedback';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('interviews')) return 'Interviews';
    if (path.includes('offers')) return 'Offers';
    if (path.includes('students')) return 'Students';
    return 'Placement Assistant';
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 text-sm rounded transition-colors ${
      isActive
        ? 'font-semibold bg-white/10 text-white'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`;

  const userName = profile?.name || profile?.company_name || 'Admin User';

  return (
    <div className="flex h-screen bg-background text-text-primary font-sans">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform flex-col border-r border-primary-hover bg-primary text-white transition-transform md:static md:flex md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full'}`}>
        <div className="flex p-4 items-center justify-between border-b border-white/10">
          <div className="text-h3 font-semibold text-white">
            Placement App
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin" end className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/admin/students" className={navLinkClass}>Students</NavLink>
              <NavLink to="/admin/companies" className={navLinkClass}>Pending Companies</NavLink>
              <NavLink to="/admin/jobs/pending" className={navLinkClass}>Pending Jobs</NavLink>
              <NavLink to="/admin/jobs" end className={navLinkClass}>Active Jobs</NavLink>
              <NavLink to="/admin/applications" className={navLinkClass}>Applications</NavLink>
              <NavLink to="/admin/interviews" className={navLinkClass}>Interviews</NavLink>
              <NavLink to="/admin/offers" className={navLinkClass}>Offers</NavLink>
              <NavLink to="/admin/feedback" className={navLinkClass}>Feedback</NavLink>
              <NavLink to="/admin/notifications" className={navLinkClass}>Notifications</NavLink>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <NavLink to="/student/dashboard" className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/student/opportunities" className={navLinkClass}>Opportunities</NavLink>
              <NavLink to="/student/applications" className={navLinkClass}>My Applications</NavLink>
              <NavLink to="/student/interviews" className={navLinkClass}>My Interviews</NavLink>
              <NavLink to="/student/profile" className={navLinkClass}>My Profile</NavLink>
              <NavLink to="/student/cv" className={navLinkClass}>My CV</NavLink>
              <NavLink to="/student/feedback" className={navLinkClass}>Submit Feedback</NavLink>
              <NavLink to="/student/notifications" className={navLinkClass}>Notifications</NavLink>
            </>
          )}
          {user?.role === 'company' && (
            <>
              <NavLink to="/company" end className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/company/jobs" end className={navLinkClass}>My Jobs</NavLink>
              <NavLink to="/company/jobs/new" className={navLinkClass}>Post Job</NavLink>
              <NavLink to="/company/feedback" className={navLinkClass}>Submit Feedback</NavLink>
              <NavLink to="/company/notifications" className={navLinkClass}>Notifications</NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface border-b border-border flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-secondary" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-lg font-medium">{getPageTitle()}</div>
          </div>
          <div className="flex items-center space-x-4">
            <NavLink to={`/${user?.role}/notifications`} className="relative text-text-secondary hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
            <div className="flex items-center space-x-4 border-l border-border pl-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-medium">{userName}</span>
                  <span className="text-xs uppercase text-text-secondary">{user?.role}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm text-text-secondary hover:text-danger font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
