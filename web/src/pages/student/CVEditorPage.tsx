import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';

interface CV {
  summary?: string;
  skills?: string[];
  version: number;
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

  if (isLoading) return <div>Loading CV...</div>;
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
    </div>
  );
};

export default CVEditorPage;
