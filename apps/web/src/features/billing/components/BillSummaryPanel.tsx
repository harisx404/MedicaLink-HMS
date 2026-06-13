import React from 'react';
import { Shield } from 'lucide-react';

interface Props {
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  insuranceClaimed?: number;
}

export const BillSummaryPanel: React.FC<Props> = ({
  grossAmount,
  discountAmount,
  taxAmount,
  netAmount,
  insuranceClaimed = 0
}) => {
  const patientPayable = Math.max(0, netAmount - insuranceClaimed);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-bold text-slate-900">Bill Summary</h3>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Gross Total</span>
          <span className="font-medium text-slate-900">₹{grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Total Discount</span>
            <span className="font-medium">- ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Taxes (GST)</span>
          <span className="font-medium text-slate-900">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="font-bold text-slate-900 text-lg">Net Payable</span>
          <span className="font-black text-indigo-600 text-xl">₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {insuranceClaimed > 0 && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 space-y-2">
          <div className="flex items-center text-amber-800 text-sm font-bold mb-2">
            <Shield size={16} className="mr-1.5" /> Insurance Claimed
          </div>
          <div className="flex justify-between text-sm text-amber-700">
            <span>Claim Amount</span>
            <span className="font-medium">- ₹{insuranceClaimed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-amber-200/50 flex justify-between items-center">
            <span className="font-bold text-slate-900">Patient Share</span>
            <span className="font-black text-red-600 text-lg">₹{patientPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
    </div>
  );
};
