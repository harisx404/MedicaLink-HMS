import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  useGetICUPatientByIdQuery, 
  useAddVitalsMutation, 
  useUpdateVentilatorMutation
} from '../api/icuApi';
import { 
  Activity,
  Wind, 
  Droplets, 
  ArrowLeft, 
  Pill, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const ICUPatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: patientRes, isLoading } = useGetICUPatientByIdQuery(id as string);
  
  const [activeTab, setActiveTab] = useState('MONITORING');
  const [addVitals] = useAddVitalsMutation();
  const [updateVent] = useUpdateVentilatorMutation();
  const [newVitals, setNewVitals] = useState({ hr: '', bp: '', rr: '', temp: '', spO2: '', cvp: '' });
  const patient = patientRes?.data;

  const [userVentState, setUserVentState] = useState<any>(null);
  const newVent = userVentState || {
    isOnVentilator: patient?.ventilator?.isOnVentilator || false,
    mode: patient?.ventilator?.mode || '',
    fiO2: patient?.ventilator?.fiO2?.toString() || '',
    peep: patient?.ventilator?.peep?.toString() || '',
    tv: patient?.ventilator?.tv?.toString() || '',
    rr: patient?.ventilator?.rr?.toString() || ''
  };
  const setNewVent = (updater: any) => {
    setUserVentState((prev: any) => typeof updater === 'function' ? updater(prev || newVent) : updater);
  };

  if (isLoading || !patient) {
    return <div className="p-8 text-center text-slate-500">Loading Patient Data...</div>;
  }

  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVitals({ 
        id: patient._id!, 
        vitals: {
          time: new Date().toISOString(),
          hr: Number(newVitals.hr),
          bp: newVitals.bp,
          rr: Number(newVitals.rr),
          temp: Number(newVitals.temp),
          spO2: Number(newVitals.spO2),
          cvp: Number(newVitals.cvp)
        }
      }).unwrap();
      toast.success('Vitals added successfully');
      setNewVitals({ hr: '', bp: '', rr: '', temp: '', spO2: '', cvp: '' });
    } catch (error) {
      toast.error('Failed to add vitals');
    }
  };

  const handleVentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateVent({
        id: patient._id!,
        settings: {
          isOnVentilator: newVent.isOnVentilator,
          mode: newVent.mode,
          fiO2: Number(newVent.fiO2),
          peep: Number(newVent.peep),
          tv: Number(newVent.tv),
          rr: Number(newVent.rr)
        }
      }).unwrap();
      toast.success('Ventilator settings updated');
    } catch (error) {
      toast.error('Failed to update ventilator settings');
    }
  };

  const chartData = patient.hourlyVitals?.map(v => ({
    time: new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    hr: v.hr,
    spO2: v.spO2,
    temp: v.temp
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/icu" className="mr-6 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">
              {patient.patient?.firstName} {patient.patient?.lastName}
            </h1>
            <p className="text-slate-400 mt-1 flex items-center">
              <span className="bg-slate-800 px-2 py-1 rounded text-xs font-bold mr-3 text-cyan-400">
                Bed {patient.bed?.bedNumber}
              </span>
              Admitted: {new Date(patient.admittedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400 uppercase font-bold tracking-wider">SOFA Score</div>
          <div className={`text-4xl font-black ${patient.sofaScore && patient.sofaScore > 5 ? 'text-rose-500' : 'text-emerald-400'}`}>
            {patient.sofaScore || 'N/A'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {[
          { id: 'MONITORING', label: 'Monitoring', icon: Activity },
          { id: 'VENTILATOR', label: 'Ventilator', icon: Wind },
          { id: 'FLUIDS', label: 'Fluid Balance', icon: Droplets },
          { id: 'MEDICATIONS', label: 'Infusions & Meds', icon: Pill },
          { id: 'NOTES', label: 'Clinical Notes', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={18} className="mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
        
        {activeTab === 'MONITORING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Vital Trends</h2>
              <div className="h-[400px] w-full border border-slate-100 rounded-xl p-4 bg-slate-50">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={3} name="Heart Rate" />
                    <Line type="monotone" dataKey="spO2" stroke="#3b82f6" strokeWidth={3} name="SpO2 (%)" />
                    <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} name="Temp (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Activity className="mr-2 text-indigo-600" /> Enter Hourly Vitals
              </h2>
              <form onSubmit={handleVitalsSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Heart Rate</label>
                    <input required type="number" value={newVitals.hr} onChange={e => setNewVitals({...newVitals, hr: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="BPM" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Blood Pressure</label>
                    <input required type="text" value={newVitals.bp} onChange={e => setNewVitals({...newVitals, bp: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="120/80" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">SpO2 (%)</label>
                    <input required type="number" value={newVitals.spO2} onChange={e => setNewVitals({...newVitals, spO2: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="%" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Resp. Rate</label>
                    <input required type="number" value={newVitals.rr} onChange={e => setNewVitals({...newVitals, rr: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="CPM" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Temp (°C)</label>
                    <input required type="number" step="0.1" value={newVitals.temp} onChange={e => setNewVitals({...newVitals, temp: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="°C" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">CVP (mmHg)</label>
                    <input type="number" value={newVitals.cvp} onChange={e => setNewVitals({...newVitals, cvp: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Optional" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors mt-4">
                  Save Vitals
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'VENTILATOR' && (
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Wind className="mr-2 text-sky-500" /> Mechanical Ventilation
            </h2>
            
            <form onSubmit={handleVentSubmit} className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-4 mb-6">
                <input 
                  type="checkbox" 
                  id="isOnVent"
                  checked={newVent.isOnVentilator}
                  onChange={e => setNewVent({...newVent, isOnVentilator: e.target.checked})}
                  className="w-6 h-6 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isOnVent" className="text-lg font-bold text-slate-900">
                  Patient is on Ventilator
                </label>
              </div>

              {newVent.isOnVentilator && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Mode</label>
                    <select 
                      value={newVent.mode} 
                      onChange={e => setNewVent({...newVent, mode: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Select Mode</option>
                      <option value="VC-CMV">VC-CMV</option>
                      <option value="PC-CMV">PC-CMV</option>
                      <option value="SIMV">SIMV</option>
                      <option value="PSV">PSV</option>
                      <option value="CPAP">CPAP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">FiO2 (%)</label>
                    <input type="number" value={newVent.fiO2} onChange={e => setNewVent({...newVent, fiO2: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">PEEP (cmH2O)</label>
                    <input type="number" value={newVent.peep} onChange={e => setNewVent({...newVent, peep: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tidal Vol (mL)</label>
                    <input type="number" value={newVent.tv} onChange={e => setNewVent({...newVent, tv: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Resp Rate</label>
                    <input type="number" value={newVent.rr} onChange={e => setNewVent({...newVent, rr: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500" />
                  </div>
                </div>
              )}

              <button type="submit" className="px-6 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors">
                Update Settings
              </button>
            </form>
          </div>
        )}

        {/* Other tabs intentionally simplified for portfolio demonstration */}
        {(activeTab === 'FLUIDS' || activeTab === 'MEDICATIONS' || activeTab === 'NOTES') && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <AlertTriangle size={48} className="mb-4 opacity-50 text-amber-500" />
            <p className="text-xl font-bold text-slate-600 mb-2">{tabLabel(activeTab)} Module</p>
            <p>UI implementation mapped to API. (Portfolio Demo Wrapper)</p>
          </div>
        )}

      </div>
    </div>
  );
};

const tabLabel = (id: string) => {
  if (id === 'FLUIDS') return 'Fluid Balance';
  if (id === 'MEDICATIONS') return 'Infusions & Meds';
  if (id === 'NOTES') return 'Clinical Notes';
  return id;
};
