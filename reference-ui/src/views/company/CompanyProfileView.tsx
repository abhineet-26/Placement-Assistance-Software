import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCompanies } from '../../hooks/usePlacementQueries';
import { Building2, ShieldCheck, Mail, Phone, Globe, MapPin } from 'lucide-react';

export const CompanyProfileView: React.FC = () => {
  const { data: companies = [] } = useCompanies();
  const currentCompany = companies[0];

  if (!currentCompany) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading organization records...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Company & Recruiter Dossier</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Corporate accreditation and points of contact registered with the University
        </p>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-md space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{currentCompany.name}</h3>
              <span className="text-xs text-slate-500">({currentCompany.legalEntityName})</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentCompany.industry}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>Cell Approved Partner</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded">
            <span className="text-slate-500 block">Headquarters</span>
            <span className="text-slate-900 font-medium text-sm mt-0.5 block">
              {currentCompany.headquarters}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded">
            <span className="text-slate-500 block">Corporate Website</span>
            <a
              href={currentCompany.website}
              target="_blank"
              rel="noreferrer"
              className="text-slate-900 underline font-medium text-sm mt-0.5 block truncate"
            >
              {currentCompany.website}
            </a>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded">
            <span className="text-slate-500 block">HR Point of Contact</span>
            <span className="text-slate-900 font-medium text-sm mt-0.5 block">
              {currentCompany.hrContactName}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded">
            <span className="text-slate-500 block">Official Contact Coordinates</span>
            <span className="text-slate-900 font-mono tabular-nums text-xs mt-0.5 block">
              {currentCompany.hrEmail} · {currentCompany.hrPhone}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono tabular-nums pt-2 border-t border-slate-100">
          Accreditation ID: {currentCompany.id} · Registered{' '}
          {new Date(currentCompany.registeredAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
