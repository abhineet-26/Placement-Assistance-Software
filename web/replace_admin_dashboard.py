with open("src/pages/admin/AdminDashboardPage.tsx", "w") as f:
    f.write("""import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../lib/api';
import PageSkeleton from '../../components/PageSkeleton';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';

type QueueSummary = {
  pending_companies: number;
  pending_jobs: number;
  flagged_feedback: number;
};

type PlacementStats = {
  total_students: number;
  total_companies: number;
  total_jobs: number;
  total_applications: number;
  total_placed_students: number;
  students_by_status: Record<string, number>;
};

const STAT_CONFIG = {
  total_students: { label: 'Students', icon: PeopleIcon, color: 'primary' },
  total_companies: { label: 'Companies', icon: BusinessIcon, color: 'secondary' },
  total_jobs: { label: 'Jobs', icon: WorkIcon, color: 'info' },
  total_applications: { label: 'Applications', icon: DescriptionIcon, color: 'success' },
  total_placed_students: { label: 'Placed', icon: CheckCircleIcon, color: 'success' },
} as const;

export default function AdminDashboardPage() {
  const { data: queues, isLoading: queuesLoading } = useQuery<QueueSummary>({
    queryKey: ['admin-queue-summary'],
    queryFn: async () => (await api.get('/admin/queues/summary')).data,
  });
  const { data: stats, isLoading: statsLoading } = useQuery<PlacementStats>({
    queryKey: ['admin-placement-stats'],
    queryFn: async () => (await api.get('/admin/reports/placement-stats')).data,
  });

  if (queuesLoading || statsLoading) return <PageSkeleton />;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'secondary.main', letterSpacing: 1.2 }}>
          Placement Control Room
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
          Keep approvals moving, review candidate matches, and monitor the placement pipeline from one view.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {Object.entries(STAT_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={key}>
              <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(1,37,85,0.08)' } }}>
                <CardContent>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${config.color}.50`, color: `${config.color}.main` }}>
                      <Icon fontSize="medium" />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {config.label}
                    </Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {stats?.[key as keyof PlacementStats] as number || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
        Pending Actions
      </Typography>

      <Grid container spacing={3}>
        {/* Company Approvals */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', borderColor: 'warning.light', bgcolor: 'warning.50' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <BusinessIcon color="warning" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                  Company Approvals
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'warning.main', mb: 2 }}>
                {queues?.pending_companies ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'warning.dark', mb: 3, flexGrow: 1 }}>
                New companies are waiting for platform access.
              </Typography>
              <Button component={RouterLink} to="/admin/companies" variant="contained" color="warning" fullWidth sx={{ fontWeight: 600 }}>
                Review Companies
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Job Approvals */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', borderColor: 'info.light', bgcolor: 'info.50' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <WorkIcon color="info" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  Job Approvals
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'info.main', mb: 2 }}>
                {queues?.pending_jobs ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'info.dark', mb: 3, flexGrow: 1 }}>
                New job postings need verification before publication.
              </Typography>
              <Button component={RouterLink} to="/admin/jobs/pending" variant="contained" color="info" fullWidth sx={{ fontWeight: 600 }}>
                Review Jobs
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Moderation */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', borderColor: 'error.light', bgcolor: 'error.50' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <WarningIcon color="error" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.dark' }}>
                  Flagged Feedback
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'error.main', mb: 2 }}>
                {queues?.flagged_feedback ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.dark', mb: 3, flexGrow: 1 }}>
                Feedback items that require administrator moderation.
              </Typography>
              <Button component={RouterLink} to="/admin/feedback" variant="contained" color="error" fullWidth sx={{ fontWeight: 600 }}>
                Moderate Feedback
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
""")
