import PageSkeleton from '../../components/PageSkeleton';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../lib/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import {
  Work as WorkIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

type Job = {
  id: string;
  title: string;
  company_id: string;
  vacancies: number;
  status: string;
  deadline?: string;
  min_cgpa?: number;
  required_skills?: string[];
};

const AdminJobsPage = () => {
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['admin-jobs', 'published'],
    queryFn: async () => {
      const res = await api.get('/jobs/?status_filter=published');
      return res.data;
    }
  });

  if (isLoading) return <PageSkeleton />;

  const isDeadlineSoon = (deadline?: string) => {
    if (!deadline) return false;
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() < Date.now();
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'secondary.main', letterSpacing: 1.2 }}>
          Placement Engine
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Active Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse all published jobs and run the matching engine for each.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, mb: 3 }}>
        <Chip icon={<WorkIcon />} label={`${jobs?.length ?? 0} Active Jobs`} color="primary" variant="outlined" />
        <Chip label={`${jobs?.filter(j => isDeadlineSoon(j.deadline)).length ?? 0} Closing Soon`} color="warning" variant="outlined" />
        <Chip label={`${jobs?.filter(j => isDeadlinePassed(j.deadline)).length ?? 0} Deadline Passed`} color="error" variant="outlined" />
      </Box>

      {jobs?.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <WorkIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No active jobs found.</Typography>
            <Typography variant="body2" color="text.disabled">
              Approve pending jobs to see them here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 340px)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Job Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }} align="center">Vacancies</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Deadline</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Min CGPA</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Required Skills</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs?.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.title}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={job.vacancies} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {job.deadline ? (
                        <Chip
                          size="small"
                          label={new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          color={isDeadlinePassed(job.deadline) ? 'error' : isDeadlineSoon(job.deadline) ? 'warning' : 'default'}
                          variant={isDeadlinePassed(job.deadline) || isDeadlineSoon(job.deadline) ? 'filled' : 'outlined'}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">No deadline</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {job.min_cgpa ? `≥ ${job.min_cgpa}` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap' }}>
                        {job.required_skills?.slice(0, 3).map((skill, idx) => (
                          <Chip key={idx} label={skill} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        ))}
                        {(job.required_skills?.length ?? 0) > 3 && (
                          <Chip label={`+${job.required_skills!.length - 3}`} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/admin/jobs/${job.id}/matches`}
                        size="small"
                        variant="contained"
                        color="primary"
                        disableElevation
                        startIcon={<AnalyticsIcon />}
                      >
                        Matches
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default AdminJobsPage;
