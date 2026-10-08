import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import PageSkeleton from '../../components/PageSkeleton';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  Divider,
} from '@mui/material';
import {
  WorkOff as WorkOffIcon,
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

const PendingJobsPage = () => {
  const queryClient = useQueryClient();
  const [returnComment, setReturnComment] = useState<Record<string, string>>({});

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
      queryClient.invalidateQueries({ queryKey: ['admin-jobs', 'pending'] });
    }
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string, comment: string }) => 
      api.patch(`/jobs/${id}/return`, { review_comment: comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs', 'pending'] });
      setReturnComment({});
    }
  });

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {jobs?.map(job => (
            <Card key={job.id} variant="outlined" sx={{ '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, transition: 'box-shadow 0.2s' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={`Vacancies: ${job.vacancies}`} size="small" variant="outlined" />
                      {job.min_cgpa && (
                        <Chip label={`Min CGPA: ${job.min_cgpa}`} size="small" color="info" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {job.required_skills.map((skill, i) => (
                    <Chip key={i} label={skill} size="small" sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 600 }} />
                  ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' }, justifyContent: 'space-between', gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Return Comment (if rejecting)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter reason for returning..."
                      value={returnComment[job.id] || ''}
                      onChange={e => setReturnComment(prev => ({ ...prev, [job.id]: e.target.value }))}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="warning"
                      onClick={() => returnMutation.mutate({ id: job.id, comment: returnComment[job.id] || 'Please review.' })}
                      disabled={returnMutation.isPending}
                    >
                      Return to Company
                    </Button>
                    <Button 
                      variant="contained" 
                      color="success"
                      disableElevation
                      onClick={() => approveMutation.mutate(job.id)}
                      disabled={approveMutation.isPending}
                    >
                      Publish Job
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PendingJobsPage;
