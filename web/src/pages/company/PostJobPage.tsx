import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Stack,
  Grid,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const PostJobPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    vacancies: 1,
    application_deadline: '',
    min_cgpa: ''
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        required_skills: data.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        min_cgpa: data.min_cgpa ? parseFloat(data.min_cgpa) : null
      };
      const res = await api.post('/jobs/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      navigate('/company');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'An error occurred while posting the job.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
        Post a New Job
      </Typography>
      
      <Card variant="outlined">
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              
              <TextField
                label="Job Title"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              
              <TextField
                label="Description"
                required
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />

              <TextField
                label="Required Skills"
                required
                fullWidth
                placeholder="e.g. React, Python, SQL (comma separated)"
                value={formData.required_skills}
                onChange={(e) => setFormData({...formData, required_skills: e.target.value})}
              />
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Vacancies"
                    type="number"
                    required
                    fullWidth
                    slotProps={{ htmlInput: { min: 1 } }}
                    value={formData.vacancies}
                    onChange={(e) => setFormData({...formData, vacancies: parseInt(e.target.value) || 1})}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Min CGPA (optional)"
                    type="number"
                    fullWidth
                    slotProps={{ htmlInput: { step: 0.1, min: 0, max: 10 } }}
                    value={formData.min_cgpa}
                    onChange={(e) => setFormData({...formData, min_cgpa: e.target.value})}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Application Deadline"
                type="datetime-local"
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.application_deadline}
                onChange={(e) => setFormData({...formData, application_deadline: e.target.value})}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                <Button 
                  type="button"
                  onClick={() => navigate('/company')}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={mutation.isPending}
                  variant="contained"
                  endIcon={<SendIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  {mutation.isPending ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PostJobPage;
