import React, { useEffect } from 'react';
import { X, Loader2, BookOpen } from 'lucide-react';
import { useLazyGetDrugInfoQuery } from '../../ai/api/aiApi';
import { Button } from '../../../components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  drugName: string | null;
}

export const DrugInfoModal: React.FC<Props> = ({ isOpen, onClose, drugName }) => {
  const [getDrugInfo, { data: infoRes, isFetching, error }] = useLazyGetDrugInfoQuery();

  useEffect(() => {
    if (isOpen && drugName) {
      getDrugInfo(drugName);
    }
  }, [isOpen, drugName, getDrugInfo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            AI Drug Monograph: {drugName}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center h-48 text-indigo-600">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="font-medium">Fetching clinical intelligence...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
              Failed to load drug information.
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap leading-relaxed text-slate-700 text-sm">
              {infoRes?.data || 'No information available.'}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </div>
    </div>
  );
};
