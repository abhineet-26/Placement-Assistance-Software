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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-10 w-64 bg-border rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-surface rounded-xl shadow-card animate-pulse border border-border" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-primary mb-1">Pending Jobs</h1>
        <p className="text-text-secondary">Review job postings before they are visible to students.</p>
      </div>
      
      {jobs?.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No pending jobs</h2>
          <p className="text-text-secondary max-w-md">There are currently no job postings waiting for review.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs?.map(job => (
            <div key={job.id} className="p-6 bg-surface border border-border rounded-xl shadow-card flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-primary">{job.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                      Vacancies: {job.vacancies}
                    </span>
                    {job.min_cgpa && (
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        Min CGPA: {job.min_cgpa}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-4 whitespace-pre-wrap line-clamp-3">{job.description}</p>
                </div>
              </div>
              
              <div className="mb-6 flex flex-wrap gap-2">
                {job.required_skills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-medium rounded-full">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-4 border-t border-border">
                <div className="w-full sm:flex-1">
                  <label className="block text-sm font-medium mb-1 text-text-primary">Return Comment (if rejecting)</label>
                  <input
                    type="text"
                    value={returnComment[job.id] || ''}
                    onChange={e => setReturnComment(prev => ({ ...prev, [job.id]: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    placeholder="Enter reason for returning..."
                  />
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => returnMutation.mutate({ id: job.id, comment: returnComment[job.id] || 'Please review.' })}
                    disabled={returnMutation.isPending}
                    className="flex-1 sm:flex-none px-5 py-2 bg-surface border border-warning text-warning font-semibold rounded-lg hover:bg-warning/10 disabled:opacity-50 transition-colors"
                  >
                    Return to Company
                  </button>
                  <button 
                    onClick={() => approveMutation.mutate(job.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 sm:flex-none px-5 py-2 bg-success text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors shadow-sm"
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
