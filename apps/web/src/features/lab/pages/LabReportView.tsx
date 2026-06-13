import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Building2 } from 'lucide-react';
import { useGetOrderDetailsQuery } from '../api/labApi';

export const LabReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetOrderDetailsQuery(id || '');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-500">Loading Report...</div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">Failed to load report. It may not exist.</div>
      </div>
    );
  }

  const { order, results } = data.data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:py-0 print:bg-white animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center print:hidden px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center shadow-sm"
            >
              <Printer size={18} className="mr-2" /> Print
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
              <Download size={18} className="mr-2" /> Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          {/* Header */}
          <div className="border-b border-slate-200 p-8 flex justify-between items-start">
            <div>
              <div className="flex items-center text-indigo-600 mb-2">
                <Building2 size={32} className="mr-3" />
                <h1 className="text-2xl font-black tracking-tight">MedicaLink<span className="font-light">Labs</span></h1>
              </div>
              <p className="text-sm text-slate-500">123 Health Ave, Medical District<br />New York, NY 10001<br />Tel: +1 (555) 123-4567</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Laboratory Report</h2>
              <div className="mt-2 text-sm text-slate-600">
                <p><span className="font-medium">Order No:</span> {order.orderNumber}</p>
                <p><span className="font-medium">Date:</span> {new Date(order.orderDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Status:</span> <span className="text-emerald-600 font-bold">{order.status}</span></p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="p-8 border-b border-slate-200 bg-slate-50/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Patient Name</p>
                <p className="font-bold text-slate-900">{order.patient?.firstName} {order.patient?.lastName}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Patient ID (UHID)</p>
                <p className="font-medium text-slate-900">{order.patient?.uhid}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Age / Gender</p>
                <p className="font-medium text-slate-900">
                  {/* Simplistic age calculation for demo */}
                  {new Date().getFullYear() - new Date(order.patient?.dateOfBirth).getFullYear()} Y / {order.patient?.gender}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Referred By</p>
                <p className="font-medium text-slate-900">Dr. {order.doctor?.firstName} {order.doctor?.lastName}</p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-8 space-y-10">
            {results.map((result: any) => (
              <div key={result._id}>
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-100">{result.test?.name}</h3>
                
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3 w-1/3">Test Description</th>
                      <th className="px-4 py-3 w-1/4">Result</th>
                      <th className="px-4 py-3 w-1/6">Units</th>
                      <th className="px-4 py-3 w-1/4">Biological Ref. Interval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.parameters?.map((param: any, idx: number) => {
                      const testParam = result.test?.parameters?.find((p: any) => p.name === param.name);
                      const refRange = testParam?.referenceRanges?.[0];
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">{param.name}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${
                              param.isCritical ? "text-red-600" : 
                              param.isAbnormal ? "text-amber-600" : "text-slate-900"
                            }`}>
                              {param.value}
                            </span>
                            {param.isCritical && <span className="ml-1 text-red-600 text-xs font-bold">*</span>}
                            {param.isAbnormal && !param.isCritical && <span className="ml-1 text-amber-600 text-xs font-bold">+</span>}
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
                
                {result.interpretation && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm">
                    <p className="font-semibold text-slate-700 mb-1">Interpretation:</p>
                    <p className="text-slate-600 whitespace-pre-wrap">{result.interpretation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-8 mt-12 bg-slate-50">
            <div className="flex justify-between items-end">
              <div className="text-xs text-slate-500 space-y-1">
                <p>* Indicates critical value. + Indicates abnormal value.</p>
                <p>This report is electronically verified and does not require a signature.</p>
                <p>Report Generated on: {new Date().toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-2"></div>
                <p className="text-sm font-bold text-slate-900">Authorized Pathologist</p>
                <p className="text-xs text-slate-500">MedicaLink Labs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
