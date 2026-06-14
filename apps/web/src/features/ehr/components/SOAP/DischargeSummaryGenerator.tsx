import React, { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { FileText, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useGenerateDischargeSummaryMutation } from '../../../ai/api/aiApi';
import toast from 'react-hot-toast';

interface Props {
  consultation: any;
}

export const DischargeSummaryGenerator: React.FC<Props> = ({ consultation }) => {
  const [generateSummary, { isLoading }] = useGenerateDischargeSummaryMutation();
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const res = await generateSummary({ 
        consultationData: consultation,
        hospitalCourse: "Routine outpatient consultation." 
      }).unwrap();
      setSummary(res.data);
    } catch (e) {
      toast.error('Failed to generate summary');
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-6 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
          <FileText size={20} className="text-indigo-600" /> 
          AI Visit / Discharge Summary
        </h3>
        <Button onClick={handleGenerate} disabled={isLoading} variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {summary ? 'Regenerate' : 'Generate Summary'}
        </Button>
      </div>

      {summary ? (
        <div className="relative">
          <div className="bg-white rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-indigo-100 shadow-inner min-h-[150px]">
            {summary}
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute top-2 right-2 text-slate-400 hover:text-indigo-600"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic">
          Generate an AI-powered summary of this consultation to share with the patient or referring physicians.
        </p>
      )}
    </div>
  );
};
