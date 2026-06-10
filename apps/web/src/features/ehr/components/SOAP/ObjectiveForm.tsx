import React from 'react';
import { Input } from '../../../../components/ui/Input';
import { Activity, Thermometer, Droplets, HeartPulse, Scale, ScanFace } from 'lucide-react';

interface Props {
  data: any;
  onChange: (data: any) => void;
  patientId?: string;
}

export const ObjectiveForm: React.FC<Props> = ({ data, onChange }) => {
  const vitals = data.vitals || {};
  const physicalExam = data.physicalExam || {};

  const updateVitals = (field: string, value: any) => {
    // Basic BMI auto-calc logic
    const newVitals = { ...vitals, [field]: value };
    if (newVitals.weight && newVitals.height) {
      const hMeters = newVitals.height / 100;
      newVitals.bmi = parseFloat((newVitals.weight / (hMeters * hMeters)).toFixed(1));
    }
    onChange({ ...data, vitals: newVitals });
  };

  const updateBP = (type: 'systolic' | 'diastolic', value: string) => {
    const bp = vitals.bp || { systolic: '', diastolic: '' };
    updateVitals('bp', { ...bp, [type]: value });
  };

  return (
    <div className="space-y-8">
      {/* Vitals Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Vital Signs
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Blood Pressure</label>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                placeholder="Sys" 
                className="w-full h-10 px-3 rounded-lg border border-input text-sm"
                value={vitals.bp?.systolic || ''}
                onChange={(e: any) => updateBP('systolic', e.target.value)}
              />
              <span className="text-muted-foreground">/</span>
              <input 
                type="number" 
                placeholder="Dia" 
                className="w-full h-10 px-3 rounded-lg border border-input text-sm"
                value={vitals.bp?.diastolic || ''}
                onChange={(e: any) => updateBP('diastolic', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center"><HeartPulse className="h-4 w-4 mr-1 text-muted-foreground" /> Heart Rate (bpm)</label>
            <Input 
              type="number" 
              value={vitals.pulse || ''} 
              onChange={(e: any) => updateVitals('pulse', e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center"><Thermometer className="h-4 w-4 mr-1 text-muted-foreground" /> Temperature (°C)</label>
            <Input 
              type="number" 
              step="0.1"
              value={vitals.temperature || ''} 
              onChange={(e: any) => updateVitals('temperature', e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center"><Droplets className="h-4 w-4 mr-1 text-muted-foreground" /> SpO2 (%)</label>
            <Input 
              type="number" 
              value={vitals.spO2 || ''} 
              onChange={(e: any) => updateVitals('spO2', e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center"><Scale className="h-4 w-4 mr-1 text-muted-foreground" /> Weight (kg)</label>
            <Input 
              type="number" 
              value={vitals.weight || ''} 
              onChange={(e: any) => updateVitals('weight', Number(e.target.value))} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Height (cm)</label>
            <Input 
              type="number" 
              value={vitals.height || ''} 
              onChange={(e: any) => updateVitals('height', Number(e.target.value))} 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium">BMI</label>
            <div className="h-10 px-3 flex items-center bg-muted/30 rounded-lg border border-border text-sm font-medium">
              {vitals.bmi || '--'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center"><ScanFace className="h-4 w-4 mr-1 text-muted-foreground" /> Pain Score (0-10)</label>
            <Input 
              type="number" 
              min="0" max="10"
              value={vitals.painScore || ''} 
              onChange={(e: any) => updateVitals('painScore', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4">Physical Examination</h3>
        <textarea 
          className="w-full min-h-[150px] p-3 rounded-lg border border-input bg-background resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Enter general physical examination notes here..."
          value={physicalExam.general || ''}
          onChange={(e: any) => onChange({ ...data, physicalExam: { ...physicalExam, general: e.target.value }})}
        />
      </div>
    </div>
  );
};
