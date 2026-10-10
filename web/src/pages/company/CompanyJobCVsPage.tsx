import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import CVPreviewPanel from '../../components/CVPreviewPanel';
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

type MatchWithCV = {
  id: string;
  job_id: string;
  student_id: string;
  application_id: string;
  skill_score: number;
  hard_filter_passed: boolean;
  forwarding_status?: string;
  student: {
    id: string;
    full_name: string;
    roll_number: string;
    branch: string;
    cgpa: number;
  };
  student_cv: any;
};

const CompanyJobCVsPage = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  
  const { data: matches, isLoading } = useQuery<MatchWithCV[]>({
    queryKey: ['company-cvs', jobId],
    queryFn: async () => {
      const url = jobId ? `/companies/me/received-cvs?job_id=${jobId}` : `/companies/me/received-cvs`;
      const res = await api.get(url);
      return res.data;
    }
  });

  const [selectedMatch, setSelectedMatch] = useState<MatchWithCV | null>(null);
  
  const queryClient = useQueryClient();
  const [schedulingInterview, setSchedulingInterview] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-cvs'] });
      setSelectedMatch(null);
    }
  });

  const interviewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMatch) return;
      await api.post('/interviews/', {
        application_id: selectedMatch.application_id,
        scheduled_at: new Date(interviewDate).toISOString(),
        location_or_mode: interviewLocation
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-cvs'] });
      setSchedulingInterview(false);
      setSelectedMatch(null);
    }
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        {jobId && (
          <IconButton onClick={() => navigate('/company/jobs')} sx={{ bgcolor: 'surface.main', border: '1px solid', borderColor: 'divider' }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            {jobId ? 'Job Applicants' : 'All Received CVs'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review candidates that have been approved and forwarded for your open positions.
          </Typography>
        </Box>
      </Box>
      
      {!matches || matches.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>No CVs Available</Typography>
          <Typography variant="body2" color="text.secondary">
            No candidates have been forwarded to you yet. Check back later once the administration has reviewed applications.
          </Typography>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Candidate Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Roll Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>CGPA</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Match Score</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map((match) => (
                  <TableRow 
                    key={match.id} 
                    hover 
                    sx={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{match.student.full_name}</TableCell>
                    <TableCell>{match.student.roll_number}</TableCell>
                    <TableCell>{match.student.branch}</TableCell>
                    <TableCell>{match.student.cgpa?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${Math.round(match.skill_score * 100)}% Match`}
                        color={match.skill_score > 0.7 ? 'success' : match.skill_score > 0.4 ? 'warning' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMatch(match);
                        }}
                      >
                        View CV
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog 
        open={Boolean(selectedMatch)} 
        onClose={() => {
          setSelectedMatch(null);
          setSchedulingInterview(false);
        }}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selectedMatch?.student.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedMatch?.student.roll_number} • {selectedMatch?.student.branch} • {selectedMatch?.student.cgpa} CGPA
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedMatch(null)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
          {selectedMatch?.student_cv ? (
            <CVPreviewPanel cv={selectedMatch.student_cv} />
          ) : (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                CV details not available for this candidate.
              </Typography>
            </Box>
          )}
        </DialogContent>
        {selectedMatch && (
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            {!schedulingInterview ? (
              <>
                <Button 
                  color="error" 
                  onClick={() => statusMutation.mutate({ id: selectedMatch.application_id, status: 'rejected' })}
                  disabled={statusMutation.isPending}
                >
                  Reject
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button 
                  variant="outlined"
                  onClick={() => statusMutation.mutate({ id: selectedMatch.application_id, status: 'shortlisted' })}
                  disabled={statusMutation.isPending}
                >
                  Shortlist
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => setSchedulingInterview(true)}
                >
                  Schedule Interview
                </Button>
              </>
            ) : (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
                <Typography variant="subtitle2">Schedule Interview</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField 
                    label="Date & Time" 
                    type="datetime-local" 
                    size="small" 
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    fullWidth
                  />
                  <TextField 
                    label="Location or Meet Link" 
                    size="small" 
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    fullWidth
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button onClick={() => setSchedulingInterview(false)}>Cancel</Button>
                  <Button 
                    variant="contained" 
                    onClick={() => interviewMutation.mutate()}
                    disabled={!interviewDate || !interviewLocation || interviewMutation.isPending}
                  >
                    Confirm Schedule
                  </Button>
                </Box>
              </Box>
            )}
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default CompanyJobCVsPage;
