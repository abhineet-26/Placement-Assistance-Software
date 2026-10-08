import PageSkeleton from '../../components/PageSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import JobCard from '../../components/JobCard';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Button,
  Divider,
  
  Stack,
} from '@mui/material';
import {
  WorkOutlined as WorkIcon,
  AssignmentTurnedIn as AssignmentIcon,
  StarOutlined as StarIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => (await api.get('/students/me')).data,
  });

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['student', 'jobs'],
    queryFn: async () => (await api.get('/jobs/')).data,
  });

  const { data: applications, isLoading: loadingApps } = useQuery({
    queryKey: ['student', 'applications'],
    queryFn: async () => (await api.get('/applications/me')).data,
  });

  if (loadingProfile || loadingJobs || loadingApps) {
    return <PageSkeleton />;
  }

  const availableJobsCount = jobs?.length || 0;
  const appliedCount = applications?.length || 0;
  const shortlistedCount = applications?.filter((a: any) => ['shortlisted', 'interview', 'hired'].includes(a.status)).length || 0;
  const offersCount = applications?.filter((a: any) => a.status === 'hired').length || 0;

  const recentJobs = jobs?.slice(0, 3) || [];
  const latestApp = applications?.[0];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Welcome Card */}
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(1, 37, 85, 0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}   sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="h4" component="h1" color="primary.main" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Welcome back, {profile?.name}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Ready to take the next step in your career?
              </Typography>
            </Grid>
            <Grid size={{xs: 12, md: 6}} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />} sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Branch</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{profile?.branch}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>CGPA</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{profile?.cgpa}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Backlogs</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{profile?.backlogs || 0}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {[
          { title: 'Available Jobs', count: availableJobsCount, icon: <WorkIcon color="primary" />, link: '/student/opportunities' },
          { title: 'Applied', count: appliedCount, icon: <AssignmentIcon color="primary" />, link: '/student/applications' },
          { title: 'Shortlisted', count: shortlistedCount, icon: <StarIcon color="primary" />, link: '/student/applications' },
          { title: 'Offers', count: offersCount, icon: <TrophyIcon color="success" />, link: '/student/applications', color: 'success.main' },
        ].map((stat, i) => (
          <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: 2, 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(1, 37, 85, 0.1)', borderColor: 'primary.main' }
              }}
            >
              <CardActionArea onClick={() => navigate(stat.link)} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  {stat.icon}
                </Box>
                <Typography variant="h3" color={stat.color || 'primary.main'} sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {stat.count}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Recent Jobs */}
        <Grid size={{xs: 12, lg: 8}}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Recent Opportunities
            </Typography>
            <Button 
              variant="text" 
              endIcon={<ArrowForwardIcon />} 
              onClick={() => navigate('/student/opportunities')}
              sx={{ fontWeight: 600 }}
            >
              View all
            </Button>
          </Box>
          
          {recentJobs.length > 0 ? (
            <Grid container spacing={3}>
              {recentJobs.map((job: any) => (
                <Grid size={{xs: 12, sm: 6}} key={job.id}>
                  <JobCard 
                    job={job}
                    onView={() => navigate('/student/opportunities')}
                    actionText="Apply"
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card variant="outlined" sx={{ borderRadius: 2, p: 6, textAlign: 'center', borderStyle: 'dashed' }}>
              <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'primary.50', color: 'primary.main', mb: 2 }}>
                <WorkIcon fontSize="large" />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>No recent opportunities</Typography>
              <Typography variant="body2" color="text.secondary">Check back later for new job postings.</Typography>
            </Card>
          )}
        </Grid>

        {/* Latest Application Timeline */}
        <Grid size={{xs: 12, lg: 4}}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 700,  mb: 3 }}>
                Latest Application
              </Typography>
              
              {latestApp ? (
                <Box>
                  <Box sx={{ pb: 2, mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {latestApp.job_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {latestApp.company_name}
                    </Typography>
                  </Box>
                  
                  {/* Timeline visual */}
                  <Box sx={{ position: 'relative', pl: 3, ml: 1, borderLeft: 2, borderColor: 'divider' }}>
                    
                    {/* Applied Step */}
                    <Box sx={{ position: 'relative', mb: 4 }}>
                      <Box sx={{ position: 'absolute', left: -32, top: 2, width: 14, height: 14, borderRadius: '50%', bgcolor: 'primary.main', border: '3px solid white', boxShadow: 1 }} />
                      <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Applied</Typography>
                      <Typography variant="caption" color="text.secondary">Application submitted</Typography>
                    </Box>

                    {/* Shortlisted Step */}
                    {['shortlisted', 'interview', 'hired'].includes(latestApp.status) && (
                      <Box sx={{ position: 'relative', mb: 4 }}>
                        <Box sx={{ position: 'absolute', left: -32, top: 2, width: 14, height: 14, borderRadius: '50%', bgcolor: 'primary.main', border: '3px solid white', boxShadow: 1 }} />
                        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Shortlisted</Typography>
                        <Typography variant="caption" color="text.secondary">CV selected for next round</Typography>
                      </Box>
                    )}

                    {/* Hired Step */}
                    {['hired'].includes(latestApp.status) && (
                      <Box sx={{ position: 'relative', mb: 4 }}>
                        <Box sx={{ position: 'absolute', left: -32, top: 2, width: 14, height: 14, borderRadius: '50%', bgcolor: 'success.main', border: '3px solid white', boxShadow: 1 }} />
                        <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Hired!</Typography>
                        <Typography variant="caption" color="success.main">Offer received</Typography>
                      </Box>
                    )}

                    {/* Rejected Step */}
                    {latestApp.status === 'rejected' && (
                      <Box sx={{ position: 'relative', mb: 4 }}>
                        <Box sx={{ position: 'absolute', left: -32, top: 2, width: 14, height: 14, borderRadius: '50%', bgcolor: 'error.main', border: '3px solid white', boxShadow: 1 }} />
                        <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Rejected</Typography>
                        <Typography variant="caption" color="error.main">Application not successful</Typography>
                      </Box>
                    )}

                    {/* Under Review Step (Pending) */}
                    {latestApp.status === 'pending' && (
                      <Box sx={{ position: 'relative', opacity: 0.5 }}>
                        <Box sx={{ position: 'absolute', left: -32, top: 2, width: 14, height: 14, borderRadius: '50%', bgcolor: 'grey.400', border: '3px solid white' }} />
                        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Under Review</Typography>
                        <Typography variant="caption" color="text.secondary">Pending company response</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, opacity: 0.6 }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">No applications yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
