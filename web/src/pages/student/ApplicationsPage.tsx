import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

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

  if (isLoading || interviewsLoading || offersLoading) return <div>Loading applications...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-bold text-primary">My Applications</h1>
      
      {!applications || applications.length === 0 ? (
        <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
          You haven't applied to any jobs yet.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="p-4 font-semibold text-sm text-text-secondary">Job Title</th>
                <th className="p-4 font-semibold text-sm text-text-secondary">Company</th>
                <th className="p-4 font-semibold text-sm text-text-secondary">Applied On</th>
                <th className="p-4 font-semibold text-sm text-text-secondary">Status</th>
                <th className="p-4 font-semibold text-sm text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-primary">
                    {app.job_summary?.title || 'Unknown Job'}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {app.job_summary?.company_name || 'Unknown Company'}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize
                      ${app.status === 'applied' ? 'bg-blue-100 text-blue-800' : ''}
                      ${app.status === 'withdrawn' ? 'bg-gray-100 text-gray-800' : ''}
                      ${app.status === 'interview_scheduled' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${app.status === 'offer_received' ? 'bg-purple-100 text-purple-800' : ''}
                      ${app.status === 'placed' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {(app.status === 'applied' || app.status === 'interview_scheduled') && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to withdraw this application?')) {
                            withdrawMutation.mutate(app.id);
                          }
                        }}
                        disabled={withdrawMutation.isPending && withdrawMutation.variables === app.id}
                        className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
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
