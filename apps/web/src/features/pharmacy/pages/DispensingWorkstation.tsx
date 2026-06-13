import React, { useState } from 'react';
import { 
  Search, 
  AlertCircle, 
  Printer, 
  CreditCard,
  Pill,
  Clock
} from 'lucide-react';
import { useGetPrescriptionQueueQuery, useDispenseDrugsMutation } from '../api/pharmacyApi';

export const DispensingWorkstation: React.FC = () => {
  const { data: queueData, isLoading: queueLoading } = useGetPrescriptionQueueQuery();
  const [dispenseDrugs, { isLoading: isDispensing }] = useDispenseDrugsMutation();
  
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const queue = queueData?.data || [];
  const filteredQueue = queue.filter((rx: any) => 
    rx.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.prescriptionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDispense = async () => {
    if (!selectedRx) return;
    
    // In a real implementation, we would build the items array from state (quantities, batches)
    // For this boilerplate, we'll just show the structure
    try {
      await dispenseDrugs({
        prescriptionId: selectedRx._id,
        patientId: selectedRx.patient._id,
        items: selectedRx.medications.map((med: any) => ({
          drugId: med.drugId,
          quantity: med.quantity,
          dose: med.dose,
          unitPrice: 10, // Mock price
          instructions: med.instructions
        })),
        paidAmount: 0 // Mock amount
      }).unwrap();
      
      setSelectedRx(null);
      // Show success toast here
    } catch (error) {
      // Show error toast here
      console.error('Failed to dispense', error);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex overflow-hidden animate-in fade-in">
      {/* Left Panel: Queue */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Prescription Queue</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patient or Rx number..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {queueLoading ? (
            <div className="p-4 text-center text-slate-500 text-sm">Loading queue...</div>
          ) : filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <CheckCircle size={32} className="text-slate-300 mb-2" />
              <p>No pending prescriptions</p>
            </div>
          ) : (
            filteredQueue.map((rx: any) => (
              <button
                key={rx._id}
                onClick={() => setSelectedRx(rx)}
                className={`w-full text-left p-4 rounded-xl mb-2 transition-all border ${
                  selectedRx?._id === rx._id 
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-slate-900">
                    {rx.patient?.firstName} {rx.patient?.lastName}
                  </div>
                  <span className="flex items-center text-xs text-slate-500">
                    <Clock size={12} className="mr-1" />
                    {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm text-slate-600 mb-2">
                  Dr. {rx.doctor?.lastName} • {rx.medications?.length || 0} items
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">Waiting</span>
                  {rx.patient?.allergies?.length > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded flex items-center">
                      <AlertCircle size={10} className="mr-1" /> Allergy Alert
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Dispensing Interface */}
      <div className="flex-1 bg-slate-50 flex flex-col">
        {selectedRx ? (
          <>
            {/* Header */}
            <div className="bg-white p-6 border-b border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {selectedRx.patient?.firstName} {selectedRx.patient?.lastName}
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    UHID: {selectedRx.patient?.uhid} | Age: 34 | Gender: Male
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">{selectedRx.prescriptionNumber}</div>
                  <div className="text-sm text-slate-500">Dr. {selectedRx.doctor?.firstName} {selectedRx.doctor?.lastName}</div>
                </div>
              </div>
              
              {selectedRx.patient?.allergies?.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start mt-4">
                  <AlertCircle className="text-red-500 mt-0.5 mr-2 shrink-0" size={16} />
                  <div>
                    <span className="font-medium text-red-800 text-sm">Allergies: </span>
                    <span className="text-red-600 text-sm">
                      {selectedRx.patient.allergies.map((a: any) => a.allergen).join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Prescription Items</h3>
              <div className="space-y-4">
                {selectedRx.medications?.map((med: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mr-4 shrink-0">
                      <Pill size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-slate-900 text-lg">{med.drugName}</h4>
                        <div className="font-medium text-slate-900">${(med.quantity * 10).toFixed(2)}</div>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">
                        {med.dose} • {med.frequency?.instructions || 'As directed'} • {med.duration}
                      </p>
                      
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-slate-500 block mb-1">Batch (FEFO)</label>
                          <select className="w-full bg-white border border-slate-200 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                            <option>Auto-select earliest expiry</option>
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="text-xs font-medium text-slate-500 block mb-1">Dispense Qty</label>
                          <input type="number" defaultValue={med.quantity} className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer / Checkout */}
            <div className="bg-white border-t border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-medium">Total Amount Due</span>
                <span className="text-3xl font-bold text-slate-900">$120.00</span>
              </div>
              
              <div className="flex gap-4">
                <button className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center flex-1">
                  <Printer size={18} className="mr-2" /> Print Labels
                </button>
                <button 
                  onClick={handleDispense}
                  disabled={isDispensing}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center flex-1 shadow-sm shadow-indigo-200 disabled:opacity-50"
                >
                  <CreditCard size={18} className="mr-2" /> 
                  {isDispensing ? 'Processing...' : 'Collect & Dispense'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Pill size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-600">No prescription selected</p>
            <p className="text-sm mt-1">Select a prescription from the queue to begin dispensing</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple mock CheckCircle icon since it's used but not imported
function CheckCircle({ size = 24, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
