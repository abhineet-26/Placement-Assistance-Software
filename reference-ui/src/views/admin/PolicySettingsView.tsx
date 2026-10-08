import React, { useState } from 'react';
import { useCreateNotice, useNotices } from '../../hooks/usePlacementQueries';
import { Bell, Plus, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';
import { PlacementNotice } from '../../types';

export const PolicySettingsView: React.FC = () => {
  const { data: notices = [], isLoading } = useNotices();
  const createNoticeMutation = useCreateNotice();

  // Policy thresholds
  const [minCtcFloor, setMinCtcFloor] = useState<number>(6.0);
  const [dreamThreshold, setDreamThreshold] = useState<number>(18.0);
  const [policySaved, setPolicySaved] = useState(false);

  // New Notice form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<PlacementNotice['priority']>('routine');
  const [category, setCategory] = useState<PlacementNotice['category']>('drive_announcement');
  const [noticeSuccess, setNoticeSuccess] = useState<string | null>(null);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await createNoticeMutation.mutateAsync({
        title,
        content,
        author: 'Placement Directorate',
        priority,
        category,
      });

      setTitle('');
      setContent('');
      setNoticeSuccess('Official announcement published to all active student portals.');
      setTimeout(() => setNoticeSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Placement Policy & Notice Dispatch</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure institutional thresholds and broadcast campus recruitment circulars
        </p>
      </div>

      {/* Institutional Policy Thresholds */}
      <div className="bg-white border border-slate-200 p-6 rounded-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Institutional Compensation & Eligibility Rules
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Governs automated eligibility checks and one-student-one-offer rules
            </p>
          </div>
          {policySaved && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Policy rules updated
            </span>
          )}
        </div>

        <form onSubmit={handleSavePolicies} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Campus Minimum CTC Floor (LPA)
            </label>
            <input
              type="number"
              step="0.5"
              min="3.0"
              value={minCtcFloor}
              onChange={(e) => setMinCtcFloor(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono tabular-nums focus:ring-1 focus:ring-slate-900"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Companies offering below this floor cannot register full-time drives.
            </span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Dream Company CTC Threshold (LPA)
            </label>
            <input
              type="number"
              step="0.5"
              min="10.0"
              value={dreamThreshold}
              onChange={(e) => setDreamThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono tabular-nums focus:ring-1 focus:ring-slate-900"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Placed students below 10 LPA remain eligible for drives meeting or exceeding this
              amount.
            </span>
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Save Policy Rules
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast Announcement Dispatch Desk */}
      <div className="bg-white border border-slate-200 p-6 rounded-md space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Broadcast Official Placement Notice</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pushed to student dashboards and the top notification desk in real time
          </p>
        </div>

        {noticeSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
            {noticeSuccess}
          </div>
        )}

        <form onSubmit={handlePublishNotice} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Circular Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Shortlist Published: Cisco Systems Technical Round 2..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
              >
                <option value="routine">Routine Information</option>
                <option value="urgent">Urgent Circular</option>
                <option value="deadline">Registration Deadline Approaching</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
              >
                <option value="drive_announcement">Drive Announcement</option>
                <option value="shortlist_published">Shortlist Published</option>
                <option value="policy_update">Policy Circular</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Circular Content *</label>
            <textarea
              rows={3}
              required
              placeholder="Details regarding reporting time, test venue, or instructions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createNoticeMutation.isPending}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              {createNoticeMutation.isPending ? 'Publishing...' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Notices Feed */}
      <div className="bg-white border border-slate-200 rounded-md p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Active Notice Feed ({notices.length})</h3>
        <div className="divide-y divide-slate-100">
          {notices.map((n) => (
            <div key={n.id} className="py-3 first:pt-0 last:pb-0 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{n.title}</span>
                <span className="font-mono tabular-nums text-slate-400 text-[11px]">
                  {new Date(n.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-600">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
