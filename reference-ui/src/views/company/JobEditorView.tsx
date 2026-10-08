import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCompanies, useCreateJob } from '../../hooks/usePlacementQueries';
import { ArrowLeft, Plus, X, ShieldAlert } from 'lucide-react';
import { JobRoleType, SelectionRound, WorkMode } from '../../types';

interface JobEditorViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AVAILABLE_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Civil Engineering',
];

export const JobEditorView: React.FC<JobEditorViewProps> = ({ onBack, onSuccess }) => {
  const { data: companies = [] } = useCompanies();
  const currentCompany = companies[0];
  const createMutation = useCreateJob();

  const [title, setTitle] = useState('');
  const [roleType, setRoleType] = useState<JobRoleType>('full_time');
  const [workMode, setWorkMode] = useState<WorkMode>('hybrid');
  const [location, setLocation] = useState('Bengaluru / Pune');
  const [ctcLpa, setCtcLpa] = useState<number>(16.0);
  const [stipendPerMonth, setStipendPerMonth] = useState<number>(40000);
  const [deadline, setDeadline] = useState('2026-11-20');
  const [description, setDescription] = useState('');

  // Criteria
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [maxActiveBacklogs, setMaxActiveBacklogs] = useState<number>(0);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    'Computer Science & Engineering',
    'Information Technology',
  ]);
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    'Python',
    'PostgreSQL',
    'Docker',
  ]);

  // Selection Rounds
  const [rounds, setRounds] = useState<SelectionRound[]>([
    { stepNumber: 1, name: 'Online Coding Assessment (90 mins)', mode: 'online' },
    { stepNumber: 2, name: 'Technical Round 1: Core Problem Solving', mode: 'online' },
    { stepNumber: 3, name: 'Executive & Cultural Alignment', mode: 'on_campus' },
  ]);

  const handleToggleDept = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter((d) => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || selectedDepartments.length === 0) {
      alert('Please fill out the title, description, and at least one allowed department.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        companyId: currentCompany?.id || 'comp-1',
        companyName: currentCompany?.name || 'Recruiter Org',
        title,
        roleType,
        workMode,
        location,
        ctcLpa: Number(ctcLpa),
        stipendPerMonth: roleType !== 'full_time' ? Number(stipendPerMonth) : undefined,
        applicationDeadline: new Date(deadline).toISOString(),
        description,
        requirements: [
          'Solid fundamentals in algorithms and system design',
          'Demonstrated project work in corresponding technical stack',
          'Good interpersonal communication and problem-solving velocity',
        ],
        selectionRounds: rounds,
        criteria: {
          minCgpa: Number(minCgpa),
          allowedDepartments: selectedDepartments,
          allowedDegrees: ['B.Tech', 'M.Tech'],
          maxActiveBacklogs: Number(maxActiveBacklogs),
          maxHistoryBacklogs: 1,
          requiredSkills,
        },
        status: 'pending_approval', // Requires Placement Cell moderation
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to author requisition.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Requisitions Desk</span>
        </button>
      </div>

      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Author New Campus Job Requisition</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Formulate role parameters, selection pipeline, and deterministic criteria
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Parameters Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-md space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            1. Role Details & Compensation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Position Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Software Development Engineer - Distributed Systems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Role Type</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as JobRoleType)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              >
                <option value="full_time">Full-Time Direct Hire</option>
                <option value="intern_to_fte">Internship leading to FTE</option>
                <option value="internship">Semester Internship Only</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              >
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On-Site Office / Lab</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Annual Package (CTC in LPA) *
              </label>
              <input
                type="number"
                step="0.1"
                min="3.0"
                required
                value={ctcLpa}
                onChange={(e) => setCtcLpa(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Location Coordinates
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Job Scope & Requirements *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe day-to-day engineering responsibilities, tech stack, and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Deterministic Eligibility Formulation */}
        <div className="bg-white border border-slate-200 p-6 rounded-md space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Deterministic Eligibility Rules (Enforced by Backend)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Minimum CGPA Cutoff (0.0 - 10.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="5.0"
                max="10.0"
                value={minCgpa}
                onChange={(e) => setMinCgpa(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Max Allowed Active Backlogs
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={maxActiveBacklogs}
                onChange={(e) => setMaxActiveBacklogs(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs">
              Eligible Degree Branches *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {AVAILABLE_DEPARTMENTS.map((dept) => (
                <label
                  key={dept}
                  className={`flex items-center gap-2 p-2.5 border rounded cursor-pointer transition-colors ${
                    selectedDepartments.includes(dept)
                      ? 'border-slate-900 bg-slate-50 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept)}
                    onChange={() => handleToggleDept(dept)}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <span>{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">
              Required Core Skills (Used for overlap ranking)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {requiredSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded text-xs border border-slate-200"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter((s) => s !== sk))}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Moderation Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Placement Cell Moderation:</strong> Upon submission, this requisition is
            queued in the Placement Administration hub. Once verified for policy compliance, it is
            published to all eligible students.
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md transform hover:-translate-y-0.5"
          >
            {createMutation.isPending ? 'Submitting...' : 'Submit Requisition for Review'}
          </button>
        </div>
      </form>
    </div>
  );
};
