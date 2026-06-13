import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetSessionByIdQuery } from '../api/telemedicineApi';
import { FileText, Save, ChevronLeft, Pill } from 'lucide-react';

export const SessionNotes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetSessionByIdQuery(id as string, { skip: !id });
  const session = data?.data;

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app/telemedicine')} className="p-2 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Post-Consultation Notes</h1>
            <p className="text-slate-500 text-sm">Patient: {session?.patient?.name}</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Save className="h-4 w-4" /> Save & Finalize
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800">Clinical Notes (SOAP)</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subjective (Chief Complaint)</label>
            <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows={3} placeholder="Patient reports..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Objective (Observations from Video)</label>
            <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows={2} placeholder="Visible signs..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assessment (Diagnosis)</label>
            <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows={2}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Plan (Treatment & Follow-up)</label>
            <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows={3}></textarea>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">e-Prescription</h2>
          </div>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Add Medication</button>
        </div>
        <div className="p-6 text-center py-12 text-slate-500">
          No medications prescribed yet. Click "Add Medication" to write an e-prescription.
        </div>
      </div>
    </div>
  );
};
