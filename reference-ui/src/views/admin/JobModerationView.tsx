import React, { useState } from 'react';
import { useJobs, useModerateJob } from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import { Modal } from '../../components/common/Modal';
import { Check, X, ShieldCheck, Eye, Clock, AlertTriangle } from 'lucide-react';
import { JobPosting } from '../../types';

export const JobModerationView: React.FC = () => {
  const { data: jobs = [], isLoading } = useJobs();
  const moderateMutation = useModerateJob();

  const [inspectingJob, setInspectingJob] = useState<JobPosting | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'published'>('all');

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === 'all') return true;
    return j.status === statusFilter;
  });

  const handleApprovePublish = async (jobId: string) => {
    try {
      await moderateMutation.mutateAsync({
        id: jobId,
        status: 'published',
        notes: 'Approved by Placement Directorate following compensation review.',
      });
      setInspectingJob(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseDrive = async (jobId: string) => {
    try {
      await moderateMutation.mutateAsync({
        id: jobId,
        status: 'closed',
        notes: 'Recruitment applications concluded.',
      });
      setInspectingJob(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Job Requisitions Moderation Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit employer terms against institutional compensation floors and publish drives
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          {jobs.filter((j) => j.status === 'pending_approval').length} awaiting publication
          approval
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs w-fit gap-1 font-semibold">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-md transition-all ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-blue-700'
          }`}
        >
          All Requisitions
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('pending_approval')}
          className={`px-3 py-1 rounded-md transition-all ${
            statusFilter === 'pending_approval'
              ? 'bg-amber-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-amber-700'
          }`}
        >
          Pending Cell Review
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('published')}
          className={`px-3 py-1 rounded-md transition-all ${
            statusFilter === 'published'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-emerald-700'
          }`}
        >
          Active on Portal
        </button>
      </div>

      {/* Jobs Roster */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading requisitions...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No requisitions match the selected moderation status.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
          {filteredJobs.map((job) => (
            <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{job.companyName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {job.ctcLpa} LPA
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="capitalize">{job.roleType.replace(/_/g, ' ')}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="font-mono tabular-nums">
                    Min CGPA: {job.criteria.minCgpa.toFixed(1)}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span>{job.criteria.allowedDepartments.length} branch(es) allowed</span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()} · Requisition
                  ID: {job.id}
                </div>
              </div>

              {/* Status & Moderation Trigger */}
              <div className="flex items-center gap-3 shrink-0">
                <StatusText status={job.status} size="sm" />

                <button
                  type="button"
                  onClick={() => setInspectingJob(job)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Audit Terms</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Modal */}
      <Modal
        isOpen={Boolean(inspectingJob)}
        onClose={() => setInspectingJob(null)}
        title="Requisition Compliance Audit"
        description={`${inspectingJob?.title} by ${inspectingJob?.companyName}`}
        maxWidth="lg"
      >
        {inspectingJob && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
              <div>
                <span className="text-slate-500 block">Package Valuation</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                  {inspectingJob.ctcLpa} LPA
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Cutoff & Backlog Limit</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  Min {inspectingJob.criteria.minCgpa.toFixed(1)} CGPA · Max{' '}
                  {inspectingJob.criteria.maxActiveBacklogs} Backlogs
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Permitted Academic Branches</h4>
              <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                {inspectingJob.criteria.allowedDepartments.join(', ')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Selection Rounds Pipeline</h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                {inspectingJob.selectionRounds.map((r) => (
                  <li key={r.stepNumber}>
                    {r.name} ({r.mode})
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectingJob(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium"
              >
                Close
              </button>

              {inspectingJob.status === 'pending_approval' && (
                <button
                  type="button"
                  onClick={() => handleApprovePublish(inspectingJob.id)}
                  disabled={moderateMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{moderateMutation.isPending ? 'Publishing...' : 'Approve & Publish to Students'}</span>
                </button>
              )}

              {inspectingJob.status === 'published' && (
                <button
                  type="button"
                  onClick={() => handleCloseDrive(inspectingJob.id)}
                  disabled={moderateMutation.isPending}
                  className="px-4 py-1.5 bg-rose-600 text-white rounded hover:bg-rose-700 font-semibold"
                >
                  Close Drive
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
