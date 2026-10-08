import React from 'react';
import { ApplicationStatus, JobStatus, OfferStatus } from '../../types';

interface StatusTextProps {
  status: ApplicationStatus | JobStatus | OfferStatus | 'pending' | 'approved' | 'rejected' | string;
  size?: 'sm' | 'md';
}

export const StatusText: React.FC<StatusTextProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let label = status.replace(/_/g, ' ');
  label = label.charAt(0).toUpperCase() + label.slice(1);

  let badgeClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-500';

  if (['published', 'approved', 'accepted', 'offered'].includes(normalized)) {
    badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs';
    dotColor = 'bg-emerald-500 ring-2 ring-emerald-200';
    if (normalized === 'published') label = 'Published & Open';
    if (normalized === 'approved') label = 'Approved Partner';
    if (normalized === 'accepted') label = 'Offer Accepted';
    if (normalized === 'offered') label = 'Offer Extended';
  } else if (['shortlisted'].includes(normalized)) {
    badgeClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200 shadow-xs';
    dotColor = 'bg-indigo-500 ring-2 ring-indigo-200';
    label = 'Shortlisted for Rounds';
  } else if (['forwarded_by_cell'].includes(normalized)) {
    badgeClasses = 'bg-purple-50 text-purple-800 border-purple-200 shadow-xs';
    dotColor = 'bg-purple-500 ring-2 ring-purple-200';
    label = 'Forwarded to Recruiter';
  } else if (['pending', 'pending_approval', 'submitted', 'in_rounds'].includes(normalized)) {
    badgeClasses = 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs';
    dotColor = 'bg-amber-500 ring-2 ring-amber-200';
    if (normalized === 'pending_approval') label = 'Pending Cell Review';
    if (normalized === 'submitted') label = 'Application Submitted';
    if (normalized === 'in_rounds') label = 'In Assessment Rounds';
  } else if (['interview_scheduled'].includes(normalized)) {
    badgeClasses = 'bg-blue-50 text-blue-800 border-blue-200 shadow-xs';
    dotColor = 'bg-blue-500 ring-2 ring-blue-200';
    label = 'Interview Scheduled';
  } else if (['rejected', 'declined', 'revoked', 'closed'].includes(normalized)) {
    badgeClasses = 'bg-rose-50 text-rose-800 border-rose-200 shadow-xs';
    dotColor = 'bg-rose-500 ring-2 ring-rose-200';
    if (normalized === 'closed') label = 'Applications Closed';
    if (normalized === 'rejected') label = 'Not Shortlisted';
    if (normalized === 'declined') label = 'Offer Declined';
  } else if (['draft'].includes(normalized)) {
    badgeClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    dotColor = 'bg-slate-400';
    label = 'Draft Requisition';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${badgeClasses} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
