import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Search, Plus, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { useLazySearchDrugsQuery, useCreatePrescriptionMutation } from '../api/ehrApi';
import { toast } from 'react-hot-toast';

interface Props {
  consultationId: string;
  patientId: string;
  onSaved: (prescriptionId: string) => void;
}

export const PrescriptionWriter: React.FC<Props> = ({ consultationId, patientId, onSaved }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDrugs, { data: drugResults, isFetching }] = useLazySearchDrugsQuery();
  const [createPrescription, { isLoading }] = useCreatePrescriptionMutation();

  const [medications, setMedications] = useState<any[]>([]);
  const [generalInstructions, setGeneralInstructions] = useState('');

  const handleSearch = () => {
    if (searchTerm.length > 2) searchDrugs(searchTerm);
  };

  const addMedication = (drug: any) => {
    setMedications([...medications, {
      drugId: drug._id || drug.id || null,
      drugName: drug.name || drug.brand,
      genericName: drug.genericName,
      form: drug.form || 'Tablet',
      strength: drug.strength || '',
      dose: '1',
      doseUnit: 'Tablet',
      frequency: { times: 1, period: 'day', instructions: 'After meals' },
      route: 'Oral',
      duration: '5 days',
      quantity: 5,
      whenToTake: 'Morning',
      instructions: '',
      isSubstitutable: true
    }]);
    setSearchTerm('');
  };

  const updateMed = (index: number, field: string, value: any) => {
    const newMeds = [...medications];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newMeds[index][parent] = { ...newMeds[index][parent], [child]: value };
    } else {
      newMeds[index][field] = value;
    }
    setMedications(newMeds);
  };

  const removeMed = (index: number) => {
    const newMeds = [...medications];
    newMeds.splice(index, 1);
    setMedications(newMeds);
  };

  const handleSave = async () => {
    if (medications.length === 0) {
      toast.error('Add at least one medication');
      return;
    }

    try {
      const res = await createPrescription({
        consultationId,
        patientId,
        medications,
        generalInstructions,
        digitalSignature: 'Signed Electronically'
      }).unwrap();

      toast.success('Prescription generated successfully');
      onSaved(res.data?._id || res.data?.id || '');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save prescription');
    }
  };

  return (
    <div className="space-y-6">
      {/* Drug Search Box */}
      <div className="bg-white p-4 rounded-lg border border-border">
        <h3 className="font-semibold mb-3 flex items-center"><Search className="h-4 w-4 mr-2" /> Search Medications</h3>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              className="w-full h-10 pl-3 pr-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Search by brand or generic name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isFetching || searchTerm.length < 3}>
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search Formulary'}
          </Button>
        </div>

        {/* Search Results */}
        {searchTerm && drugResults?.data && (
          <div className="mt-2 max-h-[150px] overflow-y-auto bg-card border border-border rounded-md shadow-sm">
            {drugResults.data.map((drug: any, i: number) => (
              <div key={i} className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border last:border-0" onClick={() => addMedication(drug)}>
                <div>
                  <span className="font-semibold text-primary">{drug.name}</span> <span className="text-xs text-muted-foreground ml-2">({drug.genericName}) - {drug.strength}</span>
                </div>
                <Plus className="h-4 w-4 text-primary" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Medications */}
      <div>
        <h3 className="font-semibold mb-3">Selected Medications</h3>
        {medications.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
            <p className="text-muted-foreground text-sm">No medications added to the prescription yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med: any, idx: number) => (
              <div key={idx} className="bg-white border border-border rounded-xl p-4 relative shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg text-primary">{med.drugName}</h4>
                    <p className="text-xs text-muted-foreground">{med.genericName} • {med.strength} • {med.form}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 px-2" onClick={() => removeMed(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <label className="font-medium text-xs">Dose</label>
                    <div className="flex">
                      <input type="text" className="w-16 h-8 border border-input rounded-l px-2 text-xs" value={med.dose} onChange={e => updateMed(idx, 'dose', e.target.value)} />
                      <input type="text" className="w-20 h-8 border-t border-b border-r border-input rounded-r px-2 text-xs" value={med.doseUnit} onChange={e => updateMed(idx, 'doseUnit', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-xs">Frequency</label>
                    <input type="text" className="w-full h-8 border border-input rounded px-2 text-xs" placeholder="e.g. 2 times a day" value={`${med.frequency?.times} times a ${med.frequency?.period}`} onChange={() => {}} disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-xs">Duration</label>
                    <input type="text" className="w-full h-8 border border-input rounded px-2 text-xs" value={med.duration} onChange={e => updateMed(idx, 'duration', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-xs">Total Qty</label>
                    <input type="number" className="w-full h-8 border border-input rounded px-2 text-xs" value={med.quantity} onChange={e => updateMed(idx, 'quantity', Number(e.target.value))} />
                  </div>
                </div>
                <div className="mt-3">
                  <Input 
                    placeholder="Specific instructions (e.g. Take after food)" 
                    value={med.instructions} 
                    onChange={e => updateMed(idx, 'instructions', e.target.value)} 
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-3">General Advice</h3>
        <textarea 
          className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Rest, hydration, dietary advice..."
          value={generalInstructions}
          onChange={(e: any) => setGeneralInstructions(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={isLoading || medications.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
          Issue E-Prescription
        </Button>
      </div>
    </div>
  );
};
