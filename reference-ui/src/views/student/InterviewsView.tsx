import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInterviews } from '../../hooks/usePlacementQueries';
import { Calendar, Clock, MapPin, Video, CheckCircle, ExternalLink } from 'lucide-react';

export const InterviewsView: React.FC = () => {
  const { studentProfile } = useAuth();
  const { data: interviews = [], isLoading } = useInterviews({
    studentId: studentProfile?.id,
  });

  const scheduled = interviews.filter((i) => i.status === 'scheduled');
  const past = interviews.filter((i) => i.status !== 'scheduled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Interview & Assessment Schedule</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Confirmed technical evaluations, coding assessments, and panel interviews
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading interview schedule...</div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Upcoming Allocated Slots ({scheduled.length})
            </h3>

            {scheduled.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded p-8 text-center text-xs text-slate-500">
                No active interview slots currently assigned to your profile. As companies
                shortlist candidates, notifications and dates will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {scheduled.map((slot) => {
                  const dateObj = new Date(slot.scheduledTime);
                  return (
                    <div
                      key={slot.id}
                      className="bg-white border border-slate-200 p-5 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {slot.companyName}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span className="text-xs text-slate-600">{slot.jobTitle}</span>
                        </div>

                        <h4 className="text-sm font-semibold text-slate-900">{slot.roundName}</h4>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1 font-mono tabular-nums text-slate-900 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {dateObj.toLocaleDateString([], {
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
                              {dateObj.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              ({slot.durationMinutes} mins)
                            </span>
                          </div>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <div className="flex items-center gap-1">
                            {slot.mode === 'virtual' ? (
                              <Video className="w-3.5 h-3.5 text-sky-600" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className="capitalize">{slot.mode} Session</span>
                          </div>
                        </div>

                        {slot.interviewerNames && (
                          <div className="text-[11px] text-slate-500">
                            Panelists: {slot.interviewerNames}
                          </div>
                        )}
                      </div>

                      {/* Coordinates Action */}
                      <div className="shrink-0 flex items-center gap-3">
                        {slot.mode === 'virtual' ? (
                          <a
                            href={slot.locationOrUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
                          >
                            <span>Launch Meeting Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                              Assigned Venue
                            </span>
                            <span className="font-semibold">{slot.locationOrUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Institutional Guidelines */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-md text-xs space-y-2">
            <h4 className="font-bold text-slate-900">Placement Cell Protocol for Interviews</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
              <li>Candidates must report 15 minutes prior to scheduled start time with College ID card.</li>
              <li>Virtual interview participants must test microphone, camera, and network stability beforehand.</li>
              <li>Formal attire is mandatory for both virtual and in-person interviews.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
