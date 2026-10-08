import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import JobCard from '../../components/JobCard';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => (await api.get('/students/me')).data,
  });

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['student', 'jobs'],
    queryFn: async () => (await api.get('/jobs/')).data,
  });

  const { data: applications, isLoading: loadingApps } = useQuery({
    queryKey: ['student', 'applications'],
    queryFn: async () => (await api.get('/applications/me')).data,
  });

  if (loadingProfile || loadingJobs || loadingApps) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-surface rounded-xl shadow-card animate-pulse border border-border" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface rounded-xl shadow-card animate-pulse border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-surface rounded-xl shadow-card animate-pulse border border-border" />
          ))}
        </div>
      </div>
    );
  }

  const availableJobsCount = jobs?.length || 0;
  const appliedCount = applications?.length || 0;
  const shortlistedCount = applications?.filter((a: any) => ['shortlisted', 'interview', 'hired'].includes(a.status)).length || 0;
  const offersCount = applications?.filter((a: any) => a.status === 'hired').length || 0;

  const recentJobs = jobs?.slice(0, 3) || [];
  const latestApp = applications?.[0];

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-primary mb-1">Welcome back, {profile?.name}!</h1>
          <p className="text-text-secondary">
            Ready to take the next step in your career?
          </p>
        </div>
        <div className="flex gap-4 text-sm text-text-secondary bg-background px-4 py-3 rounded-lg border border-border/50">
          <div><span className="block text-xs uppercase opacity-70">Branch</span><span className="font-semibold text-text-primary">{profile?.branch}</span></div>
          <div className="w-px bg-border"></div>
          <div><span className="block text-xs uppercase opacity-70">CGPA</span><span className="font-semibold text-text-primary">{profile?.cgpa}</span></div>
          <div className="w-px bg-border"></div>
          <div><span className="block text-xs uppercase opacity-70">Backlogs</span><span className="font-semibold text-text-primary">{profile?.backlogs || 0}</span></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        <Link to="/student/opportunities" className="bg-surface border border-border rounded-xl p-6 shadow-card hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <div className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-2">Available Jobs</div>
          <div className="text-3xl font-bold text-primary">{availableJobsCount}</div>
        </Link>
        <Link to="/student/applications" className="bg-surface border border-border rounded-xl p-6 shadow-card hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <div className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-2">Applied</div>
          <div className="text-3xl font-bold text-primary">{appliedCount}</div>
        </Link>
        <Link to="/student/applications" className="bg-surface border border-border rounded-xl p-6 shadow-card hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <div className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-2">Shortlisted</div>
          <div className="text-3xl font-bold text-primary">{shortlistedCount}</div>
        </Link>
        <Link to="/student/applications" className="bg-surface border border-border rounded-xl p-6 shadow-card hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <div className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-2">Offers</div>
          <div className="text-3xl font-bold text-success">{offersCount}</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-text-primary">Recent Opportunities</h2>
            <Link to="/student/opportunities" className="text-sm text-primary font-medium hover:underline">
              View all &rarr;
            </Link>
          </div>
          
          {recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentJobs.map((job: any) => (
                <JobCard 
                  key={job.id} 
                  job={job}
                  onView={() => navigate('/student/opportunities')}
                  actionText="Apply"
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-8 shadow-card flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-1">No recent opportunities</h3>
              <p className="text-sm text-text-secondary">Check back later for new job postings.</p>
            </div>
          )}
        </div>

        {/* Latest Application Timeline - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card h-full">
            <h2 className="text-xl font-bold text-text-primary mb-5">Latest Application</h2>
            {latestApp ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-border/50">
                  <h3 className="font-bold text-lg leading-tight mb-1">{latestApp.job_title}</h3>
                  <p className="text-sm font-medium text-text-secondary">{latestApp.company_name}</p>
                </div>
                {/* Timeline visual */}
                <div className="relative pl-7 border-l-2 border-border/60 space-y-6 mt-6 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[35px] top-0.5 h-4 w-4 rounded-full bg-primary border-[3px] border-surface shadow-sm" />
                    <p className="font-bold text-text-primary text-sm">Applied</p>
                    <p className="text-xs text-text-secondary mt-0.5">Application submitted</p>
                  </div>
                  {['shortlisted', 'interview', 'hired'].includes(latestApp.status) && (
                    <div className="relative">
                      <div className="absolute -left-[35px] top-0.5 h-4 w-4 rounded-full bg-primary border-[3px] border-surface shadow-sm" />
                      <p className="font-bold text-text-primary text-sm">Shortlisted</p>
                      <p className="text-xs text-text-secondary mt-0.5">CV selected for next round</p>
                    </div>
                  )}
                  {['hired'].includes(latestApp.status) && (
                    <div className="relative">
                      <div className="absolute -left-[35px] top-0.5 h-4 w-4 rounded-full bg-success border-[3px] border-surface shadow-sm" />
                      <p className="font-bold text-success text-sm">Hired!</p>
                      <p className="text-xs text-success/80 mt-0.5">Offer received</p>
                    </div>
                  )}
                  {latestApp.status === 'rejected' && (
                    <div className="relative">
                      <div className="absolute -left-[35px] top-0.5 h-4 w-4 rounded-full bg-danger border-[3px] border-surface shadow-sm" />
                      <p className="font-bold text-danger text-sm">Rejected</p>
                      <p className="text-xs text-danger/80 mt-0.5">Application not successful</p>
                    </div>
                  )}
                  {latestApp.status === 'pending' && (
                    <div className="relative opacity-40">
                      <div className="absolute -left-[35px] top-0.5 h-4 w-4 rounded-full bg-border border-[3px] border-surface" />
                      <p className="font-bold text-text-primary text-sm">Under Review</p>
                      <p className="text-xs text-text-secondary mt-0.5">Pending company response</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 opacity-60">
                <svg className="w-12 h-12 text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-sm font-medium text-text-secondary">No applications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
