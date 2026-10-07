import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

type Company = {
  id: string;
  user_id: string;
  company_name: string;
  contact_person: string | null;
  contact_phone: string | null;
  about: string | null;
  approval_status: 'pending_approval' | 'approved' | 'rejected';
};

const PendingCompaniesPage = () => {
  const queryClient = useQueryClient();
  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ['admin-companies', 'pending'],
    queryFn: async () => {
      const res = await api.get('/companies/?status=pending_approval');
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/companies/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies', 'pending'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/companies/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies', 'pending'] });
    }
  });

  if (isLoading) return <div>Loading companies...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-bold text-primary">Pending Companies</h1>
      
      {companies?.length === 0 ? (
        <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
          No companies pending approval.
        </div>
      ) : (
        <div className="grid gap-4">
          {companies?.map(company => (
            <div key={company.id} className="p-4 bg-surface border border-border rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{company.company_name}</h3>
                <p className="text-sm text-text-secondary">Contact: {company.contact_person || 'N/A'} ({company.contact_phone || 'N/A'})</p>
                {company.about && <p className="text-sm mt-1">{company.about}</p>}
              </div>
              <div className="space-x-3">
                <button 
                  onClick={() => approveMutation.mutate(company.id)}
                  disabled={approveMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button 
                  onClick={() => rejectMutation.mutate(company.id)}
                  disabled={rejectMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingCompaniesPage;
