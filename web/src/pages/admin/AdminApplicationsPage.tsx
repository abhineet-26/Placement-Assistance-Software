import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin', 'applications'],
    queryFn: async () => (await api.get('/admin/applications')).data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-h1 font-bold text-primary">All Applications</h1>
          <div className="w-40 h-10 bg-surface rounded-lg animate-pulse" />
        </div>
        <div className="bg-surface rounded-xl shadow-card p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 bg-background rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = applications?.filter((a: any) => 
    statusFilter === 'all' || a.status === statusFilter
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-h1 font-bold text-primary mb-1">All Applications</h1>
          <p className="text-text-secondary">View and manage all student applications.</p>
        </div>
        <select 
          className="border border-border rounded-lg p-2.5 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm min-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-surface rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-border/60">
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Student</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Job Title</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Company</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Status</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((app: any, idx: number) => (
                <tr key={app.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50 transition-colors`}>
                  <td className="p-5 font-medium text-text-primary">{app.student_name}</td>
                  <td className="p-5 text-text-secondary">{app.job_title}</td>
                  <td className="p-5 text-text-secondary">{app.company_name}</td>
                  <td className="p-5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="p-5 text-text-secondary">{new Date(app.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3 opacity-50">📋</div>
                      <p className="font-medium text-text-primary">No applications found.</p>
                      <p className="text-sm mt-1">Try changing your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
