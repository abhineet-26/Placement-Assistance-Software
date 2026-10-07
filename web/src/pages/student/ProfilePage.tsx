import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';

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

  if (isLoading) return <div>Loading profile...</div>;
  if (isError || !profile) return <div>Error loading profile</div>;

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
    <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-2xl font-semibold mb-6 text-primary">My Profile</h2>
      
      {!isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Full Name</p>
              <p className="font-medium">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Roll Number</p>
              <p className="font-medium">{profile.roll_number}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Phone</p>
              <p className="font-medium">{profile.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Programme</p>
              <p className="font-medium">{profile.programme || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Branch</p>
              <p className="font-medium">{profile.branch || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Batch Year</p>
              <p className="font-medium">{profile.batch_year || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">CGPA</p>
              <p className="font-medium">{profile.cgpa || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Backlogs</p>
              <p className="font-medium">{profile.backlogs ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Enrollment Status</p>
              <p className="font-medium capitalize">{profile.enrollment_status}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Placement Status</p>
              <p className="font-medium capitalize">{profile.placement_status.replace('_', ' ')}</p>
            </div>
          </div>
          
          <button 
            onClick={handleEdit}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input 
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Programme</label>
            <input 
              name="programme"
              value={formData.programme || ''}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <input 
              name="branch"
              value={formData.branch || ''}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Batch Year</label>
            <input 
              name="batch_year"
              type="number"
              value={formData.batch_year || ''}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CGPA</label>
            <input 
              name="cgpa"
              type="number"
              step="0.01"
              value={formData.cgpa || ''}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Backlogs</label>
            <input 
              name="backlogs"
              type="number"
              value={formData.backlogs ?? ''}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded bg-background"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button 
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-surface border border-border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
