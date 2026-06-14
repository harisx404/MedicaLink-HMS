import React, { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Search, Plus, Trash2, Bot, Loader2, Sparkles } from 'lucide-react';
import { useLazySearchICD10Query } from '../../api/ehrApi';
import { useSuggestDiagnosisMutation } from '../../../ai/api/aiApi';
import toast from 'react-hot-toast';

interface Props {
  data: any;
  onChange: (data: any) => void;
  consultation?: any;
}

export const AssessmentForm: React.FC<Props> = ({ data, onChange, consultation }) => {
  const diagnoses = data.diagnoses || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchICD10, { data: icdResults, isFetching }] = useLazySearchICD10Query();
  const [suggestDiagnosis, { isLoading: isSuggesting }] = useSuggestDiagnosisMutation();

  const handleSuggest = async () => {
    if (!consultation?.subjective?.symptoms) {
      toast.error('Please add symptoms first.');
      return;
    }
    const symptoms = consultation.subjective.symptoms.map((s: any) => s.symptom);
    const vitals = consultation.objective?.vitals || {};
    try {
      const res = await suggestDiagnosis({ symptoms, vitals }).unwrap();
      const suggestions = res.data;
      if (suggestions && suggestions.length > 0) {
        // Add the top suggestion or all
        const newDiags = [...diagnoses];
        suggestions.forEach((sugg: any) => {
          if (!newDiags.find(d => d.icdCode === sugg.icdCode)) {
            newDiags.push({
              icdCode: sugg.icdCode || 'AI-SUGG',
              description: sugg.description,
              type: 'DIFFERENTIAL',
              status: 'PROVISIONAL'
            });
          }
        });
        onChange({ ...data, diagnoses: newDiags });
        toast.success('AI Suggestions added');
      } else {
        toast('AI could not find matching diagnoses.', { icon: '🤖' });
      }
    } catch (e) {
      toast.error('Failed to get AI suggestions');
    }
  };

  const handleSearch = () => {
    if (searchTerm.length > 2) {
      searchICD10(searchTerm);
    }
  };

  const addDiagnosis = (icd: any) => {
    const newDiags = [...diagnoses, {
      icdCode: icd.code,
      description: icd.description,
      type: 'PRIMARY',
      status: 'PROVISIONAL'
    }];
    onChange({ ...data, diagnoses: newDiags });
    setSearchTerm('');
  };

  const updateDiagnosis = (index: number, field: string, value: string) => {
    const newDiags = [...diagnoses];
    newDiags[index] = { ...newDiags[index], [field]: value };
    onChange({ ...data, diagnoses: newDiags });
  };

  const removeDiagnosis = (index: number) => {
    const newDiags = [...diagnoses];
    newDiags.splice(index, 1);
    onChange({ ...data, diagnoses: newDiags });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Diagnoses</h3>
          <Button 
            variant="outline" 
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            onClick={handleSuggest}
            disabled={isSuggesting}
          >
            {isSuggesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Suggest Diagnoses
          </Button>
        </div>
        
        {/* ICD-10 Search Box */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input 
                className="w-full h-10 pl-9 pr-3 rounded-md border border-input text-sm"
                placeholder="Search ICD-10 codes or conditions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isFetching || searchTerm.length < 3}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchTerm && icdResults?.data && (
            <div className="mt-2 max-h-[200px] overflow-y-auto bg-card border border-border rounded-md shadow-md">
              {icdResults.data.map((icd: any) => (
                <div key={icd.code} className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border last:border-0" onClick={() => addDiagnosis(icd)}>
                  <div>
                    <span className="font-semibold text-primary">{icd.code}</span> - <span className="text-sm">{icd.description}</span>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
              {icdResults.data.length === 0 && !isFetching && (
                <div className="p-3 text-sm text-muted-foreground text-center">No matching ICD-10 codes found.</div>
              )}
            </div>
          )}
        </div>

        {/* Selected Diagnoses */}
        {diagnoses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center p-4 border border-dashed rounded-lg">No diagnoses added. Search and add above.</p>
        ) : (
          <div className="space-y-3">
            {diagnoses.map((diag: any, idx: number) => (
              <div key={idx} className="flex gap-4 p-3 bg-card border border-border rounded-lg items-center">
                <div className="w-24 font-semibold text-primary">{diag.icdCode}</div>
                <div className="flex-1 text-sm">{diag.description}</div>
                <div className="w-32">
                  <select 
                    className="w-full h-8 px-2 rounded border border-input text-xs"
                    value={diag.type}
                    onChange={(e) => updateDiagnosis(idx, 'type', e.target.value)}
                  >
                    <option value="PRIMARY">Primary</option>
                    <option value="SECONDARY">Secondary</option>
                    <option value="COMORBIDITY">Comorbidity</option>
                  </select>
                </div>
                <div className="w-32">
                  <select 
                    className="w-full h-8 px-2 rounded border border-input text-xs"
                    value={diag.status}
                    onChange={(e) => updateDiagnosis(idx, 'status', e.target.value)}
                  >
                    <option value="PROVISIONAL">Provisional</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="DIFFERENTIAL">Differential</option>
                  </select>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:bg-red-50" onClick={() => removeDiagnosis(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4">Clinical Notes & Assessment</h3>
        <textarea 
          className="w-full min-h-[150px] p-3 rounded-lg border border-input bg-background resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Enter doctor's assessment, rationale, and clinical observations..."
          value={data.clinicalNotes || ''}
          onChange={(e) => onChange({ ...data, clinicalNotes: e.target.value })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Bot className="h-5 w-5 mr-2 text-indigo-500" />
          AI Summary 
        </h3>
        {data.aiSummary ? (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
            {data.aiSummary}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">AI Summary will be generated automatically when the consultation is signed.</p>
        )}
      </div>
    </div>
  );
};
