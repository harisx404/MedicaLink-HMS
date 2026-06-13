import React, { useEffect } from 'react';
import { useGetEmergencyPatientsQuery, useTriggerAlertMutation } from '../api/emergencyApi';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { 
  AlertOctagon, 
  Flame, 
  Activity, 
  Clock, 
  User, 
  Radio,
  HeartPulse
} from 'lucide-react';
import { toast } from 'sonner';

const TriageColors: Record<string, string> = {
  RED: 'bg-red-500',
  ORANGE: 'bg-orange-500',
  YELLOW: 'bg-yellow-500',
  GREEN: 'bg-green-500',
  BLUE: 'bg-blue-500'
};

export const EmergencyDashboard: React.FC = () => {
  const { data: patientsRes, refetch } = useGetEmergencyPatientsQuery({});
  const [triggerAlert] = useTriggerAlertMutation();
  const { token, tenantId } = useSelector((state: RootState) => state.auth as any);

  useEffect(() => {
    // Connect to Socket.io for real-time emergency board updates
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      query: { tenantId }
    });

    socket.on('emergency:patient-added', () => refetch());
    socket.on('emergency:patient-updated', () => refetch());
    socket.on('emergency:code-blue', (data) => {
      toast.error(`CODE BLUE ALERT! Location: ${data.location}`, {
        duration: 10000,
        icon: <Activity size={24} className="text-white" />,
        style: { background: '#ef4444', color: 'white', fontWeight: 'bold' }
      });
      // Play sound
      const audio = new Audio('/code-blue-alarm.mp3'); // Assume sound file exists
      audio.play().catch(() => {});
    });

    return () => {
      socket.disconnect();
    };
  }, [token, tenantId, refetch]);

  const patients = patientsRes?.data || [];

  const handleCodeBlue = () => {
    if (window.confirm("TRIGGER CODE BLUE? This will alert all staff immediately!")) {
      triggerAlert({ type: 'CODE_BLUE', location: 'Emergency Bay 1' });
    }
  };

  const handleMCI = () => {
    if (window.confirm("ACTIVATE MASS CASUALTY INCIDENT (MCI)?")) {
      triggerAlert({ type: 'MCI', details: 'Multiple trauma incoming' });
    }
  };

  // Group patients by triage level
  const columns = [
    { level: 'RESUSCITATION', color: 'RED', label: 'Resuscitation (Immediate)' },
    { level: 'EMERGENCY', color: 'ORANGE', label: 'Emergency (15 mins)' },
    { level: 'URGENT', color: 'YELLOW', label: 'Urgent (30 mins)' },
    { level: 'SEMI_URGENT', color: 'GREEN', label: 'Semi-Urgent (1 hr)' },
    { level: 'NON_URGENT', color: 'BLUE', label: 'Non-Urgent (2 hrs)' }
  ];

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center">
            <Radio className="mr-3 text-rose-500 animate-pulse" /> LIVE EMERGENCY BOARD
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time triage and patient tracking</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleMCI}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors flex items-center shadow-[0_0_15px_rgba(217,119,6,0.5)]"
          >
            <Flame size={18} className="mr-2" /> MCI ACTIVATION
          </button>
          <button 
            onClick={handleCodeBlue}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors flex items-center shadow-[0_0_15px_rgba(225,29,72,0.5)]"
          >
            <AlertOctagon size={18} className="mr-2" /> CODE BLUE
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colPatients = patients.filter(p => p.triageLevel === col.level);
          return (
            <div key={col.level} className="flex flex-col bg-slate-100 rounded-xl border border-slate-200 overflow-hidden h-[calc(100vh-220px)] min-w-[280px]">
              <div className={`p-3 ${TriageColors[col.color]} text-white font-bold text-center shadow-md flex justify-between items-center`}>
                <span>{col.label}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{colPatients.length}</span>
              </div>
              <div className="flex-1 p-2 space-y-3 overflow-y-auto">
                {colPatients.map(patient => (
                  <div key={patient._id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 truncate">
                        {((patient.patient as unknown) as { firstName: string, lastName: string })?.firstName || 'Unknown'} {((patient.patient as unknown) as { firstName: string, lastName: string })?.lastName || ''}
                      </h3>
                      <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md">
                        {patient.arrivalMode}
                      </span>
                    </div>
                    
                    <p className="text-sm text-rose-600 font-semibold mb-2 line-clamp-2">
                      "{patient.chiefComplaint}"
                    </p>
                    
                    <div className="flex items-center text-xs text-slate-500 space-x-3">
                      <span className="flex items-center"><Clock size={12} className="mr-1" /> 
                        {new Date(patient.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {patient.vitals?.hr && (
                        <span className="flex items-center text-rose-500"><HeartPulse size={12} className="mr-1" /> {patient.vitals.hr}</span>
                      )}
                    </div>
                  </div>
                ))}
                {colPatients.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-2">
                    <User size={32} />
                    <span className="text-sm">No Patients</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
