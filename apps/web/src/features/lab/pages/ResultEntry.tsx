import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Beaker, 
  Save,
  AlertTriangle,
  FileEdit
} from 'lucide-react';
import { useListLabOrdersQuery, useEnterResultMutation, useGetOrderDetailsQuery } from '../api/labApi';

const ResultEntryModal = ({ orderId, onClose }: { orderId: string, onClose: () => void }) => {
  const { data, isLoading } = useGetOrderDetailsQuery(orderId);
  const [enterResult, { isLoading: isSaving }] = useEnterResultMutation();
  
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [parameters, setParameters] = useState<any[]>([]);

  if (isLoading) return <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-xl">Loading...</div></div>;

  const order = data?.data?.order;
  const results = data?.data?.results || [];
  
  const handleSelectResult = (result: any) => {
    setSelectedResult(result);
    // Initialize parameters based on test catalog if not entered
    if (result.parameters && result.parameters.length > 0) {
      setParameters(result.parameters);
    } else {
      const initParams = result.test.parameters.map((p: any) => ({
        name: p.name,
        value: '',
        unit: p.unit,
        isAbnormal: false,
        isCritical: false
      }));
      setParameters(initParams);
    }
  };

  const handleParamChange = (index: number, value: string) => {
    const newParams = [...parameters];
    newParams[index].value = value;
    // Basic logic for abnormal/critical based on reference ranges would go here
    setParameters(newParams);
  };

  const handleSave = async () => {
    if (!selectedResult) return;
    try {
      await enterResult({ 
        resultId: selectedResult._id, 
        data: { parameters } 
      }).unwrap();
      // Toast success
      setSelectedResult(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Result Entry</h2>
            <p className="text-sm text-slate-500 mt-1">Order: {order?.orderNumber} | Patient: {order?.patient?.firstName} {order?.patient?.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            &times;
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Tests List */}
          <div className="w-full md:w-1/3 border-r border-slate-100 overflow-y-auto p-4 space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Tests</h3>
            {results.map((r: any) => (
              <div 
                key={r._id} 
                onClick={() => handleSelectResult(r)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedResult?._id === r._id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="font-medium text-slate-900">{r.test.name}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    r.status === 'ENTERED' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Entry Form */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
            {selectedResult ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">{selectedResult.test.name}</h3>
                  {selectedResult.hasDeltaCheck && (
                    <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-sm font-medium">
                      <AlertTriangle size={16} className="mr-2" /> Delta Check Flagged
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Parameter</th>
                        <th className="px-4 py-3">Result</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3">Ref. Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parameters.map((param, index) => {
                        const testParam = selectedResult.test.parameters.find((p: any) => p.name === param.name);
                        const refRange = testParam?.referenceRanges?.[0]; // Simplification
                        
                        return (
                          <tr key={index}>
                            <td className="px-4 py-3 font-medium text-slate-900">{param.name}</td>
                            <td className="px-4 py-3">
                              <input 
                                type="text" 
                                value={param.value}
                                onChange={(e) => handleParamChange(index, e.target.value)}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                  param.isCritical ? 'border-red-300 bg-red-50 text-red-700' :
                                  param.isAbnormal ? 'border-amber-300 bg-amber-50 text-amber-700' :
                                  'border-slate-200'
                                }`}
                                placeholder="Enter value"
                              />
                            </td>
                            <td className="px-4 py-3 text-slate-500">{param.unit || '-'}</td>
                            <td className="px-4 py-3 text-slate-500">
                              {refRange ? (
                                refRange.normalText || `${refRange.minValue} - ${refRange.maxValue}`
                              ) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm disabled:opacity-50"
                  >
                    <Save size={18} className="mr-2" /> Save Results
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileEdit size={48} className="mb-4 opacity-20" />
                <p>Select a test from the left to enter results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResultEntry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useListLabOrdersQuery({ status: 'SAMPLE_COLLECTED' }); // or IN_PROGRESS depending on mapping
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  
  const orders = data?.data || [];
  
  const filteredOrders = orders.filter((order: any) => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Result Entry Workstation</h1>
          <p className="text-slate-500 mt-1">Enter test parameters for collected samples</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search pending results..."
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
                <th className="px-6 py-4">Order ID / Barcode</th>
                <th className="px-6 py-4">Patient Info</th>
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
                  <td className="px-6 py-4">
                    <div className="font-bold text-indigo-600">{order.orderNumber}</div>
                    <div className="text-xs font-mono text-slate-500 mt-1">{order.sampleBarcode}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 flex items-center">
                      <User size={14} className="mr-1.5 text-slate-400" />
                      {order.patient?.firstName} {order.patient?.lastName}
                    </div>
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
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center ml-auto"
                    >
                      <Beaker size={16} className="mr-2" /> Enter Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {activeOrderId && <ResultEntryModal orderId={activeOrderId} onClose={() => setActiveOrderId(null)} />}
    </div>
  );
};
