import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApplications, useApplyJob, useJob } from '../../hooks/usePlacementQueries';
import { evaluateStudentEligibility } from '../../services/api';
import { EligibilityBreakdown } from '../../components/common/EligibilityBreakdown';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  Building,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface JobDetailViewProps {
  jobId: string;
  onBack: () => void;
  onViewApplications: () => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
  jobId,
  onBack,
  onViewApplications,
}) => {
  const { studentProfile } = useAuth();
  const { data: job, isLoading } = useJob(jobId);
  const { data: applications = [] } = useApplications({ studentId: studentProfile?.id });
  const applyMutation = useApplyJob();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    studentProfile?.activeResumeId || studentProfile?.resumes[0]?.id || ''
  );
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);
  const [applyErrorMessage, setApplyErrorMessage] = useState<string | null>(null);

  if (isLoading || !job) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading drive details...</div>;
  }

  const existingApplication = applications.find((a) => a.jobId === job.id);
  const evalResult = studentProfile ? evaluateStudentEligibility(studentProfile, job) : null;

  const handleApply = async () => {
    if (!selectedResumeId) {
      setApplyErrorMessage('Please select a valid resume.');
      return;
    }
    setApplyErrorMessage(null);
    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        resumeId: selectedResumeId,
      });
      setIsApplyModalOpen(false);
      setApplySuccessMessage(
        'Your application has been successfully recorded and logged with the Placement Directorate.'
      );
    } catch (err: any) {
      setApplyErrorMessage(err.message || 'Failed to submit application.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities Directory</span>
        </button>
      </div>

      {applySuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-start justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{applySuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={onViewApplications}
            className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md hover:bg-emerald-200 transition-colors shrink-0"
          >
            Go to My Applications
          </button>
        </div>
      )}

      {/* Main Header Card with Vibrant Styling */}
      <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="font-extrabold text-blue-700 text-sm">{job.companyName}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{job.roleType.replace(/_/g, ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{job.workMode.replace(/_/g, ' ')}</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Annual Compensation:</span>
                <span className="font-mono tabular-nums font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200 text-sm">
                  {job.ctcLpa} LPA
                </span>
                {job.stipendPerMonth && (
                  <span className="text-indigo-700 font-semibold font-mono tabular-nums bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    ₹{job.stipendPerMonth.toLocaleString()} stipend
                  </span>
                )}
              </div>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <div className="flex items-center gap-1 text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{job.location}</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <div className="flex items-center gap-1 font-mono tabular-nums text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Button Container */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            {existingApplication ? (
              <div className="text-right">
                <div className="px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Application Submitted</span>
                </div>
                <button
                  type="button"
                  onClick={onViewApplications}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline mt-1.5 block"
                >
                  Track in Applications View
                </button>
              </div>
            ) : evalResult?.isEligible ? (
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md transform hover:-translate-y-0.5"
              >
                Apply for this Position
              </button>
            ) : (
              <div className="text-right">
                <button
                  type="button"
                  disabled
                  className="px-5 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-lg border border-slate-200 cursor-not-allowed"
                >
                  Ineligible to Apply
                </button>
                <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                  See eligibility breakdown below
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Eligibility Breakdown Section */}
      {evalResult && studentProfile && (
        <EligibilityBreakdown
          evaluation={evalResult}
          criteria={job.criteria}
          student={studentProfile}
        />
      )}

      {/* Main Details: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Description and Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-700">
              Role Specification & Scope
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Technical Requirements</h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Key Skills Evaluated</h4>
              <div className="flex flex-wrap gap-2">
                {job.criteria.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selection Round Roadmap & Company Coordinates */}
        <div className="space-y-6">
          {/* Selection Rounds Pipeline */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 text-purple-700">
              Selection Rounds Pipeline
            </h3>
            <ol className="relative border-l-2 border-indigo-200 ml-3 space-y-5 text-xs">
              {job.selectionRounds.map((round) => (
                <li key={round.stepNumber} className="ml-5">
                  <div className="absolute -left-2 mt-0.5 w-4 h-4 bg-indigo-600 text-white rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold">
                    {round.stepNumber}
                  </div>
                  <span className="text-[11px] font-mono text-indigo-600 font-bold block">
                    Step {round.stepNumber}
                  </span>
                  <h4 className="font-bold text-slate-900 mt-0.5">{round.name}</h4>
                  <span className="text-[11px] text-slate-500 capitalize block mt-0.5 font-medium">
                    {round.mode === 'online' ? 'Proctored Virtual Assessment' : 'In-Person Campus Lab'}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Institutional Compliance Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-xs text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Placement Cell Authorized</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-700">
              This recruitment drive adheres strictly to university compensation floors and
              anti-collision scheduling policies.
            </p>
          </div>
        </div>
      </div>

      {/* Application Confirmation Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Drive Application"
        description={`Confirm your submission for ${job.title} at ${job.companyName}`}
      >
        <div className="space-y-4 text-xs">
          {applyErrorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
              {applyErrorMessage}
            </div>
          )}

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
            <span className="text-blue-700 font-semibold block text-[11px] uppercase tracking-wider">
              Verified Candidate Dossier
            </span>
            <div className="font-bold text-slate-900 text-sm">
              {studentProfile?.fullName} · Roll: {studentProfile?.rollNumber}
            </div>
            <div className="text-slate-700 font-mono tabular-nums font-medium">
              CGPA: {studentProfile?.cgpa.toFixed(2)} · Backlogs: {studentProfile?.activeBacklogs}
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1.5">
              Select Resume Version for this Application
            </label>
            <div className="space-y-2">
              {studentProfile?.resumes.map((res) => (
                <label
                  key={res.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedResumeId === res.id
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="resumeSelection"
                      value={res.id}
                      checked={selectedResumeId === res.id}
                      onChange={() => setSelectedResumeId(res.id)}
                      className="text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{res.fileName}</span>
                      <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {res.fileSize}
                      </span>
                    </div>
                  </div>
                  {res.isDefault && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
            <strong>Policy Declaration:</strong> By applying, you confirm attendance for all
            subsequent rounds. Unexcused absence from scheduled tests or interviews leads to a
            placement disciplinary freeze.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={applyMutation.isPending}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-xs"
            >
              {applyMutation.isPending ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
