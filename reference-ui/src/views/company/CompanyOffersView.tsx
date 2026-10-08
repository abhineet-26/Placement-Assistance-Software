import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  useApplications,
  useCompanies,
  useIssueOffer,
  useOffers,
} from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import { Modal } from '../../components/common/Modal';
import { Award, Plus, Clock, FileText, CheckCircle2 } from 'lucide-react';

export const CompanyOffersView: React.FC = () => {
  const { data: companies = [] } = useCompanies();
  const currentCompany = companies[0];

  const { data: offers = [], isLoading } = useOffers({ companyId: currentCompany?.id });
  const { data: applications = [] } = useApplications({ companyId: currentCompany?.id });
  const issueMutation = useIssueOffer();

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [designation, setDesignation] = useState('Software Engineer - Core Systems');
  const [ctcLpa, setCtcLpa] = useState<number>(18.5);
  const [joiningDate, setJoiningDate] = useState('2026-07-01');
  const [deadline, setDeadline] = useState('2026-11-15');
  const [terms, setTerms] = useState(
    'Base 15.0 LPA + 3.5 LPA performance bonus. Health insurance and relocation package included.'
  );

  const eligibleCandidates = applications.filter(
    (a) => !['rejected', 'withdrawn', 'offered'].includes(a.status)
  );

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find((a) => a.id === selectedAppId);
    if (!app) {
      alert('Please select a candidate.');
      return;
    }

    try {
      await issueMutation.mutateAsync({
        applicationId: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        companyId: currentCompany.id,
        companyName: currentCompany.name,
        studentId: app.studentId,
        studentName: app.studentName,
        studentRollNumber: app.studentRollNumber,
        studentDepartment: app.studentDepartment,
        ctcLpa: Number(ctcLpa),
        designation,
        joiningDate,
        deadline: new Date(deadline).toISOString(),
        termsSummary: terms,
      });

      setIsIssueModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to issue offer.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Employment Offers Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatch formal employment offers and monitor candidate acceptance
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (eligibleCandidates.length > 0) {
              setSelectedAppId(eligibleCandidates[0].id);
            }
            setIsIssueModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Extend Formal Offer</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading offers desk...</div>
      ) : offers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No offers extended yet. Click "Extend Formal Offer" to issue an employment contract to a
          shortlisted candidate.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
          {offers.map((offer) => (
            <div key={offer.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{offer.studentName}</h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    ({offer.studentRollNumber})
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {offer.designation}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {offer.ctcLpa} LPA
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span>Joining: {new Date(offer.joiningDate).toLocaleDateString()}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="font-mono tabular-nums text-slate-500">
                    Deadline: {new Date(offer.deadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">{offer.termsSummary}</div>
              </div>

              {/* Status */}
              <div className="text-right shrink-0">
                <StatusText status={offer.status} />
                {offer.decisionAt && (
                  <span className="text-[11px] text-slate-400 block font-mono tabular-nums mt-0.5">
                    Responded: {new Date(offer.decisionAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Dispatch Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Extend Formal Employment Offer"
        description="Formal offer recorded with University Placement Cell"
      >
        <form onSubmit={handleIssueOffer} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Candidate *</label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 font-medium"
            >
              {eligibleCandidates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.studentName} ({a.studentRollNumber}) - {a.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Designation / Title *
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono tabular-nums focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Joining Date *</label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono tabular-nums focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Candidate Response Deadline *
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono tabular-nums focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Terms Summary</label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={issueMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-xs"
            >
              {issueMutation.isPending ? 'Extending...' : 'Extend Formal Offer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
