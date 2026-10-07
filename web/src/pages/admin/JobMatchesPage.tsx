import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';

type StudentMatchSummary = {
  id: string;
  roll_number: string;
  full_name: string;
  cgpa: number;
  branch: string;
  backlogs: number;
  gender: string | null;
};

type Match = {
  id: string;
  job_id: string;
  student_id: string;
  application_id: string;
  skill_score: number;
  hard_filter_passed: boolean;
  included_in_shortlist: boolean;
  forwarding_status: string;
  student: StudentMatchSummary;
  student_skills: string[];
};

type Job = {
  id: string;
  title: string;
  required_skills: string[];
};

const JobMatchesPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();

  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(new Set());
  const [overrideMatch, setOverrideMatch] = useState<Match | null>(null);

  const { data: job } = useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data;
    }
  });

  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['job-matches', jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}/matches`);
      return res.data;
    },
    enabled: !!jobId
  });
  
  const triggerMatchingMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${jobId}/run-matching`),
    onSuccess: () => {
      alert("Matching engine triggered in background.");
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['job-matches', jobId] }), 2000);
    }
  });

  const approveMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${jobId}/approve-forwarding`, { match_ids: Array.from(selectedMatchIds) }),
    onSuccess: () => {
      alert("Approved forwarding for selected CVs.");
      setSelectedMatchIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['job-matches', jobId] });
    }
  });

  const overrideMutation = useMutation({
    mutationFn: (data: { match_id: string, updates: Partial<Match> }) => 
      api.patch(`/jobs/${data.match_id}/override`, data.updates),
    onSuccess: () => {
      alert("Match overridden successfully.");
      setOverrideMatch(null);
      queryClient.invalidateQueries({ queryKey: ['job-matches', jobId] });
    },
    onError: () => {
      alert("Failed to override match.");
    }
  });

  const toggleMatchSelection = (id: string) => {
    const newSet = new Set(selectedMatchIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedMatchIds(newSet);
  };

  const selectAll = () => {
    if (matches && selectedMatchIds.size === matches.length) {
      setSelectedMatchIds(new Set());
    } else if (matches) {
      setSelectedMatchIds(new Set(matches.map(m => m.id)));
    }
  };

  if (isLoading) return <div>Loading matches...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-h1 font-bold text-primary">Job Matches</h1>
          {job && <p className="text-text-secondary mt-1">{job.title}</p>}
        </div>
        <div className="flex items-center gap-3">
          {selectedMatchIds.size > 0 && (
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
            >
              {approveMutation.isPending ? 'Approving...' : `Approve ${selectedMatchIds.size} CVs`}
            </button>
          )}
          <button 
            onClick={() => triggerMatchingMutation.mutate()}
            disabled={triggerMatchingMutation.isPending}
            className="px-4 py-2 bg-secondary text-white rounded hover:bg-primary transition-colors disabled:opacity-50"
          >
            {triggerMatchingMutation.isPending ? 'Running...' : 'Run Matching Engine'}
          </button>
        </div>
      </div>
      
      {matches?.length === 0 ? (
        <div className="p-6 bg-surface border border-border rounded-lg text-text-secondary text-center">
          No matches found or matching hasn't run yet. Click 'Run Matching Engine'.
        </div>
      ) : (
        <div className="overflow-x-auto bg-surface rounded-lg border border-border shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background/50 text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium border-b border-border w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    checked={matches && matches.length > 0 && selectedMatchIds.size === matches.length}
                    onChange={selectAll}
                  />
                </th>
                <th className="px-4 py-3 font-medium border-b border-border">Rank</th>
                <th className="px-4 py-3 font-medium border-b border-border">Student</th>
                <th className="px-4 py-3 font-medium border-b border-border">Profile</th>
                <th className="px-4 py-3 font-medium border-b border-border">Skills Map</th>
                <th className="px-4 py-3 font-medium text-right border-b border-border">Match Score</th>
                <th className="px-4 py-3 font-medium text-center border-b border-border">Status</th>
                <th className="px-4 py-3 font-medium text-center border-b border-border w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matches?.map((match, index) => {
                const isEligible = match.hard_filter_passed;
                
                return (
                  <tr key={match.id} className={!isEligible ? "opacity-60 bg-gray-50" : ""}>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={selectedMatchIds.has(match.id)}
                        onChange={() => toggleMatchSelection(match.id)}
                        disabled={match.forwarding_status === 'sent'}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">{match.student.full_name}</div>
                      <div className="text-text-secondary text-xs">{match.student.roll_number}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary space-y-1">
                      <div>CGPA: {match.student.cgpa.toFixed(2)}</div>
                      <div>Branch: {match.student.branch}</div>
                      <div>Backlogs: {match.student.backlogs}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {job?.required_skills.map((skill, idx) => {
                          const hasSkill = (match.student_skills || []).some(s => s.toLowerCase().trim() === skill.toLowerCase().trim());
                          return (
                            <span 
                              key={idx} 
                              className={`text-[10px] px-2 py-0.5 rounded-full ${hasSkill ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-100 opacity-80'}`}
                              title={hasSkill ? 'Matched' : 'Missing'}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-lg">
                        {Math.round(match.skill_score * 100)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!isEligible ? (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                          Ineligible
                        </span>
                      ) : match.forwarding_status === 'pending' ? (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                          Pending Review
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium capitalize">
                          {match.forwarding_status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setOverrideMatch(match)}
                        className="text-primary hover:text-secondary text-xs font-medium"
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {overrideMatch && (
        <OverrideDialog 
          match={overrideMatch} 
          onClose={() => setOverrideMatch(null)}
          onSave={(updates) => overrideMutation.mutate({ match_id: overrideMatch.id, updates })}
          isPending={overrideMutation.isPending}
        />
      )}
    </div>
  );
};

const OverrideDialog = ({ 
  match, 
  onClose, 
  onSave, 
  isPending 
}: { 
  match: Match, 
  onClose: () => void, 
  onSave: (updates: Partial<Match>) => void,
  isPending: boolean 
}) => {
  const [status, setStatus] = useState(match.forwarding_status);
  const [hardFilterPassed, setHardFilterPassed] = useState(match.hard_filter_passed);
  const [skillScoreStr, setSkillScoreStr] = useState(match.skill_score.toString());

  const handleSave = () => {
    onSave({
      forwarding_status: status,
      hard_filter_passed: hardFilterPassed,
      skill_score: parseFloat(skillScoreStr)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6 border border-border">
        <h3 className="text-xl font-bold text-text mb-4">Override Match</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Student</label>
            <div className="p-2 bg-background rounded text-sm text-text-secondary border border-border">
              {match.student.full_name} ({match.student.roll_number})
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-1">Forwarding Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="hard_filter"
              checked={hardFilterPassed}
              onChange={(e) => setHardFilterPassed(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="hard_filter" className="text-sm font-medium text-text cursor-pointer">
              Passed Hard Filters (Eligibility)
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-1">Skill Score (0.0 - 1.0)</label>
            <input 
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={skillScoreStr}
              onChange={(e) => setSkillScoreStr(e.target.value)}
              className="w-full p-2 border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-border rounded text-text hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobMatchesPage;
