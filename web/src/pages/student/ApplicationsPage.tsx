import PageSkeleton from '../../components/PageSkeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
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
  Paper,
  Button,
  Grid,
 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { useState } from 'react';

type ApplicationWithJob = {
  id: string;
  student_id: string;
  job_id: string;
  status: string;
  created_at: string;
  job_summary: {
    id: string;
    title: string;
    company_name: string;
  } | null;
};

type Interview = {
  id: string;
  application_id: string;
  scheduled_at: string;
  location_or_mode: string;
  status: string;
};

type Offer = {
  id: string;
  application_id: string;
  offer_details: Record<string, unknown>;
  status: string;
};

const ApplicationsPage = () => {
  const queryClient = useQueryClient();
  const [withdrawAppId, setWithdrawAppId] = useState<string | null>(null);

  const { data: applications, isLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/me');
      return res.data;
    }
  });

  const { data: interviews, isLoading: interviewsLoading } = useQuery<Interview[]>({
    queryKey: ['my-interviews'],
    queryFn: async () => (await api.get('/interviews/')).data,
  });

  const { data: offers, isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ['my-offers'],
    queryFn: async () => (await api.get('/offers/')).data,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/applications/${id}/withdraw`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      setWithdrawAppId(null);
    }
  });

  const offerDecisionMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: 'accepted' | 'declined' }) => {
      const res = await api.patch(`/offers/${offerId}/decision`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  const isLoadingData = isLoading || interviewsLoading || offersLoading;

  if (isLoadingData) {
    return <PageSkeleton />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h4" color="primary.main" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          My Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track the status of jobs you've applied for.
        </Typography>
      </Box>
      
      {!applications || applications.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2, p: 8, textAlign: 'center', borderStyle: 'dashed' }}>
          <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'primary.50', color: 'primary.main', mb: 2 }}>
            <AssignmentIcon fontSize="large" />
          </Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>No applications yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            You haven't applied to any jobs yet. Check out the opportunities page to find your next role.
          </Typography>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} aria-label="applications table">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Job Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Applied On</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow
                    key={app.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                      {app.job_summary?.title || 'Unknown Job'}
                    </TableCell>
                    <TableCell color="text.secondary">
                      {app.job_summary?.company_name || 'Unknown Company'}
                    </TableCell>
                    <TableCell color="text.secondary">
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status.replace('_', ' ')} />
                    </TableCell>
                    <TableCell align="right">
                      {(app.status === 'applied' || app.status === 'interview_scheduled') && (
                        <Button 
                          color="error"
                          variant="text"
                          size="small"
                          onClick={() => setWithdrawAppId(app.id)}
                          disabled={withdrawMutation.isPending && withdrawMutation.variables === app.id}
                        >
                          Withdraw
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {applications && applications.length > 0 && (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {applications.map((app) => {
            const interview = interviews?.find((item) => item.application_id === app.id);
            const offer = offers?.find((item) => item.application_id === app.id);
            if (!interview && !offer) return null;

            return (
              <Grid size={{xs: 12, md: 6}} key={`${app.id}-details`}>
                <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                      {app.job_summary?.title || 'Application'} Updates
                    </Typography>
                    
                    {interview && (
                      <Box sx={{ mt: 2, pl: 2, borderLeft: 3, borderColor: 'warning.main' }}>
                        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          Interview {interview.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {new Date(interview.scheduled_at).toLocaleString()} · {interview.location_or_mode}
                        </Typography>
                      </Box>
                    )}
                    
                    {offer && (
                      <Box sx={{ mt: 3, pl: 2, borderLeft: 3, borderColor: 'success.main' }}>
                        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          Offer {offer.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {Object.entries(offer.offer_details).map(([key, value]) => `${key}: ${String(value)}`).join(' · ')}
                        </Typography>
                        
                        {offer.status === 'extended' && (
                          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              disableElevation
                              onClick={() => offerDecisionMutation.mutate({ offerId: offer.id, status: 'accepted' })}
                              disabled={offerDecisionMutation.isPending}
                            >
                              Accept offer
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => offerDecisionMutation.mutate({ offerId: offer.id, status: 'declined' })}
                              disabled={offerDecisionMutation.isPending}
                            >
                              Decline offer
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Confirmation Dialog for Withdrawal */}
      <Dialog
        open={Boolean(withdrawAppId)}
        onClose={() => setWithdrawAppId(null)}
      >
        <DialogTitle>Confirm Withdrawal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to withdraw this application? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawAppId(null)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              if (withdrawAppId) withdrawMutation.mutate(withdrawAppId);
            }} 
            color="error" 
            variant="contained" 
            disableElevation
            disabled={withdrawMutation.isPending}
          >
            {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ApplicationsPage;
