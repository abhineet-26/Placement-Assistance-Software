import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import PageSkeleton from '../../components/PageSkeleton';
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
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from '@mui/material';
import {
  WorkOff as WorkOffIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Reply as ReplyIcon,
  Info as InfoIcon
} from '@mui/icons-material';

type Job = {
  id: string;
  company_id: string;
  title: string;
  description: string;
  required_skills: string[];
  vacancies: number;
  application_deadline: string;
  status: 'pending_review' | 'published' | 'returned' | 'closed';
  min_cgpa: number | null;
};

export default function PendingJobsPage() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['admin-jobs', 'pending'],
    queryFn: async () => {
      const res = await api.get('/jobs/?status_filter=pending_review');
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/jobs/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    }
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string, comment: string }) => 
      api.patch(`/jobs/${id}/return`, { review_comment: comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      handleCloseReturnDialog();
    }
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnComment, setReturnComment] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: Job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleApprove = () => {
    if (selectedJob) approveMutation.mutate(selectedJob.id);
    handleMenuClose();
  };

  const handleOpenReturnDialog = () => {
    setReturnDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseReturnDialog = () => {
    setReturnDialogOpen(false);
    setReturnComment('');
  };

  const handleConfirmReturn = () => {
    if (selectedJob) {
      returnMutation.mutate({ id: selectedJob.id, comment: returnComment || 'Please review.' });
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Pending Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review job postings before they are visible to students.
        </Typography>
      </Box>
      
      {jobs?.length === 0 ? (
        <Card variant="outlined" sx={{ py: 8, textAlign: 'center' }}>
          <Box sx={{ width: 80, height: 80, bgcolor: 'primary.50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <WorkOffIcon sx={{ fontSize: 40, color: 'primary.light' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No pending jobs</Typography>
          <Typography variant="body2" color="text.secondary">
            There are currently no job postings waiting for review.
          </Typography>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vacancies</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Min CGPA</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required Skills</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs?.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {job.title}
                        </Typography>
                        <Tooltip title={job.description} placement="top">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={job.vacancies} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {job.min_cgpa ? <Chip label={`≥ ${job.min_cgpa}`} size="small" color="info" /> : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {job.required_skills.slice(0, 3).map((skill, i) => (
                          <Chip key={i} label={skill} size="small" sx={{ bgcolor: 'primary.50', color: 'primary.main' }} />
                        ))}
                        {job.required_skills.length > 3 && (
                          <Chip label={`+${job.required_skills.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, job)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleApprove}>
          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
          <ListItemText>Publish Job</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenReturnDialog}>
          <ListItemIcon><ReplyIcon color="warning" fontSize="small" /></ListItemIcon>
          <ListItemText>Return to Company</ListItemText>
        </MenuItem>
      </Menu>

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onClose={handleCloseReturnDialog} fullWidth maxWidth="sm">
        <DialogTitle>Return Job Posting</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide a reason for returning the job posting "{selectedJob?.title}" to the company for edits.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            placeholder="E.g., Please provide more details on the role requirements..."
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseReturnDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleConfirmReturn} 
            color="warning" 
            variant="contained" 
            disabled={!returnComment.trim() || returnMutation.isPending}
          >
            Confirm Return
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
