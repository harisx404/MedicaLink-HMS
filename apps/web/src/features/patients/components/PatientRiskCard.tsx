import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useGetPatientRiskScoreMutation } from '../../ai/api/aiApi';

interface Props {
  patient: any;
}

export const PatientRiskCard: React.FC<Props> = ({ patient }) => {
  const [getRiskScore, { isLoading }] = useGetPatientRiskScoreMutation();
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    if (patient) {
      // In a real scenario, you'd fetch the latest vitals from the DB. We'll pass empty for now.
      getRiskScore({ history: patient.chronicConditions, vitals: {} })
        .unwrap()
        .then(res => setRiskData(res.data))
        .catch(err => console.error(err));
    }
  }, [patient, getRiskScore]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded"></div>
          <div className="h-4 w-full bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!riskData) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
        <Activity size={20} className="text-indigo-600" /> 
        AI Predictive Risk Profile
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">30-Day Readmission</p>
          <div className="flex items-center gap-2">
            {riskData.readmissionRisk === 'High' ? <AlertTriangle className="text-red-500 h-5 w-5" /> : 
             riskData.readmissionRisk === 'Medium' ? <Clock className="text-amber-500 h-5 w-5" /> : 
             <CheckCircle className="text-emerald-500 h-5 w-5" />}
            <span className={`font-semibold ${riskData.readmissionRisk === 'High' ? 'text-red-600' : riskData.readmissionRisk === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {riskData.readmissionRisk} Risk
            </span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Sepsis Risk (SIRS)</p>
          <div className="flex items-center gap-2">
            {riskData.sepsisRisk === 'High' ? <AlertTriangle className="text-red-500 h-5 w-5" /> : 
             riskData.sepsisRisk === 'Medium' ? <Clock className="text-amber-500 h-5 w-5" /> : 
             <CheckCircle className="text-emerald-500 h-5 w-5" />}
            <span className={`font-semibold ${riskData.sepsisRisk === 'High' ? 'text-red-600' : riskData.sepsisRisk === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {riskData.sepsisRisk} Risk
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white/60 rounded-lg p-3 text-sm text-slate-700 border border-indigo-50/50">
        <span className="font-semibold text-indigo-800">AI Reasoning: </span>
        {riskData.reasoning}
      </div>
    </div>
  );
};
