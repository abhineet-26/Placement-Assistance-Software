import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import JobCard from '../../components/JobCard';
import PageSkeleton from '../../components/PageSkeleton';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  BusinessCenter as JobIcon,
} from '@mui/icons-material';

export default function CompanyJobsPage() {
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['company', 'jobs'],
    queryFn: async () => (await api.get('/companies/me/jobs')).data,
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            My Jobs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your job postings and applicants.
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

      {!jobs || jobs.length === 0 ? (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Box sx={{ mx: 'auto', width: 80, height: 80, bgcolor: 'primary.50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <JobIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.5 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No jobs posted yet</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Click Post Job to create your first listing and start receiving applications.
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
          {jobs.map((job: any) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={job.id}>
              <JobCard 
                job={{
                  title: job.title,
                  company_name: 'Your Company',
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
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
