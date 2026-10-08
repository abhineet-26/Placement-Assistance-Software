import PageSkeleton from '../../components/PageSkeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  CircularProgress,
  
  Stack,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Person as PersonIcon } from '@mui/icons-material';

interface StudentProfile {
  id: string;
  full_name: string;
  roll_number: string;
  phone: string | null;
  programme: string | null;
  branch: string | null;
  batch_year: number | null;
  cgpa: number | null;
  backlogs: number | null;
  enrollment_status: string;
  placement_status: string;
}

const fetchProfile = async (): Promise<StudentProfile> => {
  const { data } = await api.get('/students/me');
  return data;
};

const updateProfile = async (updates: Partial<StudentProfile>): Promise<StudentProfile> => {
  const { data } = await api.patch('/students/me', updates);
  return data;
};

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: fetchProfile,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      setIsEditing(false);
    },
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !profile) return <Typography color="error">Error loading profile</Typography>;

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = value ? Number(value) : null;
    }
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: '50%', color: 'primary.main', display: 'flex' }}>
          <PersonIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }} color="primary.main">
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal and academic information.
          </Typography>
        </Box>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header section with Name & Roll No */}
          <Box sx={{ p: 4, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }} gutterBottom>
                {profile.full_name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Roll Number: {profile.roll_number}
                </Typography>
                <Chip size="small" label={profile.enrollment_status} color={profile.enrollment_status === 'active' ? 'success' : 'default'} sx={{ textTransform: 'capitalize', height: 20, fontSize: '0.7rem' }} />
                <Chip size="small" label={profile.placement_status.replace('_', ' ')} color={profile.placement_status === 'placed' ? 'success' : profile.placement_status === 'unplaced' ? 'primary' : 'default'} sx={{ textTransform: 'capitalize', height: 20, fontSize: '0.7rem' }} />
              </Stack>
            </Box>
            {!isEditing && (
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={handleEdit}
                sx={{ borderRadius: 2 }}
              >
                Edit Details
              </Button>
            )}
          </Box>

          {/* Form / View Section */}
          <Box sx={{ p: 4 }}>
            {!isEditing ? (
              <Grid container spacing={4}>
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: "uppercase", display: "block" }} gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.phone || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: "uppercase", display: "block" }} gutterBottom>
                    Programme
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.programme || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: "uppercase", display: "block" }} gutterBottom>
                    Branch
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.branch || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: "uppercase", display: "block" }} gutterBottom>
                    Batch Year
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.batch_year || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: "uppercase", display: "block" }} gutterBottom>
                    CGPA
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.cgpa || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 4}}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: "uppercase", display: "block" }} gutterBottom>
                    Backlogs
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.backlogs ?? 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Programme"
                      name="programme"
                      value={formData.programme || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Branch"
                      name="branch"
                      value={formData.branch || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Batch Year"
                      name="batch_year"
                      type="number"
                      value={formData.batch_year || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="CGPA"
                      name="cgpa"
                      type="number"
                      slotProps={{ htmlInput: { step: '0.01' } }}
                      value={formData.cgpa || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Backlogs"
                      name="backlogs"
                      type="number"
                      value={formData.backlogs ?? ''}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="text" 
                    color="inherit" 
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disableElevation
                    disabled={mutation.isPending}
                    startIcon={mutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </form>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
