import React, { useState } from 'react';
import { FlaskConical, Loader2, Sparkles } from 'lucide-react';
import { useGetLabTrendsSummaryMutation } from '../../ai/api/aiApi';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export const LabTrendsSummarizer: React.FC = () => {
  const [getLabTrends, { isLoading }] = useGetLabTrendsSummaryMutation();
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = async () => {
    try {
      // In a real app, we'd fetch actual lab results for the patient from the API
      // Here we simulate some lab data
      const mockLabResults = [
        { date: '2026-01-10', test: 'HbA1c', value: '8.2%', ref: '<5.7%' },
        { date: '2026-03-15', test: 'HbA1c', value: '7.5%', ref: '<5.7%' },
        { date: '2026-06-01', test: 'HbA1c', value: '6.8%', ref: '<5.7%' },
      ];
      
      const res = await getLabTrends({ labResults: mockLabResults }).unwrap();
      setSummary(res.data);
    } catch {
      toast.error('Failed to generate lab trends summary');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FlaskConical size={20} className="text-blue-500" /> 
          AI Lab Trends Analysis
        </h3>
        {!summary && (
          <Button onClick={handleSummarize} disabled={isLoading} variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analyze Lab History
          </Button>
        )}
      </div>

      {summary ? (
        <div className="bg-blue-50/50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-blue-100">
          {summary}
        </div>
      ) : (
        <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-slate-500 mb-2">Generate an AI-powered summary of the patient's historical lab results to identify improving or concerning trends.</p>
        </div>
      )}
    </div>
  );
};
