import React, { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Pill, TestTube, FileType2, CalendarClock } from 'lucide-react';
import { PrescriptionWriter } from '../PrescriptionWriter';

interface Props {
  data: any;
  onChange: (data: any) => void;
  consultation: any;
  patient: any;
}

export const PlanForm: React.FC<Props> = ({ data, onChange, consultation, patient }) => {
  const [showRxWriter, setShowRxWriter] = useState(false);

  const handleRxSaved = (prescriptionId: string) => {
    const existing = data.prescriptions || [];
    if (!existing.includes(prescriptionId)) {
      onChange({ ...data, prescriptions: [...existing, prescriptionId] });
    }
    setShowRxWriter(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex flex-col justify-center gap-2 border-primary/20 hover:border-primary hover:bg-primary/5" onClick={() => setShowRxWriter(true)}>
          <Pill className="h-6 w-6 text-primary" />
          <span>Write Prescription</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col justify-center gap-2 border-primary/20 hover:border-primary hover:bg-primary/5" onClick={() => {}}>
          <TestTube className="h-6 w-6 text-emerald-600" />
          <span>Lab Order</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col justify-center gap-2 border-primary/20 hover:border-primary hover:bg-primary/5" onClick={() => {}}>
          <FileType2 className="h-6 w-6 text-indigo-600" />
          <span>Radiology Order</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col justify-center gap-2 border-primary/20 hover:border-primary hover:bg-primary/5" onClick={() => {}}>
          <CalendarClock className="h-6 w-6 text-orange-600" />
          <span>Referral</span>
        </Button>
      </div>

      <div className="bg-muted/10 border border-border rounded-lg p-4">
        <h4 className="font-semibold flex items-center mb-4">
          <Pill className="h-4 w-4 mr-2" /> Attached Prescriptions
        </h4>
        {data.prescriptions?.length > 0 ? (
          <div className="space-y-2">
            {data.prescriptions.map((rx: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-card border border-border rounded-md shadow-sm">
                <span className="font-medium text-sm">Prescription #{typeof rx === 'string' ? rx.slice(-6) : rx.prescriptionNumber || idx + 1}</span>
                <Button variant="ghost" size="sm" className="text-primary hover:underline" onClick={() => window.open(`/prescriptions/${typeof rx === 'string' ? rx : rx._id}/pdf`, '_blank')}>View PDF</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No prescriptions attached.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Treatment Plan & Instructions</h3>
        <textarea 
          className="w-full min-h-[150px] p-3 rounded-lg border border-input bg-background resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="General treatment plan, lifestyle advice, and patient instructions..."
          value={data.instructions || ''}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
        <div className="space-y-2">
          <label className="text-sm font-medium">Follow-up Date</label>
          <input 
            type="date" 
            className="w-full h-10 px-3 rounded-lg border border-input text-sm"
            value={data.followUpDate ? data.followUpDate.split('T')[0] : ''}
            onChange={(e) => onChange({ ...data, followUpDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason for Follow-up</label>
          <input 
            type="text" 
            placeholder="e.g. Check blood pressure progress"
            className="w-full h-10 px-3 rounded-lg border border-input text-sm"
            value={data.followUpReason || ''}
            onChange={(e) => onChange({ ...data, followUpReason: e.target.value })}
          />
        </div>
      </div>

      {showRxWriter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-card">
              <h2 className="text-xl font-bold flex items-center">
                <Pill className="h-5 w-5 mr-2 text-primary" /> New Prescription
              </h2>
              <Button variant="ghost" onClick={() => setShowRxWriter(false)}>Close</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
              <PrescriptionWriter 
                consultationId={consultation._id || consultation.id} 
                patientId={patient._id || patient.id} 
                onSaved={handleRxSaved}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
