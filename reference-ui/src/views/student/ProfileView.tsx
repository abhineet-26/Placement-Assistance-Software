import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  FileText,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Plus,
  X,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const SKILL_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-emerald-50 text-emerald-800 border-emerald-200',
  'bg-amber-50 text-amber-800 border-amber-200',
  'bg-teal-50 text-teal-800 border-teal-200',
];

export const ProfileView: React.FC = () => {
  const { studentProfile, updateStudentProfile } = useAuth();

  const [skillsInput, setSkillsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  if (!studentProfile) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading student profile...</div>;
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = skillsInput.trim();
    if (!trimmed) return;
    if (studentProfile.skills.includes(trimmed)) return;

    const newSkills = [...studentProfile.skills, trimmed];
    updateStudentProfile({ skills: newSkills });
    setSkillsInput('');
    setSuccessNote('Skills list updated.');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = studentProfile.skills.filter((s) => s !== skillToRemove);
    updateStudentProfile({ skills: newSkills });
  };

  const handleSimulateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileSizeStr = `${Math.round(file.size / 1024)} KB`;
      const updated = await api.uploadResume(file.name, fileSizeStr);
      await updateStudentProfile(updated);
      setSuccessNote(`Successfully uploaded ${file.name}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetDefaultResume = async (resumeId: string) => {
    const updated = await api.setDefaultResume(resumeId);
    await updateStudentProfile(updated);
    setSuccessNote('Default resume updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Academic & Professional Dossier
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified academic records and employment assets used by placement matching
        </p>
      </div>

      {successNote && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successNote}</span>
          </div>
          <button
            onClick={() => setSuccessNote(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Verified Academic Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Institutional Academic Record
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified by Office of Academic Affairs & Placement Directorate
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cell Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg">
            <span className="text-blue-700 font-bold block">Candidate Full Name</span>
            <span className="text-slate-900 font-extrabold text-sm mt-0.5 block">
              {studentProfile.fullName}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-bold block">Roll Number</span>
            <span className="text-slate-900 font-mono tabular-nums font-extrabold text-sm mt-0.5 block">
              {studentProfile.rollNumber}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-bold block">Degree & Program</span>
            <span className="text-slate-900 font-semibold text-sm mt-0.5 block">
              {studentProfile.degree} ({studentProfile.batchYear})
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-bold block">Department / Branch</span>
            <span className="text-slate-900 font-semibold text-xs mt-0.5 block">
              {studentProfile.department}
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg">
            <span className="text-emerald-800 font-bold block">Cumulative GPA (CGPA)</span>
            <span className="text-emerald-900 font-mono tabular-nums font-black text-base mt-0.5 block">
              {studentProfile.cgpa.toFixed(2)}{' '}
              <span className="text-xs text-emerald-600 font-normal">/ 10.0</span>
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-bold block">Standing / Backlogs</span>
            <span className="text-slate-900 font-mono tabular-nums font-bold text-xs mt-0.5 block">
              Active: {studentProfile.activeBacklogs} · History: {studentProfile.historyBacklogs}
            </span>
          </div>
        </div>
      </div>

      {/* Resume Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Curriculum Vitae Repository</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage verified CV profiles submitted to campus employers
            </p>
          </div>

          {/* Upload Button */}
          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleSimulateUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="space-y-3">
          {studentProfile.resumes.map((res) => (
            <div
              key={res.id}
              className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all shadow-xs ${
                res.isDefault
                  ? 'border-blue-400 bg-blue-50/40 ring-1 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{res.fileName}</span>
                    {res.isDefault && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active Default
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono tabular-nums">
                    <span>{res.fileSize}</span>
                    <span aria-hidden="true">·</span>
                    <span>Uploaded {new Date(res.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {!res.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefaultResume(res.id)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vibrant Technical Skill Tags */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Technical Skills</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated by the matching engine against job criteria requirements
          </p>
        </div>

        {/* Existing Colorful Skills */}
        <div className="flex flex-wrap gap-2">
          {studentProfile.skills.map((skill, idx) => {
            const colorClass = SKILL_COLORS[idx % SKILL_COLORS.length];
            return (
              <div
                key={skill}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-2xs ${colorClass}`}
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:opacity-75"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm pt-2">
          <input
            type="text"
            placeholder="Add skill (e.g., C++, AWS, Go)..."
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
          >
            Add Skill
          </button>
        </form>
      </div>
    </div>
  );
};
