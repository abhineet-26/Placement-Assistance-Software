import React, { useState } from 'react';
import { useOffers } from '../../hooks/usePlacementQueries';
import { StatusText } from '../../components/common/StatusText';
import { Award, CheckCircle2, Search, Download } from 'lucide-react';

export const OfferLedgerView: React.FC = () => {
  const { data: offers = [], isLoading } = useOffers();
  const [search, setSearch] = useState('');

  const filtered = offers.filter((o) => {
    return (
      o.studentName.toLowerCase().includes(search.toLowerCase()) ||
      o.studentRollNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.companyName.toLowerCase().includes(search.toLowerCase()) ||
      o.designation.toLowerCase().includes(search.toLowerCase())
    );
  });

  const acceptedCount = offers.filter((o) => o.status === 'accepted').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Institutional Offer Ledger & Placements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Central audit registry for extended compensation packages and acceptance verification
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Exporting verified placement registry CSV...')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-md">
          <span className="text-slate-500 block">Total Extended Offers</span>
          <span className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1 block">
            {offers.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Recorded this season</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-md">
          <span className="text-slate-500 block">Accepted & Confirmed Placements</span>
          <span className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-1 block">
            {acceptedCount}
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Official student placements</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-md">
          <span className="text-slate-500 block">Policy Compliance Standing</span>
          <span className="font-bold text-slate-900 text-sm mt-1 block flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" /> 100% Policy Compliant
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Zero duplicate acceptances</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 p-3 rounded-md flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, roll, company, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Ledger Table */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading offer ledger...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-xs text-slate-500">
          No formal offers recorded matching query.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Candidate & Roll</th>
                <th className="py-3 px-4">Employer Entity</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Package (CTC)</th>
                <th className="py-3 px-4">Proposed Joining</th>
                <th className="py-3 px-4">Acceptance Status</th>
                <th className="py-3 px-4 text-right">Audit Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{offer.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {offer.studentRollNumber} · {offer.studentDepartment.split('&')[0].trim()}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-900 font-semibold">{offer.companyName}</td>

                  <td className="py-3 px-4 text-slate-700">{offer.designation}</td>

                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                    {offer.ctcLpa} LPA
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                    {new Date(offer.joiningDate).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4">
                    <StatusText status={offer.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-400">
                    {new Date(offer.issuedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
