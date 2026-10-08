import PageSkeleton from '../../components/PageSkeleton';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

type Job = {
  id: string;
  title: string;
  company_id: string;
  vacancies: number;
  status: string;
};

const AdminJobsPage = () => {
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['admin-jobs', 'published'],
    queryFn: async () => {
      const res = await api.get('/jobs/?status_filter=published');
      return res.data;
    }
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-bold text-primary">Active Jobs</h1>
      
      {jobs?.length === 0 ? (
        <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
          No active jobs found.
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs?.map(job => (
            <div key={job.id} className="p-6 bg-surface border border-border rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm text-text-secondary mt-1">Vacancies: {job.vacancies}</p>
              </div>
              <Link 
                to={`/admin/jobs/${job.id}/matches`}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
              >
                View Matches
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;
