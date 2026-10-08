import React, { useState } from 'react';
import {
  useApplications,
  useBatchForwardApplications,
  useJobs,
} from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import { ResumeDrawer } from '../../components/common/ResumeDrawer';
import { Application } from '../../types';
import {
  CheckSquare,
  Square,
  ArrowRight,
  Send,
  FileText,
  Filter,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const ApplicationOversightView: React.FC = () => {
  const { data: applications = [], isLoading } = useApplications();
  const { data: jobs = [] } = useJobs();
  const batchForwardMutation = useBatchForwardApplications();

  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [jobFilter, setJobFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [inspectingApp, setInspectingApp] = useState<Application | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const filteredApps = applications.filter((a) => {
    const matchesJob = jobFilter === 'all' || a.jobId === jobFilter;
    const matchesSearch =
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.studentRollNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.companyName.toLowerCase().includes(search.toLowerCase());

    return matchesJob && matchesSearch;
  });

  const submittedPendingForward = filteredApps.filter((a) => a.status === 'submitted');

  const handleToggleSelect = (id: string) => {
    if (selectedAppIds.includes(id)) {
      setSelectedAppIds(selectedAppIds.filter((item) => item !== id));
    } else {
      setSelectedAppIds([...selectedAppIds, id]);
    }
  };

  const handleSelectAllPending = () => {
    if (selectedAppIds.length === submittedPendingForward.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(submittedPendingForward.map((a) => a.id));
    }
  };

  const handleBatchForward = async () => {
    if (selectedAppIds.length === 0) return;
    try {
      await batchForwardMutation.mutateAsync(selectedAppIds);
      setSuccessBanner(
        `Successfully vetted and forwarded ${selectedAppIds.length} candidate CV(s) to respective employer HR desks.`
      );
      setSelectedAppIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Drive Applications & CV Forwarding Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit applicant cohorts and dispatch verified candidate packages to company recruiters
          </p>
        </div>

        {selectedAppIds.length > 0 && (
          <button
            type="button"
            onClick={handleBatchForward}
            disabled={batchForwardMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md transform hover:-translate-y-0.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {batchForwardMutation.isPending
                ? 'Forwarding...'
                : `Batch Forward ${selectedAppIds.length} Candidate CV(s) to HR`}
            </span>
          </button>
        )}
      </div>

      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 p-3 rounded-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, roll, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="font-semibold text-slate-700 whitespace-nowrap">Filter Drive:</label>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
          >
            <option value="all">All Active Drives</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.companyName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading applications desk...</div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No applications match the current filter.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      submittedPendingForward.length > 0 &&
                      selectedAppIds.length === submittedPendingForward.length
                    }
                    onChange={handleSelectAllPending}
                    className="text-slate-900 focus:ring-slate-900"
                    title="Select all pending forward"
                  />
                </th>
                <th className="py-3 px-4">Candidate & Roll</th>
                <th className="py-3 px-4">Recruitment Drive & Company</th>
                <th className="py-3 px-4">Verified CGPA</th>
                <th className="py-3 px-4">Application Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const isSelected = selectedAppIds.includes(app.id);
                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isSelected ? 'bg-slate-50/80' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      {app.status === 'submitted' ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(app.id)}
                          className="text-slate-900 focus:ring-slate-900"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-300 font-mono">✓</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {app.studentRollNumber} · {app.studentDepartment.split('&')[0].trim()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.jobTitle}</div>
                      <div className="text-[11px] text-slate-500">{app.companyName}</div>
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                      {app.studentCgpa.toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <StatusText status={app.status} size="sm" />
                      {app.cellForwardedAt && (
                        <span className="text-[10px] text-slate-400 block font-mono tabular-nums mt-0.5">
                          Forwarded {new Date(app.cellForwardedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectingApp(app)}
                        className="px-2.5 py-1 text-slate-700 border border-slate-300 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 font-medium ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect CV</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CV Inspection Drawer */}
      <ResumeDrawer
        isOpen={Boolean(inspectingApp)}
        onClose={() => setInspectingApp(null)}
        application={inspectingApp || undefined}
      />
    </div>
  );
};
