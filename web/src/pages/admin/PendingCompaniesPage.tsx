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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-10 w-64 bg-border rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface rounded-xl shadow-card animate-pulse border border-border" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-primary mb-1">Pending Companies</h1>
        <p className="text-text-secondary">Review and approve company registrations.</p>
      </div>
      
      {companies?.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No pending companies</h2>
          <p className="text-text-secondary max-w-md">There are currently no companies waiting for approval.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {companies?.map(company => (
            <div key={company.id} className="p-6 bg-surface border border-border rounded-xl shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-primary">{company.company_name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                  <span><span className="font-medium">Contact:</span> {company.contact_person || 'N/A'}</span>
                  <span><span className="font-medium">Phone:</span> {company.contact_phone || 'N/A'}</span>
                </div>
                {company.about && <p className="text-sm mt-3 text-text-secondary line-clamp-2 bg-gray-50/50 p-3 rounded-lg border border-border/50">{company.about}</p>}
              </div>
              <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <button 
                  onClick={() => rejectMutation.mutate(company.id)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-surface border-2 border-danger text-danger font-semibold rounded-lg hover:bg-danger/5 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => approveMutation.mutate(company.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-success text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Approve
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
