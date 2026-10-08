import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useState } from 'react';
import JobCard from '../../components/JobCard';

type Job = {
  id: string;
  company_id: string;
  company_name?: string;
  title: string;
  description: string;
  required_skills: string[];
  vacancies: number;
  application_deadline: string;
  min_cgpa: number | null;
  allowed_branches: string[] | null;
  max_backlogs: number | null;
  status: string;
  ctc?: string;
  location?: string;
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-h1 font-bold text-primary">Job Opportunities</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-surface rounded-xl shadow-card animate-pulse border border-border" />
          ))}
        </div>
      </div>
    );
  }

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
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-primary mb-2">Job Opportunities</h1>
        <p className="text-text-secondary">Discover and apply for your next career move.</p>
      </div>
      
      {!cv && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl text-warning-800 flex items-start gap-3 shadow-sm">
          <svg className="w-5 h-5 mt-0.5 text-warning flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <strong className="block mb-1">Upload your CV</strong>
            You must upload a CV in your profile before you can apply to any jobs.
          </div>
        </div>
      )}

      {jobs?.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 shadow-card flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No job opportunities</h2>
          <p className="text-text-secondary max-w-md">There are no job opportunities available at this time. Please check back later when companies post new openings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map(job => {
            const eligibility = getEligibility(job);
            const isPastDeadline = new Date(job.application_deadline) < new Date();
            const hasApplied = applications?.some((app: any) => app.job_id === job.id && app.status !== 'withdrawn');
            
            const isButtonDisabled = !cv || isPastDeadline || hasApplied || !eligibility.isEligible || applyMutation.isPending;
            
            const actionText = hasApplied ? 'Applied' : isPastDeadline ? 'Closed' : !eligibility.isEligible ? 'Not Eligible' : applyMutation.isPending && applyMutation.variables === job.id ? 'Applying...' : 'Apply Now';

            return (
              <div key={job.id} className="relative group">
                <JobCard 
                  job={{
                    title: job.title,
                    company_name: job.company_name || 'Company Name',
                    ctc: job.ctc || 'Not specified',
                    location: job.location || 'Location TBD',
                    deadline: job.application_deadline,
                    skills: job.required_skills
                  }}
                  onApply={isButtonDisabled ? undefined : () => applyMutation.mutate(job.id)}
                  actionText={actionText}
                />
                
                {/* Overlay text for errors/eligibility if button is disabled for those reasons */}
                {!eligibility.isEligible && !hasApplied && !isPastDeadline && (
                  <div className="absolute top-4 right-4 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {eligibility.reason}
                  </div>
                )}
                {applyError?.jobId === job.id && (
                  <div className="absolute bottom-20 left-6 right-6 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded shadow-sm z-10 text-center truncate">
                    {applyError.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
