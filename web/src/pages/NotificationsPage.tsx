import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

type NotificationItem = {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

const labels: Record<string, string> = {
  new_opportunity: 'New placement opportunity',
  interview_scheduled: 'Interview update',
  offer_received: 'Placement offer update',
  status_change: 'Application status update',
  company_approved: 'Company approval update',
  job_returned: 'Job requirement update',
  cvs_forwarded: 'Candidate CVs forwarded',
};

function notificationTitle(notification: NotificationItem) {
  return labels[notification.type] || 'Placement update';
}

function notificationSummary(notification: NotificationItem) {
  const payload = notification.payload || {};
  if (notification.type === 'new_opportunity') return `${payload.job_title || 'A new role'} is now available.`;
  if (notification.type === 'interview_scheduled') return `Interview for ${payload.job_title || 'your application'} at ${payload.location || 'the scheduled location'}.`;
  if (notification.type === 'offer_received') return `Offer for ${payload.job_title || 'your application'} is ${payload.status || 'available'}.`;
  if (notification.type === 'cvs_forwarded') return `${payload.cv_count || 0} candidate CVs were forwarded for ${payload.job_title || 'a role'}.`;
  return 'Open the related workflow to review the latest update.';
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, isError } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications/me')).data,
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return (<div className="animate-pulse space-y-4"><div className="h-6 bg-border rounded w-1/3" /><div className="h-4 bg-border rounded w-2/3" /><div className="h-4 bg-border rounded w-1/2" /></div>);
  if (isError) return <div className="rounded-lg border border-danger/20 bg-red-50 p-8 text-danger">Unable to load notifications right now.</div>;

  const unreadCount = notifications?.filter((notification) => !notification.read_at).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Activity centre</p>
          <h1 className="text-h1 font-bold text-primary">Notifications</h1>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {unreadCount} unread
        </span>
      </div>

      {!notifications?.length ? (
        <div className="rounded-lg border border-border bg-surface p-10 text-center text-text-secondary">
          No placement updates yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-lg border bg-surface p-5 transition-colors ${notification.read_at ? 'border-border' : 'border-accent/40 bg-accent/5'}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!notification.read_at && <span className="h-2 w-2 rounded-full bg-accent" aria-label="Unread" />}
                    <h2 className="font-semibold text-primary">{notificationTitle(notification)}</h2>
                  </div>
                  <p className="text-sm text-text-secondary">{notificationSummary(notification)}</p>
                  <time className="block text-xs text-text-secondary" dateTime={notification.created_at}>
                    {new Date(notification.created_at).toLocaleString()}
                  </time>
                </div>
                {!notification.read_at && (
                  <button
                    type="button"
                    onClick={() => readMutation.mutate(notification.id)}
                    disabled={readMutation.isPending}
                    className="shrink-0 rounded border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}