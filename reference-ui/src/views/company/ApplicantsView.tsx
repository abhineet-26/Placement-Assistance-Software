import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  useApplications,
  useCompanies,
  useJobs,
  useUpdateApplicationStatus,
} from '../../hooks/usePlacementQueries';
import { Application, ApplicationStatus } from '../../types';
import { StatusText } from '../../components/common/StatusText';
import { ResumeDrawer } from '../../components/common/ResumeDrawer';
import { Modal } from '../../components/common/Modal';
import { Search, Filter, FileText, Calendar, Check, X, ChevronRight } from 'lucide-react';

interface ApplicantsViewProps {
  initialJobId?: string;
  onNavigateToScheduler: () => void;
}

export const ApplicantsView: React.FC<ApplicantsViewProps> = ({
  initialJobId,
  onNavigateToScheduler,
}) => {
  const { data: companies = [] } = useCompanies();
  const currentCompany = companies[0];

  const { data: jobs = [] } = useJobs();
  const companyJobs = jobs.filter((j) => j.companyId === currentCompany?.id);

  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobId || companyJobs[0]?.id || ''
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: applications = [], isLoading } = useApplications({
    jobId: selectedJobId || undefined,
  });

  const updateStatusMutation = useUpdateApplicationStatus();
  const [inspectingApp, setInspectingApp] = useState<Application | null>(null);

  // Status Change Dialog
  const [targetApp, setTargetApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('shortlisted');
  const [currentRoundName, setCurrentRoundName] = useState('Technical Round 1');
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(search.toLowerCase()) ||
      app.studentRollNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.studentDepartment.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenStatusModal = (app: Application, nextState: ApplicationStatus) => {
    setTargetApp(app);
    setNewStatus(nextState);
    setCurrentRoundName(app.currentRound || 'Technical Round 1');
    setRecruiterNotes(app.recruiterNotes || '');
    setRejectionReason(app.rejectionReason || '');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!targetApp) return;
    try {
      await updateStatusMutation.mutateAsync({
        appId: targetApp.id,
        status: newStatus,
        currentRound: currentRoundName,
        notes: recruiterNotes,
        rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
      });
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Candidate Pipeline & Evaluation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate verified applicants forwarded by the Placement Cell
          </p>
        </div>

        {/* Job selector dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Position:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
          >
            {companyJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.applicantCount} applicants)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3 rounded-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate by name, roll number, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs gap-1 font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            All Candidates
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('shortlisted')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'shortlisted'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Shortlisted
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('interview_scheduled')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'interview_scheduled'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Interviewing
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('offered')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'offered'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Offered
          </button>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading candidate pipeline...</div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No candidates match the filter criteria for this position.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Candidate & Roll</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Verified CGPA</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{app.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {app.studentRollNumber}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-700">
                    {app.studentDepartment.split('&')[0].trim()}
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                    {app.studentCgpa.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-slate-800 font-medium">{app.currentRound}</td>

                  <td className="py-3 px-4">
                    <StatusText status={app.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingApp(app)}
                        className="px-2.5 py-1 text-slate-700 border border-slate-300 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 font-medium"
                        title="Inspect CV"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>CV</span>
                      </button>

                      {app.status !== 'rejected' && app.status !== 'offered' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(app, 'shortlisted')}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold text-xs shadow-xs"
                          >
                            Advance
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(app, 'rejected')}
                            className="px-2.5 py-1.5 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors font-bold text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resume Drawer for recruiter candidate inspection */}
      <ResumeDrawer
        isOpen={Boolean(inspectingApp)}
        onClose={() => setInspectingApp(null)}
        application={inspectingApp || undefined}
      />

      {/* Stage Progression Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Candidate Pipeline Stage"
        description={`For ${targetApp?.studentName} (${targetApp?.studentRollNumber})`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 font-medium"
            >
              <option value="shortlisted">Shortlisted for Assessment / Rounds</option>
              <option value="interview_scheduled">Interview Slot Assigned</option>
              <option value="in_rounds">In Evaluation Rounds</option>
              <option value="offered">Extend Formal Job Offer</option>
              <option value="rejected">Mark Ineligible / Reject</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Active Round Identifier
            </label>
            <input
              type="text"
              value={currentRoundName}
              onChange={(e) => setCurrentRoundName(e.target.value)}
              placeholder="e.g., Technical Round 1: Algorithms"
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {newStatus === 'rejected' ? (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Rejection Reason (Audit Log) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Did not clear problem solving threshold in Round 2"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-rose-300 rounded focus:ring-1 focus:ring-rose-600"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Recruiter Evaluation Notes
              </label>
              <textarea
                rows={2}
                placeholder="Internal feedback on candidate performance..."
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={updateStatusMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-xs text-xs"
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Save Stage Progression'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
