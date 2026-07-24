import React from 'react';
import { QrCode, Smartphone, Loader2, Key } from 'lucide-react';
import { useGenerateQrCodeQuery, useEnablePatientPortalMutation } from '../api/patientApi';
import type { SharedPatient } from '@medicalink/shared';
import toast from 'react-hot-toast';

interface PatientPortalCardProps {
  patient: SharedPatient;
}

export const PatientPortalCard: React.FC<PatientPortalCardProps> = ({ patient }) => {
  const { data, isLoading } = useGenerateQrCodeQuery(patient.id, {
    skip: !patient.isPortalEnabled,
  });
  
  const [enablePortal, { isLoading: isEnabling }] = useEnablePatientPortalMutation();

  const handleEnablePortal = async () => {
    try {
      await enablePortal(patient.id).unwrap();
      toast.success('Patient Portal activated successfully');
    } catch {
      toast.error('Failed to activate Patient Portal');
    }
  };

  const qrCodeUrl = data?.data?.qrCode;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
          <Smartphone size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Patient Portal</h3>
          <p className="text-sm text-gray-500">Mobile access for {patient.firstName}</p>
        </div>
      </div>

      {!patient.isPortalEnabled ? (
        <div className="text-center py-6">
          <Key className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto">
            Enable the portal so the patient can scan their code and access medical records on their phone.
          </p>
          <button 
            onClick={handleEnablePortal}
            disabled={isEnabling}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isEnabling ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
            Activate Portal Access
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
              <Loader2 className="animate-spin text-indigo-400" size={32} />
            </div>
          ) : qrCodeUrl ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <img 
                src={qrCodeUrl} 
                alt="Patient Portal QR Code" 
                className="w-48 h-48 p-2 bg-white border border-gray-200 rounded-xl shadow-sm transition-transform group-hover:scale-105 duration-300" 
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400">
              <QrCode size={32} />
            </div>
          )}
          
          <div className="mt-5 w-full space-y-2">
            <span className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Portal Active
            </span>
            <p className="text-xs text-center text-gray-500">
              Patient can scan this code using the MedicaLink App to securely link their account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
