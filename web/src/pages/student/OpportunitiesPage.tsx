import PageSkeleton from '../../components/PageSkeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useState, useMemo } from 'react';
import JobCard from '../../components/JobCard';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  
  Divider,
  Alert
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';

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
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

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

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(job => {
      // Status filter
      if (activeOnly && job.status !== 'approved') return false;
      
      // Eligibility filter
      if (eligibleOnly) {
        const { isEligible } = getEligibility(job);
        if (!isEligible) return false;
      }
      
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(term);
        const matchCompany = (job.company_name || '').toLowerCase().includes(term);
        const matchSkills = job.required_skills.some(s => s.toLowerCase().includes(term));
        if (!matchTitle && !matchCompany && !matchSkills) return false;
      }
      
      return true;
    });
  }, [jobs, activeOnly, eligibleOnly, searchTerm, profile]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h4" color="primary.main" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          Job Opportunities
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and apply for your next career move.
        </Typography>
      </Box>
      
      {!cv && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <strong>Upload your CV</strong> - You must upload a CV in your profile before you can apply to any jobs.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Sidebar Filters */}
        <Grid size={{xs: 12, md: 3}}>
          <Card variant="outlined" sx={{ borderRadius: 2, position: 'sticky', top: 24 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Filters</Typography>
              </Box>
              
              <TextField
                fullWidth
                size="small"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{ input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                } }}
                sx={{ mb: 3 }}
              />
              
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={<Checkbox checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} />}
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Eligible Only</Typography>}
                sx={{ mb: 1, display: 'block' }}
              />
              
              <FormControlLabel
                control={<Checkbox checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />}
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Active Postings Only</Typography>}
                sx={{ mb: 1, display: 'block' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid size={{xs: 12, md: 9}}>
          {filteredJobs.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 2, p: 8, textAlign: 'center', borderStyle: 'dashed' }}>
              <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'primary.50', color: 'primary.main', mb: 2 }}>
                <SearchIcon fontSize="large" />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>No job opportunities found</Typography>
              <Typography variant="body2" color="text.secondary">Try adjusting your filters or check back later.</Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredJobs.map(job => {
                const eligibility = getEligibility(job);
                const isPastDeadline = new Date(job.application_deadline) < new Date();
                const hasApplied = applications?.some((app: any) => app.job_id === job.id && app.status !== 'withdrawn');
                
                const isButtonDisabled = !cv || isPastDeadline || hasApplied || !eligibility.isEligible || applyMutation.isPending;
                
                const actionText = hasApplied ? 'Applied' : isPastDeadline ? 'Closed' : !eligibility.isEligible ? 'Not Eligible' : applyMutation.isPending && applyMutation.variables === job.id ? 'Applying...' : 'Apply Now';

                return (
                  <Grid size={{xs: 12, sm: 6, lg: 4}} key={job.id}>
                    <Box sx={{ position: 'relative', height: '100%', '&:hover .eligibility-tooltip': { opacity: 1 } }}>
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
                      
                      {!eligibility.isEligible && !hasApplied && !isPastDeadline && (
                        <Box 
                          className="eligibility-tooltip"
                          sx={{
                            position: 'absolute', top: 16, right: 16, bgcolor: 'error.light', color: 'error.dark', 
                            px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600, 
                            opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none', zIndex: 10
                          }}
                        >
                          {eligibility.reason}
                        </Box>
                      )}
                      
                      {applyError?.jobId === job.id && (
                        <Box sx={{ position: 'absolute', bottom: 64, left: 16, right: 16, bgcolor: 'error.light', color: 'error.dark', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', zIndex: 10 }}>
                          {applyError.message}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default OpportunitiesPage;
