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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

type Student = {
  id: string;
  full_name: string;
  roll_number: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  placement_status: string;
  year_of_graduation: number;
};

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['admin', 'students'],
    queryFn: async () => (await api.get('/admin/students?limit=200')).data,
  });

  if (isLoading) return <PageSkeleton />;

  const filtered = students?.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.placement_status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const placedCount = students?.filter(s => s.placement_status === 'placed').length ?? 0;
  const unplacedCount = students?.filter(s => s.placement_status === 'unplaced').length ?? 0;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'secondary.main', letterSpacing: 1.2 }}>
          Placement Management
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Students Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage student enrollment and placement outcomes.
        </Typography>
      </Box>

      {/* Summary chips */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip icon={<SchoolIcon />} label={`${students?.length ?? 0} Total`} variant="outlined" />
        <Chip label={`${placedCount} Placed`} color="success" variant="outlined" />
        <Chip label={`${unplacedCount} Unplaced`} color="warning" variant="outlined" />
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by name, roll no or branch..."
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
          <InputLabel>Placement Status</InputLabel>
          <Select
            value={statusFilter}
            label="Placement Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="unplaced">Unplaced</MenuItem>
            <MenuItem value="placed">Placed</MenuItem>
            <MenuItem value="opted_out">Opted Out</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Card variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Roll No.</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }} align="center">CGPA</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }} align="center">Backlogs</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }} align="center">Grad. Year</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '0.8rem', fontWeight: 600 }}>
                        {student.full_name?.substring(0, 2).toUpperCase() || 'ST'}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {student.full_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {student.roll_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{student.branch}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={student.cgpa?.toFixed(2) ?? 'N/A'}
                      size="small"
                      color={student.cgpa >= 7 ? 'success' : student.cgpa >= 5 ? 'warning' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={student.backlogs > 0 ? 'error.main' : 'text.secondary'}>
                      {student.backlogs || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {student.year_of_graduation || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={student.placement_status || 'unplaced'} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                        No students found
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Try adjusting your search or filter.
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
        Showing {filtered.length} of {students?.length ?? 0} students
      </Typography>
    </Box>
  );
}
