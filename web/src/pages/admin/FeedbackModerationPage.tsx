import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import PageSkeleton from '../../components/PageSkeleton';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  Divider,
  Rating,
} from '@mui/material';
import {
  Flag as FlagIcon,
  CheckCircle as UnflagIcon,
  Message as MessageIcon,
} from '@mui/icons-material';

type Feedback = {
  id: string;
  author_type: string;
  target_type: string;
  content: string;
  rating: number | null;
  flagged: boolean;
  created_at: string;
};

export default function FeedbackModerationPage() {
  const queryClient = useQueryClient();

  const { data: feedback, isLoading, isError } = useQuery<Feedback[]>({
    queryKey: ['admin-feedback'],
    queryFn: async () => (await api.get('/feedback/')).data,
  });

  const flagMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/feedback/${id}/flag`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-feedback'] }),
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Unable to load feedback. Please try again.
      </Alert>
    );
  }

  const flaggedCount = feedback?.filter(f => f.flagged).length ?? 0;
  const totalCount = feedback?.length ?? 0;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'secondary.main', letterSpacing: 1.2 }}>
          Moderation
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Feedback Review
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and moderate feedback submissions from students and companies.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        <Chip icon={<MessageIcon />} label={`${totalCount} Total`} variant="outlined" />
        <Chip icon={<FlagIcon />} label={`${flaggedCount} Flagged`} color="error" variant={flaggedCount > 0 ? 'filled' : 'outlined'} />
      </Box>

      {!feedback?.length ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 10 }}>
            <MessageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No feedback to review</Typography>
            <Typography variant="body2" color="text.disabled">
              No feedback has been submitted yet. It will appear here when users submit it.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {feedback.map((item) => (
            <Card
              key={item.id}
              variant="outlined"
              sx={{
                borderColor: item.flagged ? 'error.light' : 'divider',
                bgcolor: item.flagged ? '#fff8f8' : 'background.paper',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
                      <Chip
                        label={item.author_type}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                      <Typography variant="caption" color="text.disabled">→</Typography>
                      <Chip
                        label={item.target_type}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                      {item.flagged && (
                        <Chip
                          icon={<FlagIcon />}
                          label="Flagged"
                          size="small"
                          color="error"
                        />
                      )}
                    </Box>

                    {/* Rating */}
                    {item.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={item.rating} max={5} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">{item.rating}/5</Typography>
                      </Box>
                    )}

                    {/* Content */}
                    <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, mb: 1.5 }}>
                      {item.content}
                    </Typography>

                    <Divider sx={{ mb: 1 }} />

                    {/* Date */}
                    <Typography variant="caption" color="text.disabled">
                      Submitted: {new Date(item.created_at).toLocaleString('en-IN')}
                    </Typography>
                  </Box>

                  {/* Action */}
                  <Button
                    variant="outlined"
                    color={item.flagged ? 'success' : 'error'}
                    size="small"
                    onClick={() => flagMutation.mutate(item.id)}
                    disabled={flagMutation.isPending}
                    startIcon={item.flagged ? <UnflagIcon /> : <FlagIcon />}
                    sx={{ minWidth: 140, flexShrink: 0 }}
                  >
                    {item.flagged ? 'Unflag' : 'Flag Content'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}