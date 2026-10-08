import React, { useState } from 'react';
import { useCompanies, useSetCompanyVerification } from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import { Modal } from '../../components/common/Modal';
import { Check, X, Building2, Globe, Mail, Phone, Search, ShieldCheck } from 'lucide-react';
import { CompanyProfile } from '../../types';

export const CompanyApprovalsView: React.FC = () => {
  const { data: companies = [], isLoading } = useCompanies();
  const verifyMutation = useSetCompanyVerification();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  // Reject modal state
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.hrContactName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (companyId: string) => {
    try {
      await verifyMutation.mutateAsync({
        companyId,
        status: 'approved',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReject = (company: CompanyProfile) => {
    setSelectedCompany(company);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedCompany) return;
    try {
      await verifyMutation.mutateAsync({
        companyId: selectedCompany.id,
        status: 'rejected',
        reason: rejectReason || 'Did not meet institutional documentation standards.',
      });
      setIsRejectModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Employer Accreditation & Vetting Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review corporate entities, verify HR credentials, and authorize campus access
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          {companies.filter((c) => c.verificationStatus === 'pending').length} registrations
          pending vetting
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3 rounded-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company by name, industry, or HR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs gap-1 font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            All Partners
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'pending'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Pending Review
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Company Table */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading company registry...</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-xs">
          No employers match your active search or filter.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                <th className="py-3.5 px-4">Entity & Legal Name</th>
                <th className="py-3.5 px-4">Sector / Domain</th>
                <th className="py-3.5 px-4">HR Contact Coordinates</th>
                <th className="py-3.5 px-4">Accreditation Status</th>
                <th className="py-3.5 px-4 text-right">Cell Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map((comp) => (
                <tr key={comp.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900">{comp.name}</div>
                    <div className="text-[11px] text-slate-500">{comp.legalEntityName}</div>
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 font-medium hover:underline block mt-0.5"
                    >
                      {comp.website}
                    </a>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-semibold text-slate-900">{comp.industry}</div>
                    <div className="text-[11px] text-slate-400">{comp.headquarters}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-bold text-slate-900">{comp.hrContactName}</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {comp.hrEmail} · {comp.hrPhone}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusText status={comp.verificationStatus} size="sm" />
                    {comp.rejectionReason && (
                      <span className="text-[10px] text-rose-600 block mt-0.5">
                        {comp.rejectionReason}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {comp.verificationStatus === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(comp.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Partner</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenReject(comp)}
                            className="px-2.5 py-1.5 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : comp.verificationStatus === 'approved' ? (
                        <span className="text-[11px] text-emerald-700 font-bold font-mono tabular-nums bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Active Partner
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApprove(comp.id)}
                          className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          Re-authorize
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Employer Accreditation"
        description={`For ${selectedCompany?.name} (${selectedCompany?.legalEntityName})`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Audit Note / Rejection Reason *
            </label>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Domain mismatch or corporate credentials could not be verified with MCA registry..."
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={verifyMutation.isPending}
              className="px-4 py-1.5 bg-rose-600 text-white rounded hover:bg-rose-700 font-semibold"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
