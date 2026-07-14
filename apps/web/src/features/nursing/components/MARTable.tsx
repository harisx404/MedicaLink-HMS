import React, { useState } from 'react';
import { useAdministerMedicationMutation } from '../nursingApi';
import { Pill, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface MARTableProps {
  patientId: string;
  prescriptions: any[];
  history: any[];
}

export const MARTable: React.FC<MARTableProps> = ({ patientId, prescriptions, history }) => {
  const [administer] = useAdministerMedicationMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAdminister = async (
    prescriptionId: string, 
    medicationId: string, 
    status: 'GIVEN' | 'HELD' | 'REFUSED'
  ) => {
    try {
      setLoadingId(medicationId);
      await administer({
        patient: patientId,
        prescription: prescriptionId,
        medicationId,
        status,
        administeredAt: new Date().toISOString(),
      }).unwrap();
      toast.success(`Medication marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update medication administration');
    } finally {
      setLoadingId(null);
    }
  };

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <Pill className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Prescriptions</h3>
        <p className="text-sm text-gray-500">This patient does not have any active medications scheduled.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 font-jakarta flex items-center">
          <Pill className="w-5 h-5 text-indigo-500 mr-2" />
          Medication Administration Record (MAR)
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medication
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dose & Route
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {prescriptions.flatMap((prescription) => 
              prescription.medications.map((med: any) => {
                // Find last administration in history for this medication
                const lastAdministered = history.find(h => h.medicationId === med._id);
                
                return (
                  <tr key={med._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{med.drugName}</span>
                        {med.genericName && (
                          <span className="text-xs text-gray-500">{med.genericName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{med.dose}</div>
                      <div className="text-xs text-gray-500">{med.route}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {med.frequency?.times}x / {med.frequency?.period}
                      </div>
                      <div className="text-xs text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-full mt-1">
                        {med.whenToTake}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAdminister(prescription._id, med._id, 'GIVEN')}
                          disabled={loadingId === med._id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Given
                        </button>
                        <button
                          onClick={() => handleAdminister(prescription._id, med._id, 'HELD')}
                          disabled={loadingId === med._id}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                          <AlertCircle className="w-4 h-4 mr-1 text-amber-500" />
                          Hold
                        </button>
                      </div>
                      {lastAdministered && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <span className="mr-1">Last:</span>
                          <span className={lastAdministered.status === 'GIVEN' ? 'text-teal-600 font-medium' : 'text-amber-600 font-medium'}>
                            {lastAdministered.status}
                          </span>
                          <span className="ml-1 text-gray-400">
                            ({new Date(lastAdministered.administeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
