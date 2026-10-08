import React, { useState } from 'react';
import { useInterviews } from '../../hooks/usePlacementQueries';
import { Calendar, Clock, MapPin, Video, Search, CheckCircle } from 'lucide-react';

export const CampusInterviewsView: React.FC = () => {
  const { data: interviews = [], isLoading } = useInterviews();
  const [search, setSearch] = useState('');

  const filtered = interviews.filter((i) => {
    return (
      i.companyName.toLowerCase().includes(search.toLowerCase()) ||
      i.studentName.toLowerCase().includes(search.toLowerCase()) ||
      i.roundName.toLowerCase().includes(search.toLowerCase()) ||
      i.locationOrUrl.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Campus Interview Schedule & Coordination
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor institutional panel allocations, lab booking slots, and anti-collision schedules
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          {interviews.length} total scheduled evaluations recorded
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 p-3 rounded-md flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, student, or lab venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Interview Slots Master List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading campus schedule...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No scheduled interview slots found.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
          {filtered.map((slot) => {
            const dateObj = new Date(slot.scheduledTime);
            return (
              <div key={slot.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{slot.companyName}</span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{slot.studentName}</span>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      ({slot.studentRollNumber})
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 font-medium">
                    {slot.roundName} · {slot.jobTitle}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1 font-mono tabular-nums font-semibold text-slate-900">
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
                    <span className="capitalize">{slot.mode} panel</span>
                  </div>

                  {slot.interviewerNames && (
                    <div className="text-[11px] text-slate-500">
                      Panelists: {slot.interviewerNames}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Allocated Coordinate
                    </span>
                    <span className="font-semibold truncate max-w-xs block">
                      {slot.locationOrUrl}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
