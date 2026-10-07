import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

type Feedback = {
  id: string;
  author_type: string;
  target_type: string;
  content: string;
  rating: number | null;
  flagged: boolean;
  created_at: string;
};

export default function FeedbackModerationPage() {
  const queryClient = useQueryClient();
  const { data: feedback, isLoading, isError } = useQuery<Feedback[]>({
    queryKey: ['admin-feedback'],
    queryFn: async () => (await api.get('/feedback/')).data,
  });
  const flagMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/feedback/${id}/flag`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-feedback'] }),
  });

  if (isLoading) return <div className="rounded-lg border border-border bg-surface p-8 text-text-secondary">Loading feedback...</div>;
  if (isError) return <div className="rounded-lg border border-danger/20 bg-red-50 p-8 text-danger">Unable to load feedback.</div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Moderation</p>
        <h1 className="text-h1 font-bold text-primary">Feedback review</h1>
      </div>
      {!feedback?.length ? (
        <div className="rounded-lg border border-border bg-surface p-10 text-center text-text-secondary">No feedback has been submitted yet.</div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => (
            <article key={item.id} className={`rounded-lg border bg-surface p-5 ${item.flagged ? 'border-danger/40 bg-red-50/40' : 'border-border'}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{item.author_type} · {item.target_type} · {item.rating ? `${item.rating}/5` : 'No rating'}</p>
                  <p className="mt-2 text-text-primary">{item.content}</p>
                  <time className="mt-2 block text-xs text-text-secondary" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
                </div>
                <button
                  type="button"
                  onClick={() => flagMutation.mutate(item.id)}
                  disabled={flagMutation.isPending}
                  className={`shrink-0 rounded border px-3 py-2 text-sm font-semibold disabled:opacity-50 ${item.flagged ? 'border-success text-success hover:bg-green-50' : 'border-danger text-danger hover:bg-red-50'}`}
                >
                  {item.flagged ? 'Unflag' : 'Flag'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}