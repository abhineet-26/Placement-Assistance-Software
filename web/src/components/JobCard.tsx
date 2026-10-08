import React from 'react';
import StatusBadge from './StatusBadge';

interface JobCardProps {
  job: {
    title: string;
    company_name: string;
    ctc: string;
    location: string;
    deadline: string;
    skills: string[];
    status?: string;
  };
  onApply?: () => void;
  onView?: () => void;
  actionText?: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onView, actionText = 'Apply Now' }) => {
  return (
    <div className="bg-surface rounded-xl shadow-card p-6 border border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="flex justify-between items-start mb-4 gap-2">
        <div>
          <h3 className="text-h3 font-semibold text-text-primary mb-1 leading-tight">{job.title}</h3>
          <div className="text-text-secondary font-medium">{job.company_name}</div>
        </div>
        {job.status && (
          <StatusBadge status={job.status} />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-5 flex-grow">
        <div className="flex items-center text-sm text-text-secondary">
          <svg className="w-4.5 h-4.5 mr-2 text-text-secondary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {job.ctc}
        </div>
        <div className="flex items-center text-sm text-text-secondary">
          <svg className="w-4.5 h-4.5 mr-2 text-text-secondary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {job.location}
        </div>
        <div className="flex items-center text-sm text-text-secondary col-span-2">
          <svg className="w-4.5 h-4.5 mr-2 text-text-secondary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Apply by {new Date(job.deadline).toLocaleDateString()}
        </div>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-2">
        {job.skills && job.skills.slice(0, 3).map(skill => (
          <span key={skill} className="px-2.5 py-1 bg-background text-text-secondary text-xs rounded-md font-medium border border-border/50">
            {skill}
          </span>
        ))}
        {job.skills && job.skills.length > 3 && (
          <span className="px-2.5 py-1 bg-background text-text-secondary text-xs rounded-md font-medium border border-border/50">
            +{job.skills.length - 3} more
          </span>
        )}
      </div>
      
      <div className="flex justify-end gap-3 mt-auto">
        {onView && (
          <button 
            onClick={onView}
            className="px-4 py-2.5 text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors flex-1 text-center"
          >
            View Details
          </button>
        )}
        {onApply && (
          <button 
            onClick={onApply}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm flex-1 text-center"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
