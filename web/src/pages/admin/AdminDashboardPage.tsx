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

  if (queuesLoading || statsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-4 bg-border rounded w-48 mb-2 animate-pulse" />
          <div className="h-8 bg-border rounded w-64 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-surface rounded-xl shadow-card animate-pulse border border-border" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface rounded-xl shadow-card animate-pulse border border-border" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent mb-1">Placement control room</p>
        <h1 className="text-h1 font-bold text-primary">Admin dashboard</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">Keep approvals moving, review candidate matches, and monitor the placement pipeline from one view.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Placement totals">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-xl border border-border bg-surface p-6 shadow-card hover:-translate-y-0.5 transition-transform duration-200">
            <p className="text-sm text-text-secondary font-medium">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{stats?.[card.key] ?? 0}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Pending queues">
        <Link to="/admin/companies" className="rounded-xl shadow-card border border-warning/30 bg-warning/5 p-6 transition-all duration-200 hover:border-warning hover:shadow-md hover:-translate-y-0.5">
          <p className="text-sm text-text-secondary font-medium">Company approvals</p>
          <p className="mt-2 text-3xl font-bold text-primary">{queues?.pending_companies ?? 0}</p>
          <p className="mt-2 text-sm font-semibold text-warning">Review pending companies</p>
        </Link>
        <Link to="/admin/jobs/pending" className="rounded-xl shadow-card border border-primary/20 bg-primary/5 p-6 transition-all duration-200 hover:border-primary hover:shadow-md hover:-translate-y-0.5">
          <p className="text-sm text-text-secondary font-medium">Job approvals</p>
          <p className="mt-2 text-3xl font-bold text-primary">{queues?.pending_jobs ?? 0}</p>
          <p className="mt-2 text-sm font-semibold text-primary">Review pending jobs</p>
        </Link>
        <Link to="/admin/feedback" className="rounded-xl shadow-card border border-danger/20 bg-red-50 p-6 transition-all duration-200 hover:border-danger hover:shadow-md hover:-translate-y-0.5">
          <p className="text-sm text-text-secondary font-medium">Flagged feedback</p>
          <p className="mt-2 text-3xl font-bold text-primary">{queues?.flagged_feedback ?? 0}</p>
          <p className="mt-2 text-sm font-semibold text-danger">Open operations queue</p>
        </Link>
      </section>

      <section className="rounded-xl border border-border shadow-card bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-primary">Student placement status</h2>
            <p className="text-sm text-text-secondary mt-1">Current derived status across the student population.</p>
          </div>
          <Link to="/admin/jobs" className="text-sm font-semibold text-primary hover:underline bg-primary/5 px-4 py-2 rounded-lg transition-colors hover:bg-primary/10">Open jobs and matches</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(stats?.students_by_status || {}).map(([status, count]) => (
            <div key={status} className="border-l-2 border-accent pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{status.replace('_', ' ')}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}