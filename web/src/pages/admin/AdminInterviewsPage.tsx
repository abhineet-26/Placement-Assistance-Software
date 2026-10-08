import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import PageSkeleton from '../../components/PageSkeleton';
import StatusBadge from '../../components/StatusBadge';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

type Interview = {
  id: string;
  student_name?: string;
  job_title?: string;
  company_name?: string;
  scheduled_date: string;
  scheduled_time?: string;
  mode: string;
  status: string;
};

export default function AdminInterviewsPage() {
  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ['admin', 'interviews'],
    queryFn: async () => (await api.get('/admin/interviews')).data,
  });

  if (isLoading) return <PageSkeleton />;

  const scheduledCount = interviews?.filter(i => i.status === 'scheduled').length ?? 0;
  const completedCount = interviews?.filter(i => i.status === 'completed').length ?? 0;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'secondary.main', letterSpacing: 1.2 }}>
          Operations
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Interviews
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track all scheduled and completed interviews across the platform.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, mb: 3 }}>
        <Chip icon={<EventIcon />} label={`${interviews?.length ?? 0} Total`} variant="outlined" />
        <Chip label={`${scheduledCount} Scheduled`} color="info" variant="outlined" />
        <Chip label={`${completedCount} Completed`} color="success" variant="outlined" />
      </Box>

      <Card variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 340px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Job & Company</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Mode</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews?.map((interview) => (
                <TableRow key={interview.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {interview.student_name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{interview.job_title || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{interview.company_name || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {interview.scheduled_date
                        ? new Date(interview.scheduled_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </Typography>
                    {interview.scheduled_time && (
                      <Typography variant="caption" color="text.secondary">
                        {interview.scheduled_time}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={interview.mode || 'online'}
                      size="small"
                      variant="outlined"
                      color={interview.mode === 'online' ? 'info' : 'default'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={interview.status} />
                  </TableCell>
                </TableRow>
              ))}
              {(!interviews || interviews.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <EventIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography color="text.secondary" sx={{ fontWeight: 600 }}>No interviews yet</Typography>
                      <Typography variant="body2" color="text.disabled">
                        Interviews will appear here once scheduled by companies.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        {interviews?.length ?? 0} interview records total
      </Typography>
    </Box>
  );
}
