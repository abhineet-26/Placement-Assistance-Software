import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import PageSkeleton from '../../components/PageSkeleton';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
 
} from '@mui/material';
import {
  Add as AddIcon,
  BusinessCenter as JobIcon,
  PeopleAlt as PeopleIcon,
  Event as EventIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

type Job = {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_review' | 'published' | 'returned' | 'closed';
  review_comment: string | null;
  vacancies: number;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['company-jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs/');
      return res.data;
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.role],
    queryFn: async () => {
      const res = await api.get('/companies/me');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: cvs } = useQuery({
    queryKey: ['company-cvs-dashboard'],
    queryFn: async () => {
      const res = await api.get('/companies/me/received-cvs');
      return res.data;
    }
  });

  const { data: interviews } = useQuery({
    queryKey: ['company-interviews-dashboard'],
    queryFn: async () => {
      const res = await api.get('/interviews/');
      return res.data;
    }
  });

  if (isLoading) return <PageSkeleton />;

  const activeJobs = jobs?.filter(j => j.status === 'published').length || 0;
  const pendingJobs = jobs?.filter(j => j.status === 'pending_review').length || 0;
    
  const totalApplications = cvs?.length || 0;
  const upcomingInterviews = interviews?.length || 0;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Welcome back, {profile?.company_name || 'Company'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your recruitment activities.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/company/jobs/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ fontWeight: 600 }}
        >
          Post New Job
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(1, 37, 85, 0.1)', borderColor: 'primary.main' } }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main' }}>
                  <JobIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Active Jobs</Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{activeJobs}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(1, 37, 85, 0.1)', borderColor: 'warning.main' } }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.50', color: 'warning.main' }}>
                  <JobIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>In Review</Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{pendingJobs}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(1, 37, 85, 0.1)', borderColor: 'info.main' } }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.50', color: 'info.main' }}>
                  <PeopleIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Total Applicants</Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{totalApplications}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(1, 37, 85, 0.1)', borderColor: 'success.main' } }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.50', color: 'success.main' }}>
                  <EventIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Interviews</Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{upcomingInterviews}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Recent Postings</Typography>
        <Button 
          component={RouterLink} 
          to="/company/jobs"
          endIcon={<ArrowForwardIcon />}
          sx={{ fontWeight: 600 }}
        >
          View All
        </Button>
      </Box>

      {jobs?.length === 0 ? (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Box sx={{ mx: 'auto', width: 80, height: 80, bgcolor: 'primary.50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <JobIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.5 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No jobs posted yet</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Create your first job posting to start finding the perfect candidates.
            </Typography>
            <Button
              component={RouterLink}
              to="/company/jobs/new"
              variant="contained"
              size="large"
              sx={{ fontWeight: 600 }}
            >
              Post your first job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {jobs?.slice(0, 3).map((job) => (
            <Grid size={{ xs: 12 }} key={job.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  transition: 'all 0.2s', 
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(1, 37, 85, 0.1)', borderColor: 'primary.main' },
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/company/jobs/${job.id}`)}
              >
                <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{job.title}</Typography>
                    <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" />
                        <Typography variant="body2">{job.vacancies} {job.vacancies === 1 ? 'Vacancy' : 'Vacancies'}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <StatusBadge status={job.status} />
                    {job.status === 'returned' && job.review_comment && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'error.main', bgcolor: 'error.50', p: 1, borderRadius: 1 }}>
                        <strong>Feedback:</strong> {job.review_comment}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DashboardPage;
