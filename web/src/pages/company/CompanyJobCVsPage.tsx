import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import CVPreviewPanel from '../../components/CVPreviewPanel';

type MatchWithCV = {
  id: string;
  job_id: string;
  student_id: string;
  application_id: string;
  skill_score: number;
  hard_filter_passed: boolean;
  student: {
    id: string;
    full_name: string;
    roll_number: string;
    branch: string;
    cgpa: number;
  };
  student_cv: {
    id: string;
    summary: string | null;
    academic_record: any;
    skills: string[] | null;
    projects: any[] | null;
    certifications: any[] | null;
  } | null;
};

const CompanyJobCVsPage = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  
  const { data: matches, isLoading } = useQuery<MatchWithCV[]>({
    queryKey: ['company-cvs', jobId],
    queryFn: async () => {
      const url = jobId ? `/companies/me/received-cvs?job_id=${jobId}` : `/companies/me/received-cvs`;
      const res = await api.get(url);
      return res.data;
    }
  });

  const [selectedMatch, setSelectedMatch] = useState<MatchWithCV | null>(null);

  if (isLoading) return (<div className="animate-pulse space-y-4"><div className="h-6 bg-border rounded w-1/3" /><div className="h-4 bg-border rounded w-2/3" /><div className="h-4 bg-border rounded w-1/2" /></div>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-primary">Received CVs</h1>
        <p className="text-text-secondary mt-1">Review approved candidates for your open positions.</p>
      </div>
      
      {matches?.length === 0 ? (
        <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
          No CVs have been forwarded to you yet. Check back later once the administration has reviewed applications.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border border-border rounded-lg bg-surface overflow-hidden">
            <ul className="divide-y divide-border h-[calc(100vh-250px)] overflow-y-auto">
              {matches?.map((match) => (
                <li 
                  key={match.id} 
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMatch?.id === match.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="font-medium text-text">{match.student.full_name}</div>
                  <div className="text-sm text-text-secondary flex justify-between mt-1">
                    <span>{match.student.branch} • {match.student.cgpa.toFixed(2)} CGPA</span>
                    <span className="font-semibold text-primary">{Math.round(match.skill_score * 100)}% Match</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            {selectedMatch ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start bg-surface p-6 rounded-lg border border-border shadow-sm">
                  <div>
                    <h2 className="text-2xl font-bold text-text">{selectedMatch.student.full_name}</h2>
                    <p className="text-text-secondary">{selectedMatch.student.roll_number} • {selectedMatch.student.branch}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{Math.round(selectedMatch.skill_score * 100)}%</div>
                    <div className="text-xs text-text-secondary uppercase tracking-wide">Match Score</div>
                  </div>
                </div>
                
                {selectedMatch.student_cv ? (
                  <CVPreviewPanel cv={selectedMatch.student_cv} />
                ) : (
                  <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
                    CV details not available for this candidate.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] bg-surface border border-border rounded-lg text-text-secondary text-center">
                Select a candidate from the list to view their CV.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyJobCVsPage;
