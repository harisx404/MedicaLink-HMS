import React, { useState } from 'react';
import { useGetBloodRequestsQuery, useGetInventoryQuery, useCrossMatchUnitMutation, useIssueUnitMutation } from '../api/bloodBankApi';
import { Activity, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BloodRequestStatus, BloodUnitStatus } from '@medicalink/shared';

export const BloodRequests: React.FC = () => {
  const { data: reqsData, isLoading: isReqsLoading } = useGetBloodRequestsQuery();
  const { data: invData } = useGetInventoryQuery();
  const [crossMatch, { isLoading: isCrossMatching }] = useCrossMatchUnitMutation();
  const [issue, { isLoading: isIssuing }] = useIssueUnitMutation();

  const [selectedReq, setSelectedReq] = useState<any>(null);

  const requests = reqsData?.data || [];
  const inventory = invData?.data || [];

  const handleCrossMatch = async (unitId: string) => {
    if (!selectedReq) return;
    try {
      await crossMatch({ requestId: selectedReq._id, unitId }).unwrap();
      // the cache invalidation should refresh the list
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssue = async (unitId: string) => {
    if (!selectedReq) return;
    try {
      await issue({ requestId: selectedReq._id, unitId }).unwrap();
      setSelectedReq(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: BloodRequestStatus) => {
    switch(status) {
      case BloodRequestStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case BloodRequestStatus.CROSS_MATCHING: return 'bg-blue-100 text-blue-700';
      case BloodRequestStatus.RESERVED: return 'bg-emerald-100 text-emerald-700';
      case BloodRequestStatus.ISSUED: return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency === 'EMERGENCY') return 'text-red-600 font-bold';
    if (urgency === 'URGENT') return 'text-amber-600 font-bold';
    return 'text-slate-600';
  };

  // Find compatible units for selected request
  const compatibleUnits = selectedReq ? inventory.filter(u => 
    u.status === BloodUnitStatus.AVAILABLE && 
    u.bloodGroup === selectedReq.bloodGroup && 
    u.componentType === selectedReq.component
  ) : [];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Activity className="text-amber-500 mr-2" size={24} />
            Blood Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage blood requests from wards and operation theaters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">All Requests</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {isReqsLoading ? (
              <div className="p-8 text-center text-slate-500 animate-pulse">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No active requests.</div>
            ) : requests.map((req) => (
              <div 
                key={req._id} 
                onClick={() => setSelectedReq(req)}
                className={`p-4 cursor-pointer transition-colors ${selectedReq?._id === req._id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                    <span className={`ml-2 text-xs uppercase ${getUrgencyColor(req.urgency)}`}>
                      {req.urgency}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center">
                    <Clock size={12} className="mr-1" /> {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div>
                    <p className="font-bold text-slate-800">{req.patient?.firstName} {req.patient?.lastName}</p>
                    <p className="text-sm text-slate-500">Requested by Dr. {req.doctor?.firstName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{req.quantityRequested} Unit(s) of {req.bloodGroup}</p>
                    <p className="text-sm text-slate-500">{req.component.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-200px)] sticky top-6">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">Cross-match & Issue</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedReq ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <Activity size={48} className="mb-4 opacity-50" />
                <p>Select a request from the list<br/>to cross-match and issue units.</p>
              </div>
            ) : selectedReq.status === BloodRequestStatus.ISSUED || selectedReq.status === BloodRequestStatus.COMPLETED ? (
               <div className="h-full flex flex-col items-center justify-center text-emerald-500 text-center">
                 <CheckCircle size={48} className="mb-4" />
                 <p className="font-medium text-slate-800">Request Completed</p>
                 <p className="text-sm text-slate-500 mt-1">Units have been successfully issued.</p>
               </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Requirement</p>
                  <p className="font-bold text-lg text-slate-800">
                    {selectedReq.quantityRequested}x {selectedReq.bloodGroup} {selectedReq.component.replace('_', ' ')}
                  </p>
                </div>

                {selectedReq.status === BloodRequestStatus.PENDING || selectedReq.status === BloodRequestStatus.CROSS_MATCHING ? (
                  <div>
                    <h4 className="font-semibold text-slate-700 text-sm border-b pb-2 mb-3">Available Compatible Units ({compatibleUnits.length})</h4>
                    {compatibleUnits.length === 0 ? (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 flex items-start gap-2 text-sm">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p>No compatible units available in inventory.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {compatibleUnits.slice(0, 5).map(unit => (
                          <div key={unit._id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-indigo-300">
                            <div>
                              <p className="font-bold font-mono text-slate-700">{unit.unitNumber}</p>
                              <p className="text-xs text-slate-500">Exp: {new Date(unit.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <button 
                              onClick={() => handleCrossMatch(unit._id)}
                              disabled={isCrossMatching}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-semibold transition-colors"
                            >
                              Cross-match
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Show reserved units ready to issue */}
                {selectedReq.status === BloodRequestStatus.CROSS_MATCHING || selectedReq.status === BloodRequestStatus.RESERVED ? (
                   <div className="mt-6">
                     <h4 className="font-semibold text-slate-700 text-sm border-b pb-2 mb-3">Reserved Units Ready for Issue</h4>
                     <div className="space-y-2">
                       {/* Hardcoding the mapping for demo, since we don't strictly tie reserved unit to request yet */}
                       {inventory.filter(u => u.status === BloodUnitStatus.RESERVED && u.bloodGroup === selectedReq.bloodGroup).slice(0, selectedReq.quantityRequested).map(unit => (
                          <div key={unit._id} className="flex items-center justify-between p-3 border border-emerald-200 bg-emerald-50 rounded-lg">
                            <div>
                              <p className="font-bold font-mono text-slate-800">{unit.unitNumber}</p>
                              <p className="text-xs text-emerald-700 flex items-center"><CheckCircle size={10} className="mr-1"/> Cross-match OK</p>
                            </div>
                            <button 
                              onClick={() => handleIssue(unit._id)}
                              disabled={isIssuing}
                              className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-semibold transition-colors shadow-sm"
                            >
                              Issue Unit
                            </button>
                          </div>
                       ))}
                     </div>
                   </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
