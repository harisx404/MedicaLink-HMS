import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  CheckCircle, 
  XCircle, 
  Send,
  Building
} from 'lucide-react';
import { 
  useListInsuranceClaimsQuery, 
  useUpdateClaimStatusMutation 
} from '../api/billingApi';
import { InsuranceClaimStatus } from '@medicalink/shared';

export const InsuranceClaims: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; claimId: string; type: 'APPROVE' | 'REJECT' | 'SETTLE' | null }>({ isOpen: false, claimId: '', type: null });
  const [actionAmount, setActionAmount] = useState<number>(0);
  const [actionReason, setActionReason] = useState<string>('');

  const { data, isLoading, refetch } = useListInsuranceClaimsQuery({ status: statusFilter });
  const [updateClaim, { isLoading: isUpdating }] = useUpdateClaimStatusMutation();

  const billsWithClaims = data?.data || [];

  const filtered = billsWithClaims.filter(bill => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      bill.billNumber.toLowerCase().includes(s) ||
      bill.patient?.firstName?.toLowerCase().includes(s) ||
      bill.patient?.lastName?.toLowerCase().includes(s) ||
      bill.insuranceClaim?.tpaName?.toLowerCase().includes(s) ||
      bill.insuranceClaim?.policyNumber?.toLowerCase().includes(s)
    );
  });

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payload: any = {};
      
      if (actionModal.type === 'APPROVE') {
        payload = { status: InsuranceClaimStatus.APPROVED, approvedAmount: actionAmount };
      } else if (actionModal.type === 'REJECT') {
        payload = { status: InsuranceClaimStatus.REJECTED, rejectionReason: actionReason };
      } else if (actionModal.type === 'SETTLE') {
        payload = { status: InsuranceClaimStatus.SETTLED, settledAmount: actionAmount };
      }

      await updateClaim({ id: actionModal.claimId, data: payload }).unwrap();
      setActionModal({ isOpen: false, claimId: '', type: null });
      setActionAmount(0);
      setActionReason('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const openAction = (billId: string, type: 'APPROVE' | 'REJECT' | 'SETTLE') => {
    setActionModal({ isOpen: true, claimId: billId, type });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">Pending submission</span>;
      case 'SUBMITTED': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Submitted</span>;
      case 'APPROVED': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Approved</span>;
      case 'SETTLED': return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Payment Settled</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Rejected</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <ShieldAlert className="mr-3 text-indigo-600" size={28} /> 
            Insurance Claims Desk
          </h1>
          <p className="text-slate-500 mt-1">Track and process TPA/Insurance claims</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patient, TPA, policy number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          <div className="flex gap-2 bg-white rounded-lg p-1 border border-slate-200">
            {['', 'PENDING', 'SUBMITTED', 'APPROVED', 'SETTLED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  statusFilter === status 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {status === '' ? 'ALL' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Claim Details</th>
                <th className="px-6 py-4">TPA / Policy</th>
                <th className="px-6 py-4">Bill Info</th>
                <th className="px-6 py-4 text-right">Claimed Amt</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading claims...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <ShieldAlert size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-medium">No claims match the selected filters</p>
                  </td>
                </tr>
              ) : (
                filtered.map((bill) => {
                  const claim = bill.insuranceClaim;
                  return (
                    <tr key={bill._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {bill.patient?.firstName} {bill.patient?.lastName}
                        </div>
                        {claim?.claimNumber ? (
                          <div className="text-xs text-indigo-600 font-mono mt-1 font-bold">
                            {claim.claimNumber}
                          </div>
                        ) : (
                          <div className="text-xs text-amber-600 mt-1">PreAuth: {claim?.preAuthNumber || 'Pending'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-900 font-medium">
                          <Building size={14} className="mr-1.5 text-slate-400" />
                          {claim?.tpaName || 'Registered TPA'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-1">{claim?.policyNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{bill.billNumber}</div>
                        <div className="text-xs text-slate-500 mt-1">Total: ₹{bill.netAmount.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ₹{claim?.claimedAmount?.toLocaleString('en-IN') || bill.netAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(claim?.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {claim?.status === 'PENDING' && (
                            <button 
                              onClick={async () => {
                                const claimNo = prompt('Enter the submitted Claim Number or Reference:');
                                if (claimNo) {
                                  try {
                                    await updateClaim({ 
                                      id: bill._id, 
                                      data: { status: InsuranceClaimStatus.SUBMITTED, claimNumber: claimNo }
                                    }).unwrap();
                                    refetch();
                                  } catch (err: any) { alert(err.message); }
                                }
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Mark as Submitted"
                            >
                              <Send size={18} />
                            </button>
                          )}

                          {claim?.status === 'SUBMITTED' && (
                            <>
                              <button onClick={() => openAction(bill._id, 'APPROVE')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Approve Claim">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => openAction(bill._id, 'REJECT')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject Claim">
                                <XCircle size={18} />
                              </button>
                            </>
                          )}

                          {claim?.status === 'APPROVED' && (
                            <button onClick={() => openAction(bill._id, 'SETTLE')} className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-bold transition-colors">
                              Record Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {actionModal.type === 'APPROVE' && 'Approve Claim'}
              {actionModal.type === 'REJECT' && 'Reject Claim'}
              {actionModal.type === 'SETTLE' && 'Record Claim Settlement'}
            </h2>
            <form onSubmit={handleActionSubmit} className="space-y-4">
              {(actionModal.type === 'APPROVE' || actionModal.type === 'SETTLE') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {actionModal.type === 'APPROVE' ? 'Approved Amount (₹)' : 'Settlement Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={actionAmount || ''}
                    onChange={(e) => setActionAmount(Number(e.target.value))}
                    className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
              
              {actionModal.type === 'REJECT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rejection Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Provide reason from TPA..."
                  ></textarea>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setActionModal({ isOpen: false, claimId: '', type: null })} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
                  actionModal.type === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}>
                  Confirm {actionModal.type === 'APPROVE' ? 'Approval' : actionModal.type === 'REJECT' ? 'Rejection' : 'Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
