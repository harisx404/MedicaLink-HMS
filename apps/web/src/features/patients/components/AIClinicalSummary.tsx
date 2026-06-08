import React from 'react';
import { Sparkles, Loader2, Bot, AlertTriangle } from 'lucide-react';
import { useGenerateClinicalSummaryQuery } from '../api/patientApi';
import type { SharedPatient } from '@medicalink/shared';

interface AIClinicalSummaryProps {
  patient: SharedPatient;
}

export const AIClinicalSummary: React.FC<AIClinicalSummaryProps> = ({ patient }) => {
  const { data, isLoading, isError, refetch, isFetching } = useGenerateClinicalSummaryQuery(patient.id);
  const summary = data?.data?.summary;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-indigo-100/50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1.5 rounded-lg text-white">
            <Sparkles size={18} />
          </div>
          <h3 className="font-bold text-gray-900">AI Clinical Summary</h3>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100"
        >
          {isFetching ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
          {summary ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      <div className="p-6">
        {isLoading || isFetching ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-indigo-400 rounded-full blur animate-pulse"></div>
              <Sparkles size={32} className="relative text-indigo-600 animate-bounce" />
            </div>
            <p className="text-sm font-medium text-indigo-900">Gemini is analyzing patient records...</p>
            <p className="text-xs text-indigo-600/70 mt-1">Synthesizing demographics, allergies, and history</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertTriangle className="text-red-400 mb-2" size={28} />
            <p className="text-sm font-medium text-red-800">Failed to generate AI summary</p>
            <p className="text-xs text-red-600/80 mt-1">Please check your Gemini API Key configuration or network connection.</p>
          </div>
        ) : summary ? (
          <div className="prose prose-sm prose-indigo max-w-none text-gray-700 leading-relaxed">
            {summary.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className={idx === 0 && paragraph.toLowerCase().includes('severe') ? 'font-medium text-gray-900 border-l-2 border-red-400 pl-3' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">Click generate to create an intelligent summary of this patient's medical history using Gemini AI.</p>
          </div>
        )}
      </div>
      
      {summary && (
        <div className="px-6 py-3 bg-indigo-900/5 flex items-center justify-between border-t border-indigo-100/50">
          <p className="text-[10px] text-indigo-600/70 font-medium uppercase tracking-widest flex items-center gap-1">
            <Bot size={10} /> Powered by Gemini 1.5 Flash
          </p>
          <p className="text-[10px] text-indigo-600/50">
            AI-generated content should be verified by a clinician.
          </p>
        </div>
      )}
    </div>
  );
};
