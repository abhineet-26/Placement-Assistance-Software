import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminInterviewsPage() {
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['admin', 'interviews'],
    queryFn: async () => (await api.get('/admin/interviews')).data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-h1 font-bold text-primary">Interviews</h1>
        </div>
        <div className="bg-surface rounded-xl shadow-card p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-background rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-primary mb-1">Interviews</h1>
        <p className="text-text-secondary">Track upcoming and past interviews.</p>
      </div>

      <div className="bg-surface rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-border/60">
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Student</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Job & Company</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Date & Time</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Mode</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {interviews?.map((interview: any, idx: number) => (
                <tr key={interview.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50 transition-colors`}>
                  <td className="p-5 font-medium text-text-primary">{interview.student_name}</td>
                  <td className="p-5">
                    <div className="font-medium text-text-primary">{interview.job_title}</div>
                    <div className="text-sm text-text-secondary">{interview.company_name}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-text-primary">{new Date(interview.scheduled_date).toLocaleDateString()}</div>
                    <div className="text-sm text-text-secondary">{interview.scheduled_time}</div>
                  </td>
                  <td className="p-5 capitalize text-text-secondary">{interview.mode}</td>
                  <td className="p-5">
                    <StatusBadge status={interview.status} />
                  </td>
                </tr>
              ))}
              {(!interviews || interviews.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3 opacity-50">🗓️</div>
                      <p className="font-medium text-text-primary">No interviews scheduled.</p>
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
