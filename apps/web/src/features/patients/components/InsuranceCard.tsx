import React from 'react';
import { Shield, Building, Hash, CalendarDays } from 'lucide-react';
import type { SharedInsurance } from '@medicalink/shared';

interface InsuranceCardProps {
  insurance: SharedInsurance;
}

export const InsuranceCard: React.FC<InsuranceCardProps> = ({ insurance }) => {
  const isExpired = new Date(insurance.validTo) < new Date();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-800 to-blue-900 text-white shadow-md p-6 border border-indigo-700/50">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-blue-400/10 blur-xl"></div>
      
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm border border-white/10">
            <Shield size={24} className="text-blue-200" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-wide text-white/95">{insurance.provider}</h3>
            {insurance.tpaName && (
              <p className="text-xs text-indigo-200 font-medium">TPA: {insurance.tpaName}</p>
            )}
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-sm ${
          isExpired 
            ? 'bg-red-500/20 text-red-200 border-red-500/30' 
            : 'bg-green-500/20 text-green-200 border-green-500/30'
        }`}>
          {isExpired ? 'Expired' : 'Active'}
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <div>
          <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Policy Number</p>
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-indigo-300/70" />
            <p className="font-mono text-lg tracking-wider text-white/90">{insurance.policyNumber}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Member Name</p>
            <div className="flex items-center gap-1.5">
              <Building size={14} className="text-indigo-300/70" />
              <p className="text-sm font-medium text-white/90 truncate">{insurance.memberName}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Valid Thru</p>
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-indigo-300/70" />
              <p className={`text-sm font-medium ${isExpired ? 'text-red-300' : 'text-white/90'}`}>
                {insurance.validTo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {insurance.preauthRequired && (
        <div className="absolute bottom-0 right-0 bg-yellow-500/20 backdrop-blur-md px-3 py-1.5 rounded-tl-lg border-t border-l border-yellow-500/30 text-xs font-bold text-yellow-200 flex items-center gap-1.5">
          <AlertCircle size={12} /> Pre-auth Required
        </div>
      )}
    </div>
  );
};

// Add AlertCircle icon import
import { AlertCircle } from 'lucide-react';
