import { useState } from 'react';
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

type Application = {
  id: string;
  student_name: string;
  job_title: string;
  company_name: string;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = ['all', 'pending', 'shortlisted', 'interview', 'hired', 'rejected'];

export default function AdminApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['admin', 'applications'],
    queryFn: async () => (await api.get('/admin/applications?limit=200')).data,
  });

  if (isLoading) return <PageSkeleton />;

  const filtered = applications?.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      !search ||
      a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title?.toLowerCase().includes(search.toLowerCase()) ||
      a.company_name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const countByStatus = STATUS_OPTIONS.slice(1).reduce<Record<string, number>>((acc, s) => {
    acc[s] = applications?.filter(a => a.status === s).length ?? 0;
    return acc;
  }, {});

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'secondary.main', letterSpacing: 1.2 }}>
          Operations
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          All Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and monitor all student applications across jobs and companies.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Looking to forward CVs to a company?</strong> Application forwarding is handled by the matching engine. To review and send matched candidates to companies, please use the <strong>Job Matches</strong> tab.
      </Alert>

      {/* Summary chips */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
        <Chip
          icon={<AssignmentIcon />}
          label={`${applications?.length ?? 0} Total`}
          variant="outlined"
        />
        {Object.entries(countByStatus).map(([s, count]) => (
          <Chip
            key={s}
            label={`${count} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            size="small"
            variant="outlined"
            color={s === 'hired' ? 'success' : s === 'rejected' ? 'error' : s === 'interview' ? 'info' : 'default'}
          />
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search by student, job or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <MenuItem key={s} value={s}>
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Applied Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{app.student_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{app.job_title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{app.company_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography color="text.secondary" sx={{ fontWeight: 600 }}>No applications found</Typography>
                      <Typography variant="body2" color="text.disabled">Try adjusting the filters.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        Showing {filtered.length} of {applications?.length ?? 0} applications
      </Typography>
    </Box>
  );
}
