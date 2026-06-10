import React from 'react';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: any;
  onChange: (data: any) => void;
}

export const SubjectiveForm: React.FC<Props> = ({ data, onChange }) => {
  const symptoms = data.symptoms || [];

  const addSymptom = () => {
    onChange({
      ...data,
      symptoms: [...symptoms, { symptom: '', duration: '', severity: 'MILD', notes: '' }]
    });
  };

  const updateSymptom = (index: number, field: string, value: string) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = { ...newSymptoms[index], [field]: value };
    onChange({ ...data, symptoms: newSymptoms });
  };

  const removeSymptom = (index: number) => {
    const newSymptoms = [...symptoms];
    newSymptoms.splice(index, 1);
    onChange({ ...data, symptoms: newSymptoms });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Chief Complaints & Symptoms</h3>
        <Button size="sm" onClick={addSymptom} variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Add Symptom
        </Button>
      </div>

      {symptoms.length === 0 ? (
        <div className="text-center p-6 bg-muted/20 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">No symptoms recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {symptoms.map((s: any, idx: number) => (
            <div key={idx} className="flex gap-4 items-start p-4 bg-muted/10 rounded-lg border border-border">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Symptom</label>
                    <Input 
                      placeholder="e.g. Headache" 
                      value={s.symptom} 
                      onChange={(e: any) => updateSymptom(idx, 'symptom', e.target.value)} 
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Duration</label>
                    <Input 
                      placeholder="e.g. 2 days" 
                      value={s.duration} 
                      onChange={(e: any) => updateSymptom(idx, 'duration', e.target.value)} 
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Severity</label>
                    <select 
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                      value={s.severity}
                      onChange={(e: any) => updateSymptom(idx, 'severity', e.target.value)}
                    >
                      <option value="MILD">Mild</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="SEVERE">Severe</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Additional Notes</label>
                  <Input 
                    placeholder="Any specific triggers or details..." 
                    value={s.notes} 
                    onChange={(e: any) => updateSymptom(idx, 'notes', e.target.value)} 
                  />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 mt-6 px-2" onClick={() => removeSymptom(idx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Review of Systems</h3>
        <textarea 
          className="w-full min-h-[120px] p-3 rounded-lg border border-input bg-background resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Enter detailed review of systems history here..."
          value={data.reviewOfSystems?.general || ''}
          onChange={(e: any) => onChange({ ...data, reviewOfSystems: { ...data.reviewOfSystems, general: e.target.value }})}
        />
      </div>
    </div>
  );
};
