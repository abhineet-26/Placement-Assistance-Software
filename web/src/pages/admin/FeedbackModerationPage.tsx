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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-10 w-64 bg-border rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface rounded-xl shadow-card animate-pulse border border-border" />)}
        </div>
      </div>
    );
  }

  if (isError) return <div className="rounded-xl border border-danger/20 bg-red-50 p-8 text-danger shadow-card">Unable to load feedback.</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent mb-1">Moderation</p>
        <h1 className="text-h1 font-bold text-primary">Feedback review</h1>
      </div>
      {!feedback?.length ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No feedback to review</h2>
          <p className="text-text-secondary max-w-md">No feedback has been submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <article key={item.id} className={`rounded-xl shadow-card p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all duration-200 border ${item.flagged ? 'border-danger/30 bg-red-50/30' : 'border-border bg-surface hover:-translate-y-0.5 hover:shadow-md'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {item.author_type}
                  </span>
                  <span className="text-text-secondary text-sm">→</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {item.target_type}
                  </span>
                  {item.rating && (
                    <span className="ml-2 flex items-center text-sm font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      ★ {item.rating}/5
                    </span>
                  )}
                </div>
                <p className="mt-3 text-text-primary whitespace-pre-wrap">{item.content}</p>
                <time className="mt-4 block text-xs font-medium text-text-secondary" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
              </div>
              <button
                type="button"
                onClick={() => flagMutation.mutate(item.id)}
                disabled={flagMutation.isPending}
                className={`shrink-0 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm ${item.flagged ? 'border-success text-success bg-white hover:bg-success/5' : 'border-danger/20 text-danger bg-danger/5 hover:bg-danger/10'}`}
              >
                {item.flagged ? 'Unflag' : 'Flag as Inappropriate'}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}