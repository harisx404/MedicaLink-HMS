import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { useGetRadiologyOrderByIdQuery, useGetReportByOrderIdQuery, useSaveReportMutation } from '../radiologyApi';
import { DicomViewer } from '../components/DicomViewer';

export const ReportWriter: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: orderData } = useGetRadiologyOrderByIdQuery(orderId!);
  const { data: reportData } = useGetReportByOrderIdQuery(orderId!, { skip: !orderId });
  const [saveReport, { isLoading: isSaving }] = useSaveReportMutation();

  const [formData, setFormData] = useState({
    findings: '',
    impression: '',
    criticalFindings: false,
    status: 'DRAFT'
  });

  useEffect(() => {
    if (reportData?.data) {
      setFormData({
        findings: reportData.data.findings || '',
        impression: reportData.data.impression || '',
        criticalFindings: reportData.data.criticalFindings || false,
        status: reportData.data.status || 'DRAFT'
      });
    }
  }, [reportData]);

  const order = orderData?.data;

  const handleSave = async (status: string) => {
    await saveReport({
      orderId: orderId!,
      data: { ...formData, status }
    });
    if (status === 'FINAL') {
      navigate('/radiology/orders');
    } else {
      setFormData(prev => ({ ...prev, status }));
    }
  };

  const insertTemplate = () => {
    if (order?.modality === 'XRAY') {
      setFormData(prev => ({
        ...prev,
        findings: 'The cardiac silhouette and mediastinal contours are within normal limits. The lungs are clear without focal consolidation, pneumothorax, or pleural effusion. The osseous structures are unremarkable.',
        impression: 'No acute cardiopulmonary process.'
      }));
    }
  };

  if (!order) return <PageWrapper title="Loading..."><div /></PageWrapper>;

  return (
    <div className="flex h-screen bg-slate-100 p-4 gap-4 overflow-hidden">
      {/* Left side: Viewer */}
      <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-black">
        <DicomViewer />
      </div>

      {/* Right side: Report Writer */}
      <div className="w-[450px] flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="rounded-xl border shadow-sm bg-white">
          <div className="p-6 pb-3 border-b">
            <h3 className="text-lg font-semibold">Study Information</h3>
          </div>
          <div className="p-6 pt-3 text-sm space-y-2 text-slate-700">
            <div className="flex justify-between">
              <span className="font-medium">Patient:</span>
              <span>{order.patient?.firstName} {order.patient?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modality:</span>
              <span>{order.modality} - {order.bodyPart}</span>
            </div>
            <div className="flex justify-between text-red-600 font-medium">
              <span>Urgency:</span>
              <span>{order.urgency}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-sm bg-white flex-1 flex flex-col overflow-hidden border-t-4 border-t-blue-500">
          <div className="p-6 pb-2 border-b flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold">Diagnostic Report</h3>
            <button 
              onClick={insertTemplate}
              className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
            >
              Normal Template
            </button>
          </div>
          <div className="p-6 pt-4 flex flex-col gap-4 overflow-y-auto flex-1">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Findings</label>
              <textarea 
                className="w-full border border-slate-300 rounded-md p-3 h-48 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.findings}
                onChange={e => setFormData(p => ({ ...p, findings: e.target.value }))}
                placeholder="Detailed findings..."
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Impression</label>
              <textarea 
                className="w-full border border-slate-300 rounded-md p-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
                value={formData.impression}
                onChange={e => setFormData(p => ({ ...p, impression: e.target.value }))}
                placeholder="Overall impression / diagnosis..."
              />
            </div>

            <label className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-red-600 rounded border-red-300"
                checked={formData.criticalFindings}
                onChange={e => setFormData(p => ({ ...p, criticalFindings: e.target.checked }))}
              />
              <span className="text-sm font-medium text-red-800">Flag as Critical Finding</span>
            </label>
          </div>
          
          <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
            <button 
              className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
              onClick={() => handleSave('DRAFT')}
              disabled={isSaving}
            >
              Save Draft
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              onClick={() => handleSave('FINAL')}
              disabled={isSaving || !formData.impression}
            >
              Sign & Finalize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
