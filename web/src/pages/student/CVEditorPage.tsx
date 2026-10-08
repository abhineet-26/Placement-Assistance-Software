import PageSkeleton from '../../components/PageSkeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import {
  Box,
  Typography,
  Card, CircularProgress,
  CardContent,
  Button,
  TextField,
 
 
  Alert
} from '@mui/material';
import { 
  Description as DescriptionIcon, 
  UploadFile as UploadIcon, 
  CloudDownload as DownloadIcon,
  Save as SaveIcon
} from '@mui/icons-material';

interface CV {
  summary?: string;
  skills?: string[];
  version: number;
  pdf_file_path?: string;
  student_id?: string;
}

const fetchCV = async (): Promise<CV> => {
  try {
    const { data } = await api.get('/cv/me');
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { version: 0, summary: '', skills: [] }; // Empty CV
    }
    throw error;
  }
};

const updateCV = async (updates: Partial<CV>): Promise<CV> => {
  const { data } = await api.put('/cv/me', updates);
  return data;
};

const uploadCVPdf = async (file: File): Promise<CV> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post('/cv/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

const CVEditorPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<{summary: string, skills: string}>({ summary: '', skills: '' });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: cv, isLoading, isError } = useQuery({
    queryKey: ['studentCV'],
    queryFn: fetchCV,
  });

  const mutation = useMutation({
    mutationFn: updateCV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentCV'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadCVPdf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentCV'] });
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const handleDownload = async () => {
    try {
      if (!cv?.student_id) return;
      const response = await api.get(`/cv/download?student_id=${cv.student_id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cv.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF", error);
      alert("Failed to download PDF");
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }
  if (isError || !cv) return <Typography color="error">Error loading CV</Typography>;

  const handleInitEdit = () => {
    setFormData({
      summary: cv.summary || '',
      skills: cv.skills?.join(', ') || ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      summary: formData.summary,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: '50%', color: 'primary.main', display: 'flex' }}>
          <DescriptionIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            My CV
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your CV and skills. Version: {cv.version}
          </Typography>
        </Box>
      </Box>

      {/* PDF Upload Section */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Resume Document (PDF)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload your professional resume in PDF format. This document will be shared with companies when you apply.
          </Typography>

          {uploadSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>PDF uploaded successfully!</Alert>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 3 }}>
            <Button
              component="label"
              variant="contained"
              disableElevation
              startIcon={uploadMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload PDF'}
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            
            {cv.pdf_file_path && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                View / Download Current CV
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Extracted Details Section */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            CV Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This information is extracted or manually entered and can be used for quick filtering by recruiters.
          </Typography>

          {saveSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>Information saved successfully!</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
              <TextField
                label="Professional Summary"
                name="summary"
                multiline
                rows={4}
                fullWidth
                value={formData.summary === '' && !mutation.isPending && cv.summary ? cv.summary : formData.summary}
                onChange={handleChange}
                onFocus={() => {
                    if(formData.summary === '' && cv.summary) handleInitEdit();
                }}
                placeholder="Write a brief professional summary..."
                slotProps={{ inputLabel: { shrink: true } }}
              />
              
              <TextField
                label="Skills (comma separated)"
                name="skills"
                fullWidth
                value={formData.skills === '' && !mutation.isPending && cv.skills ? cv.skills.join(', ') : formData.skills}
                onChange={handleChange}
                onFocus={() => {
                    if(formData.skills === '' && cv.skills) handleInitEdit();
                }}
                placeholder="e.g. Python, React, PostgreSQL"
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Companies often search by skills. Include your key technical and soft skills."
              />
              
              <Box sx={{ alignSelf: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disableElevation
                  startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Saving...' : 'Save Details'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CVEditorPage;
