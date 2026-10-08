import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  useApplications,
  useCompanies,
  useInterviews,
  useScheduleInterview,
  useUpdateInterviewStatus,
} from '../../hooks/usePlacementQueries';
import { Modal } from '../../components/common/Modal';
import { Calendar, Clock, MapPin, Video, Plus, Check, X, ExternalLink } from 'lucide-react';
import { InterviewSlot } from '../../types';

export const CompanyInterviewsView: React.FC = () => {
  const { data: companies = [] } = useCompanies();
  const currentCompany = companies[0];

  const { data: interviews = [], isLoading } = useInterviews({
    companyName: currentCompany?.name,
  });
  const { data: applications = [] } = useApplications({ companyId: currentCompany?.id });

  const scheduleMutation = useScheduleInterview();
  const updateStatusMutation = useUpdateInterviewStatus();

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [roundName, setRoundName] = useState('Technical Round 1: DSA');
  const [scheduledDate, setScheduledDate] = useState('2026-10-18T10:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [mode, setMode] = useState<'virtual' | 'in_person'>('virtual');
  const [locationOrUrl, setLocationOrUrl] = useState('https://meet.google.com/xyz-eval');
  const [panelists, setPanelists] = useState('Senior Staff Engineer');

  const eligibleForInterviewApps = applications.filter(
    (a) => !['rejected', 'withdrawn', 'offered'].includes(a.status)
  );

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find((a) => a.id === selectedAppId);
    if (!app) {
      alert('Please select a candidate.');
      return;
    }

    try {
      await scheduleMutation.mutateAsync({
        applicationId: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        companyName: currentCompany.name,
        studentId: app.studentId,
        studentName: app.studentName,
        studentRollNumber: app.studentRollNumber,
        roundName,
        scheduledTime: new Date(scheduledDate).toISOString(),
        durationMinutes: Number(durationMinutes),
        mode,
        locationOrUrl,
        interviewerNames: panelists,
      });

      setIsScheduleModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to schedule interview.');
    }
  };

  const handleMarkCompleted = async (slotId: string) => {
    await updateStatusMutation.mutateAsync({
      id: slotId,
      status: 'completed',
      feedback: 'Candidate evaluated and completed session.',
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Interview Coordination & Scheduling</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate evaluation panels, virtual links, and campus lab allocations
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (eligibleForInterviewApps.length > 0) {
              setSelectedAppId(eligibleForInterviewApps[0].id);
            }
            setIsScheduleModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Allocate Interview Slot</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading interview desk...</div>
      ) : interviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No active interview slots allocated. Click "Allocate Interview Slot" to assign times to
          shortlisted candidates.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
          {interviews.map((slot) => (
            <div key={slot.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{slot.studentName}</h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    ({slot.studentRollNumber})
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{slot.jobTitle}</span>
                </div>

                <div className="text-xs font-medium text-slate-800">{slot.roundName}</div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-mono tabular-nums font-semibold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(slot.scheduledTime).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <div className="flex items-center gap-1 font-mono tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(slot.scheduledTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ({slot.durationMinutes} mins)
                    </span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="capitalize">{slot.mode} panel</span>
                </div>

                {slot.interviewerNames && (
                  <div className="text-[11px] text-slate-500">
                    Panelists: {slot.interviewerNames}
                  </div>
                )}
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-3 shrink-0">
                {slot.status === 'scheduled' ? (
                  <button
                    type="button"
                    onClick={() => handleMarkCompleted(slot.id)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mark Completed</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Completed
                  </span>
                )}

                {slot.mode === 'virtual' && (
                  <a
                    href={slot.locationOrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Launch Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Slot Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Interview Slot"
        description="Allocate proctored session with candidate"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Candidate *
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 font-medium"
            >
              {eligibleForInterviewApps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.studentName} ({a.studentRollNumber}) - {a.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Round Name *
            </label>
            <input
              type="text"
              required
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
              >
                <option value="virtual">Virtual Meeting</option>
                <option value="in_person">In-Person Campus Lab</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Meeting Link or Venue *
              </label>
              <input
                type="text"
                required
                value={locationOrUrl}
                onChange={(e) => setLocationOrUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Panelist Names</label>
            <input
              type="text"
              value={panelists}
              onChange={(e) => setPanelists(e.target.value)}
              placeholder="e.g., Lead Architect, Senior SDE"
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={scheduleMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-xs"
            >
              {scheduleMutation.isPending ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
