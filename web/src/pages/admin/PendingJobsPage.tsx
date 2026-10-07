import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

type Job = {
  id: string;
  company_id: string;
  title: string;
  description: string;
  required_skills: string[];
  vacancies: number;
  application_deadline: string;
  status: 'pending_review' | 'published' | 'returned' | 'closed';
  min_cgpa: number | null;
};

const PendingJobsPage = () => {
  const queryClient = useQueryClient();
  const [returnComment, setReturnComment] = useState<Record<string, string>>({});

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['admin-jobs', 'pending'],
    queryFn: async () => {
      const res = await api.get('/jobs/?status_filter=pending_review');
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/jobs/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs', 'pending'] });
    }
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string, comment: string }) => 
      api.patch(`/jobs/${id}/return`, { review_comment: comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs', 'pending'] });
      setReturnComment({}); // Reset comments on success
    }
  });

  if (isLoading) return <div>Loading jobs...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-bold text-primary">Pending Jobs</h1>
      
      {jobs?.length === 0 ? (
        <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
          No jobs pending review.
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs?.map(job => (
            <div key={job.id} className="p-6 bg-surface border border-border rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{job.description}</p>
                </div>
                <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  Vacancies: {job.vacancies}
                </div>
              </div>
              
              <div className="mb-4 text-sm">
                <span className="font-medium text-text-secondary">Skills: </span>
                {job.required_skills.join(', ')}
              </div>

              <div className="flex items-end justify-between">
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium mb-1">Return Comment (if rejecting)</label>
                  <input
                    type="text"
                    value={returnComment[job.id] || ''}
                    onChange={e => setReturnComment({ ...returnComment, [job.id]: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded"
                    placeholder="Enter reason for returning..."
                  />
                </div>
                
                <div className="space-x-3 flex-shrink-0">
                  <button 
                    onClick={() => returnMutation.mutate({ id: job.id, comment: returnComment[job.id] || 'Please review.' })}
                    disabled={returnMutation.isPending}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Return to Company
                  </button>
                  <button 
                    onClick={() => approveMutation.mutate(job.id)}
                    disabled={approveMutation.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Publish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingJobsPage;
