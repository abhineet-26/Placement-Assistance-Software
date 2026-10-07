import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

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
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-h1 font-bold text-primary">Post a New Job</h1>
      
      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-lg border border-border shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Job Title</label>
          <input 
            type="text" 
            required
            className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
          <textarea 
            required
            rows={4}
            className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Required Skills (comma separated)</label>
          <input 
            type="text" 
            required
            placeholder="e.g. React, Python, SQL"
            className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            value={formData.required_skills}
            onChange={(e) => setFormData({...formData, required_skills: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Vacancies</label>
            <input 
              type="number" 
              required
              min="1"
              className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.vacancies}
              onChange={(e) => setFormData({...formData, vacancies: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Min CGPA (optional)</label>
            <input 
              type="number" 
              step="0.1"
              min="0"
              max="10"
              className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.min_cgpa}
              onChange={(e) => setFormData({...formData, min_cgpa: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Application Deadline</label>
          <input 
            type="datetime-local" 
            required
            className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            value={formData.application_deadline}
            onChange={(e) => setFormData({...formData, application_deadline: e.target.value})}
          />
        </div>
        
        <div className="pt-4 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={() => navigate('/company')}
            className="px-4 py-2 border border-border rounded text-text-primary hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJobPage;
