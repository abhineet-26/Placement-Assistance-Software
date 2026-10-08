import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOffers, useRespondOffer } from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import { Modal } from '../../components/common/Modal';
import { Award, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { OfferRecord } from '../../types';

export const OffersView: React.FC = () => {
  const { studentProfile, refreshUserData } = useAuth();
  const { data: offers = [], isLoading } = useOffers({
    studentId: studentProfile?.id,
  });
  const respondMutation = useRespondOffer();

  const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);
  const [responseType, setResponseType] = useState<'accepted' | 'declined'>('accepted');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleOpenConfirm = (offer: OfferRecord, type: 'accepted' | 'declined') => {
    setSelectedOffer(offer);
    setResponseType(type);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmResponse = async () => {
    if (!selectedOffer) return;
    try {
      await respondMutation.mutateAsync({
        offerId: selectedOffer.id,
        response: responseType,
      });
      await refreshUserData();
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Offers & Institutional Acceptance</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Formal employment offers, CTC packages, and acceptance enforcement
        </p>
      </div>

      {/* University Placement Policy Reminder */}
      <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-md text-xs text-slate-700 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 block">
            Institutional Placement Policy Clause 4.1 (One-Offer Rule)
          </span>
          <p className="text-slate-600 leading-relaxed">
            Accepting an offer officially marks you as Placed in the University Registry. All other
            active applications will be automatically closed, unless the current offer is under 10
            LPA and qualifies for a single Dream Company attempt (&gt;= 18 LPA).
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No formal offers have been extended yet. Completed interview evaluations will appear here
          once submitted by recruiters.
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-slate-200 rounded-md p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">{offer.companyName}</h3>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {offer.designation}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-mono tabular-nums">
                    <span className="text-slate-400">Total Compensation:</span>
                    <strong className="text-slate-900 font-bold text-sm">
                      {offer.ctcLpa} LPA
                    </strong>
                  </div>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <div className="flex items-center gap-1 font-mono tabular-nums">
                    <span className="text-slate-400">Proposed Joining:</span>
                    <span>{new Date(offer.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <div className="flex items-center gap-1 font-mono tabular-nums text-rose-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Acceptance Deadline: {new Date(offer.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-semibold block text-slate-800 mb-0.5">Terms Summary:</span>
                  <p>{offer.termsSummary}</p>
                </div>
              </div>

              {/* Status and Accept/Decline Actions */}
              <div className="shrink-0 flex flex-col items-end gap-3">
                <StatusText status={offer.status} />

                {offer.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenConfirm(offer, 'declined')}
                      className="px-3.5 py-1.5 border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenConfirm(offer, 'accepted')}
                      className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      Accept Offer
                    </button>
                  </div>
                )}

                {offer.decisionAt && (
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    Responded on {new Date(offer.decisionAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={
          responseType === 'accepted'
            ? 'Confirm Offer Acceptance'
            : 'Decline Employment Offer'
        }
        description={`For ${selectedOffer?.designation} at ${selectedOffer?.companyName}`}
      >
        <div className="space-y-4 text-xs">
          {responseType === 'accepted' ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 space-y-1">
              <strong>Institutional Confirmation:</strong>
              <p>
                By accepting this offer of {selectedOffer?.ctcLpa} LPA, you agree to fulfill the
                joining conditions. In accordance with university policy, your placement status will
                transition to <strong>PLACED</strong>.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 space-y-1">
              <strong>Decline Confirmation:</strong>
              <p>
                Are you sure you wish to decline this offer? This action is irreversible once
                transmitted to the recruiter and placement office.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmResponse}
              disabled={respondMutation.isPending}
              className={`px-4 py-1.5 text-white rounded font-semibold ${
                responseType === 'accepted'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {respondMutation.isPending
                ? 'Processing...'
                : responseType === 'accepted'
                ? 'Confirm Acceptance'
                : 'Confirm Decline'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
