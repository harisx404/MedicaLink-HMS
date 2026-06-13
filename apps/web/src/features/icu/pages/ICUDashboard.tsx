import React from 'react';
import { useGetICUPatientsQuery } from '../api/icuApi';
import { Activity, Wind, Heart, Droplets, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ICUDashboard: React.FC = () => {
  const { data: icuRes, isLoading } = useGetICUPatientsQuery();
  const patients = icuRes?.data || [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading ICU data...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-black flex items-center">
            <Activity className="mr-3 text-cyan-400" size={32} /> 
            INTENSIVE CARE UNIT (ICU)
          </h1>
          <p className="text-slate-400 mt-2">Central Monitoring Station</p>
        </div>
        <div className="flex space-x-6 text-center">
          <div>
            <div className="text-4xl font-black text-cyan-400">{patients.length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">Occupied Beds</div>
          </div>
          <div>
            <div className="text-4xl font-black text-amber-400">
              {patients.filter(p => p.ventilator?.isOnVentilator).length}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">On Ventilator</div>
          </div>
        </div>
      </div>

      {/* Bed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {patients.map(patient => {
          const lastVitals = patient.hourlyVitals && patient.hourlyVitals.length > 0 
            ? patient.hourlyVitals[patient.hourlyVitals.length - 1] 
            : null;

          const isCritical = lastVitals && (lastVitals.hr > 120 || lastVitals.spO2 < 92);

          return (
            <Link 
              key={patient._id} 
              to={`/icu/patients/${patient._id}`}
              className={`block rounded-2xl border-2 transition-all transform hover:-translate-y-1 overflow-hidden shadow-sm hover:shadow-xl ${
                isCritical ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className={`p-3 text-white flex justify-between items-center ${isCritical ? 'bg-rose-600' : 'bg-slate-800'}`}>
                <span className="font-bold">Bed {patient.bed?.bedNumber || 'Unknown'}</span>
                {isCritical && <AlertTriangle size={16} className="animate-pulse" />}
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg truncate">
                    {patient.patient?.firstName} {patient.patient?.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Admitted: {new Date(patient.admittedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                    <Heart size={14} className="text-rose-500" />
                    <span className="font-bold text-slate-700">{lastVitals?.hr || '--'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                    <Activity size={14} className="text-indigo-500" />
                    <span className="font-bold text-slate-700">{lastVitals?.bp || '--'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                    <Wind size={14} className="text-sky-500" />
                    <span className="font-bold text-slate-700">{lastVitals?.spO2 || '--'}%</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                    <Droplets size={14} className="text-amber-500" />
                    <span className="font-bold text-slate-700">{lastVitals?.temp || '--'}°</span>
                  </div>
                </div>

                {patient.ventilator?.isOnVentilator && (
                  <div className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center">
                    <Wind size={14} className="mr-2" /> ON VENTILATOR ({patient.ventilator.mode})
                  </div>
                )}
                
                {patient.sofaScore !== undefined && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500">SOFA Score</span>
                    <span className={`text-sm font-black ${patient.sofaScore > 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {patient.sofaScore}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {patients.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <Activity size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-bold text-slate-500">No active ICU patients</p>
          </div>
        )}
      </div>
    </div>
  );
};
