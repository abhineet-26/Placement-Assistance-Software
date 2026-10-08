import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import PageSkeleton from '../../components/PageSkeleton';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

type Interview = {
  id: string;
  application_id: string;
  scheduled_at: string;
  location_or_mode: string;
  status: string;
  created_at: string;
};

const STATUS_COLOR_MAP: Record<string, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'error',
  rescheduled: 'warning',
};

export default function StudentInterviewsPage() {
  const { data: interviews, isLoading, isError } = useQuery<Interview[]>({
    queryKey: ['student', 'interviews'],
    queryFn: async () => (await api.get('/interviews/')).data,
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load interviews. Please try refreshing the page.
      </Alert>
    );
  }

  const upcoming = interviews?.filter(i =>
    i.status === 'scheduled' && new Date(i.scheduled_at) >= new Date()
  ) || [];
  const past = interviews?.filter(i =>
    i.status === 'completed' || (i.status !== 'cancelled' && new Date(i.scheduled_at) < new Date())
  ) || [];

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'secondary.main', letterSpacing: 1.2 }}>
          Career Milestones
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          My Interviews
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your scheduled and completed interviews.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
        <Chip icon={<ScheduleIcon />} label={`${upcoming.length} Upcoming`} color="info" variant="outlined" />
        <Chip icon={<CheckIcon />} label={`${past.length} Completed`} color="success" variant="outlined" />
      </Box>

      {!interviews?.length ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 10 }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No interviews yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              When a company or admin schedules an interview for you, it will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {upcoming.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'info.main' }}>
                Upcoming
              </Typography>
              <Grid container spacing={2}>
                {upcoming.map((interview) => (
                  <Grid size={{ xs: 12, md: 6 }} key={interview.id}>
                    <InterviewCard interview={interview} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {past.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
                Past Interviews
              </Typography>
              <Grid container spacing={2}>
                {past.map((interview) => (
                  <Grid size={{ xs: 12, md: 6 }} key={interview.id}>
                    <InterviewCard interview={interview} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function InterviewCard({ interview }: { interview: Interview }) {
  const isUpcoming = interview.status === 'scheduled' && new Date(interview.scheduled_at) >= new Date();
  const scheduledDate = new Date(interview.scheduled_at);

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: isUpcoming ? 'info.light' : 'divider',
        bgcolor: isUpcoming ? '#f0f8ff' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Chip
              label={interview.status}
              size="small"
              color={STATUS_COLOR_MAP[interview.status] || 'default'}
              sx={{ textTransform: 'capitalize', mb: 1.5, fontWeight: 600 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EventIcon fontSize="small" color="action" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {scheduledDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {scheduledDate.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {interview.location_or_mode}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
