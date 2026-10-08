import PageSkeleton from '../../components/PageSkeleton';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Stack,
  Alert
} from '@mui/material';

type StudentMatchSummary = {
  id: string;
  roll_number: string;
  full_name: string;
  cgpa: number;
  branch: string;
  backlogs: number;
  gender: string | null;
};

type Match = {
  id: string;
  job_id: string;
  student_id: string;
  application_id: string;
  skill_score: number;
  hard_filter_passed: boolean;
  included_in_shortlist: boolean;
  forwarding_status: string;
  student: StudentMatchSummary;
  student_skills: string[];
};

type Job = {
  id: string;
  title: string;
  required_skills: string[];
};

const JobMatchesPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();

  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(new Set());
  const [overrideMatch, setOverrideMatch] = useState<Match | null>(null);

  const { data: job } = useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data;
    }
  });

  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['job-matches', jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}/matches`);
      return res.data;
    },
    enabled: !!jobId
  });
  
  const triggerMatchingMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${jobId}/run-matching`),
    onSuccess: () => {
      alert("Matching engine triggered in background.");
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['job-matches', jobId] }), 2000);
    }
  });

  const approveMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${jobId}/approve-forwarding`, { match_ids: Array.from(selectedMatchIds) }),
    onSuccess: () => {
      alert("Approved forwarding for selected CVs.");
      setSelectedMatchIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['job-matches', jobId] });
    }
  });

  const overrideMutation = useMutation({
    mutationFn: (data: { match_id: string, updates: Partial<Match> }) => 
      api.patch(`/jobs/${data.match_id}/override`, data.updates),
    onSuccess: () => {
      alert("Match overridden successfully.");
      setOverrideMatch(null);
      queryClient.invalidateQueries({ queryKey: ['job-matches', jobId] });
    },
    onError: () => {
      alert("Failed to override match.");
    }
  });

  const toggleMatchSelection = (id: string) => {
    const newSet = new Set(selectedMatchIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedMatchIds(newSet);
  };

  const selectAll = () => {
    if (matches && selectedMatchIds.size === matches.length) {
      setSelectedMatchIds(new Set());
    } else if (matches) {
      setSelectedMatchIds(new Set(matches.map(m => m.id)));
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }} color="primary">
            Job Matches
          </Typography>
          {job && (
            <Typography variant="subtitle1" color="text.secondary">
              {job.title}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {selectedMatchIds.size > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Approving...' : `Approve ${selectedMatchIds.size} CVs`}
            </Button>
          )}
          <Button 
            variant="contained"
            color="secondary"
            onClick={() => triggerMatchingMutation.mutate()}
            disabled={triggerMatchingMutation.isPending}
          >
            {triggerMatchingMutation.isPending ? 'Running...' : 'Run Matching Engine'}
          </Button>
        </Stack>
      </Box>
      
      {matches?.length === 0 ? (
        <Alert severity="info" sx={{ width: '100%' }}>
          No matches found or matching hasn't run yet. Click 'Run Matching Engine'.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
          <Table sx={{ minWidth: 650 }} aria-label="job matches table">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedMatchIds.size > 0 && matches && selectedMatchIds.size < matches.length}
                    checked={matches && matches.length > 0 && selectedMatchIds.size === matches.length}
                    onChange={selectAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Profile</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Skills Map</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Match Score</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches?.map((match, index) => {
                const isEligible = match.hard_filter_passed;
                
                return (
                  <TableRow 
                    key={match.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      opacity: isEligible ? 1 : 0.6,
                      bgcolor: isEligible ? 'inherit' : 'action.hover'
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selectedMatchIds.has(match.id)}
                        onChange={() => toggleMatchSelection(match.id)}
                        disabled={match.forwarding_status === 'sent'}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      #{index + 1}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {match.student.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {match.student.roll_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="column" spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          CGPA: {match.student.cgpa.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Branch: {match.student.branch}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Backlogs: {match.student.backlogs}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 250 }}>
                        {job?.required_skills.map((skill, idx) => {
                          const hasSkill = (match.student_skills || []).some(s => s.toLowerCase().trim() === skill.toLowerCase().trim());
                          return (
                            <Chip 
                              key={idx} 
                              label={skill} 
                              size="small"
                              color={hasSkill ? "success" : "default"}
                              variant={hasSkill ? "filled" : "outlined"}
                              sx={{ 
                                fontSize: '0.65rem', 
                                height: '20px',
                                opacity: hasSkill ? 1 : 0.7
                              }}
                              title={hasSkill ? 'Matched' : 'Missing'}
                            />
                          );
                        })}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {Math.round(match.skill_score * 100)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {!isEligible ? (
                        <Chip label="Ineligible" size="small" />
                      ) : match.forwarding_status === 'pending' ? (
                        <Chip label="Pending Review" size="small" color="warning" />
                      ) : (
                        <Chip label={match.forwarding_status} size="small" color="success" sx={{ textTransform: 'capitalize' }} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        onClick={() => setOverrideMatch(match)}
                      >
                        Override
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {overrideMatch && (
        <OverrideDialog 
          match={overrideMatch} 
          onClose={() => setOverrideMatch(null)}
          onSave={(updates) => overrideMutation.mutate({ match_id: overrideMatch.id, updates })}
          isPending={overrideMutation.isPending}
        />
      )}
    </Box>
  );
};

const OverrideDialog = ({ 
  match, 
  onClose, 
  onSave, 
  isPending 
}: { 
  match: Match, 
  onClose: () => void, 
  onSave: (updates: Partial<Match>) => void,
  isPending: boolean 
}) => {
  const [status, setStatus] = useState(match.forwarding_status);
  const [hardFilterPassed, setHardFilterPassed] = useState(match.hard_filter_passed);
  const [skillScoreStr, setSkillScoreStr] = useState(match.skill_score.toString());

  const handleSave = () => {
    onSave({
      forwarding_status: status,
      hard_filter_passed: hardFilterPassed,
      skill_score: parseFloat(skillScoreStr)
    });
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Override Match</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Student</Typography>
            <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
              <Typography variant="body2" color="text.secondary">
                {match.student.full_name} ({match.student.roll_number})
              </Typography>
            </Paper>
          </Box>
          
          <FormControl fullWidth size="small">
            <InputLabel id="status-label">Forwarding Status</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Forwarding Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={hardFilterPassed}
                onChange={(e) => setHardFilterPassed(e.target.checked)}
                color="primary"
              />
            }
            label={<Typography variant="body2">Passed Hard Filters (Eligibility)</Typography>}
          />
          
          <TextField
            label="Skill Score (0.0 - 1.0)"
            type="number"
            slotProps={{ htmlInput: { step: 0.01, min: 0, max: 1 } }}
            value={skillScoreStr}
            onChange={(e) => setSkillScoreStr(e.target.value)}
            fullWidth
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobMatchesPage;
