import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';

type ApplicationWithJob = {
  id: string;
  student_id: string;
  job_id: string;
  status: string;
  created_at: string;
  job_summary: {
    id: string;
    title: string;
    company_name: string;
  } | null;
};

type Interview = {
  id: string;
  application_id: string;
  scheduled_at: string;
  location_or_mode: string;
  status: string;
};

type Offer = {
  id: string;
  application_id: string;
  offer_details: Record<string, unknown>;
  status: string;
};

const ApplicationsPage = () => {
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/me');
      return res.data;
    }
  });

  const { data: interviews, isLoading: interviewsLoading } = useQuery<Interview[]>({
    queryKey: ['my-interviews'],
    queryFn: async () => (await api.get('/interviews/')).data,
  });

  const { data: offers, isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ['my-offers'],
    queryFn: async () => (await api.get('/offers/')).data,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/applications/${id}/withdraw`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    }
  });

  const offerDecisionMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: 'accepted' | 'declined' }) => {
      const res = await api.patch(`/offers/${offerId}/decision`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  if (isLoading || interviewsLoading || offersLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-h1 font-bold text-primary">My Applications</h1>
        <div className="bg-surface rounded-xl shadow-card p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-background rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-primary mb-1">My Applications</h1>
        <p className="text-text-secondary">Track the status of jobs you've applied for.</p>
      </div>
      
      {!applications || applications.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No applications yet</h2>
          <p className="text-text-secondary max-w-md">You haven't applied to any jobs yet. Check out the opportunities page to find your next role.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-border/60">
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Job Title</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Company</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Applied On</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Status</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {applications.map((app, idx) => (
                <tr key={app.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50 transition-colors`}>
                  <td className="p-5 font-medium text-text-primary">
                    {app.job_summary?.title || 'Unknown Job'}
                  </td>
                  <td className="p-5 text-text-secondary">
                    {app.job_summary?.company_name || 'Unknown Company'}
                  </td>
                  <td className="p-5 text-text-secondary">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-5">
                    <StatusBadge status={app.status.replace('_', ' ')} />
                  </td>
                  <td className="p-5 text-right">
                    {(app.status === 'applied' || app.status === 'interview_scheduled') && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to withdraw this application?')) {
                            withdrawMutation.mutate(app.id);
                          }
                        }}
                        disabled={withdrawMutation.isPending && withdrawMutation.variables === app.id}
                        className="text-sm px-3 py-1.5 rounded text-danger hover:bg-danger/10 font-medium disabled:opacity-50 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {applications?.map((app) => {
          const interview = interviews?.find((item) => item.application_id === app.id);
          const offer = offers?.find((item) => item.application_id === app.id);
          if (!interview && !offer) return null;

          return (
            <article key={`${app.id}-details`} className="rounded-lg border border-border bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-accent">{app.job_summary?.title || 'Application'}</p>
              {interview && (
                <div className="mt-3 border-l-2 border-warning pl-3">
                  <h2 className="font-semibold text-primary">Interview {interview.status}</h2>
                  <p className="text-sm text-text-secondary">
                    {new Date(interview.scheduled_at).toLocaleString()} · {interview.location_or_mode}
                  </p>
                </div>
              )}
              {offer && (
                <div className="mt-4 border-l-2 border-success pl-3">
                  <h2 className="font-semibold text-primary">Offer {offer.status}</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    {Object.entries(offer.offer_details).map(([key, value]) => `${key}: ${String(value)}`).join(' · ')}
                  </p>
                  {offer.status === 'extended' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => offerDecisionMutation.mutate({ offerId: offer.id, status: 'accepted' })}
                        disabled={offerDecisionMutation.isPending}
                        className="rounded bg-success px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Accept offer
                      </button>
                      <button
                        type="button"
                        onClick={() => offerDecisionMutation.mutate({ offerId: offer.id, status: 'declined' })}
                        disabled={offerDecisionMutation.isPending}
                        className="rounded border border-danger px-3 py-2 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-50"
                      >
                        Decline offer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationsPage;
