
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background text-text-primary font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col hidden md:flex">
        <div className="p-4 text-h3 font-semibold text-primary border-b border-border">
          Placement Assistant
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/companies" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                Pending Companies
              </Link>
              <Link to="/admin/jobs/pending" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                Pending Jobs
              </Link>
              <Link to="/admin/jobs" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                Active Jobs
              </Link>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <Link to="/student/opportunities" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                Job Opportunities
              </Link>
              <Link to="/student/applications" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                My Applications
              </Link>
              <Link to="/student/profile" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                My Profile
              </Link>
              <Link to="/student/cv" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                My CV
              </Link>
            </>
          )}
          {user?.role === 'company' && (
            <>
              <Link to="/company" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                Dashboard
              </Link>
              <Link to="/company/jobs/new" className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 rounded">
                Post Job
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface border-b border-border flex items-center px-6 justify-between flex-shrink-0">
          <div className="text-lg font-medium">Dashboard</div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-text-secondary">Notifications</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user?.role}</span>
              <button 
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
