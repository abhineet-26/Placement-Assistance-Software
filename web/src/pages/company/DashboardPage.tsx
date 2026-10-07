import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Link } from 'react-router-dom';


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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-h1 font-bold text-primary">Company Dashboard</h1>
        <Link 
          to="/company/jobs/new"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
        >
          Post New Job
        </Link>
      </div>
      
      {isLoading ? (
        <div>Loading your job postings...</div>
      ) : jobs?.length === 0 ? (
        <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
          You haven't posted any jobs yet.
        </div>
      ) : (
        <div className="grid gap-4">
          <h2 className="text-h2 font-semibold">Your Postings</h2>
          {jobs?.map(job => (
            <div key={job.id} className="p-4 bg-surface border border-border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm text-text-secondary">Vacancies: {job.vacancies}</p>
              </div>
              <div className="mt-2 sm:mt-0 flex flex-col items-end">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                  ${job.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                  ${job.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${job.status === 'returned' ? 'bg-red-100 text-red-800' : ''}
                  ${job.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''}
                  ${job.status === 'draft' ? 'bg-blue-100 text-blue-800' : ''}
                `}>
                  {job.status.replace('_', ' ').toUpperCase()}
                </span>
                {job.status === 'returned' && job.review_comment && (
                  <p className="text-xs text-red-600 mt-1 max-w-xs text-right">
                    Review: {job.review_comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
