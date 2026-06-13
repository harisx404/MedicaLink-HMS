import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { useListLabOrdersQuery, useVerifyOrderResultsMutation, useGetOrderDetailsQuery } from '../api/labApi';

const VerifyModal = ({ orderId, onClose }: { orderId: string, onClose: () => void }) => {
  const { data, isLoading } = useGetOrderDetailsQuery(orderId);
  const [verifyOrder, { isLoading: isVerifying }] = useVerifyOrderResultsMutation();
  
  if (isLoading) return <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-xl">Loading...</div></div>;

  const order = data?.data?.order;
  const results = data?.data?.results || [];

  const handleVerify = async () => {
    try {
      await verifyOrder(orderId).unwrap();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <FileCheck size={24} className="mr-2 text-indigo-600" /> Verify Results
            </h2>
            <p className="text-sm text-slate-500 mt-1">Order: {order?.orderNumber} | Patient: {order?.patient?.firstName} {order?.patient?.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
            &times;
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          {results.map((result: any) => (
            <div key={result._id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">{result.test?.name}</h3>
                {result.hasDeltaCheck && (
                  <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                    <AlertTriangle size={14} className="mr-1" /> Delta Flag
                  </span>
                )}
              </div>
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Parameter</th>
                      <th className="px-4 py-2 font-medium">Result</th>
                      <th className="px-4 py-2 font-medium">Unit</th>
                      <th className="px-4 py-2 font-medium">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.parameters?.map((param: any, idx: number) => {
                      const testParam = result.test?.parameters?.find((p: any) => p.name === param.name);
                      const refRange = testParam?.referenceRanges?.[0]; // simplification
                      
                      return (
                        <tr key={idx} className={param.isCritical ? "bg-red-50/50" : param.isAbnormal ? "bg-amber-50/50" : ""}>
                          <td className="px-4 py-3 text-slate-900">{param.name}</td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${
                              param.isCritical ? "text-red-700" : 
                              param.isAbnormal ? "text-amber-700" : "text-slate-900"
                            }`}>
                              {param.value}
                            </span>
                            {param.isCritical && <span className="ml-2 text-xs font-bold text-red-600">(CRITICAL)</span>}
                            {param.isAbnormal && !param.isCritical && <span className="ml-2 text-xs font-bold text-amber-600">(HIGH)</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{param.unit || '-'}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {refRange ? (refRange.normalText || `${refRange.minValue} - ${refRange.maxValue}`) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {result.hasDeltaCheck && result.deltaWarning && (
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 flex items-start">
                  <AlertTriangle size={16} className="text-amber-600 mr-2 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">{result.deltaWarning}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm disabled:opacity-50"
          >
            <CheckCircle size={18} className="mr-2" /> Verify & Authorize
          </button>
        </div>
      </div>
    </div>
  );
};

export const Verification: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useListLabOrdersQuery({ status: 'IN_PROGRESS' }); // Assuming IN_PROGRESS means ready for verification
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  
  const orders = data?.data || [];
  
  const filteredOrders = orders.filter((order: any) => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Result Verification</h1>
          <p className="text-slate-500 mt-1">Pathologist review and authorization</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Patient Name or Order..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Tests</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-600">{order.orderNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {order.patient?.firstName} {order.patient?.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {order.tests?.map((t: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                          {t.testName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setActiveOrderId(order._id!)}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors flex items-center ml-auto"
                    >
                      <CheckCircle size={16} className="mr-2" /> Review Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {activeOrderId && <VerifyModal orderId={activeOrderId} onClose={() => setActiveOrderId(null)} />}
    </div>
  );
};
