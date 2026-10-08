import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';

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

  const { data: cv, isLoading, isError } = useQuery({
    queryKey: ['studentCV'],
    queryFn: fetchCV,
  });

  const mutation = useMutation({
    mutationFn: updateCV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentCV'] });
      alert("CV Updated Successfully");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadCVPdf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentCV'] });
      alert("CV PDF Uploaded Successfully");
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

  if (isLoading) return (<div className="animate-pulse space-y-4"><div className="h-6 bg-border rounded w-1/3" /><div className="h-4 bg-border rounded w-2/3" /><div className="h-4 bg-border rounded w-1/2" /></div>);
  if (isError || !cv) return <div>Error loading CV</div>;

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
    <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-2xl font-semibold mb-2 text-primary">My CV (Version: {cv.version})</h2>
      <p className="text-text-secondary mb-6">Manage your CV content. Updates will overwrite the current version, but admins can view history.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">Summary</label>
          <textarea 
            name="summary"
            rows={4}
            value={formData.summary === '' && !mutation.isPending && cv.summary ? cv.summary : formData.summary}
            onChange={handleChange}
            onFocus={() => {
                if(formData.summary === '' && cv.summary) handleInitEdit();
            }}
            className="w-full p-2 border border-border rounded bg-background"
            placeholder="Write a brief professional summary..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
          <input 
            name="skills"
            value={formData.skills === '' && !mutation.isPending && cv.skills ? cv.skills.join(', ') : formData.skills}
            onChange={handleChange}
            onFocus={() => {
                if(formData.skills === '' && cv.skills) handleInitEdit();
            }}
            className="w-full p-2 border border-border rounded bg-background"
            placeholder="e.g. Python, React, PostgreSQL"
          />
        </div>
        
        <button 
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save CV'}
        </button>
      </form>

      <hr className="my-8 border-border" />
      <h3 className="text-xl font-semibold mb-4 text-primary">Upload PDF CV</h3>
      <div className="max-w-2xl">
        <input 
          type="file" 
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={uploadMutation.isPending}
          className="block w-full text-sm text-text-secondary
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-white
            hover:file:bg-opacity-90 cursor-pointer"
        />
        {uploadMutation.isPending && <p className="text-sm mt-2 text-text-secondary">Uploading...</p>}
        {cv.pdf_file_path && (
          <div className="mt-4">
            <button 
              onClick={handleDownload}
              className="text-primary hover:underline font-medium"
            >
              View/Download Uploaded PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVEditorPage;
