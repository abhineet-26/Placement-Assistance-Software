import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApplications } from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import { ResumeDrawer } from '../../components/common/ResumeDrawer';
import { Application } from '../../types';
import {
  FileText,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface ApplicationsViewProps {
  onSelectJob: (jobId: string) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({ onSelectJob }) => {
  const { studentProfile } = useAuth();
  const { data: applications = [], isLoading } = useApplications({
    studentId: studentProfile?.id,
  });

  const [inspectingApp, setInspectingApp] = useState<Application | null>(null);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Application Tracker</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time lifecycle and progress through selection funnels
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          You haven't submitted any applications yet. Explore active drives in the Opportunities
          Directory.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
          {applications.map((app) => (
            <div key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    onClick={() => onSelectJob(app.jobId)}
                    className="text-sm font-bold text-slate-900 hover:underline cursor-pointer"
                  >
                    {app.jobTitle}
                  </h3>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {app.companyName}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>
                    Current Stage:{' '}
                    <strong className="text-slate-800 font-medium">{app.currentRound}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                  {app.cellForwardedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CV Forwarded to HR
                      </span>
                    </>
                  )}
                </div>

                {/* Recruiter feedback or rejection note if present */}
                {app.rejectionReason && (
                  <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 p-2 rounded mt-1">
                    <strong>Notice:</strong> {app.rejectionReason}
                  </div>
                )}
                {app.recruiterNotes && (
                  <div className="text-[11px] text-amber-900 bg-amber-50/60 border border-amber-100 p-2 rounded mt-1">
                    <strong>Recruiter Note:</strong> {app.recruiterNotes}
                  </div>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <StatusText status={app.status} />
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono tabular-nums">
                    Updated {new Date(app.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingApp(app)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>View CV</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CV Inspection Drawer */}
      <ResumeDrawer
        isOpen={Boolean(inspectingApp)}
        onClose={() => setInspectingApp(null)}
        application={inspectingApp || undefined}
        student={studentProfile || undefined}
      />
    </div>
  );
};
