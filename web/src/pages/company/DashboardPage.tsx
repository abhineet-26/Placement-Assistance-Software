import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

type Job = {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_review' | 'published' | 'returned' | 'closed';
  review_comment: string | null;
  vacancies: number;
};

const DashboardPage = () => {
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['company-jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs/');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-h1 font-bold text-primary">Company Dashboard</h1>
          <div className="w-32 h-10 bg-primary/20 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface rounded-xl shadow-card animate-pulse border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-h1 font-bold text-primary mb-1">Company Dashboard</h1>
          <p className="text-text-secondary">Manage your job postings and applicants.</p>
        </div>
        <Link 
          to="/company/jobs/new"
          className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-colors shrink-0"
        >
          + Post New Job
        </Link>
      </div>
      
      {jobs?.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No jobs posted yet</h2>
          <p className="text-text-secondary max-w-md mb-6">Create your first job posting to start finding the perfect candidates.</p>
          <Link 
            to="/company/jobs/new"
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-colors"
          >
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-h2 font-bold text-text-primary mb-4">Recent Postings</h2>
          <div className="grid gap-4">
            {jobs?.map(job => (
              <div key={job.id} className="p-6 bg-surface border border-border rounded-xl shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-bold text-text-primary mb-1">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {job.vacancies} {job.vacancies === 1 ? 'Vacancy' : 'Vacancies'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end w-full sm:w-auto">
                  <StatusBadge status={job.status} />
                  
                  {job.status === 'returned' && job.review_comment && (
                    <div className="mt-3 text-xs text-danger bg-danger/5 p-2 rounded-lg border border-danger/20 w-full sm:max-w-xs sm:text-right">
                      <span className="font-semibold block mb-0.5">Review feedback:</span>
                      {job.review_comment}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
