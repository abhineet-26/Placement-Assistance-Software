import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import JobCard from '../../components/JobCard';

export default function CompanyJobsPage() {
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['company', 'jobs'],
    queryFn: async () => (await api.get('/companies/me/jobs')).data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-h1 font-bold text-primary">My Jobs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-surface rounded-xl shadow-card animate-pulse border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-h1 font-bold text-primary mb-1">My Jobs</h1>
          <p className="text-text-secondary">Manage your job postings and applicants.</p>
        </div>
        <Link to="/company/jobs/new" className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-hover shadow-sm hover:shadow transition-all hover:-translate-y-0.5">
          Post New Job
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No jobs posted yet</h2>
          <p className="text-text-secondary max-w-md mb-6">Click Post Job to create your first listing and start receiving applications.</p>
          <Link to="/company/jobs/new" className="text-primary font-semibold hover:underline">
            Post your first job &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: any) => (
            <JobCard 
              key={job.id} 
              job={{
                title: job.title,
                company_name: 'Your Company', // It's their own job
                ctc: job.package ? `₹${job.package} LPA` : 'Not specified',
                location: job.location || 'Location TBD',
                deadline: job.deadline,
                skills: job.required_skills || [],
                status: job.status
              }}
              onView={() => navigate(`/company/jobs/${job.id}/cvs`)}
              actionText="View Applicants"
              onApply={() => navigate(`/company/jobs/${job.id}/cvs`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
