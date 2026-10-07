import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

type QueueSummary = {
  pending_companies: number;
  pending_jobs: number;
  flagged_feedback: number;
};

type PlacementStats = {
  total_students: number;
  total_companies: number;
  total_jobs: number;
  total_applications: number;
  total_placed_students: number;
  students_by_status: Record<string, number>;
};

const statCards = [
  { key: 'total_students', label: 'Students' },
  { key: 'total_companies', label: 'Companies' },
  { key: 'total_jobs', label: 'Jobs' },
  { key: 'total_applications', label: 'Applications' },
  { key: 'total_placed_students', label: 'Placed students' },
] as const;

export default function AdminDashboardPage() {
  const { data: queues, isLoading: queuesLoading } = useQuery<QueueSummary>({
    queryKey: ['admin-queue-summary'],
    queryFn: async () => (await api.get('/admin/queues/summary')).data,
  });
  const { data: stats, isLoading: statsLoading } = useQuery<PlacementStats>({
    queryKey: ['admin-placement-stats'],
    queryFn: async () => (await api.get('/admin/reports/placement-stats')).data,
  });

  if (queuesLoading || statsLoading) return <div className="rounded-lg border border-border bg-surface p-8 text-text-secondary">Loading placement overview...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Placement control room</p>
        <h1 className="text-h1 font-bold text-primary">Admin dashboard</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">Keep approvals moving, review candidate matches, and monitor the placement pipeline from one view.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Placement totals">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-text-secondary">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{stats?.[card.key] ?? 0}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Pending queues">
        <Link to="/admin/companies" className="rounded-lg border border-warning/30 bg-warning/5 p-5 transition-colors hover:border-warning">
          <p className="text-sm text-text-secondary">Company approvals</p>
          <p className="mt-2 text-3xl font-bold text-primary">{queues?.pending_companies ?? 0}</p>
          <p className="mt-2 text-sm font-semibold text-warning">Review pending companies</p>
        </Link>
        <Link to="/admin/jobs/pending" className="rounded-lg border border-primary/20 bg-primary/5 p-5 transition-colors hover:border-primary">
          <p className="text-sm text-text-secondary">Job approvals</p>
          <p className="mt-2 text-3xl font-bold text-primary">{queues?.pending_jobs ?? 0}</p>
          <p className="mt-2 text-sm font-semibold text-primary">Review pending jobs</p>
        </Link>
        <Link to="/admin/feedback" className="rounded-lg border border-danger/20 bg-red-50 p-5 transition-colors hover:border-danger">
          <p className="text-sm text-text-secondary">Flagged feedback</p>
          <p className="mt-2 text-3xl font-bold text-primary">{queues?.flagged_feedback ?? 0}</p>
          <p className="mt-2 text-sm font-semibold text-danger">Open operations queue</p>
        </Link>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary">Student placement status</h2>
            <p className="text-sm text-text-secondary">Current derived status across the student population.</p>
          </div>
          <Link to="/admin/jobs" className="text-sm font-semibold text-primary hover:underline">Open jobs and matches</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(stats?.students_by_status || {}).map(([status, count]) => (
            <div key={status} className="border-l-2 border-accent pl-3">
              <p className="text-xs uppercase tracking-wide text-text-secondary">{status.replace('_', ' ')}</p>
              <p className="mt-1 text-xl font-bold text-primary">{count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}