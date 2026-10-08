import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminOffersPage() {
  const { data: offers, isLoading } = useQuery({
    queryKey: ['admin', 'offers'],
    queryFn: async () => (await api.get('/admin/offers')).data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-h1 font-bold text-primary">Offers</h1>
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
        <h1 className="text-h1 font-bold text-primary mb-1">Offers</h1>
        <p className="text-text-secondary">Track job offers extended to students.</p>
      </div>

      <div className="bg-surface rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-border/60">
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Student</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Company</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Job</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Package (CTC)</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Offer Date</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {offers?.map((offer: any, idx: number) => (
                <tr key={offer.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50 transition-colors`}>
                  <td className="p-5 font-medium text-text-primary">{offer.student_name}</td>
                  <td className="p-5 text-text-secondary">{offer.company_name}</td>
                  <td className="p-5 text-text-secondary">{offer.job_title}</td>
                  <td className="p-5 font-medium text-primary">₹{offer.package} LPA</td>
                  <td className="p-5 text-text-secondary">{new Date(offer.created_at).toLocaleDateString()}</td>
                  <td className="p-5">
                    <StatusBadge status={offer.status} />
                  </td>
                </tr>
              ))}
              {(!offers || offers.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3 opacity-50">🎉</div>
                      <p className="font-medium text-text-primary">No offers recorded yet.</p>
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
