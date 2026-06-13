import React, { useState } from 'react';
import { useRegisterEmergencyPatientMutation } from '../api/emergencyApi';
import { 
  HeartPulse, 
  Activity, 
  Thermometer, 
  Wind,
  AlertTriangle,
  User
} from 'lucide-react';
import { toast } from 'sonner';

export const TriageInterface: React.FC = () => {
  const [registerPatient, { isLoading }] = useRegisterEmergencyPatientMutation();
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    arrivalMode: 'WALK_IN',
    gender: 'Male',
    approximateAge: '',
    hr: '',
    bp: '',
    rr: '',
    temp: '',
    spO2: ''
  });

  const calculateTriage = (vitals: any) => {
    // Basic logic for demonstration
    if (vitals.hr > 130 || vitals.spO2 < 90 || vitals.rr > 30) return { level: 'RESUSCITATION', color: 'RED' };
    if (vitals.hr > 110 || vitals.spO2 < 94 || vitals.rr > 24) return { level: 'EMERGENCY', color: 'ORANGE' };
    if (vitals.hr > 100 || vitals.temp > 39) return { level: 'URGENT', color: 'YELLOW' };
    return { level: 'NON_URGENT', color: 'BLUE' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vitals = {
      hr: Number(formData.hr),
      bp: formData.bp,
      rr: Number(formData.rr),
      temp: Number(formData.temp),
      spO2: Number(formData.spO2)
    };

    const triage = calculateTriage(vitals);

    try {
      await registerPatient({
        unknownIdentity: {
          gender: formData.gender as any,
          approximateAge: Number(formData.approximateAge),
          description: 'Emergency Walk-in / Ambulance Drop'
        },
        chiefComplaint: formData.chiefComplaint,
        arrivalMode: formData.arrivalMode as any,
        vitals,
        triageLevel: triage.level as any,
        triageColor: triage.color as any,
        arrivalTime: new Date().toISOString()
      }).unwrap();

      toast.success(`Patient Triage Completed. Level: ${triage.level}`);
      // Reset form
      setFormData({
        chiefComplaint: '',
        arrivalMode: 'WALK_IN',
        gender: 'Male',
        approximateAge: '',
        hr: '', bp: '', rr: '', temp: '', spO2: ''
      });
    } catch (error) {
      toast.error('Failed to register patient');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fast Triage Interface</h1>
          <p className="text-slate-500 mt-1">30-second rapid registration and triage assessment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
        
        {/* Quick Identity */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <User size={20} className="mr-2 text-indigo-600" /> Patient Identity & Arrival
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Approx. Age</label>
              <input 
                type="number" 
                name="approximateAge" 
                value={formData.approximateAge} 
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Mode</label>
              <select 
                name="arrivalMode" 
                value={formData.arrivalMode} 
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="WALK_IN">Walk In</option>
                <option value="AMBULANCE">Ambulance</option>
                <option value="REFERRED">Referred</option>
                <option value="POLICE">Police</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chief Complaint</label>
              <input 
                type="text" 
                name="chiefComplaint" 
                value={formData.chiefComplaint} 
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Chest Pain, Trauma"
              />
            </div>
          </div>
        </div>

        {/* Vital Signs (Large Inputs) */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Activity size={20} className="mr-2 text-rose-600" /> Vital Signs Assessment
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <HeartPulse size={16} className="mr-1 text-rose-500" /> Heart Rate
              </label>
              <input 
                type="number" 
                name="hr" 
                value={formData.hr} 
                onChange={handleInputChange}
                required
                className="w-full text-2xl font-black text-center px-2 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="BPM"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Activity size={16} className="mr-1 text-indigo-500" /> Blood Pressure
              </label>
              <input 
                type="text" 
                name="bp" 
                value={formData.bp} 
                onChange={handleInputChange}
                required
                className="w-full text-2xl font-black text-center px-2 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="120/80"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Wind size={16} className="mr-1 text-sky-500" /> Resp. Rate
              </label>
              <input 
                type="number" 
                name="rr" 
                value={formData.rr} 
                onChange={handleInputChange}
                required
                className="w-full text-2xl font-black text-center px-2 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
                placeholder="CPM"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Thermometer size={16} className="mr-1 text-amber-500" /> Temp (°C)
              </label>
              <input 
                type="number" 
                step="0.1"
                name="temp" 
                value={formData.temp} 
                onChange={handleInputChange}
                required
                className="w-full text-2xl font-black text-center px-2 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="°C"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Activity size={16} className="mr-1 text-emerald-500" /> SpO2 (%)
              </label>
              <input 
                type="number" 
                name="spO2" 
                value={formData.spO2} 
                onChange={handleInputChange}
                required
                className="w-full text-2xl font-black text-center px-2 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="%"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/20 flex items-center disabled:opacity-50"
          >
            <AlertTriangle size={24} className="mr-2" /> Complete Triage & Register
          </button>
        </div>
      </form>
    </div>
  );
};
