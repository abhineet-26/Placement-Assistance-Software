import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useState } from 'react';

type Job = {
  id: string;
  company_id: string;
  title: string;
  description: string;
  required_skills: string[];
  vacancies: number;
  application_deadline: string;
  min_cgpa: number | null;
  allowed_branches: string[] | null;
  max_backlogs: number | null;
  status: string;
};

type StudentProfile = {
  cgpa: number | null;
  branch: string | null;
  backlogs: number | null;
};

const OpportunitiesPage = () => {
  const queryClient = useQueryClient();
  const [applyError, setApplyError] = useState<{jobId: string, message: string} | null>(null);

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['student-jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs/');
      return res.data;
    }
  });

  const { data: profile, isLoading: profileLoading } = useQuery<StudentProfile>({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const res = await api.get('/students/me');
      return res.data;
    }
  });

  const { data: cv, isLoading: cvLoading } = useQuery({
    queryKey: ['studentCv'],
    queryFn: async () => {
      try {
        const res = await api.get('/cv/me');
        return res.data;
      } catch (err) {
        return null;
      }
    },
    retry: false
  });

  // Fetch applications to see if already applied
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/me');
      return res.data;
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await api.post('/applications/', { job_id: jobId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      setApplyError(null);
    },
    onError: (error: any, variables: string) => {
      setApplyError({
        jobId: variables,
        message: error.response?.data?.detail || 'Failed to apply'
      });
    }
  });

  const isLoading = jobsLoading || profileLoading || cvLoading || appsLoading;

  if (isLoading) return <div>Loading opportunities...</div>;

  const getEligibility = (job: Job) => {
    if (!profile) return { isEligible: false, reason: 'Profile not loaded' };
    
    if (job.min_cgpa !== null && (profile.cgpa || 0) < job.min_cgpa) {
      return { isEligible: false, reason: `CGPA too low (Requires ${job.min_cgpa})` };
    }
    
    if (job.allowed_branches && job.allowed_branches.length > 0 && profile.branch) {
      if (!job.allowed_branches.includes(profile.branch)) {
        return { isEligible: false, reason: `Branch ${profile.branch} not allowed` };
      }
    }
    
    if (job.max_backlogs !== null && (profile.backlogs || 0) > job.max_backlogs) {
      return { isEligible: false, reason: `Too many backlogs (Max ${job.max_backlogs})` };
    }
    
    return { isEligible: true };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-bold text-primary">Job Opportunities</h1>
      
      {!cv && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          <strong>Notice:</strong> You must upload a CV in your profile before you can apply to any jobs.
        </div>
      )}

      {jobs?.length === 0 ? (
        <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
          No job opportunities available right now. Check back later!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs?.map(job => {
            const eligibility = getEligibility(job);
            const isPastDeadline = new Date(job.application_deadline) < new Date();
            const hasApplied = applications?.some((app: any) => app.job_id === job.id && app.status !== 'withdrawn');
            
            // Client side blocking logic
            const isButtonDisabled = !cv || isPastDeadline || hasApplied || !eligibility.isEligible || applyMutation.isPending;
            
            return (
              <div key={job.id} className="p-6 bg-surface border border-border rounded-lg shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-primary">{job.title}</h3>
                    {eligibility.isEligible ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Eligible</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Not Eligible</span>
                    )}
                  </div>
                  
                  {!eligibility.isEligible && (
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      Reason: {eligibility.reason}
                    </div>
                  )}

                  <div className="mt-4 text-sm text-text-secondary whitespace-pre-wrap">
                    {job.description}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-1">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-text-secondary font-medium">Vacancies:</span> {job.vacancies}
                    </div>
                    <div>
                      <span className="text-text-secondary font-medium">Min CGPA:</span> {job.min_cgpa || 'N/A'}
                    </div>
                    <div>
                      <span className="text-text-secondary font-medium">Max Backlogs:</span> {job.max_backlogs ?? 'N/A'}
                    </div>
                    <div className="col-span-2">
                      <span className="text-text-secondary font-medium">Deadline:</span> {new Date(job.application_deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  {applyError?.jobId === job.id && (
                    <div className="text-sm text-red-600 font-medium">
                      {applyError.message}
                    </div>
                  )}
                  {hasApplied ? (
                    <button 
                      disabled
                      className="w-full px-4 py-2 bg-gray-200 text-gray-500 font-medium rounded cursor-not-allowed"
                    >
                      Applied
                    </button>
                  ) : isPastDeadline ? (
                    <button 
                      disabled
                      className="w-full px-4 py-2 bg-gray-200 text-gray-500 font-medium rounded cursor-not-allowed"
                    >
                      Deadline Passed
                    </button>
                  ) : (
                    <button 
                      disabled={isButtonDisabled}
                      onClick={() => applyMutation.mutate(job.id)}
                      className={`w-full px-4 py-2 font-medium rounded transition-colors ${
                        isButtonDisabled 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-primary text-white hover:bg-opacity-90'
                      }`}
                    >
                      {applyMutation.isPending && applyMutation.variables === job.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
